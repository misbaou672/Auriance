import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../models/auth_models.dart';
import '../models/transcription_models.dart';

/// Main API Service for AURIANCE
class ApiService {
  /// Télécharge un PDF généré par le backend à partir du formulaire médical
  Future<List<int>?> downloadPdfFromBackend(
      Map<String, dynamic> formJson) async {
    try {
      final response = await _dio.post(
        '/api/auriance/save-pdf',
        data: jsonEncode(formJson),
        options: Options(
          headers: {'Content-Type': 'application/json'},
          responseType: ResponseType.bytes,
        ),
      );
      return response.data as List<int>;
    } on DioException catch (e) {
      debugPrint('Erreur PDF backend: \\${_handleError(e)}');
      return null;
    }
  }

  late Dio _dio;
  String? _authToken;
  VoidCallback? _onUnauthorized;

  late final List<String> _baseUrls;
  int _baseUrlIndex = 0;

  String? _resolvedBaseUrl;
  Future<void>? _baseUrlProbeFuture;

  ApiService() {
    _baseUrls = ApiConstants.baseUrls;
    _initializeDio();
  }

  Future<void> _ensureBaseUrlResolved() async {
    if (_resolvedBaseUrl != null) return;

    // Only probe once; callers await the same future.
    _baseUrlProbeFuture ??= _probeAndSelectBaseUrl();
    await _baseUrlProbeFuture;
  }

  Future<void> _probeAndSelectBaseUrl() async {
    if (_baseUrls.isEmpty) return;

    // Avoid recursive interceptor calls by using a dedicated Dio.
    final probe = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 2),
        receiveTimeout: const Duration(seconds: 3),
        sendTimeout: const Duration(seconds: 2),
        responseType: ResponseType.plain,
        followRedirects: false,
        validateStatus: (s) => s != null && s >= 200 && s < 500,
        headers: const {'Accept': 'text/plain, application/json'},
      ),
    );

    // Probes a lightweight endpoint that exists on FastAPI.
    const probePath = '/docs';

    for (final base in _baseUrls) {
      try {
        final baseUri = Uri.parse(base);
        final probeUri = baseUri.replace(
          path: probePath,
          queryParameters: const {},
        );

        final res = await probe.getUri(probeUri);
        final code = res.statusCode ?? 0;

        if (code >= 200 && code < 400) {
          _resolvedBaseUrl = base;
          _dio.options.baseUrl = base;
          if (kDebugMode) {
            debugPrint('[ApiService] Base URL resolved by probe: $base');
          }
          return;
        }
      } catch (_) {
        // ignore and try next
      }
    }

    // Nothing worked quickly; keep the current baseUrl but mark as resolved
    // so we don't re-probe on every request.
    _resolvedBaseUrl = _dio.options.baseUrl;
    if (kDebugMode) {
      debugPrint(
        '[ApiService] Base URL probe failed (all unreachable). Keeping: ${_dio.options.baseUrl}',
      );
    }
  }

  bool _isAuthEndpoint(RequestOptions options) {
    final parsedPath = Uri.tryParse(options.path)?.path ?? options.path;
    final uriPath = options.uri.path;
    return parsedPath.startsWith('/auth/') || uriPath.startsWith('/auth/');
  }

  /// Transcription audio via Whisper (backend)
  Future<Map<String, dynamic>> whisperTranscribe({
    required List<int> audioBytes,
    String fileName = 'audio.wav',
    String language = 'auto',
    String modelSize = 'base',
    bool medicalContext = true,
  }) async {
    try {
      final form = FormData.fromMap({
        'audio_file': MultipartFile.fromBytes(audioBytes, filename: fileName),
        'language': language,
        'model_size': modelSize,
        'medical_context': medicalContext.toString(),
      });
      final response = await _dio.post(
        ApiConstants.whisperTranscribe,
        data: form,
        options: Options(contentType: 'multipart/form-data'),
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  void _initializeDio() {
    final initialBaseUrl = _baseUrls.isNotEmpty
        ? _baseUrls[_baseUrlIndex.clamp(0, _baseUrls.length - 1)]
        : ApiConstants.baseUrl;

    if (kDebugMode) {
      debugPrint('[ApiService] Base URLs: ${_baseUrls.join(', ')}');
      debugPrint('[ApiService] Base URL (active): $initialBaseUrl');
    }

    _dio = Dio(BaseOptions(
      baseUrl: initialBaseUrl,
      connectTimeout: ApiConstants.connectTimeout,
      receiveTimeout: ApiConstants.receiveTimeout,
      contentType: ApiConstants.contentType,
      headers: {'Accept': 'application/json'},
    ));

    if (kDebugMode) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint(obj.toString()),
      ));
    }

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Best-effort: auto-select a reachable backend once at startup.
        // This makes "save to DB" work out-of-the-box when:
        // - phone uses USB + adb reverse (127.0.0.1 works)
        // - OR phone can reach host IP over Wi‑Fi/LAN
        await _ensureBaseUrlResolved();

        // Évite d'ajouter un token potentiellement périmé aux endpoints d'auth.
        if (_authToken != null && !_isAuthEndpoint(options)) {
          options.headers[ApiConstants.authorizationHeader] =
              '${ApiConstants.bearerPrefix} $_authToken';
        } else {
          // En cas de retry avec un path absolu, on s'assure qu'aucun token ne traîne.
          options.headers.remove(ApiConstants.authorizationHeader);
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          debugPrint('Token expired/unauthorized, redirecting to login');
          _authToken = null;
          _onUnauthorized?.call();
          return handler.next(error);
        }

        final noBaseUrlRetry =
            (error.requestOptions.extra['noBaseUrlRetry'] as bool?) ?? false;

        // Réseau bloqué/isolé (ex: eduroam) : tente automatiquement les URLs fallback.
        final isConnectionIssue =
            error.type == DioExceptionType.connectionError ||
                error.type == DioExceptionType.connectionTimeout ||
                error.type == DioExceptionType.unknown;

        if (isConnectionIssue) {
          // For some endpoints (like form-json), we want to fail fast without
          // thrashing baseUrl probing/retries.
          if (!noBaseUrlRetry) {
            // Network context may have changed (USB reverse / Wi‑Fi toggled). Allow re-probing.
            _resolvedBaseUrl = null;
            _baseUrlProbeFuture = null;
          }
        }

        final req = error.requestOptions;
        final retryCount = (req.extra['baseUrlRetry'] as int?) ?? 0;

        if (!noBaseUrlRetry && isConnectionIssue && _baseUrls.length > 1) {
          final maxRetries = _baseUrls.length - 1;
          if (retryCount < maxRetries) {
            _baseUrlIndex = (_baseUrlIndex + 1) % _baseUrls.length;
            final nextUrl = _baseUrls[_baseUrlIndex];
            _dio.options.baseUrl = nextUrl;

            // Les retries doivent échouer vite pour passer au fallback suivant.
            final nextExtra = Map<String, dynamic>.from(req.extra)
              ..['baseUrlRetry'] = retryCount + 1;

            // IMPORTANT:
            // - ne pas muter/relancer la même instance de RequestOptions (peut garder une URI déjà construite)
            // - reconstruire une nouvelle RequestOptions avec baseUrl forcé
            // - éviter le header Authorization sur /auth/* même si le path est absolu
            final retryOptions = req.copyWith(
              baseUrl: nextUrl,
              extra: nextExtra,
              connectTimeout: const Duration(seconds: 6),
              receiveTimeout: const Duration(seconds: 15),
            );

            if (_isAuthEndpoint(retryOptions)) {
              retryOptions.headers.remove(ApiConstants.authorizationHeader);
            }

            if (kDebugMode) {
              debugPrint(
                  '[ApiService] Connection error -> retry with baseUrl: $nextUrl (attempt ${retryCount + 1}/$maxRetries)');
            }

            try {
              final response = await _dio.fetch(retryOptions);
              return handler.resolve(response);
            } catch (e) {
              // Si le retry échoue, on laisse Dio gérer l'erreur finale.
              if (e is DioException) return handler.next(e);
              return handler.next(error);
            }
          }
        }

        return handler.next(error);
      },
    ));
  }

  void setUnauthorizedHandler(VoidCallback handler) {
    _onUnauthorized = handler;
  }

  void setAuthToken(String token) => _authToken = token;
  void clearAuthToken() => _authToken = null;
  bool isAuthenticated() => _authToken != null;

  // ============ AUTH ENDPOINTS ============
  Future<AuthResponse> register(RegisterRequest request) async {
    try {
      final response = await _dio.post(
        ApiConstants.authRegister,
        data: request.toJson(),
        options: Options(contentType: 'application/x-www-form-urlencoded'),
      );
      return AuthResponse.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<AuthResponse> login(LoginRequest request) async {
    try {
      // Correction : encoder en Map<String, String> pour form-urlencoded
      final response = await _dio.post(
        ApiConstants.authLogin,
        data: {
          'username': request.username,
          'password': request.password,
        },
        options: Options(contentType: 'application/x-www-form-urlencoded'),
      );
      return AuthResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ TRANSCRIPTION ENDPOINTS ============
  /// Helper pour créer FormData fraîche pour les retries
  FormData _createTranscribeFormData(List<int> audioBytes, String fileName,
      {String? language}) {
    return FormData.fromMap({
      'audio_file': MultipartFile.fromBytes(audioBytes, filename: fileName),
      if (language != null && language.isNotEmpty) 'language': language,
    });
  }

  Future<Map<String, dynamic>> aurianceTranscribeBytes({
    required List<int> audioBytes,
    String fileName = 'audio.m4a',
    String? language,
    String? domain,
  }) async {
    try {
      final form =
          _createTranscribeFormData(audioBytes, fileName, language: language);

      final response = await _dio.post(
        ApiConstants.aurianceTranscribe,
        data: form,
        options: Options(
          contentType: 'multipart/form-data',
          receiveTimeout: const Duration(seconds: 120),
          extra: {'noBaseUrlRetry': true}, // FormData ne peut pas être retryée
        ),
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> translateText({
    required String text,
    String? sourceLang,
    String targetLang = 'fr',
  }) async {
    try {
      // Utilise l'endpoint AURIANCE qui:
      // - auto-détecte la langue côté backend
      // - renvoie directement translated_text
      final data = {
        'text': text,
        'target_lang': targetLang,
        if (sourceLang != null) 'source_lang': sourceLang,
      };
      debugPrint('TRADUCTION: Body envoyé => $data');

      final response = await _dio.post(
        ApiConstants.aurianceTranslateText,
        data: data,
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          responseType: ResponseType.json,
        ),
      );

      final Map<String, dynamic> result = (response.data is String)
          ? (jsonDecode(response.data as String) as Map<String, dynamic>)
          : (response.data as Map<String, dynamic>);

      final translated = result['translated_text'] as String? ?? text;
      return {
        'status': (result['success'] == true) ? 'success' : 'error',
        'translated_text': translated,
        'provider': result['provider'] ?? 'auriance',
        'confidence': result['language_confidence'] ?? 0,
        'original': result['original_text'] ?? text,
        'detected_language': result['detected_language'],
        'target_language': result['target_language'] ?? targetLang,
      };
    } on DioException catch (e) {
      debugPrint('TRADUCTION: DIO Error => ${e.message}');
      debugPrint('TRADUCTION: DIO Response => ${e.response?.data}');
      throw _handleError(e);
    } catch (e) {
      debugPrint('TRADUCTION: Erreur => $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> generateFormJson({
    required String transcription,
    String? formType,
  }) async {
    try {
      final dataMap = {
        'transcription': transcription,
        if (formType != null) 'form_type': formType,
      };

      final response = await _dio.post(
        ApiConstants.aurianceGenerateFormJson,
        data: dataMap,
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          extra: const {'noBaseUrlRetry': true},
          sendTimeout: const Duration(seconds: 2),
          receiveTimeout: const Duration(seconds: 6),
        ),
      );
      final data = response.data as Map<String, dynamic>;

      // Le backend retourne {success: True, form_json: {...}, ...}
      if (data.containsKey('form_json')) {
        return (data['form_json'] as Map).cast<String, dynamic>();
      }
      // Fallback: retourner directement data si form_json n'existe pas
      return data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> generateReport({
    required String transcription,
    String? reportType,
    String format = 'json',
    Map<String, dynamic>? extractedFields,
  }) async {
    try {
      final form = FormData.fromMap({
        'transcription': transcription,
        if (reportType != null) 'report_type': reportType,
        'format': format,
        if (extractedFields != null)
          'extracted_fields': jsonEncode(extractedFields),
      });
      final response = await _dio.post(
        ApiConstants.aurianceGenerateReport,
        data: form,
        options: Options(contentType: 'application/x-www-form-urlencoded'),
      );
      final data = response.data as Map<String, dynamic>;
      return (data['report'] as Map).cast<String, dynamic>();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<String> generateSqlQuery({
    required String intent,
    Map<String, dynamic>? context,
  }) async {
    try {
      // Utiliser application/x-www-form-urlencoded pour éviter les problèmes FormData
      final response = await _dio.post(
        ApiConstants.aurianceGenerateSqlQuery,
        data: {
          'intent': intent,
          if (context != null) 'context': jsonEncode(context),
        },
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          extra: {'noBaseUrlRetry': false}, // Peut être retryé sans problème
        ),
      );
      final data = response.data as Map<String, dynamic>;
      return (data['sql'] ?? '').toString();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<String> generateCypherQuery({
    required String intent,
    Map<String, dynamic>? context,
  }) async {
    try {
      // Utiliser application/x-www-form-urlencoded pour éviter les problèmes FormData
      final response = await _dio.post(
        ApiConstants.aurianceGenerateCypherQuery,
        data: {
          'intent': intent,
          if (context != null) 'context': jsonEncode(context),
        },
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          extra: {'noBaseUrlRetry': false}, // Peut être retryé sans problème
        ),
      );
      final data = response.data as Map<String, dynamic>;
      return (data['cypher'] ?? '').toString();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Transcription> createTranscription(
      CreateTranscriptionRequest request) async {
    try {
      final response = await _dio.post(
        ApiConstants.dataTranscriptions,
        data: request.toJson(),
      );
      return Transcription.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Report> createReport(CreateReportRequest request) async {
    try {
      final response = await _dio.post(
        ApiConstants.dataReports,
        data: request.toJson(),
      );
      return Report.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Transcription>> getTranscriptions({
    int skip = 0,
    int limit = 100,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.dataTranscriptions,
        queryParameters: {'skip': skip, 'limit': limit},
      );
      final list = response.data as List;
      return list.map((item) => Transcription.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Transcription> getTranscription(int id) async {
    try {
      final response = await _dio.get(
        '${ApiConstants.dataTranscriptions}/$id',
      );
      return Transcription.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> searchTranscriptions(String query,
      {int limit = 5}) async {
    try {
      final response = await _dio.get(
        ApiConstants.dataSearch,
        queryParameters: {'query': query, 'limit': limit},
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> deleteTranscription(int id) async {
    try {
      await _dio.delete('${ApiConstants.dataTranscriptions}/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ EXTRACTION ENDPOINTS ============
  Future<Extraction> createExtraction(Extraction extraction) async {
    try {
      final response = await _dio.post(
        ApiConstants.dataExtractions,
        data: extraction.toJson(),
      );
      return Extraction.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Extraction>> getExtractions({
    int skip = 0,
    int limit = 100,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.dataExtractions,
        queryParameters: {'skip': skip, 'limit': limit},
      );
      final list = response.data as List;
      return list.map((item) => Extraction.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Report>> getReports({
    int skip = 0,
    int limit = 100,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.dataReports,
        queryParameters: {'skip': skip, 'limit': limit},
      );
      final list = response.data as List;
      return list.map((item) => Report.fromJson(item)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ STATISTICS ============
  Future<Map<String, dynamic>> getDatabaseStats() async {
    try {
      final response = await _dio.get(ApiConstants.dataStats);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ DEMO VECTOR/GRAPH ENDPOINTS ============
  Future<Map<String, dynamic>> demoIngest({
    required String text,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.demoIngest,
        data: {'text': text},
        options: Options(contentType: 'application/json'),
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> demoSearch({
    required String query,
    int limit = 5,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.demoSearch,
        queryParameters: {'query': query, 'limit': limit},
      );
      return (response.data as Map).cast<String, dynamic>();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ MEDICAL SEARCH ENDPOINTS ============
  Future<Map<String, dynamic>> medicalSearch({
    required String query,
    int limit = 5,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.medicalSearch,
        queryParameters: {
          'query': query,
          'limit': limit,
        },
      );
      return (response.data as Map).cast<String, dynamic>();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> medicalHistory({int limit = 50}) async {
    try {
      final response = await _dio.get(
        ApiConstants.medicalHistory,
        queryParameters: {'limit': limit},
      );
      return (response.data as Map).cast<String, dynamic>();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> medicalHistoryDetail(int id) async {
    try {
      final response = await _dio.get(ApiConstants.medicalHistoryDetail(id));
      return (response.data as Map).cast<String, dynamic>();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<int>> downloadMedicalHistoryPdf(int id) async {
    try {
      final response = await _dio.get(
        ApiConstants.medicalHistoryPdf(id),
        options: Options(responseType: ResponseType.bytes),
      );
      return (response.data as List<int>);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> demoSemanticGraph({
    required String query,
    int limit = 5,
  }) async {
    try {
      final response = await _dio.get(
        ApiConstants.demoSemanticGraph,
        queryParameters: {
          'query': query,
          'limit': limit,
        },
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> demoIngestAndSearch({
    required String text,
    String? query,
    int limit = 5,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.demoIngestAndSearch,
        data: {
          'text': text,
          if (query != null) 'query': query,
          'limit': limit,
        },
        options: Options(contentType: 'application/json'),
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ AURIANCE ADDITIONAL ENDPOINTS ============
  /// Transcription et extraction en une seule requête
  Future<Map<String, dynamic>> transcribeAndExtract({
    required List<int> audioBytes,
    String fileName = 'audio.m4a',
    String? language,
    Map<String, dynamic>? fields,
  }) async {
    try {
      final form = FormData.fromMap({
        'audio_file': MultipartFile.fromBytes(audioBytes, filename: fileName),
        if (language != null) 'language': language,
        if (fields != null) 'fields': jsonEncode(fields),
      });

      final response = await _dio.post(
        ApiConstants.aurianceTranscribeAndExtract,
        data: form,
        options: Options(contentType: 'multipart/form-data'),
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Génère un résumé d'une transcription
  Future<String> generateSummary({
    required String transcription,
    int maxLength = 200,
  }) async {
    try {
      final form = FormData.fromMap({
        'transcription': transcription,
        'max_length': maxLength.toString(),
      });

      final response = await _dio.post(
        ApiConstants.aurianceGenerateSummary,
        data: form,
        options: Options(contentType: 'application/x-www-form-urlencoded'),
      );

      final data = response.data as Map<String, dynamic>;
      return (data['summary'] ?? '').toString();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Pipeline complet AURIANCE (transcription + extraction + requêtes + rapports)
  Future<Map<String, dynamic>> completePipeline({
    required List<int> audioBytes,
    String fileName = 'audio.m4a',
    String? language,
    String action = 'transcribe', // transcribe, extract, query, report, all
  }) async {
    try {
      final form = FormData.fromMap({
        'audio_file': MultipartFile.fromBytes(audioBytes, filename: fileName),
        'action': action,
        if (language != null) 'language': language,
      });

      final response = await _dio.post(
        ApiConstants.aurianceCompletePipeline,
        data: form,
        options: Options(contentType: 'multipart/form-data'),
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ AURIAN AI ENDPOINTS ============
  /// Chat texte avec Aurian
  Future<Map<String, dynamic>> aurianChat({
    required String message,
    Map<String, dynamic>? context,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.aurianChat,
        data: {
          'message': message,
          if (context != null) 'context': context,
        },
        options: Options(contentType: 'application/json'),
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Chat vocal avec Aurian
  Future<Map<String, dynamic>> aurianVoice({
    required List<int> audioBytes,
    String fileName = 'audio.m4a',
  }) async {
    try {
      final form = FormData.fromMap({
        'audio_file': MultipartFile.fromBytes(audioBytes, filename: fileName),
      });

      final response = await _dio.post(
        ApiConstants.aurianVoice,
        data: form,
        options: Options(contentType: 'multipart/form-data'),
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Récupère les capacités d'Aurian
  Future<Map<String, dynamic>> getAurianCapabilities() async {
    try {
      final response = await _dio.get(ApiConstants.aurianCapabilities);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ CONSULTATION SAVE ============
  /// Sauvegarde une consultation en base de données
  Future<Map<String, dynamic>> saveConsultation({
    required String transcription,
    String? nom,
    String? prenom,
    int? age,
    String? dateNaissance,
    String? genre,
    String? symptomes,
    String? diagnostic,
    String? traitement,
    double? temperature,
  }) async {
    try {
      final dataMap = {
        'transcription': transcription,
        if (nom != null) 'nom': nom,
        if (prenom != null) 'prenom': prenom,
        if (age != null) 'age': age,
        if (dateNaissance != null) 'date_naissance': dateNaissance,
        if (genre != null) 'genre': genre,
        if (symptomes != null) 'symptomes': symptomes,
        if (diagnostic != null) 'diagnostic': diagnostic,
        if (traitement != null) 'traitement': traitement,
        if (temperature != null) 'temperature': temperature,
      };

      final response = await _dio.post(
        ApiConstants.aurianceSaveConsultation,
        data: dataMap,
        options: Options(contentType: 'application/x-www-form-urlencoded'),
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ CONSULTATIONS HISTORY ============
  /// Récupère l'historique des consultations
  Future<List<Map<String, dynamic>>> getConsultations({
    int skip = 0,
    int limit = 50,
  }) async {
    try {
      final response = await _dio.get(
        '/api/auriance/consultations',
        queryParameters: {'skip': skip, 'limit': limit},
      );
      return (response.data as List).cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ RAG ENDPOINTS ============
  Future<Map<String, dynamic>> submitRagQuery(String question,
      {int topK = 4,
      bool translateResponse = false,
      String language = 'auto',
      String? responseLanguage}) async {
    try {
      final response = await _dio.post(
        ApiConstants.aurianceRagAnswer,
        data: {
          'question': question,
          'top_k': topK.toString(),
          'language': language,
          'translate_response': translateResponse.toString(),
          if (responseLanguage != null) 'response_language': responseLanguage,
        },
        options: Options(
          contentType: 'application/x-www-form-urlencoded',
          extra: {'noBaseUrlRetry': false},
        ),
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Recherche vocale multi-bases: transcription + RAG en une seule requête
  /// Retourne: {transcription, sql_query, cypher_query, vector_query, postgres_results, neo4j_results, qdrant_results, answer}
  Future<Map<String, dynamic>> voiceMultiDatabaseSearch({
    required List<int> audioBytes,
    String fileName = 'audio.m4a',
    String language = 'auto',
    int topK = 4,
    bool translateResponse = false,
    String? responseLanguage,
  }) async {
    try {
      final form = FormData.fromMap({
        'audio_file': MultipartFile.fromBytes(audioBytes, filename: fileName),
        'language': language,
        'top_k': topK.toString(),
        'translate_response': translateResponse.toString(),
        if (responseLanguage != null) 'response_language': responseLanguage,
      });

      final response = await _dio.post(
        '/api/auriance/voice-search', // Endpoint pour recherche vocale multi-bases
        data: form,
        options: Options(
          contentType: 'multipart/form-data',
          extra: {'noBaseUrlRetry': true}, // FormData ne peut pas être retryée
        ),
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ ADMIN ENDPOINTS ============
  Future<Map<String, dynamic>> getAdminStats({int days = 7}) async {
    try {
      final response = await _dio.get(
        '/api/admin/rag-stats',
        queryParameters: {'days': days},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getServerHistory(
      {int limit = 50, int offset = 0}) async {
    try {
      final response = await _dio.get(
        '/api/admin/rag-history',
        queryParameters: {'limit': limit, 'offset': offset},
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============ TRANSLATION ENDPOINTS ============

  /// Traduit un texte d'une langue à une autre (retourne objet Translation)
  Future<Translation> translateTextTyped({
    required String text,
    String sourceLanguage = 'en',
    required String targetLanguage,
  }) async {
    try {
      final response = await _dio.post(
        '/translation/translate',
        data: {
          'text': text,
          'source_language': sourceLanguage,
          'target_language': targetLanguage,
        },
      );
      final result = response.data as Map<String, dynamic>;
      final translationData = result['data'] as Map<String, dynamic>;
      return Translation.fromJson(translationData);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Traduit plusieurs textes en une seule requête
  Future<List<Translation>> translateBatch({
    required List<String> texts,
    String sourceLanguage = 'en',
    required String targetLanguage,
  }) async {
    try {
      final response = await _dio.post(
        '/translation/translate-batch',
        data: {
          'texts': texts,
          'source_language': sourceLanguage,
          'target_language': targetLanguage,
        },
      );
      final result = response.data as Map<String, dynamic>;
      final batchData = result['data'] as Map<String, dynamic>;
      final translations =
          (batchData['translations'] as List).cast<Map<String, dynamic>>();
      return translations.map((t) => Translation.fromJson(t)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Traduit une transcription vocale
  Future<Map<String, dynamic>> translateTranscription({
    required String transcriptionText,
    required String detectedLanguage,
    required String targetLanguage,
  }) async {
    try {
      final response = await _dio.post(
        '/translation/translate-transcription',
        data: {
          'transcription_text': transcriptionText,
          'detected_language': detectedLanguage,
          'target_language': targetLanguage,
        },
      );
      final result = response.data as Map<String, dynamic>;
      return result['data'] as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Récupère la liste de toutes les langues supportées
  Future<List<LanguageInfo>> getSupportedLanguages() async {
    try {
      final response = await _dio.get('/translation/languages');
      final result = response.data as Map<String, dynamic>;
      final data = result['data'] as Map<String, dynamic>;
      final languages =
          (data['languages'] as List).cast<Map<String, dynamic>>();
      return languages.map((l) => LanguageInfo.fromJson(l)).toList();
    } on DioException catch (e) {
      // Fallback local si l'API n'est pas dispo (404/connection error)
      debugPrint('getSupportedLanguages fallback: ${_handleError(e)}');
      return _fallbackLanguages();
    }
  }

  /// Récupère les infos d'une langue spécifique
  Future<LanguageInfo> getLanguageInfo(String languageCode) async {
    try {
      final response = await _dio.get('/translation/languages/$languageCode');
      final result = response.data as Map<String, dynamic>;
      final data = result['data'] as Map<String, dynamic>;
      return LanguageInfo.fromJson(data);
    } on DioException catch (e) {
      // Fallback: retourner depuis la liste locale si non disponible côté API
      final fallback =
          _fallbackLanguages().firstWhere((l) => l.code == languageCode,
              orElse: () => LanguageInfo(
                    code: languageCode,
                    name: languageCode.toUpperCase(),
                    nativeName: languageCode,
                    speakers: 0,
                  ));
      debugPrint(
          'getLanguageInfo fallback for $languageCode: ${_handleError(e)}');
      return fallback;
    }
  }

  // ============ FALLBACK LANGUAGES (25) ============
  List<LanguageInfo> _fallbackLanguages() {
    final langs = <LanguageInfo>[
      LanguageInfo(
          code: 'en',
          name: 'English',
          nativeName: 'English',
          speakers: 1460000000),
      LanguageInfo(
          code: 'zh',
          name: 'Mandarin Chinese',
          nativeName: '中文',
          speakers: 1140000000),
      LanguageInfo(
          code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speakers: 609000000),
      LanguageInfo(
          code: 'es',
          name: 'Spanish',
          nativeName: 'Español',
          speakers: 559000000),
      LanguageInfo(
          code: 'fr',
          name: 'French',
          nativeName: 'Français',
          speakers: 310000000),
      LanguageInfo(
          code: 'ar',
          name: 'Arabic',
          nativeName: 'العربية',
          speakers: 372000000),
      LanguageInfo(
          code: 'bn',
          name: 'Bengali',
          nativeName: 'বাংলা',
          speakers: 300000000),
      LanguageInfo(
          code: 'ru',
          name: 'Russian',
          nativeName: 'Русский',
          speakers: 258000000),
      LanguageInfo(
          code: 'pt',
          name: 'Portuguese',
          nativeName: 'Português',
          speakers: 258000000),
      LanguageInfo(
          code: 'ur', name: 'Urdu', nativeName: 'اردو', speakers: 230000000),
      LanguageInfo(
          code: 'id',
          name: 'Indonesian',
          nativeName: 'Bahasa Indonesia',
          speakers: 199000000),
      LanguageInfo(
          code: 'de',
          name: 'German',
          nativeName: 'Deutsch',
          speakers: 132000000),
      LanguageInfo(
          code: 'ja', name: 'Japanese', nativeName: '日本語', speakers: 125000000),
      LanguageInfo(
          code: 'yo',
          name: 'Nigerian Pidgin',
          nativeName: 'Naija',
          speakers: 75000000),
      LanguageInfo(
          code: 'arz',
          name: 'Egyptian Arabic',
          nativeName: 'العربية المصرية',
          speakers: 65000000),
      LanguageInfo(
          code: 'mr', name: 'Marathi', nativeName: 'मराठी', speakers: 83000000),
      LanguageInfo(
          code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speakers: 82000000),
      LanguageInfo(
          code: 'tr',
          name: 'Turkish',
          nativeName: 'Türkçe',
          speakers: 85000000),
      LanguageInfo(
          code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speakers: 78000000),
      LanguageInfo(
          code: 'yue',
          name: 'Cantonese',
          nativeName: '廣東話',
          speakers: 73000000),
      LanguageInfo(
          code: 'vi',
          name: 'Vietnamese',
          nativeName: 'Tiếng Việt',
          speakers: 86000000),
      LanguageInfo(
          code: 'wuu',
          name: 'Wu Chinese',
          nativeName: '吴语',
          speakers: 83000000),
      LanguageInfo(
          code: 'tl',
          name: 'Tagalog',
          nativeName: 'Tagalog',
          speakers: 82000000),
      LanguageInfo(
          code: 'ko', name: 'Korean', nativeName: '한국어', speakers: 82000000),
      LanguageInfo(
          code: 'fa',
          name: 'Farsi (Persian)',
          nativeName: 'فارسی',
          speakers: 70000000),
    ];
    // Trier par nom pour affichage stable
    langs.sort((a, b) => a.name.compareTo(b.name));
    return langs;
  }

  // ============ ERROR HANDLING ============
  String _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return 'Connection timeout. Backend unreachable (USB adb reverse or LAN IP).';
      case DioExceptionType.sendTimeout:
        return 'Send timeout. Please try again.';
      case DioExceptionType.receiveTimeout:
        return 'Receive timeout. Please try again.';
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final message = error.response?.data?['detail'] ??
            error.response?.statusMessage ??
            'Unknown error';
        return 'Error $statusCode: $message';
      case DioExceptionType.cancel:
        return 'Request cancelled.';
      case DioExceptionType.badCertificate:
        return 'Bad certificate.';
      case DioExceptionType.connectionError:
        return 'Connection error. Backend unreachable (USB adb reverse or LAN IP).';
      case DioExceptionType.unknown:
        return error.message ?? 'Unknown error occurred.';
    }
  }

  /// Transcription RAG/IA universelle (texte -> réponse intelligente)
  Future<Map<String, dynamic>?> transcribeRag(String text,
      {String language = 'fr', int topK = 5}) async {
    await _ensureBaseUrlResolved();
    try {
      final response = await _dio.post(
        '/api/voice/transcribe-rag',
        data: {
          'text': text,
          'language': language,
          'top_k': topK,
        },
        options: Options(contentType: 'application/json'),
      );
      return response.data as Map<String, dynamic>?;
    } on DioException catch (e) {
      debugPrint('Erreur transcribeRag: \\${_handleError(e)}');
      return null;
    }
  }
}
