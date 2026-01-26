// Service de base de données locale SQLite pour l'historique RAG
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/rag_history_item.dart';

class RagHistoryDatabase {
  static final RagHistoryDatabase instance = RagHistoryDatabase._init();
  static Database? _database;

  RagHistoryDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('rag_history.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE rag_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        hits_count INTEGER NOT NULL,
        hits_data TEXT,
        created_at TEXT NOT NULL,
        category TEXT NOT NULL
      )
    ''');
  }

  // Insérer un item
  Future<int> insert(RagHistoryItem item) async {
    final db = await database;
    return await db.insert('rag_history', item.toMap());
  }

  // Récupérer tous les items (triés par date décroissante)
  Future<List<RagHistoryItem>> getAll() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'rag_history',
      orderBy: 'created_at DESC',
    );
    return List.generate(maps.length, (i) => RagHistoryItem.fromMap(maps[i]));
  }

  // Récupérer par catégorie
  Future<List<RagHistoryItem>> getByCategory(String category) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'rag_history',
      where: 'category = ?',
      whereArgs: [category],
      orderBy: 'created_at DESC',
    );
    return List.generate(maps.length, (i) => RagHistoryItem.fromMap(maps[i]));
  }

  // Récupérer les N derniers
  Future<List<RagHistoryItem>> getRecent(int limit) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'rag_history',
      orderBy: 'created_at DESC',
      limit: limit,
    );
    return List.generate(maps.length, (i) => RagHistoryItem.fromMap(maps[i]));
  }

  // Supprimer un item
  Future<int> delete(int id) async {
    final db = await database;
    return await db.delete(
      'rag_history',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Supprimer tout l'historique
  Future<int> deleteAll() async {
    final db = await database;
    return await db.delete('rag_history');
  }

  // Obtenir le nombre total d'items
  Future<int> getCount() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) FROM rag_history');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  // Obtenir statistiques par catégorie
  Future<Map<String, int>> getCategoryStats() async {
    final db = await database;
    final List<Map<String, dynamic>> result = await db.rawQuery(
      'SELECT category, COUNT(*) as count FROM rag_history GROUP BY category',
    );

    final Map<String, int> stats = {};
    for (var row in result) {
      stats[row['category'] as String] = row['count'] as int;
    }
    return stats;
  }

  // Rechercher dans l'historique
  Future<List<RagHistoryItem>> search(String query) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'rag_history',
      where: 'question LIKE ? OR answer LIKE ?',
      whereArgs: ['%$query%', '%$query%'],
      orderBy: 'created_at DESC',
    );
    return List.generate(maps.length, (i) => RagHistoryItem.fromMap(maps[i]));
  }

  // Fermer la DB
  Future<void> close() async {
    final db = await database;
    await db.close();
  }
}
