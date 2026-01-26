import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:record/record.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path_provider/path_provider.dart';
import 'package:file_picker/file_picker.dart';

/// Service pour l'enregistrement audio
class AudioRecordingService {
  final AudioRecorder _audioRecorder = AudioRecorder();
  String? _currentRecordingPath;
  
  /// Importe un fichier audio depuis le périphérique
  Future<String?> importAudioFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.audio,
      );

      if (result != null && result.files.single.path != null) {
        String path = result.files.single.path!;
        if (kDebugMode) {
          print('Fichier audio importé: $path');
        }
        return path;
      }
      return null;
    } catch (e) {
      if (kDebugMode) {
        print('Erreur import audio: $e');
      }
      return null;
    }
  }
  
  /// Vérifie si la permission microphone est accordée
  Future<bool> hasMicrophonePermission() async {
    final status = await Permission.microphone.status;
    if (status.isGranted) return true;
    return (await Permission.microphone.request()).isGranted;
  }

  /// Démarre l'enregistrement audio
  Future<bool> startRecording() async {
    try {
      if (await hasMicrophonePermission()) {
        final directory = await getTemporaryDirectory();
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        final path = '${directory.path}/recording_$timestamp.m4a';
        _currentRecordingPath = path;

        // Config: AAC LC, 128k bit rate, 44100Hz
        const config = RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000, sampleRate: 44100);
        
        await _audioRecorder.start(config, path: _currentRecordingPath!);
        
        if (kDebugMode) {
          print('Enregistrement démarré: $path');
        }
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Erreur démarrage enregistrement: $e');
      }
      return false;
    }
  }

  /// Arrête l'enregistrement et retourne le chemin du fichier
  Future<String?> stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      _currentRecordingPath = path;

      if (kDebugMode) {
        print('Enregistrement arrêté: $path');
      }

      return path;
    } catch (e) {
      if (kDebugMode) {
        print('Erreur arrêt enregistrement: $e');
      }
      return null;
    }
  }

  /// Annule l'enregistrement en cours
  Future<void> cancelRecording() async {
    try {
      await _audioRecorder.stop();
      if (_currentRecordingPath != null) {
        final file = File(_currentRecordingPath!);
        if (await file.exists()) {
          await file.delete();
        }
      }
      _currentRecordingPath = null;
    } catch (e) {
      if (kDebugMode) {
        print('Erreur annulation enregistrement: $e');
      }
    }
  }

  Future<List<int>?> getAudioBytes() async {
    if (_currentRecordingPath != null) {
      final file = File(_currentRecordingPath!);
      if (await file.exists()) {
        return await file.readAsBytes();
      }
    }
    return null;
  }

  void dispose() {
    _audioRecorder.dispose();
  }
}
