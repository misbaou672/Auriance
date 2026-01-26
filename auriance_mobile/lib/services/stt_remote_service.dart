import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';

/// Service pour la reconnaissance vocale distante (Whisper, Vosk, Silero)
class SttRemoteService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: ApiConstants.connectTimeout,
    receiveTimeout: ApiConstants.receiveTimeout,
    contentType: 'multipart/form-data',
    headers: {'Accept': 'application/json'},
  ));

  /// Envoie un fichier audio au backend pour transcription
  Future<String> transcribeAudio(File audioFile,
      {String engine = 'whisper'}) async {
    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(audioFile.path,
            filename: audioFile.path.split('/').last),
        'engine': engine,
      });
      final response = await _dio.post('/api/voice/transcribe', data: form);
      if (response.data != null && response.data['text'] != null) {
        return response.data['text'] as String;
      }
      throw Exception('Aucune transcription reçue');
    } catch (e) {
      debugPrint('Erreur STT distant: $e');
      rethrow;
    }
  }
}
