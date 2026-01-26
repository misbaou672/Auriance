import 'dart:math';

/// Simple offline/demo implementations used when the backend is not reachable
/// (e.g. SKIP_LOGIN=true during mobile development).
class OfflineDemoService {
  static final _rand = Random(42);

  static Map<String, dynamic> vectorIngestDemo({required String text}) {
    return {
      'ok': true,
      'inserted_id': _rand.nextInt(999999) + 1,
      'payload': {'text': text},
      'note': 'OFFLINE DEMO (no backend persistence)'
    };
  }

  static Map<String, dynamic> vectorSearchDemo(
      {required String query, int limit = 5}) {
    return {
      'ok': true,
      'query': query,
      'results': vectorSearch(query, limit: limit),
      'note': 'OFFLINE DEMO (local similarity only)'
    };
  }

  static Map<String, dynamic> vectorIngestAndSearchDemo({
    required String text,
    String? query,
    int limit = 5,
  }) {
    final inserted = vectorIngestDemo(text: text);
    final q =
        (query == null || query.trim().isEmpty) ? _keyword(text) : query.trim();
    final searched = vectorSearchDemo(query: q, limit: limit);
    return {
      ...inserted,
      ...searched,
    };
  }

  static Map<String, dynamic> vectorSemanticGraphDemo(
      {required String query, int limit = 5}) {
    final searched = vectorSearchDemo(query: query, limit: limit);
    return {
      ...searched,
      'neo4j': 'offline-demo',
      'graph': {
        'nodes': [
          {'id': 'Patient:1', 'label': 'Patient'},
          {'id': 'Symptom:${_keyword(query)}', 'label': 'Symptom'},
        ],
        'edges': [
          {
            'from': 'Patient:1',
            'to': 'Symptom:${_keyword(query)}',
            'type': 'HAS_SYMPTOM'
          }
        ]
      },
    };
  }

  static String generateSql(String intent) {
    final safe = intent.replaceAll("'", "''");
    return """
-- OFFLINE DEMO (no backend)
-- Intention: $safe
SELECT id, full_name, age, symptoms, created_at
FROM consultations
WHERE symptoms ILIKE '%${_keyword(intent)}%'
ORDER BY created_at DESC
LIMIT 20;
"""
        .trim();
  }

  static String generateCypher(String intent) {
    final kw = _keyword(intent);
    return """
// OFFLINE DEMO (no backend)
// Intention: ${intent.trim()}
MATCH (p:Patient)-[:HAS_SYMPTOM]->(s:Symptom)
WHERE toLower(s.name) CONTAINS toLower('$kw')
RETURN p, s
ORDER BY p.lastSeen DESC
LIMIT 25;
"""
        .trim();
  }

  static List<Map<String, dynamic>> vectorSearch(String query,
      {int limit = 5}) {
    final corpus = _demoCorpus;
    final scored = corpus.map((text) {
      final score = _similarity(query, text);
      return {
        'score': score,
        'payload': {'text': text},
      };
    }).toList();

    scored
        .sort((a, b) => (b['score'] as double).compareTo(a['score'] as double));
    return scored.take(limit).toList();
  }

  static Map<String, dynamic> medicalSearch(String query, {int limit = 5}) {
    final results = vectorSearch(query, limit: limit);
    return {
      'history_id': _rand.nextInt(999999) + 1,
      'results': results,
      'advice': {
        'disclaimer':
            "Mode démo hors-ligne: ces suggestions ne remplacent pas un avis médical.",
        'suggestions': [
          'Si les symptômes persistent ou s’aggravent, consultez un professionnel.',
          'Vérifiez les signes d’alerte (douleur thoracique, dyspnée, confusion, etc.).',
        ],
      },
    };
  }

  static Map<String, dynamic> medicalHistory({int limit = 50}) {
    final items = List.generate(min(limit, 12), (i) {
      final q = _demoQueries[i % _demoQueries.length];
      return {
        'id': i + 1,
        'query': q,
        'created_at':
            DateTime.now().subtract(Duration(days: i)).toIso8601String(),
      };
    });
    return {'items': items};
  }

  static Map<String, dynamic> medicalHistoryDetail(int id) {
    return {
      'id': id,
      'query': _demoQueries[(id - 1).abs() % _demoQueries.length],
      'summary': 'Mode démo hors-ligne: détail non disponible sans backend.',
    };
  }

  static Map<String, dynamic> ragAnswer(String question,
      {String detectedLanguage = 'fr',
      bool translateResponse = false,
      String? responseLanguage}) {
    final hits = vectorSearch(question, limit: 5);
    final answer =
        "Mode démo hors-ligne: je ne peux pas appeler le backend RAG.\n\nQuestion: $question\n\nPistes: ${_keyword(question)}";

    return {
      'question': question,
      'question_original': question,
      'question_for_rag': question,
      'detected_language': detectedLanguage,
      'language_name': _langName(detectedLanguage),
      'translated': translateResponse,
      'response_language': responseLanguage ?? detectedLanguage,
      'answer': answer,
      'translated_text': translateResponse ? answer : null,
      'hits_qdrant': hits,
      'hits_postgres': const [],
      'hits_neo4j': const [],
    };
  }

  static Map<String, dynamic> adminStats({required int days}) {
    final total = 120 + days * 3;
    final avg = 4.2;
    final now = DateTime.now();
    final daily = List.generate(days, (i) {
      final d = now.subtract(Duration(days: (days - 1 - i)));
      return {
        'date': DateTime(d.year, d.month, d.day).toIso8601String(),
        'count': 1 + ((sin(i / 2) + 1) * 6).round(),
      };
    });

    return {
      'total_queries': total,
      'avg_hits_per_query': avg,
      'frequent_questions': [
        {'question': 'Comment soulager une migraine ?', 'count': 18},
        {'question': 'Conseils pour la fièvre', 'count': 14},
        {'question': 'Remèdes pour la toux', 'count': 11},
        {'question': 'Symptômes de la grippe', 'count': 9},
      ],
      'daily_activity': daily,
    };
  }

  static String _keyword(String text) {
    final cleaned = text
        .toLowerCase()
        .replaceAll(RegExp(r"[^a-zàâçéèêëîïôûùüÿñæœ\s]", unicode: true), ' ')
        .split(RegExp(r"\s+"))
        .where((w) => w.length >= 4)
        .toList();
    if (cleaned.isEmpty) return 'symptome';
    return cleaned.first;
  }

  static double _similarity(String a, String b) {
    final wa = a
        .toLowerCase()
        .split(RegExp(r"\W+"))
        .where((w) => w.isNotEmpty)
        .toSet();
    final wb = b
        .toLowerCase()
        .split(RegExp(r"\W+"))
        .where((w) => w.isNotEmpty)
        .toSet();
    if (wa.isEmpty || wb.isEmpty) return 0.0;
    final inter = wa.intersection(wb).length;
    final union = wa.union(wb).length;
    return union == 0 ? 0.0 : inter / union;
  }

  static String _langName(String code) {
    switch (code) {
      case 'fr':
        return 'Français';
      case 'en':
        return 'English';
      case 'es':
        return 'Español';
      case 'ar':
        return 'العربية';
      case 'de':
        return 'Deutsch';
      case 'zh':
        return '中文';
      case 'hi':
        return 'हिंदी';
      default:
        return 'Inconnue';
    }
  }

  static const List<String> _demoCorpus = [
    'Le patient présente une fièvre persistante avec frissons et céphalées.',
    'Douleur thoracique à l’effort, dyspnée et sueurs froides.',
    'Toux sèche depuis 5 jours, irritation pharyngée, pas de fièvre.',
    'Migraine avec photophobie, nausées et aura visuelle.',
    'Douleurs abdominales, diarrhée et déshydratation légère.',
    'Allergie saisonnière: éternuements, rhinite, prurit oculaire.',
    'Entorse de cheville: douleur latérale, œdème, difficulté d’appui.',
    'Infection urinaire: brûlures mictionnelles et pollakiurie.',
  ];

  static const List<String> _demoQueries = [
    'toux sèche',
    'fièvre élevée',
    'migraine',
    'angine',
    'douleur thoracique',
    'diarrhée',
    'allergie saisonnière',
  ];
}
