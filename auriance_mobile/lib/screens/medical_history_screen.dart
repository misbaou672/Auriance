import 'dart:typed_data';
import 'dart:io';
import 'package:file_saver/file_saver.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/stt_service.dart';
import '../services/file_storage_service.dart';
import '../constants/feature_flags.dart';
import '../services/offline_demo_service.dart';

class MedicalHistoryScreen extends StatefulWidget {
  const MedicalHistoryScreen({super.key});

  @override
  State<MedicalHistoryScreen> createState() => _MedicalHistoryScreenState();
}

class _MedicalHistoryScreenState extends State<MedicalHistoryScreen> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = const [];
  final TextEditingController _filterCtrl = TextEditingController();
  bool _sttInitTried = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = FeatureFlags.skipLogin
          ? OfflineDemoService.medicalHistory(limit: 50)
          : await context.read<ApiService>().medicalHistory(limit: 50);
      final items = ((resp['items'] as List?) ?? [])
          .map((e) => (e as Map).cast<String, dynamic>())
          .toList();
      setState(() {
        _items = items;
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

  Future<void> _exportPdf(int id) async {
    if (FeatureFlags.skipLogin) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Export PDF indisponible en mode démo hors-ligne.')),
      );
      return;
    }
    final api = context.read<ApiService>();
    try {
      final bytes = await api.downloadMedicalHistoryPdf(id);
      final storage = FileStorageService();
      final dir = await storage.getPdfsDirectory();
      final filename =
          'medical_search_${id}_${DateTime.now().millisecondsSinceEpoch}.pdf';
      final file = File('${dir.path}/$filename');
      await file.writeAsBytes(Uint8List.fromList(bytes));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDF sauvegarde: ${file.path}')),
        );
      }
    } catch (e) {
      // Fallback via FileSaver if direct write fails
      try {
        await FileSaver.instance.saveFile(
          name: 'medical_search_$id',
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
    final stt = context.watch<SttService>();
    if (stt.isAvailable && stt.isListening) {
      final t = stt.text;
      if (t.isNotEmpty && _filterCtrl.text != t) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _filterCtrl.value = TextEditingValue(
            text: t,
            selection: TextSelection.collapsed(offset: t.length),
          );
        });
      }
    }
    final filter = _filterCtrl.text.trim().toLowerCase();
    final filtered = filter.isEmpty
        ? _items
        : _items
            .where((it) =>
                ((it['query'] as String?) ?? '').toLowerCase().contains(filter))
            .toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Historique médical')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child:
                      Text(_error!, style: const TextStyle(color: Colors.red)))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: filtered.length + 1,
                    separatorBuilder: (_, __) => const Divider(),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: TextField(
                            controller: _filterCtrl,
                            decoration: InputDecoration(
                              labelText: 'Filtrer par requête (voix ok)',
                              suffixIcon: IconButton(
                                tooltip: stt.isListening ? 'Arrêter' : 'Parler',
                                icon: Icon(
                                    stt.isListening ? Icons.stop : Icons.mic),
                                onPressed: () async {
                                  if (!stt.isAvailable && !_sttInitTried) {
                                    _sttInitTried = true;
                                    await context
                                        .read<SttService>()
                                        .initialize(preferredLocale: 'fr_FR');
                                  }
                                  final svc = context.read<SttService>();
                                  if (svc.isListening) {
                                    await svc.stopListening();
                                  } else {
                                    await svc.startListening(localeId: 'fr_FR');
                                  }
                                },
                              ),
                            ),
                            onChanged: (_) => setState(() {}),
                          ),
                        );
                      }
                      final it = filtered[index - 1];
                      final id = (it['id'] as num).toInt();
                      final query = (it['query'] as String?) ?? '';
                      final createdAt = it['created_at'] as String?;
                      return ListTile(
                        leading: const Icon(Icons.history),
                        title: Text(query),
                        subtitle: Text(createdAt ?? ''),
                        trailing: IconButton(
                          icon: const Icon(Icons.picture_as_pdf),
                          onPressed: () => _exportPdf(id),
                        ),
                        onTap: () async {
                          // Show quick detail
                          try {
                            final detail = FeatureFlags.skipLogin
                                ? OfflineDemoService.medicalHistoryDetail(id)
                                : await context
                                    .read<ApiService>()
                                    .medicalHistoryDetail(id);
                            if (!mounted) return;
                            showDialog(
                              context: context,
                              builder: (_) => AlertDialog(
                                title: Text('Détail #$id'),
                                content: SizedBox(
                                  width: double.maxFinite,
                                  child: SingleChildScrollView(
                                    child: Text(detail.toString()),
                                  ),
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context),
                                    child: const Text('Fermer'),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pop(context);
                                      _exportPdf(id);
                                    },
                                    child: const Text('Exporter PDF'),
                                  ),
                                ],
                              ),
                            );
                          } catch (e) {
                            if (!mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Erreur détail: $e')),
                            );
                          }
                        },
                      );
                    },
                  ),
                ),
    );
  }
}
