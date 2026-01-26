import 'dart:typed_data';
import 'dart:io';
import 'package:file_saver/file_saver.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/audio_service.dart';
import '../services/file_storage_service.dart';
import '../constants/feature_flags.dart';
import '../services/offline_demo_service.dart';

class MedicalSearchScreen extends StatefulWidget {
  const MedicalSearchScreen({super.key});

  @override
  State<MedicalSearchScreen> createState() => _MedicalSearchScreenState();
}

class _MedicalSearchScreenState extends State<MedicalSearchScreen> {
  final TextEditingController _queryCtrl = TextEditingController();
  bool _loading = false;
  int _limit = 5;
  Map<String, dynamic>? _resp;
  String? _error;
  int? _lastHistoryId;
  bool _isRecording = false;
  bool _isTranscribing = false;

  Future<void> _toggleRecording() async {
    final audioService = context.read<AudioService>();

    if (_isRecording) {
      // STOP RECORDING
      await audioService.stopRecording();
      setState(() {
        _isRecording = false;
        _isTranscribing = true;
      });

      try {
        final bytes = await audioService.getAudioBytes();
        if (bytes != null) {
          final api = context.read<ApiService>();
          // Utilise le backend Whisper pour transcription
          final result = await api.aurianceTranscribeBytes(
            audioBytes: bytes,
            language: 'fr',
          );
          final text = result['transcription'] as String? ?? '';

          if (mounted) {
            _queryCtrl.text = text;

            // Auto-search si texte non vide
            if (text.isNotEmpty) {
              _run();
            }
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erreur transcription: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) setState(() => _isTranscribing = false);
      }
    } else {
      // START RECORDING
      final hasPerm = await audioService.hasMicrophonePermission();
      if (!hasPerm) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Permission microphone requise'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        return;
      }
      await audioService.startRecording();
      setState(() => _isRecording = true);
    }
  }

  Future<void> _run() async {
    final q = _queryCtrl.text.trim();
    if (q.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Entrez une requête')),
      );
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = FeatureFlags.skipLogin
          ? OfflineDemoService.medicalSearch(q, limit: _limit)
          : await context
              .read<ApiService>()
              .medicalSearch(query: q, limit: _limit);
      setState(() {
        _resp = resp;
        _lastHistoryId = (resp['history_id'] as num?)?.toInt();
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _exportPdf() async {
    if (FeatureFlags.skipLogin) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Export PDF indisponible en mode démo hors-ligne.')),
      );
      return;
    }
    final id = _lastHistoryId;
    if (id == null) return;
    final api = context.read<ApiService>();
    try {
      final bytes = await api.downloadMedicalHistoryPdf(id);
      final storage = FileStorageService();
      final dir = await storage.getPdfsDirectory();
      final name =
          'medical_search_${id}_${DateTime.now().millisecondsSinceEpoch}.pdf';
      final file = File('${dir.path}/$name');
      await file.writeAsBytes(Uint8List.fromList(bytes));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDF sauvegardé: ${file.path}')),
        );
      }
    } catch (e) {
      // Fallback via FileSaver if direct write fails
      try {
        final name = 'medical_search_$id';
        await FileSaver.instance.saveFile(
          name: name,
          bytes: Uint8List.fromList(await api.downloadMedicalHistoryPdf(id)),
          fileExtension: 'pdf',
          mimeType: MimeType.other,
        );
      } catch (_) {}
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur export PDF: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final results = ((_resp?['results'] as List?) ?? []).cast<Map>();
    final advice = (_resp?['advice'] as Map?) ?? {};
    final suggestions =
        (advice['suggestions'] as List?)?.cast<String>() ?? const [];
    final disclaimer = advice['disclaimer'] as String?;

    return Scaffold(
      appBar: AppBar(title: const Text('Recherche médicale')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _queryCtrl,
              decoration: InputDecoration(
                labelText: 'Symptôme / maladie / terme médical',
                hintText: 'ex.: toux sèche, angine, migraine',
                suffixIcon: IconButton(
                  tooltip: _isTranscribing
                      ? 'Transcription...'
                      : (_isRecording ? 'Arrêter' : 'Parler'),
                  icon: _isTranscribing
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Icon(_isRecording ? Icons.stop_circle : Icons.mic,
                          color: _isRecording ? Colors.red : Colors.blue),
                  onPressed: _isTranscribing ? null : _toggleRecording,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Text('Top K:'),
                const SizedBox(width: 8),
                DropdownButton<int>(
                  value: _limit,
                  items: const [3, 5, 10, 20]
                      .map((v) =>
                          DropdownMenuItem<int>(value: v, child: Text('$v')))
                      .toList(),
                  onChanged: _loading
                      ? null
                      : (v) {
                          if (v != null) setState(() => _limit = v);
                        },
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _run,
                  icon: const Icon(Icons.search),
                  label: const Text('Rechercher'),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed:
                      (_loading || _lastHistoryId == null) ? null : _exportPdf,
                  icon: const Icon(Icons.picture_as_pdf),
                  label: const Text('Exporter PDF'),
                )
              ],
            ),
            const SizedBox(height: 12),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            if (disclaimer != null) ...[
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Conseils (généraux):',
                    style: Theme.of(context).textTheme.titleMedium),
              ),
              const SizedBox(height: 6),
              Text(disclaimer, style: const TextStyle(fontSize: 12)),
              const SizedBox(height: 6),
              for (final s in suggestions)
                Row(children: [
                  const Icon(Icons.check, size: 16),
                  const SizedBox(width: 6),
                  Expanded(child: Text(s))
                ]),
              const Divider(height: 24),
            ],
            Expanded(
              child: ListView.separated(
                itemCount: results.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (context, index) {
                  final h = results[index].cast<String, dynamic>();
                  final text =
                      (h['payload'] as Map?)?['text']?.toString() ?? '';
                  final score = (h['score'] as num?)?.toDouble();
                  return ListTile(
                    leading: const Icon(Icons.description),
                    title: Text(text.isEmpty ? '(texte indisponible)' : text),
                    subtitle: Text(score != null
                        ? 'score: ${score.toStringAsFixed(3)}'
                        : ''),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
