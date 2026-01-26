import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:package_info_plus/package_info_plus.dart';

/// Service centralisé pour gérer les fichiers (PDFs, audio, historique)
/// Tous les fichiers sont sauvegardés dans: /storage/emulated/0/Android/media/com.example.auriance_mobile
class FileStorageService {
  // Singleton pattern
  static final FileStorageService _instance = FileStorageService._internal();

  factory FileStorageService() {
    return _instance;
  }

  FileStorageService._internal();

  /// Récupère le répertoire de base pour tous les fichiers AURIANCE
  /// Structure: /Android/media/com.example.auriance_mobile/
  Future<Directory> _getAurianceMediaDir() async {
    try {
      if (Platform.isAndroid) {
        final pkg = await PackageInfo.fromPlatform();
        final packageName = pkg.packageName;

        // Best-effort: request legacy storage permission, but do not fail if denied.
        // On Android 10+ this may be ignored/denied (scoped storage).
        // We only request it to improve compatibility on older devices/ROMs.
        try {
          await Permission.storage.request();
        } catch (_) {}

        Future<Directory?> ensureWritableDir(String path) async {
          try {
            final dir = Directory(path);
            if (!await dir.exists()) {
              await dir.create(recursive: true);
            }
            final probe = File(
                '${dir.path}/.write_test_${DateTime.now().millisecondsSinceEpoch}');
            await probe.writeAsString('ok');
            await probe.delete();
            return dir;
          } catch (e) {
            if (kDebugMode) {
              debugPrint('Dir not writable: $path ($e)');
            }
            return null;
          }
        }

        // 1) Preferred: Android/media/<package>
        final candidates = <String>[
          '/storage/emulated/0/Android/media/$packageName',
          '/sdcard/Android/media/$packageName',
        ];

        // 2) Derive from app external dir (common on most devices)
        final extDir = await getExternalStorageDirectory();
        final extPath = extDir?.path ?? '';
        final index = extPath.indexOf('Android/data');
        if (index != -1) {
          final rootPart = extPath.substring(0, index);
          candidates.add('${rootPart}Android/media/$packageName');
        }

        for (final p in candidates) {
          final dir = await ensureWritableDir(p);
          if (dir != null) return dir;
        }

        // 3) Fallback: app external files dir (always writable, but less user-visible)
        if (extDir != null) {
          final fallback = Directory('${extDir.path}/auriance');
          if (!await fallback.exists()) {
            await fallback.create(recursive: true);
          }
          return fallback;
        }

        // 4) Final fallback: app documents (always available)
        return await getApplicationDocumentsDirectory();
      } else if (Platform.isIOS) {
        return await getApplicationDocumentsDirectory();
      } else {
        return await getApplicationDocumentsDirectory();
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Erreur accès répertoire: $e');
      }
      return await getApplicationDocumentsDirectory();
    }
  }

  /// Récupère le répertoire pour les PDFs (formulaires et transcriptions)
  Future<Directory> getPdfsDirectory() async {
    final baseDir = await _getAurianceMediaDir();
    final pdfsDir = Directory('${baseDir.path}/pdfs');
    if (!await pdfsDir.exists()) {
      await pdfsDir.create(recursive: true);
    }
    return pdfsDir;
  }

  /// Récupère le répertoire pour les enregistrements audio
  Future<Directory> getAudioDirectory() async {
    final baseDir = await _getAurianceMediaDir();
    final audioDir = Directory('${baseDir.path}/audio');
    if (!await audioDir.exists()) {
      await audioDir.create(recursive: true);
    }
    return audioDir;
  }

  /// Récupère le répertoire pour l'historique des transcriptions
  Future<Directory> getHistoryDirectory() async {
    final baseDir = await _getAurianceMediaDir();
    final historyDir = Directory('${baseDir.path}/history');
    if (!await historyDir.exists()) {
      await historyDir.create(recursive: true);
    }
    return historyDir;
  }

  /// Génère un nom de fichier avec timestamp
  String _generateTimestampFilename(String type, String extension) {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return '${type}_$timestamp.$extension';
  }

  /// Sauvegarde un PDF
  /// Type: 'formulaire' ou 'transcription'
  Future<String> savePdf(Uint8List bytes, {String type = 'formulaire'}) async {
    try {
      final pdfsDir = await getPdfsDirectory();
      final filename = _generateTimestampFilename(type, 'pdf');
      final file = File('${pdfsDir.path}/$filename');
      await file.writeAsBytes(bytes);

      if (kDebugMode) {
        debugPrint('PDF sauvegardé: ${file.path}');
      }

      return file.path;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Erreur sauvegarde PDF: $e');
      }
      rethrow;
    }
  }

  /// Sauvegarde un fichier audio
  Future<String> saveAudio(Uint8List bytes, {String filename = ''}) async {
    try {
      final audioDir = await getAudioDirectory();
      final finalFilename = filename.isEmpty
          ? _generateTimestampFilename('audio', 'wav')
          : filename;
      final file = File('${audioDir.path}/$finalFilename');
      await file.writeAsBytes(bytes);

      if (kDebugMode) {
        debugPrint('Audio sauvegardé: ${file.path}');
      }

      return file.path;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Erreur sauvegarde audio: $e');
      }
      rethrow;
    }
  }

  /// Enregistre une entrée dans l'historique
  /// Type: 'transcription_temps_reel', 'formulaire', 'contexte_extraction', 'compte_rendu'
  Future<String> saveHistoryEntry({
    required String type,
    required String transcription,
    String? patientName,
    String? symptoms,
    String? diagnosis,
    String? treatment,
    String? pdfPath,
    Map<String, dynamic>? extraData,
  }) async {
    try {
      final historyDir = await getHistoryDirectory();
      final timestamp = DateTime.now().toIso8601String();

      // Créer une sous-catégorie pour chaque type
      final typeDir = Directory('${historyDir.path}/$type');
      if (!await typeDir.exists()) {
        await typeDir.create(recursive: true);
      }

      // Format: type_timestamp.json
      final filename = _generateTimestampFilename(type, 'json');
      final file = File('${typeDir.path}/$filename');

      // Créer le JSON
      final entry = {
        'timestamp': timestamp,
        'type': type,
        'transcription': transcription,
        if (patientName != null) 'patient_name': patientName,
        if (symptoms != null) 'symptoms': symptoms,
        if (diagnosis != null) 'diagnosis': diagnosis,
        if (treatment != null) 'treatment': treatment,
        if (pdfPath != null) 'pdf_path': pdfPath,
        ...?extraData, // Merge extra data if provided
      };

      // Use proper JSON encoding so commas/quotes in transcription are safe.
      await file.writeAsString(jsonEncode(entry));

      if (kDebugMode) {
        debugPrint('Entrée historique sauvegardée: ${file.path}');
      }

      return file.path;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Erreur sauvegarde historique: $e');
      }
      rethrow;
    }
  }

  /// Récupère tout l'historique d'un type
  /// Type: 'transcription_temps_reel' ou 'formulaire'
  Future<List<Map<String, dynamic>>> getHistory(String type) async {
    try {
      final historyDir = await getHistoryDirectory();
      final typeDir = Directory('${historyDir.path}/$type');

      if (!await typeDir.exists()) {
        return [];
      }

      final entries = <Map<String, dynamic>>[];
      final files = typeDir.listSync().whereType<File>().toList();

      // Trier par date décroissante (plus récent en premier)
      files.sort(
          (a, b) => b.statSync().modified.compareTo(a.statSync().modified));

      for (final file in files) {
        try {
          final content = await file.readAsString();
          final decoded = jsonDecode(content);
          if (decoded is Map) {
            entries.add(decoded.cast<String, dynamic>());
          }
        } catch (e) {
          if (kDebugMode) {
            debugPrint('Erreur lecture fichier historique: $e');
          }
        }
      }

      return entries;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Erreur lecture historique: $e');
      }
      return [];
    }
  }
}
