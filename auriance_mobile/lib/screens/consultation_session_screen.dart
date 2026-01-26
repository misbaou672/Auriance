import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../constants/app_theme.dart';

import '../services/api_service.dart';
import '../services/pdf_service.dart';
import '../services/stt_service.dart';
import '../services/file_storage_service.dart';
import 'form_auto_fill_screen.dart';
import '../models/transcription_models.dart';

class ConsultationSessionScreen extends StatefulWidget {
  const ConsultationSessionScreen({super.key});

  @override
  State<ConsultationSessionScreen> createState() =>
      _ConsultationSessionScreenState();
}

class _ConsultationSessionScreenState extends State<ConsultationSessionScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  int? _transcriptionId;
  bool _isBusy = false;
  Map<String, dynamic>? _contextJson;
  String? _reportContent;
  String? _lastPdfPath;

  Future<void> _openAutoFormFromSession(SttService stt) async {
    final api = context.read<ApiService>();

    // Stabilize the transcript: we want the final text before extracting.
    if (stt.isListening) {
      await stt.stopListening();
    }

    final textForExtraction =
        (stt.finalText.isNotEmpty ? stt.finalText : stt.text).trim();
    if (textForExtraction.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucune transcription à convertir')),
        );
      }
      return;
    }

    setState(() => _isBusy = true);
    try {
      final formJson =
          await api.generateFormJson(transcription: textForExtraction);
      if (!mounted) return;
      await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => FormAutoFillScreen(formData: formJson),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur extraction formulaire: $e')));
      }
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    // Initialisation STT au chargement
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final stt = context.read<SttService>();
      stt.initialize(preferredLocale: 'fr_FR').then((_) {
        if (mounted) setState(() {});
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 900;

    return Consumer<SttService>(
      builder: (context, stt, _) {
        final isListening = stt.isListening;
        return Scaffold(
          appBar: AppBar(
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Session de Consultation'),
                Text(
                  stt.isInitializing
                      ? 'Initialisation micro...'
                      : (isListening
                          ? 'Écoute active...'
                          : (stt.isAvailable
                              ? 'Micro prêt'
                              : 'Micro indisponible')),
                  style: const TextStyle(
                      fontSize: 10, fontWeight: FontWeight.normal),
                ),
              ],
            ),
            backgroundColor: Color(AppColors.bgLightValue),
            foregroundColor: Color(AppColors.textPrimaryValue),
            elevation: 0,
            systemOverlayStyle: SystemUiOverlayStyle.dark,
            actions: [
              if (_isBusy)
                const Padding(
                  padding: EdgeInsets.only(right: 16),
                  child: Center(
                    child: SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                ),
              _ActionBar(
                isListening: stt.isListening,
                onToggleMic: () => _handleMicPressed(stt),
                onReset: stt.clear,
                onCopy: () => _copyTranscription(stt),
                onSave: () => _saveTranscription(stt),
                onPdf: () => _exportPdf(stt),
                onAutoForm: () => _openAutoFormFromSession(stt),
              ),
            ],
          ),
          body: SafeArea(
            child: Padding(
              padding: EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(
                    child: isWide
                        ? Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Expanded(child: _buildTabbedContent(stt)),
                              SizedBox(width: AppSpacing.md),
                              SizedBox(
                                width: 320,
                                child: _TaskPanel(
                                  hasTranscription: _transcriptionId != null,
                                  isListening: stt.isListening,
                                ),
                              ),
                            ],
                          )
                        : Column(
                            children: [
                              Expanded(child: _buildTabbedContent(stt)),
                              SizedBox(height: AppSpacing.md),
                              _TaskPanel(
                                hasTranscription: _transcriptionId != null,
                                isListening: stt.isListening,
                              ),
                            ],
                          ),
                  ),
                ],
              ),
            ),
          ),
          floatingActionButton: FloatingActionButton.large(
            onPressed: _isBusy ? null : () => _handleMicPressed(stt),
            backgroundColor:
                isListening ? Colors.red : Color(AppColors.primaryValue),
            child: Icon(
              isListening ? Icons.stop : Icons.mic,
              size: 32,
              color: Colors.white,
            ),
          ),
        );
      },
    );
  }

  Widget _buildTabbedContent(SttService stt) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: Color(AppColors.borderValue)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          TabBar(
            controller: _tabController,
            labelColor: Color(AppColors.primaryValue),
            unselectedLabelColor: Colors.grey,
            indicatorColor: Color(AppColors.primaryValue),
            tabs: const [
              Tab(text: 'Transcription'),
              Tab(text: 'Contexte'),
              Tab(text: 'Compte Rendu'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _TranscriptPane(text: stt.text),
                _ContextPane(
                  contextJson: _contextJson,
                  onGenerate: () => _generateContext(stt),
                  onSave: () => _saveContext(),
                  isBusy: _isBusy,
                ),
                _ReportPane(
                  reportContent: _reportContent,
                  reportTitle: 'Compte Rendu Consultation',
                  lastPdfPath: _lastPdfPath,
                  onGenerate: () => _generateReport(stt),
                  onSave: () => _saveReport(),
                  isBusy: _isBusy,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _generateContext(SttService stt) async {
    final text = stt.text;
    if (text.isEmpty) return;
    final api = context.read<ApiService>();
    setState(() => _isBusy = true);
    try {
      final res = await api.generateFormJson(transcription: text);
      setState(() => _contextJson = res);
      _tabController.animateTo(1);
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally {
      setState(() => _isBusy = false);
    }
  }

  Future<void> _saveContext() async {
    if (_contextJson == null) return;
    try {
      await FileStorageService().saveHistoryEntry(
        type: 'contexte_extraction',
        transcription: 'Extraction Contextuelle',
        extraData: _contextJson,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Contexte sauvegardé localement')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Erreur sauvegarde: $e')));
      }
    }
  }

  Future<void> _generateReport(SttService stt) async {
    final text = stt.text;
    if (text.isEmpty) return;
    final api = context.read<ApiService>();
    setState(() => _isBusy = true);
    try {
      final res = await api.generateReport(transcription: text);
      setState(
          () => _reportContent = res['content']?.toString() ?? res.toString());
      _tabController.animateTo(2);
    } catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally {
      setState(() => _isBusy = false);
    }
  }

  Future<void> _saveReport() async {
    if (_reportContent == null) return;
    try {
      await FileStorageService().saveHistoryEntry(
        type: 'compte_rendu',
        transcription: _reportContent!,
        extraData: {
          'title': 'Compte Rendu Consultation',
          'generated_at': DateTime.now().toIso8601String(),
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Rapport sauvegardé')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Erreur sauvegarde: $e')));
      }
    }
  }

  Future<void> _copyTranscription(SttService stt) async {
    if (stt.text.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucune transcription à copier')),
        );
      }
      return;
    }

    await Clipboard.setData(ClipboardData(text: stt.text));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Transcription copiée')),
      );
    }
  }

  Future<void> _saveTranscription(SttService stt) async {
    final textForPdf = stt.finalText.isNotEmpty ? stt.finalText : stt.text;

    if (textForPdf.trim().isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucun texte à enregistrer')),
        );
      }
      return;
    }

    // Always save a local history entry so it appears in History > Local
    // even if the backend is unreachable.
    try {
      await FileStorageService().saveHistoryEntry(
        type: 'transcription_temps_reel',
        transcription: textForPdf,
      );
    } catch (_) {
      // ignore local history failures (permissions/storage)
    }

    final api = context.read<ApiService>();
    try {
      setState(() => _isBusy = true);
      final created = await api.createTranscription(
        CreateTranscriptionRequest(
          text: textForPdf,
          language: stt.localeId ?? 'fr',
        ),
      );
      setState(() => _transcriptionId = created.id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Transcription enregistrée #${created.id}'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                'Sauvegarde locale OK. Erreur serveur: ${e.toString().split("\n").first}'),
            backgroundColor: Colors.orange,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  Future<void> _exportPdf(SttService stt) async {
    final text = stt.finalText.isNotEmpty ? stt.finalText : stt.text;
    if (text.trim().isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucun texte à exporter en PDF')),
        );
      }
      return;
    }
    final title = _transcriptionId != null
        ? 'Transcription #$_transcriptionId'
        : 'Transcription';
    await _promptAndSavePdf(text: text, title: title);
  }

  Future<void> _promptAndSavePdf(
      {required String text, required String title}) async {
    final choice = await showModalBottomSheet<int>(
      context: context,
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.download),
                title: const Text('Téléchargements (Downloads)'),
                subtitle:
                    const Text('Enregistrer dans le dossier Téléchargements'),
                onTap: () => Navigator.of(ctx).pop(0),
              ),
              ListTile(
                leading: const Icon(Icons.devices),
                title: const Text('Mon appareil (Auriance)'),
                subtitle:
                    const Text('Enregistrer dans Android/media de l\'app'),
                onTap: () => Navigator.of(ctx).pop(2),
              ),
              ListTile(
                leading: const Icon(Icons.folder_open),
                title: const Text('Choisir un emplacement…'),
                subtitle:
                    const Text('Utiliser le sélecteur de fichiers du système'),
                onTap: () => Navigator.of(ctx).pop(1),
              ),
            ],
          ),
        );
      },
    );

    if (choice == null) return;
    setState(() => _isBusy = true);
    try {
      final path = await PdfService.saveTranscriptionPdf(
        text: text,
        title: title,
        preferDownloads: choice == 0,
        preferAppMedia: choice == 2,
      );
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('PDF sauvegardé: $path')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Erreur PDF: $e')));
      }
    } finally {
      if (mounted) setState(() => _isBusy = false);
    }
  }

  Future<void> _handleMicPressed(SttService stt) async {
    if (stt.isListening) {
      await stt.stopListening();
    } else {
      await stt.initialize(preferredLocale: 'fr_FR');
      if (stt.isAvailable) {
        await stt.startListening();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Reconnaissance vocale non disponible')),
        );
      }
    }
  }
}

class _ActionBar extends StatelessWidget {
  final bool isListening;
  final VoidCallback onToggleMic;
  final VoidCallback onReset;
  final VoidCallback onCopy;
  final VoidCallback onSave;
  final VoidCallback onPdf;
  final VoidCallback onAutoForm;

  const _ActionBar({
    required this.isListening,
    required this.onToggleMic,
    required this.onReset,
    required this.onCopy,
    required this.onSave,
    required this.onPdf,
    required this.onAutoForm,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: Color(AppColors.borderValue)),
      ),
      child: Wrap(
        spacing: AppSpacing.sm,
        runSpacing: AppSpacing.sm,
        children: [
          _ActionChipButton(
            icon: isListening ? Icons.mic_off : Icons.mic,
            label: isListening ? 'Arrêter' : 'Démarrer',
            onPressed: onToggleMic,
            background: isListening ? Colors.red.shade100 : null,
            foreground: isListening ? Colors.red.shade800 : null,
          ),
          _ActionChipButton(
            icon: Icons.refresh,
            label: 'Réinitialiser',
            onPressed: onReset,
          ),
          _ActionChipButton(
            icon: Icons.copy,
            label: 'Copier',
            onPressed: onCopy,
          ),
          _ActionChipButton(
            icon: Icons.save,
            label: 'Enregistrer',
            onPressed: onSave,
            background: Color(AppColors.bgValue),
            foreground: Color(AppColors.primaryValue),
          ),
          _ActionChipButton(
            icon: Icons.picture_as_pdf_outlined,
            label: 'PDF',
            onPressed: onPdf,
          ),
          _ActionChipButton(
            icon: Icons.assignment,
            label: 'Formulaire',
            onPressed: onAutoForm,
            background: Colors.orange.shade50,
            foreground: Colors.orange.shade800,
          ),
        ],
      ),
    );
  }
}

class _ActionChipButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;
  final Color? background;
  final Color? foreground;

  const _ActionChipButton({
    required this.icon,
    required this.label,
    required this.onPressed,
    this.background,
    this.foreground,
  });

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      onPressed: onPressed,
      avatar: Icon(icon, size: 18, color: foreground),
      backgroundColor: background ?? Colors.white,
      shape: StadiumBorder(
        side: BorderSide(color: Color(AppColors.borderValue)),
      ),
      label: Text(
        label,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: foreground ?? Color(AppColors.textPrimaryValue),
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}

class _TaskPanel extends StatelessWidget {
  final bool hasTranscription;
  final bool isListening;

  const _TaskPanel({
    required this.hasTranscription,
    required this.isListening,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final tasks = [
      _TaskItem(
        label: 'Capturer la transcription',
        done: hasTranscription,
      ),
      _TaskItem(
        label: isListening ? 'Micro actif' : 'Micro en pause',
        done: isListening,
      ),
    ];

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        border: Border.all(color: Color(AppColors.borderValue)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Tâches', style: textTheme.titleMedium),
          SizedBox(height: AppSpacing.sm),
          ...tasks,
          SizedBox(height: AppSpacing.md),
          Container(
            padding: EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: Color(AppColors.bgValue),
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.blue),
                SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'Parlez, puis sauvegardez votre transcription.',
                    style: textTheme.bodySmall,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TaskItem extends StatelessWidget {
  final String label;
  final bool done;

  const _TaskItem({required this.label, required this.done});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        children: [
          Icon(
            done ? Icons.check_circle : Icons.radio_button_unchecked,
            color: done ? Colors.green : Color(AppColors.textTertiaryValue),
          ),
          SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

class _TranscriptPane extends StatelessWidget {
  final String text;
  const _TranscriptPane({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(AppSpacing.lg),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: Color(AppColors.borderValue)),
        ),
        child: Text(
          text.isEmpty ? 'Your note will appear here…' : text,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
      ),
    );
  }
}

// ignore: unused_element
class _ContextPane extends StatelessWidget {
  final Map<String, dynamic>? contextJson;
  final VoidCallback onGenerate;
  final VoidCallback onSave;
  final bool isBusy;

  const _ContextPane({
    required this.contextJson,
    required this.onGenerate,
    required this.onSave,
    required this.isBusy,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: isBusy ? null : onGenerate,
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Générer via IA'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(AppColors.primaryValue),
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filledTonal(
                onPressed: (contextJson == null || isBusy) ? null : onSave,
                icon: const Icon(Icons.save),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: Color(AppColors.borderValue)),
              ),
              child: SingleChildScrollView(
                child: contextJson == null
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.psychology_outlined,
                              size: 48, color: Colors.grey.shade400),
                          const SizedBox(height: 16),
                          Text(
                            'L\'IA va extraire les informations clés pour vous.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ],
                      )
                    : _buildExtractionList(contextJson!),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExtractionList(Map<String, dynamic> data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: data.entries.map((e) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: RichText(
            text: TextSpan(
              style: const TextStyle(color: Colors.black87, fontSize: 16),
              children: [
                TextSpan(
                    text: '${e.key}: ',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                TextSpan(text: '${e.value}'),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ignore: unused_element
class _ReportPane extends StatelessWidget {
  final String? reportContent;
  final String reportTitle;
  final String? lastPdfPath;
  final VoidCallback onGenerate;
  final VoidCallback onSave;
  final bool isBusy;

  const _ReportPane({
    required this.reportContent,
    required this.reportTitle,
    required this.lastPdfPath,
    required this.onGenerate,
    required this.onSave,
    required this.isBusy,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: isBusy ? null : onGenerate,
                  icon: const Icon(Icons.description),
                  label: const Text('Générer le Compte Rendu'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo.shade600,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filledTonal(
                onPressed:
                    (reportContent == null || reportContent!.isEmpty || isBusy)
                        ? null
                        : onSave,
                icon: const Icon(Icons.save),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Expanded(
            child: Container(
              width: double.infinity,
              padding: EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.lg),
                border: Border.all(color: Color(AppColors.borderValue)),
              ),
              child: SingleChildScrollView(
                child: reportContent == null || reportContent!.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.article_outlined,
                                size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 16),
                            Text(
                              'Générez un compte rendu structuré à partir de la transcription.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      )
                    : Text(
                        reportContent!,
                        style: const TextStyle(fontSize: 15, height: 1.5),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
