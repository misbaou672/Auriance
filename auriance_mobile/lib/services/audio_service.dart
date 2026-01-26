import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'audio_recording_service.dart';

/// Service principal pour la gestion audio
class AudioService extends ChangeNotifier {
  final AudioRecordingService _recordingService = AudioRecordingService();
  bool _isRecording = false;
  String? _currentPath;
  final Stopwatch _stopwatch = Stopwatch();
  Timer? _timer;

  bool get isRecording => _isRecording;
  String? get recordingPath => _currentPath;
  Duration get recordingDuration => _stopwatch.elapsed;
  int get recordingDurationMs => _stopwatch.elapsedMilliseconds;

  Future<bool> hasMicrophonePermission() =>
      _recordingService.hasMicrophonePermission();

  Future<bool> startRecording() async {
    final success = await _recordingService.startRecording();
    if (success) {
      _isRecording = true;
      _stopwatch.reset();
      _stopwatch.start();
      _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
        notifyListeners();
      });
      notifyListeners();
    }
    return success;
  }

  Future<void> stopRecording() async {
    _currentPath = await _recordingService.stopRecording();
    _isRecording = false;
    _stopwatch.stop();
    _timer?.cancel();
    notifyListeners();
  }

  Future<void> cancelRecording() async {
    await _recordingService.cancelRecording();
    _isRecording = false;
    _stopwatch.stop();
    _stopwatch.reset();
    _timer?.cancel();
    _currentPath = null;
    notifyListeners();
  }

  Future<List<int>?> getAudioBytes() async {
    if (_currentPath != null) {
      final file = File(_currentPath!);
      if (await file.exists()) {
        return await file.readAsBytes();
      }
    }
    return null;
  }
  
  Future<String?> importAudioFile() => _recordingService.importAudioFile();

  @override
  void dispose() {
    _timer?.cancel();
    _stopwatch.stop();
    super.dispose();
  }
}
