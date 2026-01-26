import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

/// API Configuration for AURIANCE Backend
class ApiConstants {
  // Whisper Voice Recognition Endpoints
  static const String whisperTranscribe = '/api/voice/transcribe';
  static const String whisperTranscribeAndAnalyze =
      '/api/voice/transcribe-and-analyze';
  static const String whisperDetectLanguage = '/api/voice/detect-language';
  static const String whisperHealth = '/api/voice/health';

  /// Backend URL(s):
  /// - `API_BASE_URLS` (CSV) ou `API_BASE_URL` (single) dans `.env`
  /// - sinon fallback automatique (utile sur eduroam / réseaux isolés)
  ///
  /// Notes réseau:
  /// - Android Emulator -> `http://10.0.2.2:8000`
  /// - Téléphone Android sur Wi‑Fi isolé (eduroam) -> utilise USB + `adb reverse` et `http://127.0.0.1:8000`
  static List<String> get baseUrls {
    final envUrlsCsv = (dotenv.env['API_BASE_URLS'] ?? '').trim();
    final envUrlSingle = (dotenv.env['API_BASE_URL'] ?? '').trim();

    final urls = <String>[];

    // 1) URLs explicites depuis .env
    // - Si API_BASE_URLS est fourni: l'ordre est volontaire, on le respecte.
    // - Si seulement API_BASE_URL est fourni: on le considère comme fallback,
    //   et on préfère les defaults plateforme (utile sur eduroam + adb reverse).
    final hasExplicitCsv = envUrlsCsv.isNotEmpty;
    if (hasExplicitCsv) {
      for (final part in envUrlsCsv.split(',')) {
        final u = part.trim();
        if (u.isNotEmpty) urls.add(u);
      }
    }

    // 2) Fallbacks par plateforme (utile quand l'URL du Wi‑Fi est bloquée / isolée)
    final List<String> fallbacks;
    if (kIsWeb) {
      fallbacks = const ['http://localhost:8000'];
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      // IMPORTANT:
      // - Sur un téléphone Android, `127.0.0.1` / `localhost` pointent vers le téléphone lui‑même.
      //   Ça ne marche que si tu utilises `adb reverse tcp:8000 tcp:8000`.
      // - Sur l'émulateur Android, `10.0.2.2` pointe vers la machine hôte.
      fallbacks = const [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://10.0.2.2:8000',
      ];
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      fallbacks = const ['http://localhost:8000', 'http://127.0.0.1:8000'];
    } else {
      fallbacks = const ['http://127.0.0.1:8000', 'http://localhost:8000'];
    }

    // 3) Merge unique
    // - Si env CSV: env d'abord puis fallbacks
    // - Sinon: fallbacks d'abord, puis env single
    if (hasExplicitCsv) {
      for (final fb in fallbacks) {
        if (!urls.contains(fb)) urls.add(fb);
      }
    } else {
      for (final fb in fallbacks) {
        if (!urls.contains(fb)) urls.add(fb);
      }
      if (envUrlSingle.isNotEmpty && !urls.contains(envUrlSingle)) {
        urls.add(envUrlSingle);
      }
    }

    // 4) Qualité de vie: sur téléphone Android, l'URL émulateur ne marche pas.
    // On la met en dernier pour éviter de perdre du temps en retry.
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      const emulatorHost = 'http://10.0.2.2:8000';
      if (urls.contains(emulatorHost) && urls.length > 1) {
        urls
          ..remove(emulatorHost)
          ..add(emulatorHost);
      }
    }

    return urls;
  }

  static String get baseUrl => baseUrls.first;

  // Auth Endpoints
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';

  // Data Endpoints
  static const String dataTranscriptions = '/data/transcriptions';
  static const String dataExtractions = '/data/extractions';
  static const String dataReports = '/data/reports';
  static const String dataSearch = '/data/transcriptions/search/semantic';
  static const String dataStats = '/data/stats/databases';

  // AURIANCE Pipeline Endpoints
  // Note: Backend exposes under /api/auriance/*
  static const String aurianceTranscribe = '/api/auriance/transcribe';
  static const String aurianceTranscribeAndExtract =
      '/api/auriance/transcribe-and-extract';
  static const String aurianceGenerateFormJson = '/api/auriance/form-json';
  static const String aurianceGenerateSqlQuery =
      '/api/auriance/generate-sql-query';
  static const String aurianceGenerateCypherQuery =
      '/api/auriance/generate-cypher-query';
  static const String aurianceGenerateReport = '/api/auriance/generate-report';
  static const String aurianceGenerateSummary =
      '/api/auriance/generate-summary';
  static const String aurianceCompletePipeline =
      '/api/auriance/complete-pipeline';
  static const String aurianceSaveConsultation =
      '/api/auriance/save-consultation';
  static const String aurianceTranslateText = '/api/auriance/translate-text';
  static const String aurianceRagAnswer = '/api/auriance/rag-answer';

  // Aurian AI Endpoints
  static const String aurianChat = '/api/aurian/chat';
  static const String aurianVoice = '/api/aurian/voice';
  static const String aurianCapabilities = '/api/aurian/capabilities';

  // Demo Vector/Graph Endpoints
  static const String demoIngest = '/api/demo/ingest';
  static const String demoSearch = '/api/demo/search';
  static const String demoSemanticGraph = '/api/demo/semantic-graph';
  static const String demoIngestAndSearch = '/api/demo/ingest-and-search';

  // Medical Search Endpoints
  static const String medicalSearch = '/api/medical/search';
  static const String medicalHistory = '/api/medical/history';
  static String medicalHistoryDetail(int id) => '/api/medical/history/$id';
  static String medicalHistoryPdf(int id) => '/api/medical/history/$id/pdf';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Headers
  static const String contentType = 'application/json';
  static const String authorizationHeader = 'Authorization';
  static const String bearerPrefix = 'Bearer';
}
