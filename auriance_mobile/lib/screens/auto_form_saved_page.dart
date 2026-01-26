import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../services/file_storage_service.dart';

class AutoFormSavedPage extends StatefulWidget {
  const AutoFormSavedPage({super.key});

  @override
  State<AutoFormSavedPage> createState() => _AutoFormSavedPageState();
}

class _AutoFormSavedPageState extends State<AutoFormSavedPage> {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    _future = FileStorageService().getHistory('formulaire');
  }

  void _refresh() {
    setState(() {
      _future = FileStorageService().getHistory('formulaire');
    });
  }

  String _safeString(dynamic v) => (v ?? '').toString().trim();

  String _formatTimestamp(dynamic value) {
    final raw = _safeString(value);
    final dt = DateTime.tryParse(raw);
    if (dt == null) return raw.isEmpty ? '—' : raw;
    return '${dt.day.toString().padLeft(2, '0')}/'
        '${dt.month.toString().padLeft(2, '0')}/'
        '${dt.year} '
        '${dt.hour.toString().padLeft(2, '0')}:'
        '${dt.minute.toString().padLeft(2, '0')}';
  }

  Future<void> _copyToClipboard(String label, String value) async {
    if (value.trim().isEmpty) return;
    await Clipboard.setData(ClipboardData(text: value));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$label copié')),
    );
  }

  Future<void> _openEntry(Map<String, dynamic> e) async {
    final ts = _formatTimestamp(e['timestamp']);
    final patient = _safeString(e['patient_name']);
    final diagnosis = _safeString(e['diagnosis']);
    final symptoms = _safeString(e['symptoms']);
    final treatment = _safeString(e['treatment']);
    final pdfPath = _safeString(e['pdf_path']);
    final transcription = _safeString(e['transcription']);

    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Auto-formulaire saved'),
          content: SingleChildScrollView(
            child: SelectableText(
              'Date: $ts\n'
              'Patient: ${patient.isEmpty ? '—' : patient}\n'
              'Symptômes: ${symptoms.isEmpty ? '—' : symptoms}\n'
              'Diagnostic: ${diagnosis.isEmpty ? '—' : diagnosis}\n'
              'Traitement: ${treatment.isEmpty ? '—' : treatment}\n\n'
              'PDF: ${pdfPath.isEmpty ? '—' : pdfPath}\n\n'
              'Contenu:\n${transcription.isEmpty ? '—' : transcription}',
            ),
          ),
          actions: [
            TextButton(
              onPressed: pdfPath.isEmpty
                  ? null
                  : () => _copyToClipboard('Chemin PDF', pdfPath),
              child: const Text('COPIER PDF'),
            ),
            TextButton(
              onPressed: transcription.isEmpty
                  ? null
                  : () => _copyToClipboard('Texte', transcription),
              child: const Text('COPIER TEXTE'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('FERMER'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Auto-formulaire saved'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Rafraîchir',
            onPressed: _refresh,
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Erreur: ${snapshot.error}'));
          }

          final list = snapshot.data ?? [];
          if (list.isEmpty) {
            return const Center(
              child: Text('Aucun auto-formulaire sauvegardé (local).'),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: list.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final e = list[index];
              final ts = _formatTimestamp(e['timestamp']);
              final patient = _safeString(e['patient_name']);
              final diagnosis = _safeString(e['diagnosis']);
              final pdfPath = _safeString(e['pdf_path']);

              return Card(
                child: ListTile(
                  title: Text(patient.isEmpty ? 'Patient Inconnu' : patient),
                  subtitle: Text(
                    [
                      ts,
                      if (diagnosis.isNotEmpty) 'Diag: $diagnosis',
                      if (pdfPath.isNotEmpty) 'PDF: OK',
                    ].join(' • '),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Icon(
                    pdfPath.isNotEmpty
                        ? Icons.picture_as_pdf
                        : Icons.description_outlined,
                    color: pdfPath.isNotEmpty ? Colors.red : null,
                  ),
                  onTap: () => _openEntry(e),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
