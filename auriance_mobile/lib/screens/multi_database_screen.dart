// Écran RAG amélioré avec UI moderne, icônes et cartes
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../services/rag_history_database.dart';
import '../models/rag_history_item.dart';

import 'rag_history_screen.dart';
import 'admin_dashboard_screen.dart';

class MultiDatabaseScreen extends StatefulWidget {
  const MultiDatabaseScreen({super.key});

  @override
  State<MultiDatabaseScreen> createState() => _MultiDatabaseScreenState();
}

class _MultiDatabaseScreenState extends State<MultiDatabaseScreen> {
  final TextEditingController _questionController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;
  bool _isTranslating = false;
  Map<String, dynamic>? _ragResult;
  String? _error;
  String _detectedLanguage = 'auto';
  bool _translateResponse = false;
  String? _responseLanguage;

  String? _sqlQuery;
  String? _cypherQuery;
  String? _vectorQuery;

  // Icônes par catégorie
  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'migraine':
        return FontAwesomeIcons.headSideCough;
      case 'fièvre':
      case 'fever':
        return FontAwesomeIcons.temperatureHigh;
      case 'toux':
        return FontAwesomeIcons.lungs;
      case 'grippe':
        return FontAwesomeIcons.virus;
      case 'allergie':
        return FontAwesomeIcons
            .seedling; // Pas d'icône allergie, utilisons seedling
      default:
        return FontAwesomeIcons.heartPulse;
    }
  }

  final List<Map<String, String>> _languageOptions = const [
    {'code': 'auto', 'label': 'Langue détectée'},
    {'code': 'fr', 'label': 'Français'},
    {'code': 'en', 'label': 'English'},
    {'code': 'es', 'label': 'Español'},
    {'code': 'ar', 'label': 'العربية'},
    {'code': 'de', 'label': 'Deutsch'},
    {'code': 'zh', 'label': '中文'},
    {'code': 'hi', 'label': 'हिंदी'},
  ];

  // Couleur par catégorie
  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'migraine':
        return Colors.deepPurple;
      case 'fièvre':
      case 'fever':
        return Colors.red;
      case 'toux':
        return Colors.blue;
      case 'grippe':
        return Colors.orange;
      case 'allergie':
        return Colors.pink;
      default:
        return Colors.teal;
    }
  }

  Future<void> _submitQuestion() async {
    if (_questionController.text.trim().isEmpty) {
      setState(() {
        _error = 'Veuillez entrer une question';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
      _ragResult = null;
      _sqlQuery = null;
      _cypherQuery = null;
      _vectorQuery = null;
    });

    try {
      final responseLang = (_responseLanguage == null ||
              _responseLanguage == 'auto' ||
              _responseLanguage!.trim().isEmpty)
          ? null
          : _responseLanguage;

      final result = await _apiService.submitRagQuery(
        _questionController.text,
        language: _detectedLanguage,
        translateResponse: _translateResponse,
        responseLanguage: responseLang,
      );

      // Queries (backend fournit normalement sql_query/cypher_query/vector_query)
      String? sqlQuery = (result['sql_query'] as String?)?.trim();
      String? cypherQuery = (result['cypher_query'] as String?)?.trim();
      String? vectorQuery = (result['vector_query'] as String?)?.trim();

      // Fallback (compat) si backend ancien
      if ((sqlQuery == null || sqlQuery.isEmpty) ||
          (cypherQuery == null || cypherQuery.isEmpty)) {
        try {
          final futures = await Future.wait([
            _apiService.generateSqlQuery(intent: _questionController.text),
            _apiService.generateCypherQuery(intent: _questionController.text),
          ]);
          sqlQuery = futures[0].trim();
          cypherQuery = futures[1].trim();
        } catch (_) {
          // ignore fallback failure; UI will still show results
        }
      }
      vectorQuery ??=
          "qdrant.search(collection='documents', query_vector=embed('${_questionController.text}'), limit=5)";

      // Sauvegarder dans l'historique local
      final category = RagHistoryItem.detectCategory(_questionController.text);
      final hitsQdrant = (result['hits_qdrant'] as List?) ?? const [];
      final hitsPostgres = (result['hits_postgres'] as List?) ?? const [];
      final hitsNeo4j = (result['hits_neo4j'] as List?) ?? const [];
      final hitsTotal =
          hitsQdrant.length + hitsPostgres.length + hitsNeo4j.length;
      final historyItem = RagHistoryItem(
        question: _questionController.text,
        answer: result['answer'] ?? 'Pas de réponse',
        hitsCount: hitsTotal,
        hitsData: jsonEncode(result),
        createdAt: DateTime.now(),
        category: category,
      );

      // Sauvegarder en local
      await RagHistoryDatabase.instance.insert(historyItem);

      // Sauvegarder aussi au serveur backend
      try {
        await _apiService.saveConsultation(
          transcription: _questionController.text,
          diagnostic: result['answer'] ?? 'Pas de réponse',
        );
        debugPrint('✅ Consultation sauvegardée au serveur');
      } catch (serverError) {
        debugPrint('⚠️ Erreur sauvegarde serveur: $serverError');
        // Continue même si la sauvegarde serveur échoue
      }

      setState(() {
        _ragResult = result;
        _detectedLanguage = result['detected_language'] as String? ?? 'auto';
        _responseLanguage = result['response_language'] as String?;
        _sqlQuery = sqlQuery;
        _cypherQuery = cypherQuery;
        _vectorQuery = vectorQuery;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Erreur: $e';
        _isLoading = false;
      });
    }
  }

  String _stringOrJson(dynamic value) {
    if (value == null) return '';
    if (value is String) return value;
    try {
      return jsonEncode(value);
    } catch (_) {
      return value.toString();
    }
  }

  String _displayPostgresHit(Map<String, dynamic> hit) {
    final text = hit['text']?.toString();
    if (text != null && text.trim().isNotEmpty) return text;

    final patientName = hit['patient_name']?.toString();
    final patientAge = hit['patient_age']?.toString();
    final symptomesDirect = hit['symptomes']?.toString();
    if ((symptomesDirect ?? '').trim().isNotEmpty) {
      final headerParts = <String>[];
      if (patientName != null && patientName.trim().isNotEmpty) {
        headerParts.add(patientName.trim());
      }
      if (patientAge != null && patientAge.trim().isNotEmpty) {
        headerParts.add('${patientAge.trim()} ans');
      }
      final header = headerParts.join(' • ');
      return header.isNotEmpty
          ? '$header — $symptomesDirect'
          : symptomesDirect!;
    }

    final prenom = hit['prenom']?.toString();
    final nom = hit['nom']?.toString();
    final symptomes = hit['symptomes']?.toString();
    final name =
        [prenom, nom].where((e) => e != null && e.trim().isNotEmpty).join(' ');
    if ((symptomes ?? '').trim().isNotEmpty) {
      return name.isNotEmpty ? '$name — $symptomes' : symptomes!;
    }

    return _stringOrJson(hit);
  }

  String _displayNeo4jHit(Map<String, dynamic> hit) {
    final symptome = hit['symptome']?.toString();
    final diagnostic = hit['diagnostic']?.toString();
    final traitements = hit['traitements'];

    if ((symptome ?? '').trim().isNotEmpty ||
        (diagnostic ?? '').trim().isNotEmpty) {
      final parts = <String>[];
      if ((symptome ?? '').trim().isNotEmpty) parts.add('Symptôme: $symptome');
      if ((diagnostic ?? '').trim().isNotEmpty) {
        parts.add('Diagnostic: $diagnostic');
      }
      if (traitements is List && traitements.isNotEmpty) {
        final tr = traitements
            .map((e) => e.toString())
            .where((s) => s.trim().isNotEmpty)
            .toList();
        if (tr.isNotEmpty) parts.add('Traitements: ${tr.join(', ')}');
      }
      return parts.join(' • ');
    }

    final labels = (hit['labels'] is List)
        ? (hit['labels'] as List).map((e) => e.toString()).toList()
        : <String>[];

    final primary = (hit['nom'] ??
            hit['name'] ??
            hit['text'] ??
            hit['diagnostic'] ??
            hit['traitement'])
        ?.toString();
    final prefix = labels.isNotEmpty ? '[${labels.join(', ')}] ' : '';
    if (primary != null && primary.trim().isNotEmpty) return '$prefix$primary';

    return '$prefix${_stringOrJson(hit)}';
  }

  Widget _buildQueryBox(String title, String? query, Color color) {
    final q = (query ?? '').trim();
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 8),
          SelectableText(
            q.isEmpty ? '—' : q,
            style: const TextStyle(
                fontSize: 12, height: 1.35, fontFamily: 'monospace'),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsList({
    required List<dynamic> items,
    required String emptyLabel,
    required String Function(Map<String, dynamic>) itemText,
    Color? badgeColor,
    String? scoreKey,
  }) {
    if (items.isEmpty) {
      return Padding(
        padding: const EdgeInsets.only(top: 10),
        child: Text(emptyLabel, style: TextStyle(color: Colors.grey[600])),
      );
    }

    return Column(
      children: items.take(8).map((raw) {
        final hit = (raw is Map)
            ? raw.cast<String, dynamic>()
            : <String, dynamic>{'value': raw};

        final text = itemText(hit);
        final scoreVal = scoreKey != null ? hit[scoreKey] : null;
        final score = (scoreVal is num) ? scoreVal.toDouble() : null;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (score != null && badgeColor != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: badgeColor,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '${(score * 100).toStringAsFixed(0)}%',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              if (score != null && badgeColor != null) const SizedBox(width: 8),
              Expanded(
                child: Text(
                  text.length > 220 ? '${text.substring(0, 220)}...' : text,
                  style: TextStyle(
                      fontSize: 12, color: Colors.grey[800], height: 1.35),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQuickQuestionChip(String label, String question, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: ActionChip(
        avatar: FaIcon(icon, size: 16),
        label: Text(label),
        onPressed: () {
          _questionController.text = question;
          _submitQuestion();
        },
      ),
    );
  }

  Widget _buildResultCard() {
    if (_ragResult == null) return const SizedBox.shrink();

    // Affiche la traduction si présente
    final answer = _ragResult!['translated_text'] as String? ??
        _ragResult!['answer'] as String? ??
        'Pas de réponse';
    final question = _ragResult!['question'] as String? ?? '';
    final detectedLang =
        _ragResult!['detected_language'] as String? ?? 'unknown';
    final langName = _ragResult!['language_name'] as String? ?? 'Inconnue';
    final isTranslated = _ragResult!['translated'] as bool? ?? false;
    final responseLang =
        _ragResult!['response_language'] as String? ?? detectedLang;

    final category = RagHistoryItem.detectCategory(question);
    final categoryIcon = _getCategoryIcon(category);
    final categoryColor = _getCategoryColor(category);

    final hitsQdrant = _ragResult!['hits_qdrant'] as List? ?? [];
    final hitsPostgres = _ragResult!['hits_postgres'] as List? ?? [];
    final hitsNeo4j = _ragResult!['hits_neo4j'] as List? ?? [];
    final totalHits =
        hitsQdrant.length + hitsPostgres.length + hitsNeo4j.length;

    // Ajout : récupération des erreurs partielles ou backend
    final backendError = _ragResult!['error'] as String?;
    final qdrantError = _ragResult!['qdrant_error'] as String?;
    final postgresError = _ragResult!['postgres_error'] as String?;
    final neo4jError = _ragResult!['neo4j_error'] as String?;

    return Card(
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // En-tête avec icône catégorie + langue
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: categoryColor.withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: categoryColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child:
                          FaIcon(categoryIcon, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            category.toUpperCase(),
                            style: TextStyle(
                              color: categoryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            question,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Langue détectée + bouton traduction
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.language,
                              size: 14, color: Colors.blue),
                          const SizedBox(width: 4),
                          Text(
                            '🌐 $langName → $responseLang${isTranslated ? ' (traduit)' : ''}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Colors.blue,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    if (detectedLang != 'fr' && detectedLang != 'unknown')
                      OutlinedButton.icon(
                        onPressed:
                            _isTranslating ? null : () => _toggleTranslate(),
                        icon: _isTranslating
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.translate, size: 16),
                        label:
                            Text(_isTranslating ? 'Traduction...' : 'Traduire'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 4),
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),

          // Réponse + erreurs éventuelles
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.psychology, color: Colors.teal, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Réponse Aurian',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.teal.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.teal.withOpacity(0.2)),
                  ),
                  child: Text(
                    answer,
                    style: const TextStyle(fontSize: 15, height: 1.5),
                  ),
                ),
                // Affichage des erreurs backend ou partielles
                if (backendError != null && backendError.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: Text(
                      'Erreur backend : $backendError',
                      style: const TextStyle(
                          color: Colors.red, fontWeight: FontWeight.bold),
                    ),
                  ),
                if (qdrantError != null && qdrantError.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'Erreur Qdrant : $qdrantError',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                if (postgresError != null && postgresError.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'Erreur Postgres : $postgresError',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                if (neo4jError != null && neo4jError.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                      'Erreur Neo4j : $neo4jError',
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Détails langues / requête',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6),
                      Text(
                          'Question originale: ${_ragResult!['question_original'] ?? question}'),
                      Text(
                          'Question envoyée au RAG (FR): ${_ragResult!['question_for_rag'] ?? question}'),
                      Text('Réponse générée en: $responseLang'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Statistiques des hits
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              border: Border(
                top: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildHitStat('Qdrant', hitsQdrant.length,
                    FontAwesomeIcons.database, Colors.blue),
                _buildHitStat('Postgres', hitsPostgres.length,
                    FontAwesomeIcons.table, Colors.green),
                _buildHitStat('Neo4j', hitsNeo4j.length,
                    FontAwesomeIcons.projectDiagram, Colors.orange),
              ],
            ),
          ),

          // 3 bases / 3 requêtes / 3 résultats (onglets)
          Padding(
            padding: const EdgeInsets.all(16),
            child: DefaultTabController(
              length: 3,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Recherches multi-bases (3/3) — $totalHits résultats',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const TabBar(
                      labelColor: Colors.black,
                      indicatorSize: TabBarIndicatorSize.tab,
                      tabs: [
                        Tab(text: 'Qdrant'),
                        Tab(text: 'Postgres'),
                        Tab(text: 'Neo4j'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 340,
                    child: TabBarView(
                      children: [
                        SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildQueryBox('Requête vectorielle (démo)',
                                  _vectorQuery, Colors.blue),
                              const SizedBox(height: 12),
                              _buildResultsList(
                                items: hitsQdrant,
                                emptyLabel: 'Aucun résultat Qdrant.',
                                badgeColor: Colors.blue,
                                scoreKey: 'score',
                                itemText: (hit) {
                                  final payload = (hit['payload'] is Map)
                                      ? (hit['payload'] as Map)
                                          .cast<String, dynamic>()
                                      : <String, dynamic>{};
                                  final text = payload['text'] ??
                                      payload['content'] ??
                                      payload['chunk'] ??
                                      payload;
                                  return _stringOrJson(text);
                                },
                              ),
                            ],
                          ),
                        ),
                        SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildQueryBox(
                                  'SQL généré', _sqlQuery, Colors.green),
                              const SizedBox(height: 12),
                              _buildResultsList(
                                items: hitsPostgres,
                                emptyLabel: 'Aucun résultat PostgreSQL.',
                                itemText: (hit) => _displayPostgresHit(hit),
                              ),
                            ],
                          ),
                        ),
                        SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildQueryBox(
                                  'Cypher généré', _cypherQuery, Colors.orange),
                              const SizedBox(height: 12),
                              _buildResultsList(
                                items: hitsNeo4j,
                                emptyLabel: 'Aucun résultat Neo4j.',
                                itemText: (hit) => _displayNeo4jHit(hit),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleTranslate() async {
    if (_ragResult == null) return;

    setState(() => _isTranslating = true);

    try {
      final question = _ragResult!['question_original'] as String? ?? '';
      final detectedLang =
          _ragResult!['detected_language'] as String? ?? 'unknown';

      if (detectedLang == 'fr' || detectedLang == 'unknown') return;

      // Re-appelle l'API avec translate_response=true
      final responseLang = (_responseLanguage == null ||
              _responseLanguage == 'auto' ||
              _responseLanguage!.trim().isEmpty)
          ? null
          : _responseLanguage;
      final result = await _apiService.submitRagQuery(
        question,
        translateResponse: !(_ragResult!['translated'] as bool? ?? false),
        responseLanguage: responseLang,
      );

      if (!mounted) return;

      setState(() {
        _ragResult = result;
        _sqlQuery = (result['sql_query'] as String?)?.trim();
        _cypherQuery = (result['cypher_query'] as String?)?.trim();
        _vectorQuery = (result['vector_query'] as String?)?.trim();
        _isTranslating = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isTranslating = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur traduction: $e')),
      );
    }
  }

  Widget _buildHitStat(String label, int count, IconData icon, Color color) {
    return Column(
      children: [
        FaIcon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(
          '$count',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🔍 Recherche RAG Multi-Bases'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const RagHistoryScreen(),
                ),
              );
            },
            tooltip: 'Historique',
          ),
          IconButton(
            icon: const Icon(Icons.dashboard),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AdminDashboardScreen(),
                ),
              );
            },
            tooltip: 'Dashboard Admin',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Titre
            const Text(
              'Posez votre question santé',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Aurian cherchera dans toutes les bases de données pour vous répondre.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),

            // Reconnaissance vocale (STT) désactivée (plugins incompatibles)
            // Consumer<SttService>(
            //   builder: (context, stt, _) {
            //     ...
            //   },
            // ),
            const SizedBox(height: 16),

            // Questions rapides
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildQuickQuestionChip(
                    'Migraine',
                    'Comment soulager une migraine ?',
                    FontAwesomeIcons.headSideCough,
                  ),
                  _buildQuickQuestionChip(
                    'Fièvre',
                    'Conseils pour la fièvre',
                    FontAwesomeIcons.temperatureHigh,
                  ),
                  _buildQuickQuestionChip(
                    'Toux',
                    'Remèdes pour la toux',
                    FontAwesomeIcons.lungs,
                  ),
                  _buildQuickQuestionChip(
                    'Grippe',
                    'Symptômes de la grippe',
                    FontAwesomeIcons.virus,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Champ de question
            TextField(
              controller: _questionController,
              decoration: InputDecoration(
                labelText: 'Votre question',
                hintText: 'Ex: Quels sont les symptômes de la migraine ?',
                prefixIcon: const Icon(Icons.question_answer),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey[50],
              ),
              maxLines: 3,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _submitQuestion(),
            ),
            const SizedBox(height: 16),

            // Options de langue / traduction
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    initialValue: _responseLanguage ?? 'auto',
                    decoration: const InputDecoration(
                      labelText: 'Langue de réponse',
                      border: OutlineInputBorder(),
                    ),
                    items: _languageOptions
                        .map((opt) => DropdownMenuItem<String>(
                              value: opt['code'],
                              child: Text(opt['label'] ?? opt['code']!),
                            ))
                        .toList(),
                    onChanged: (val) {
                      setState(() => _responseLanguage = val);
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SwitchListTile(
                    dense: true,
                    title: const Text('Traduire auto'),
                    value: _translateResponse,
                    onChanged: (val) {
                      setState(() => _translateResponse = val);
                    },
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Bouton soumettre
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _submitQuestion,
              icon: _isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.send),
              label: Text(_isLoading ? 'Recherche en cours...' : 'Rechercher'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),

            // Erreur
            if (_error != null)
              Container(
                margin: const EdgeInsets.only(top: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red[300]!),
                ),
                child: Text(
                  _error!,
                  style: const TextStyle(color: Colors.red),
                ),
              ),

            // Résultat
            _buildResultCard(),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _questionController.dispose();
    super.dispose();
  }
}
