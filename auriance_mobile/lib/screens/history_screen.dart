import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_theme.dart';
import '../models/transcription_models.dart';
import '../services/pdf_service.dart';
import '../services/api_service.dart';
import '../services/file_storage_service.dart';

class _HistoryItem {
  final Transcription transcription;
  final Extraction? extraction;
  final Report? report;

  const _HistoryItem({
    required this.transcription,
    this.extraction,
    this.report,
  });
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  late Future<List<_HistoryItem>> _serverHistoryFuture;
  late Future<List<Map<String, dynamic>>> _localHistoryFuture;
  late Future<List<Map<String, dynamic>>> _consultationsFuture;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _refreshAll();
  }

  void _refreshAll() {
    setState(() {
      _serverHistoryFuture = _loadServerHistory();
      _localHistoryFuture = _loadLocalHistory();
      _consultationsFuture = _loadConsultations();
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Historique'),
          backgroundColor: Color(AppColors.primaryValue),
          elevation: 0,
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Rafraîchir',
              onPressed: _refreshAll,
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.description), text: 'Formulaires'),
              Tab(icon: Icon(Icons.cloud_outlined), text: 'Serveur'),
              Tab(icon: Icon(Icons.phone_android), text: 'Local'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildConsultationsTab(),
            _buildServerHistoryTab(),
            _buildLocalHistoryTab(),
          ],
        ),
      ),
    );
  }

  // --- LOGIC: Consultations ---
  Future<List<Map<String, dynamic>>> _loadConsultations() async {
    final apiService = context.read<ApiService>();
    return await apiService.getConsultations(limit: 1000);
  }

  Widget _buildConsultationsTab() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _consultationsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Erreur: ${snapshot.error}'));
        }
        final list = snapshot.data ?? [];
        if (list.isEmpty) {
          return _emptyPlaceholder(
            icon: Icons.assignment_turned_in,
            title: 'Aucun formulaire enregistré',
            subtitle:
                'Les consultations médicales sauvegardées apparaîtront ici.',
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: list.length,
          itemBuilder: (context, index) {
            final item = list[index];
            final patientName = item['patient_name'] ?? 'Patient Inconnu';
            final dateStr = item['created_at'];
            final date =
                DateTime.tryParse(dateStr.toString()) ?? DateTime.now();
            final symptomes = item['symptomes'] ?? 'Aucun symptôme';
            final age = item['age'];
            final id = item['id'];

            return Card(
              elevation: 2,
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                title: Text(
                  patientName.toString().toUpperCase(),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                        '${age != null ? "$age ans • " : ""}${_formatDate(date)}'),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        symptomes.toString(),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: Colors.blue.shade900),
                      ),
                    ),
                  ],
                ),
                trailing: IconButton(
                  icon: const Icon(Icons.picture_as_pdf, color: Colors.red),
                  tooltip: 'Voir PDF',
                  onPressed: () => _openConsultationPdf(item),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openConsultationPdf(Map<String, dynamic> item) async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ouverture du PDF...')),
      );

      // Le PDF n'est pas stocké en base binaire, on le régénère à la volée
      // pour garantir qu'on peut toujours le voir.
      final content = '''
      Consultation Médicale - AURIANCE
      ===============================

      Nom du patient : ${item['patient_name'] ?? 'Inconnu'}
      Âge : ${item['age'] ?? '?'} ans
      
      Symptômes :
      ${item['symptomes'] ?? '-'}

      Diagnostic :
      ${item['diagnostic'] ?? '-'}

      Traitement Prescrit :
      ${item['traitement'] ?? '-'}

      --------------------------------
      Date : ${item['created_at']}
      ID Consultation : ${item['id']}
      ''';

      final path = await PdfService.saveTranscriptionPdf(
        text: content,
        title: 'Consultation - ${item['patient_name'] ?? 'Inconnu'}',
        logoAssetPath: 'assets/images/logo.png',
        preferAppMedia: true,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('PDF prêt: $path'),
            action: SnackBarAction(
              label: 'OK',
              onPressed: () {},
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Erreur PDF: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  // --- LOGIC: Server History ---
  Future<List<_HistoryItem>> _loadServerHistory() async {
    final apiService = context.read<ApiService>();
    final transcriptions = await apiService.getTranscriptions(limit: 1000);

    List<Extraction> extractions = const [];
    List<Report> reports = const [];
    try {
      extractions = await apiService.getExtractions(limit: 1000);
    } catch (_) {}
    try {
      reports = await apiService.getReports(limit: 1000);
    } catch (_) {}

    final extractionByTid = {
      for (final extraction in extractions)
        extraction.transcriptionId: extraction
    };
    final reportByTid = {
      for (final report in reports) report.transcriptionId: report
    };

    return transcriptions
        .map(
          (t) => _HistoryItem(
            transcription: t,
            extraction: extractionByTid[t.id],
            report: reportByTid[t.id],
          ),
        )
        .toList();
  }

  // --- LOGIC: Local History ---
  Future<List<Map<String, dynamic>>> _loadLocalHistory() async {
    final storage = FileStorageService();
    final realtime = await storage.getHistory('transcription_temps_reel');
    final forms = await storage.getHistory('formulaire');
    final contexts = await storage.getHistory('contexte_extraction');
    final reports = await storage.getHistory('compte_rendu');

    final merged = <Map<String, dynamic>>[
      ...realtime,
      ...forms,
      ...contexts,
      ...reports
    ];
    merged.sort((a, b) {
      final ta = DateTime.tryParse((a['timestamp'] ?? '').toString()) ??
          DateTime.fromMillisecondsSinceEpoch(0);
      final tb = DateTime.tryParse((b['timestamp'] ?? '').toString()) ??
          DateTime.fromMillisecondsSinceEpoch(0);
      return tb.compareTo(ta);
    });
    return merged;
  }

  Widget _buildServerHistoryTab() {
    return FutureBuilder<List<_HistoryItem>>(
      future: _serverHistoryFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(
            child: CircularProgressIndicator(
              valueColor:
                  AlwaysStoppedAnimation<Color>(Color(AppColors.primaryValue)),
            ),
          ).animate().fadeIn(duration: 400.ms);
        }

        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  color: Color(AppColors.errorValue),
                  size: 48,
                ),
                SizedBox(height: AppSpacing.md),
                Text(
                  'Error: ${snapshot.error}',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          );
        }

        var history = snapshot.data ?? [];
        if (_searchQuery.isNotEmpty) {
          final q = _searchQuery.toLowerCase();
          history = history.where((it) {
            final text = it.transcription.text.toLowerCase();
            return text.contains(q);
          }).toList();
        }

        if (history.isEmpty) {
          return _emptyPlaceholder(
            icon: Icons.cloud_off,
            title: 'Aucune transcription serveur',
            subtitle: 'Enregistrez pour créer votre première entrée serveur',
          );
        }

        return Column(
          children: [
            Padding(
              padding: EdgeInsets.all(AppSpacing.md),
              child: TextField(
                controller: _searchController,
                onChanged: (v) => setState(() => _searchQuery = v),
                decoration: const InputDecoration(
                  hintText: 'Rechercher (texte/titre)',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: EdgeInsets.all(AppSpacing.md),
                itemCount: history.length,
                itemBuilder: (context, index) {
                  final item = history[index];
                  final transcription = item.transcription;
                  final textTheme = Theme.of(context).textTheme;
                  return Card(
                    margin: EdgeInsets.only(bottom: AppSpacing.md),
                    child: Padding(
                      padding: EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  'Transcription #${transcription.id}',
                                  style: textTheme.titleSmall,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.picture_as_pdf_outlined),
                                tooltip: 'Exporter en PDF',
                                onPressed: () => _exportToPdf(item),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline),
                                tooltip: 'Supprimer',
                                onPressed: () =>
                                    _confirmDelete(transcription.id),
                              ),
                              Icon(Icons.mic,
                                  color: Color(AppColors.textTertiaryValue)),
                            ],
                          ),
                          SizedBox(height: AppSpacing.xs),
                          Text(
                            _truncate(transcription.text, max: 240),
                            style: textTheme.bodyMedium,
                          ),
                          SizedBox(height: AppSpacing.sm),
                          Wrap(
                            spacing: AppSpacing.sm,
                            runSpacing: 4,
                            children: [
                              _infoChip(Icons.language, transcription.language),
                              if (transcription.durationSeconds != null)
                                _infoChip(Icons.timer,
                                    '${transcription.durationSeconds?.toStringAsFixed(1)}s'),
                              _infoChip(
                                Icons.speed,
                                'Conf: ${((transcription.confidenceScore ?? 0) * 100).toStringAsFixed(1)}%',
                              ),
                              _infoChip(
                                Icons.event,
                                _formatDate(transcription.createdAt),
                              ),
                            ],
                          ),
                          SizedBox(height: AppSpacing.md),
                          Divider(
                              height: 1, color: Color(AppColors.borderValue)),
                          SizedBox(height: AppSpacing.sm),
                          Text('Contexte', style: textTheme.titleSmall),
                          SizedBox(height: AppSpacing.xs),
                          _buildContextSection(item.extraction, textTheme),
                          SizedBox(height: AppSpacing.md),
                          Divider(
                              height: 1, color: Color(AppColors.borderValue)),
                          SizedBox(height: AppSpacing.sm),
                          Text('Compte rendu', style: textTheme.titleSmall),
                          SizedBox(height: AppSpacing.xs),
                          _buildReportSection(item.report, textTheme),
                        ],
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(duration: 300.ms)
                      .slideY(begin: 0.1, end: 0);
                },
              ),
            ),
          ],
        ).animate().fadeIn(duration: 250.ms);
      },
    );
  }

  Widget _buildLocalHistoryTab() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _localHistoryFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(
            child: CircularProgressIndicator(
              valueColor:
                  AlwaysStoppedAnimation<Color>(Color(AppColors.primaryValue)),
            ),
          );
        }

        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  color: Color(AppColors.errorValue),
                  size: 48,
                ),
                SizedBox(height: AppSpacing.md),
                Text(
                  'Error: ${snapshot.error}',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          );
        }

        final entries = snapshot.data ?? [];

        if (entries.isEmpty) {
          return _emptyPlaceholder(
            icon: Icons.phone_android,
            title: 'Aucun historique local',
            subtitle:
                'Les transcriptions et formulaires sauvegardés localement apparaîtront ici.',
          );
        }

        return ListView.builder(
          padding: EdgeInsets.all(AppSpacing.md),
          itemCount: entries.length,
          itemBuilder: (context, index) {
            final entry = entries[index];
            final dt = _parseTimestamp(entry['timestamp']);
            final textTheme = Theme.of(context).textTheme;
            final type = (entry['type'] ?? '').toString();

            // Custom UI for different types
            IconData icon = Icons.description;
            String typeLabel = 'Fichier';
            String title = 'Élément local';
            String subtitle = (entry['transcription'] ?? '').toString();

            if (type == 'transcription_temps_reel') {
              icon = Icons.mic;
              typeLabel = 'Transcription';
              title = 'Dictée vocale';
            } else if (type == 'formulaire') {
              icon = Icons.assignment;
              typeLabel = 'Formulaire';
              title = entry['patient_name'] ?? 'Formulaire Patient';
            } else if (type == 'contexte_extraction') {
              icon = Icons.psychology;
              typeLabel = 'Contexte IA';
              title = 'Extraction contextuelle';
              // Display some key fields nicely
              final name = entry['nom'] ?? entry['full_name'];
              if (name != null) subtitle = 'Patient: $name\n$subtitle';
            } else if (type == 'compte_rendu') {
              icon = Icons.article;
              typeLabel = 'Rapport';
              title = entry['title'] ?? 'Compte Rendu';
            }

            return Card(
              margin: EdgeInsets.only(bottom: AppSpacing.md),
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(icon,
                            size: 20, color: Color(AppColors.primaryValue)),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            title,
                            style: textTheme.titleSmall,
                          ),
                        ),
                        if (entry['pdf_path'] != null)
                          Icon(Icons.picture_as_pdf,
                              size: 16, color: Colors.red),
                      ],
                    ),
                    SizedBox(height: AppSpacing.xs),
                    if (subtitle.isNotEmpty)
                      Text(
                        _truncate(subtitle, max: 180),
                        style: textTheme.bodyMedium,
                      ),
                    SizedBox(height: AppSpacing.sm),
                    Wrap(
                      spacing: AppSpacing.sm,
                      runSpacing: 4,
                      children: [
                        _infoChip(Icons.event, _formatDate(dt)),
                        _infoChip(Icons.label, typeLabel),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _confirmDelete(int transcriptionId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer la transcription ?'),
        content: const Text(
            'Cette action supprimera la transcription et ses données associées.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    final apiService = context.read<ApiService>();
    try {
      await apiService.deleteTranscription(transcriptionId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transcription supprimée')),
        );
        _refreshAll();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de suppression: $e')),
        );
      }
    }
  }

  Future<void> _exportToPdf(_HistoryItem item) async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Génération du PDF...')),
      );
      final path = await PdfService.saveTranscriptionPdf(
        text: item.transcription.text,
        title: 'Transcription #${item.transcription.id}',
        languageCode: item.transcription.language,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDF sauvegardé: $path')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur PDF: $e')),
        );
      }
    }
  }

  Widget _infoChip(IconData icon, String label) {
    return Chip(
      padding: EdgeInsets.zero,
      visualDensity: VisualDensity.compact,
      avatar: Icon(icon, size: 16),
      label: Text(label),
    );
  }

  Widget _buildContextSection(Extraction? extraction, TextTheme textTheme) {
    if (extraction == null) {
      return Text(
        'Contexte non enregistré',
        style: textTheme.bodySmall?.copyWith(
          color: Color(AppColors.textTertiaryValue),
        ),
      );
    }

    final rows = <Widget>[];

    void addRow(String label, String? value) {
      if (value == null || value.isEmpty) return;
      rows.add(Padding(
        padding: EdgeInsets.only(bottom: AppSpacing.xs),
        child: Text('$label: $value', style: textTheme.bodySmall),
      ));
    }

    addRow('Nom', extraction.fullName);
    addRow('Email', extraction.email);
    addRow('Téléphone', extraction.phone);
    addRow('Date de naissance', extraction.dateOfBirth);
    addRow('Adresse', extraction.address);
    addRow('Âge', extraction.age?.toString());
    addRow('Formulaire', extraction.formType);

    if (rows.isEmpty && extraction.extraFields != null) {
      final prettyJson =
          const JsonEncoder.withIndent('  ').convert(extraction.extraFields);
      rows.add(Text(
        _truncate(prettyJson, max: 320),
        style: textTheme.bodySmall,
      ));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: rows.isEmpty
          ? [
              Text(
                'Contexte enregistré',
                style: textTheme.bodySmall,
              ),
            ]
          : rows,
    );
  }

  Widget _buildReportSection(Report? report, TextTheme textTheme) {
    if (report == null) {
      return Text(
        'Compte rendu non enregistré',
        style: textTheme.bodySmall?.copyWith(
          color: Color(AppColors.textTertiaryValue),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (report.title.isNotEmpty)
          Padding(
            padding: EdgeInsets.only(bottom: AppSpacing.xs),
            child: Text(report.title, style: textTheme.bodyMedium),
          ),
        Text(
          _truncate(report.content, max: 320),
          style: textTheme.bodySmall,
        ),
        SizedBox(height: AppSpacing.xs),
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: 4,
          children: [
            _infoChip(Icons.article,
                report.reportType.isEmpty ? 'consultation' : report.reportType),
            _infoChip(Icons.format_align_left, report.format),
            _infoChip(Icons.event, _formatDate(report.createdAt)),
          ],
        ),
      ],
    );
  }

  String _truncate(String text, {int max = 200}) {
    if (text.length <= max) return text;
    return '${text.substring(0, max)}…';
  }

  String _formatDate(DateTime dt) {
    final local = dt.toLocal();
    String two(int v) => v.toString().padLeft(2, '0');
    return '${two(local.day)}/${two(local.month)} ${two(local.hour)}:${two(local.minute)}';
  }

  DateTime _parseTimestamp(dynamic v) {
    if (v is String) {
      final parsed = DateTime.tryParse(v);
      if (parsed != null) return parsed;
    }
    return DateTime.now();
  }

  Widget _emptyPlaceholder({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Color(AppColors.textTertiaryValue))
                .animate()
                .fadeIn(duration: 300.ms)
                .scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1)),
            SizedBox(height: AppSpacing.md),
            Text(title, style: Theme.of(context).textTheme.titleSmall)
                .animate()
                .fadeIn(duration: 350.ms),
            SizedBox(height: AppSpacing.xs),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: Color(AppColors.textTertiaryValue)),
            ).animate().fadeIn(duration: 400.ms),
          ],
        ),
      ),
    );
  }
}
