import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_theme.dart';
import '../constants/feature_flags.dart';
import '../services/api_service.dart';
import '../services/offline_demo_service.dart';
import '../services/stt_service.dart';

class DebugVectorScreen extends StatefulWidget {
  const DebugVectorScreen({super.key});

  @override
  State<DebugVectorScreen> createState() => _DebugVectorScreenState();
}

class _DebugVectorScreenState extends State<DebugVectorScreen> {
  final TextEditingController _ingestController = TextEditingController(
    text: 'Le patient a une fièvre élevée et des maux de tête',
  );
  final TextEditingController _queryController =
      TextEditingController(text: 'fièvre');

  bool _loading = false;
  Map<String, dynamic>? _lastResponse;
  List<_SearchItem> _items = const [];
  String? _error;
  String _status = '';
  int _limit = 5;

  @override
  void dispose() {
    _ingestController.dispose();
    _queryController.dispose();
    super.dispose();
  }

  void _notify(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  void _updateResponse(Map<String, dynamic> resp) {
    setState(() {
      _lastResponse = resp;
      _items = _extractItems(resp);
    });
  }

  List<_SearchItem> _extractItems(Map<String, dynamic> resp) {
    final raw = (resp['results'] ??
        resp['qdrant_results'] ??
        resp['hits'] ??
        []) as List<dynamic>;
    return raw.map((e) {
      final map = (e is Map) ? e.cast<String, dynamic>() : <String, dynamic>{};
      final payload = (map['payload'] is Map)
          ? (map['payload'] as Map).cast<String, dynamic>()
          : <String, dynamic>{};
      final text = (payload['text'] ?? map['text'] ?? '').toString();
      final score = (map['score'] ?? payload['score'] ?? '').toString();
      return _SearchItem(text: text, score: score);
    }).toList();
  }

  Future<void> _runIngest() async {
    final text = _ingestController.text.trim();
    if (text.isEmpty) {
      setState(() => _error = 'Please enter text to ingest.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = FeatureFlags.skipLogin
          ? OfflineDemoService.vectorIngestDemo(text: text)
          : await context.read<ApiService>().demoIngest(text: text);
      _updateResponse(resp);
      final insertedId = resp['inserted_id']?.toString();
      final msg =
          insertedId != null ? 'Ingest OK (id=$insertedId)' : 'Ingest OK';
      _notify(msg);
      setState(() => _status = msg);
    } catch (e) {
      setState(() => _error = e.toString());
      _notify('Ingest error');
      setState(() => _status = 'Ingest error');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _runSearch() async {
    final q = _queryController.text.trim();
    if (q.isEmpty) {
      setState(() => _error = 'Please enter a query to search.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = FeatureFlags.skipLogin
          ? OfflineDemoService.vectorSearchDemo(query: q, limit: _limit)
          : await context
              .read<ApiService>()
              .demoSearch(query: q, limit: _limit);
      _updateResponse(resp);
      final msg = 'Search: ${_items.length} result(s)';
      _notify(msg);
      setState(() => _status = msg);
    } catch (e) {
      setState(() => _error = e.toString());
      _notify('Search error');
      setState(() => _status = 'Search error');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _runIngestAndSearch() async {
    final text = _ingestController.text.trim();
    final q = _queryController.text.trim();
    if (text.isEmpty) {
      setState(() => _error = 'Please enter text to ingest.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = FeatureFlags.skipLogin
          ? OfflineDemoService.vectorIngestAndSearchDemo(
              text: text,
              query: q.isEmpty ? null : q,
              limit: _limit,
            )
          : await context.read<ApiService>().demoIngestAndSearch(
                text: text,
                query: q.isEmpty ? null : q,
                limit: _limit,
              );
      _updateResponse(resp);
      final insertedId = resp['inserted_id']?.toString();
      final msg =
          'Ingest+Search: id=${insertedId ?? '?'} • ${_items.length} result(s)';
      _notify(msg);
      setState(() => _status = msg);
    } catch (e) {
      setState(() => _error = e.toString());
      _notify('Ingest+Search error');
      setState(() => _status = 'Ingest+Search error');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _runSemanticGraph() async {
    final q = _queryController.text.trim();
    if (q.isEmpty) {
      setState(() => _error = 'Please enter a query to search.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final resp = FeatureFlags.skipLogin
          ? OfflineDemoService.vectorSemanticGraphDemo(query: q, limit: _limit)
          : await context
              .read<ApiService>()
              .demoSemanticGraph(query: q, limit: _limit);
      _updateResponse(resp);
      final neo4j = (resp['neo4j'] ?? resp['graph'])?.toString();
      final msg =
          'Semantic+Graph: ${_items.length} result(s) • Neo4j=${neo4j ?? 'n/a'}';
      _notify(msg);
      setState(() => _status = msg);
    } catch (e) {
      setState(() => _error = e.toString());
      _notify('Semantic+Graph error');
      setState(() => _status = 'Semantic+Graph error');
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final stt = context.watch<SttService>();
    if (stt.isAvailable && stt.isListening) {
      final t = stt.text;
      if (t.isNotEmpty && _queryController.text != t) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _queryController.value = TextEditingValue(
            text: t,
            selection: TextSelection.collapsed(offset: t.length),
          );
        });
      }
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text('Debug: Vector Search'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Demo endpoints to ingest and search Qdrant',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextField(
              controller: _ingestController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Text to ingest',
                hintText: 'e.g., Le patient présente une fièvre persistante...',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _queryController,
              decoration: InputDecoration(
                labelText: 'Query',
                hintText: 'e.g., fièvre',
                suffixIcon: IconButton(
                  tooltip: stt.isListening ? 'Stop' : 'Speak',
                  icon: Icon(stt.isListening ? Icons.stop : Icons.mic),
                  onPressed: () async {
                    final svc = context.read<SttService>();
                    if (!svc.isAvailable) {
                      await svc.initialize(preferredLocale: 'fr_FR');
                    }
                    if (svc.isListening) {
                      await svc.stopListening();
                    } else {
                      await svc.startListening(localeId: 'fr_FR');
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: _loading
                      ? null
                      : () {
                          setState(() {
                            _items = const [];
                            _lastResponse = null;
                            _error = null;
                            _status = 'Cleared';
                          });
                          _notify('Cleared');
                        },
                  icon: const Icon(Icons.clear_all),
                  label: const Text('Clear'),
                ),
                const SizedBox(width: 12),
                Text('Top K:', style: Theme.of(context).textTheme.bodySmall),
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
                          if (v == null) return;
                          setState(() => _limit = v);
                        },
                ),
              ],
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                ElevatedButton.icon(
                  onPressed: _loading ? null : _seedCorpus,
                  icon: const Icon(Icons.library_add),
                  label: const Text('Seed corpus'),
                ),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _runIngest,
                  icon: const Icon(Icons.upload_file),
                  label: const Text('Ingest'),
                ),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _runSearch,
                  icon: const Icon(Icons.search),
                  label: const Text('Search'),
                ),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _runIngestAndSearch,
                  icon: const Icon(Icons.playlist_add_check),
                  label: const Text('Ingest + Search'),
                ),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _runSemanticGraph,
                  icon: const Icon(Icons.account_tree),
                  label: const Text('Semantic + Graph'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_status.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Text(
                  _status,
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: Color(AppColors.textSecondaryValue)),
                ),
              ),
            const SizedBox(height: 8),
            if (_loading) const LinearProgressIndicator(),
            if (_error != null) ...[
              const SizedBox(height: 8),
              Text(_error!, style: TextStyle(color: Colors.red[700])),
            ],
            const SizedBox(height: 16),
            if (_items.isNotEmpty) ...[
              Text('Top Matches',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              ..._items.map((item) => Card(
                    child: ListTile(
                      title: Text(
                          item.text.isEmpty ? '(no text payload)' : item.text),
                      subtitle: Text('score: ${item.score}'),
                    ),
                  )),
            ],
            const SizedBox(height: 16),
            if (_lastResponse != null) ...[
              Text('Raw Response',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Color(AppColors.bgLightValue),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: Color(AppColors.borderValue)),
                ),
                child: Text(
                    const JsonEncoder.withIndent('  ').convert(_lastResponse)),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _seedCorpus() async {
    if (FeatureFlags.skipLogin) {
      setState(() {
        _loading = false;
        _status = 'Seeding skipped (offline demo)';
        _error = null;
      });
      _notify('Seeding skipped (offline demo)');
      return;
    }
    final samples = <String>[
      'La grippe provoque fièvre, toux, fatigue et courbatures.',
      'Le paludisme (malaria) entraîne fièvre intermittente, frissons, sueurs et anémie.',
      'Le diabète sucré se manifeste par polyurie, polydipsie, amaigrissement et hyperglycémie.',
      "L'hypertension artérielle peut rester asymptomatique ou causer céphalées et vertiges.",
      "L'asthme déclenche dyspnée, sifflements, toux surtout nocturne ou à l'effort.",
      'La tuberculose provoque toux chronique, fièvre vespérale, sueurs nocturnes et amaigrissement.',
      'La rougeole cause fièvre élevée, éruption maculo-papuleuse et toux.',
      'La méningite se traduit par fièvre, raideur de nuque et photophobie.',
      'La migraine associe céphalées pulsatiles, nausées, photophobie et phonophobie.',
      'La COVID-19 peut donner fièvre, toux sèche, anosmie et dyspnée.',
      'La gastro-entérite aiguë cause diarrhées, vomissements et crampes abdominales.',
      "L'angine streptococcique provoque odynophagie, fièvre et exsudat amygdalien.",
    ];

    final api = context.read<ApiService>();
    setState(() {
      _loading = true;
      _status = 'Seeding corpus...';
      _error = null;
    });
    int ok = 0;
    for (final t in samples) {
      try {
        await api.demoIngest(text: t);
        ok++;
      } catch (_) {
        // ignore individual failures
      }
    }
    setState(() {
      _loading = false;
      _status = 'Seeding done: $ok/${samples.length} inserted';
    });
    _notify('Seeding done: $ok/${samples.length}');
  }
}

class _SearchItem {
  final String text;
  final String score;
  const _SearchItem({required this.text, required this.score});
}
