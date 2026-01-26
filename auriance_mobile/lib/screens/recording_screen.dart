import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_config.dart';
import '../constants/app_theme.dart';
import '../services/audio_service.dart';
import '../services/api_service.dart';
import '../services/pdf_service.dart';
import '../services/file_storage_service.dart';
import '../widgets/custom_widgets.dart';
import '../models/transcription_models.dart';
import '../widgets/language_selector_widget.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';

class RecordingScreen extends StatefulWidget {
  const RecordingScreen({super.key});

  @override
  State<RecordingScreen> createState() => _RecordingScreenState();
}

class _RecordingScreenState extends State<RecordingScreen> {
  late AudioService _audioService;
  String _selectedLanguage = 'fr';
  String? _detectedLanguage;
  bool _isTranscribing = false;
  String _transcribedText = '';
  double _confidence = 0.0;
  bool _isSavingPdf = false;
  List<LanguageInfo> _supportedLanguages = [];
  bool _isLoadingLanguages = true;
  bool _medicalMode = true;

  @override
  void initState() {
    super.initState();
    _audioService = context.read<AudioService>();
    _audioService.addListener(_onAudioStateChanged);
    _loadSupportedLanguages();
  }

  @override
  void dispose() {
    _audioService.removeListener(_onAudioStateChanged);
    super.dispose();
  }

  void _onAudioStateChanged() {
    setState(() {});
  }

  Future<void> _loadSupportedLanguages() async {
    try {
      final api = context.read<ApiService>();
      final langs = await api.getSupportedLanguages();
      langs.sort((a, b) => a.name.compareTo(b.name));
      setState(() {
        _supportedLanguages = langs;
        _isLoadingLanguages = false;
        final codes = langs.map((e) => e.code).toSet();
        if (!codes.contains(_selectedLanguage)) {
          _selectedLanguage = codes.contains('fr')
              ? 'fr'
              : (codes.isNotEmpty ? codes.first : _selectedLanguage);
        }
      });
    } catch (e) {
      setState(() => _isLoadingLanguages = false);
      debugPrint('Erreur chargement langues: $e');
    }
  }

  Future<void> _startRecording() async {
    final hasPermission = await _audioService.hasMicrophonePermission();

    if (!hasPermission) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Microphone permission required'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    await _audioService.startRecording();
    setState(() {});
  }

  Future<void> _stopRecording() async {
    await _audioService.stopRecording();

    if (_audioService.recordingPath != null && mounted) {
      _sendTranscription();
    }
  }

  Future<void> _sendTranscription() async {
    setState(() => _isTranscribing = true);

    try {
      final audioBytes = await _audioService.getAudioBytes();

      if (audioBytes == null || audioBytes.isEmpty) {
        throw Exception('No audio data');
      }

      final api = context.read<ApiService>();
      final path = _audioService.recordingPath;
      final fileName = path != null
          ? (path.split('/').isNotEmpty ? path.split('/').last : 'audio.m4a')
          : 'audio.m4a';
      final result = await api.aurianceTranscribeBytes(
        audioBytes: audioBytes,
        fileName: fileName,
        language: _selectedLanguage,
      );

      // Le backend retourne {success: True, transcription: "...", language: "...", confidence: ..., ...}
      final text = (result['transcription'] as String?) ?? '';
      final confidence = (result['confidence'] as num?)?.toDouble() ?? 0.0;
      final lang = (result['language'] as String?)?.trim();

      setState(() {
        _transcribedText = text;
        _confidence = confidence;
        _detectedLanguage = (lang != null && lang.isNotEmpty) ? lang : null;
        _isTranscribing = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
      setState(() => _isTranscribing = false);
    }
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? Colors.red : Colors.green,
      ),
    );
  }

  Future<void> _importAudio() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg'],
      );
      if (result == null || result.files.isEmpty) return;
      final picked = result.files.first;
      final bytes = picked.bytes ?? await File(picked.path!).readAsBytes();
      final api = context.read<ApiService>();
      final resp = await api.aurianceTranscribeBytes(
        audioBytes: bytes,
        fileName: picked.name.isNotEmpty ? picked.name : 'audio.m4a',
        language: _selectedLanguage,
      );
      final text = (resp['transcription'] as String?) ?? '';
      final confidence = (resp['confidence'] as num?)?.toDouble() ?? 0.0;
      final lang = (resp['language'] as String?)?.trim();
      setState(() {
        _transcribedText = text;
        _confidence = confidence;
        _detectedLanguage = (lang != null && lang.isNotEmpty) ? lang : null;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Audio importé et transcrit')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur import/transcription: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _saveTranscription() async {
    if (_transcribedText.trim().isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucune transcription à sauvegarder')),
        );
      }
      return;
    }

    // Save locally so it appears in History > Local even if backend fails.
    try {
      await FileStorageService().saveHistoryEntry(
        type: 'transcription_temps_reel',
        transcription: _transcribedText,
      );
    } catch (_) {
      // ignore
    }

    try {
      final api = context.read<ApiService>();
      final created = await api.createTranscription(
        CreateTranscriptionRequest(
          text: _transcribedText,
          language: _detectedLanguage ?? _selectedLanguage,
          durationSeconds: _audioService.recordingDuration.inSeconds.toDouble(),
          confidenceScore: _confidence,
          audioFilePath: _audioService.recordingPath,
        ),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
                'Transcription enregistrée #${created.id} (local + serveur)'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text('Sauvegarde serveur échouée (historique local OK): $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _exportPdf() async {
    if (_transcribedText.trim().isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucun texte à exporter en PDF')),
        );
      }
      return;
    }
    await _promptAndSavePdf(
      text: _transcribedText,
      title: 'Transcription',
      languageCode: _detectedLanguage ?? _selectedLanguage,
    );
  }

  Future<void> _promptAndSavePdf(
      {required String text,
      required String title,
      String? languageCode}) async {
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
    setState(() => _isSavingPdf = true);
    try {
      final path = await PdfService.saveTranscriptionPdf(
        text: text,
        title: title,
        languageCode: languageCode,
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
      if (mounted) setState(() => _isSavingPdf = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isRecording = _audioService.isRecording;
    final durationMs = _audioService.recordingDurationMs;
    final minutes = (durationMs ~/ 60000).toString().padLeft(2, '0');
    final seconds = ((durationMs ~/ 1000) % 60).toString().padLeft(2, '0');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Enregistrement Vocal'),
        backgroundColor: Color(AppColors.primaryValue),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Language Selector
            Card(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Language',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    SizedBox(height: AppSpacing.sm),
                    if (_isLoadingLanguages)
                      DropdownButton<String>(
                        value: _selectedLanguage,
                        isExpanded: true,
                        onChanged: isRecording
                            ? null
                            : (value) {
                                if (value != null) {
                                  setState(() => _selectedLanguage = value);
                                }
                              },
                        items: SupportedLanguages.languages.entries
                            .map((e) => DropdownMenuItem(
                                  value: e.key,
                                  child: Text(e.value),
                                ))
                            .toList(),
                      )
                    else
                      LanguageSelector(
                        title: 'Langue d\'entrée',
                        selectedLanguageCode: _selectedLanguage,
                        languages: _supportedLanguages,
                        onLanguageSelected: isRecording
                            ? (_) {}
                            : (code) {
                                setState(() => _selectedLanguage = code);
                              },
                      ),
                    SizedBox(height: AppSpacing.md),
                    SwitchListTile(
                      title:
                          const Text('Mode médical (reconnaissance renforcée)'),
                      value: _medicalMode,
                      onChanged: (v) => setState(() => _medicalMode = v),
                    ),
                    SizedBox(height: AppSpacing.md),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _importAudio,
                            icon: const Icon(Icons.audio_file),
                            label: const Text('Ajouter audio'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(AppColors.primaryValue),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: AppSpacing.lg),

            // Recording Timer
            Card(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    Text(
                      '$minutes:$seconds',
                      style:
                          Theme.of(context).textTheme.headlineLarge?.copyWith(
                                fontFamily: 'monospace',
                                color: Color(AppColors.primaryValue),
                              ),
                    ),
                    SizedBox(height: AppSpacing.md),
                    Text(
                      isRecording ? 'Recording...' : 'Ready',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: isRecording
                                ? Colors.red
                                : Color(AppColors.textSecondaryValue),
                          ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: AppSpacing.lg),

            // Recording Buttons
            Row(
              children: [
                Expanded(
                  child: CustomButton(
                    label: isRecording
                        ? 'Stop & Transcrire'
                        : 'Démarrer Enregistrement',
                    onPressed: isRecording
                        ? _stopRecording
                        : () async {
                            final simple =
                                await _audioService.hasMicrophonePermission();
                            if (!simple) {
                              _showSnack("Permission Micro requise",
                                  isError: true);
                              return;
                            }
                            final success =
                                await _audioService.startRecording();
                            if (!success) {
                              _showSnack("Échec du démarrage micro",
                                  isError: true);
                            } else {
                              setState(() {});
                            }
                          },
                    backgroundColor: isRecording
                        ? Colors.red
                        : Color(AppColors.primaryValue),
                  ),
                ),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: CustomButton(
                    label: 'Annuler',
                    onPressed: isRecording
                        ? () {
                            _audioService.cancelRecording();
                            setState(() {});
                          }
                        : () {},
                    backgroundColor: Color(AppColors.textTertiaryValue),
                  ),
                ),
              ],
            ),
            SizedBox(height: AppSpacing.lg),

            // Transcription Result
            if (_transcribedText.isNotEmpty)
              Card(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Transcription',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      SizedBox(height: AppSpacing.sm),
                      Text(
                        _transcribedText,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      SizedBox(height: AppSpacing.md),
                      Text(
                        'Confidence: ${(_confidence * 100).toStringAsFixed(1)}%',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      SizedBox(height: AppSpacing.md),
                      Row(
                        children: [
                          Expanded(
                            child: CustomButton(
                              label: 'Sauvegarder',
                              onPressed: _saveTranscription,
                              backgroundColor: Color(AppColors.primaryValue),
                            ),
                          ),
                          SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: CustomButton(
                              label: 'Exporter PDF',
                              onPressed: () {
                                if (_isSavingPdf) return;
                                _exportPdf();
                              },
                              isEnabled: !_isSavingPdf,
                              backgroundColor: Color(AppColors.primaryValue),
                            ),
                          ),
                          SizedBox(width: AppSpacing.md),
                          if (_isSavingPdf)
                            const SizedBox(
                              height: 28,
                              width: 28,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            if (_isTranscribing) ...[
              SizedBox(height: AppSpacing.lg),
              Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    Color(AppColors.primaryValue),
                  ),
                ),
              ),
              SizedBox(height: AppSpacing.md),
              Text(
                'Transcribing...',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
