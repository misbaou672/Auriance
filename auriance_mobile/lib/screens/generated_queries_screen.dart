import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/audio_service.dart';
import '../constants/feature_flags.dart';
import '../services/offline_demo_service.dart';

/// Affiche trois requêtes générées depuis la voix: SQL, Cypher, Vectorielle
class GeneratedQueriesScreen extends StatefulWidget {
  const GeneratedQueriesScreen({super.key});

  @override
  State<GeneratedQueriesScreen> createState() => _GeneratedQueriesScreenState();
}

class _GeneratedQueriesScreenState extends State<GeneratedQueriesScreen> {
  final _intentController = TextEditingController();

  // Voice State
  bool _isRecording = false;
  bool _isTranscribing = false;

  // Generation State
  bool _isLoading = false;

  String _sql = '';
  String _cypher = '';
  String _vectorPayload = '';
  List<Map<String, dynamic>> _vectorHits = [];
  String _ragAnswer = '';

  @override
  void dispose() {
    _intentController.dispose();
    super.dispose();
  }

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
          // Utilise Whisper Backend pour une transcription parfaite
          final result = await api.aurianceTranscribeBytes(
            audioBytes: bytes,
            language: 'fr',
          );
          final text = result['transcription'] as String? ?? '';

          if (mounted) {
            setState(() {
              _intentController.text = text;
            });
            // Auto-generate if text is present
            if (text.isNotEmpty) {
              _generate();
            }
          }
        }
      } catch (e) {
        if (mounted) _showSnack('Erreur de transcription: $e');
      } finally {
        if (mounted) setState(() => _isTranscribing = false);
      }
    } else {
      // START RECORDING
      final hasPerm = await audioService.hasMicrophonePermission();
      if (!hasPerm) {
        _showSnack('Permission micro requise');
        return;
      }
      await audioService.startRecording();
      setState(() => _isRecording = true);
    }
  }

  Future<void> _generate() async {
    final intent = _intentController.text.trim();
    if (intent.isEmpty) {
      _showSnack('Dicte une intention d\'abord');
      return;
    }
    setState(() => _isLoading = true);

    try {
      if (FeatureFlags.skipLogin) {
        final vector = {
          'collection': 'documents',
          'query': intent,
          'limit': 5,
        };
        final hits = OfflineDemoService.vectorSearch(intent, limit: 5);
        setState(() {
          _sql = OfflineDemoService.generateSql(intent);
          _cypher = OfflineDemoService.generateCypher(intent);
          _vectorPayload = const JsonEncoder.withIndent('  ').convert(vector);
          _vectorHits = hits;
          _ragAnswer = '';
        });
        return;
      }

      final api = context.read<ApiService>();

      print('🔄 Génération des requêtes pour: "$intent"');

      final ragResult = await api.submitRagQuery(intent, topK: 5);

      String sql = (ragResult['sql_query'] as String?)?.trim() ?? '';
      String cypher = (ragResult['cypher_query'] as String?)?.trim() ?? '';
      final vectorQuery = (ragResult['vector_query'] as String?)?.trim() ?? '';
      final answer = (ragResult['answer'] as String?)?.trim() ?? '';

      // Fallback si backend renvoie des requêtes vides
      if (sql.isEmpty) {
        try {
          sql = await api.generateSqlQuery(intent: intent);
        } catch (_) {}
      }
      if (cypher.isEmpty) {
        try {
          cypher = await api.generateCypherQuery(intent: intent);
        } catch (_) {}
      }

      final hits = (ragResult['hits_qdrant'] as List? ?? [])
          .map((e) => (e as Map).cast<String, dynamic>())
          .toList();

      print('✅ SQL reçu: ${sql.isNotEmpty ? sql : '(vide)'}');
      print('✅ Cypher reçu: ${cypher.isNotEmpty ? cypher : '(vide)'}');
      print('✅ Qdrant hits: ${hits.length}');

      setState(() {
        _sql = sql.isNotEmpty ? sql : '-- Aucune requête SQL générée --';
        _cypher =
            cypher.isNotEmpty ? cypher : '// Aucune requête Cypher générée //';
        _vectorPayload = vectorQuery.isNotEmpty
            ? vectorQuery
            : "qdrant.search(collection='documents', query_vector=embed('$intent'), limit=5)";
        _vectorHits = hits;
        _ragAnswer = answer;
      });

      // Afficher un message si toutes les requêtes sont vides
      if (sql.isEmpty && cypher.isEmpty && hits.isEmpty) {
        _showSnack('⚠️ Aucune requête générée. Vérifiez le backend.');
      } else {
        _showSnack('✅ Requêtes générées avec succès');
      }
    } catch (e) {
      print('❌ Erreur génération: $e');
      if (FeatureFlags.skipLogin) {
        final vector = {
          'collection': 'documents',
          'query': intent,
          'limit': 5,
        };
        final hits = OfflineDemoService.vectorSearch(intent, limit: 5);
        setState(() {
          _sql = OfflineDemoService.generateSql(intent);
          _cypher = OfflineDemoService.generateCypher(intent);
          _vectorPayload = const JsonEncoder.withIndent('  ').convert(vector);
          _vectorHits = hits;
        });
      } else {
        _showSnack('❌ Erreur: $e');
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  Widget _buildCodeView(String code, {String language = 'sql'}) {
    if (code.isEmpty) {
      return const Center(
        child: Text('Aucune requête générée',
            style: TextStyle(color: Colors.grey)),
      );
    }
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: SelectableText(
        code,
        style: const TextStyle(
          fontFamily: 'monospace',
          fontSize: 14,
          height: 1.4,
        ),
      ),
    );
  }

  Widget _buildVectorView() {
    if (_vectorPayload.isEmpty) {
      return const Center(
        child: Text('Aucune requête vectorielle',
            style: TextStyle(color: Colors.grey)),
      );
    }
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Payload Qdrant:",
              style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Text(
              _vectorPayload,
              style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
            ),
          ),
          const SizedBox(height: 20),
          const Text("Résultats (Top 5):",
              style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ..._vectorHits.map((hit) {
            final score = hit['score'];
            final payload = hit['payload'] as Map<String, dynamic>?;
            final text =
                payload?['text']?.toString() ?? payload?.toString() ?? '';
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                dense: true,
                title: Text(text, maxLines: 2, overflow: TextOverflow.ellipsis),
                subtitle: Text(
                    'Score: ${score is num ? score.toStringAsFixed(3) : score}'),
                leading: const Icon(Icons.data_array, color: Colors.purple),
              ),
            );
          })
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Requêtes Générées'),
          bottom: const TabBar(
            tabs: [
              Tab(text: "SQL", icon: Icon(Icons.storage)),
              Tab(text: "Cypher", icon: Icon(Icons.share)),
              Tab(text: "Vector", icon: Icon(Icons.manage_search)),
            ],
          ),
        ),
        body: Column(
          children: [
            // Zone de dictée (fixe en haut)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextField(
                    controller: _intentController,
                    decoration: InputDecoration(
                      hintText: 'Ex: "Patients qui ont de la fièvre..."',
                      suffixIcon: IconButton(
                        icon: _isTranscribing
                            ? const SizedBox(
                                width: 24,
                                height: 24,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2))
                            : Icon(_isRecording ? Icons.stop_circle : Icons.mic,
                                color: _isRecording ? Colors.red : Colors.blue),
                        onPressed: _isTranscribing ? null : _toggleRecording,
                        tooltip: "Maintenir ou cliquer pour dicter",
                      ),
                      border: const OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: (_isLoading || _isRecording || _isTranscribing)
                          ? null
                          : _generate,
                      icon: _isLoading
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.auto_awesome),
                      label: Text(_isLoading
                          ? 'Génération en cours...'
                          : 'Générer les 3 requêtes'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  if (_ragAnswer.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue.shade100),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Réponse IA (RAG):',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text(_ragAnswer),
                          const SizedBox(height: 10),
                          const Text(
                            'Conclusion : Voilà comment on aide les entreprises à automatiser leurs processus.',
                            style: TextStyle(fontStyle: FontStyle.italic),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Divider(height: 1),
            // Contenu des onglets
            Expanded(
              child: TabBarView(
                children: [
                  _buildCodeView(_sql, language: 'sql'),
                  _buildCodeView(_cypher, language: 'cypher'),
                  _buildVectorView(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
