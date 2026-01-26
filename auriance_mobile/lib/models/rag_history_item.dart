// Modèle pour l'historique RAG stocké localement
class RagHistoryItem {
  final int? id;
  final String question;
  final String answer;
  final int hitsCount;
  final String? hitsData; // JSON stringifié
  final DateTime createdAt;
  final String category; // 'migraine', 'fièvre', 'toux', 'général'

  RagHistoryItem({
    this.id,
    required this.question,
    required this.answer,
    required this.hitsCount,
    this.hitsData,
    required this.createdAt,
    this.category = 'général',
  });

  // Convertir en Map pour SQLite
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'question': question,
      'answer': answer,
      'hits_count': hitsCount,
      'hits_data': hitsData,
      'created_at': createdAt.toIso8601String(),
      'category': category,
    };
  }

  // Créer depuis Map SQLite
  factory RagHistoryItem.fromMap(Map<String, dynamic> map) {
    return RagHistoryItem(
      id: map['id'] as int?,
      question: map['question'] as String,
      answer: map['answer'] as String,
      hitsCount: map['hits_count'] as int,
      hitsData: map['hits_data'] as String?,
      createdAt: DateTime.parse(map['created_at'] as String),
      category: map['category'] as String? ?? 'général',
    );
  }

  // Détecter la catégorie automatiquement depuis la question
  static String detectCategory(String question) {
    final lowerQ = question.toLowerCase();
    if (lowerQ.contains('migraine') ||
        lowerQ.contains('maux de tête') ||
        lowerQ.contains('céphalée')) {
      return 'migraine';
    } else if (lowerQ.contains('fièvre') || lowerQ.contains('température')) {
      return 'fièvre';
    } else if (lowerQ.contains('toux')) {
      return 'toux';
    } else if (lowerQ.contains('grippe') || lowerQ.contains('rhume')) {
      return 'grippe';
    } else if (lowerQ.contains('allergie')) {
      return 'allergie';
    } else {
      return 'général';
    }
  }

  // Copier avec modifications
  RagHistoryItem copyWith({
    int? id,
    String? question,
    String? answer,
    int? hitsCount,
    String? hitsData,
    DateTime? createdAt,
    String? category,
  }) {
    return RagHistoryItem(
      id: id ?? this.id,
      question: question ?? this.question,
      answer: answer ?? this.answer,
      hitsCount: hitsCount ?? this.hitsCount,
      hitsData: hitsData ?? this.hitsData,
      createdAt: createdAt ?? this.createdAt,
      category: category ?? this.category,
    );
  }
}
