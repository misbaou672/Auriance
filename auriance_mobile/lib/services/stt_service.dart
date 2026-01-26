import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;

/// Real-time Speech-to-Text (on-device/Google ASR)
/// - Supports partial results, sound level, locale selection
class SttService extends ChangeNotifier {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _available = false;
  // `_listening` represents user intent (UI state). We keep it true until the
  // user explicitly stops, even if the platform engine restarts internally.
  bool _listening = false;
  // Actual engine state (speech_to_text session running).
  bool _engineListening = false;
  bool _initializing = false;
  String _partialText = '';
  String _finalText = '';
  String _sessionText = '';
  double _confidence = 0.0;
  double _soundLevel = 0.0;
  String? _localeId;
  bool _manualStop = false;
  bool _restartPending = false;
  int _restartToken = 0;
  int _timeoutCount = 0;
  DateTime _lastRestart = DateTime.now();

  bool get isAvailable => _available;
  bool get isListening => _listening;
  bool get isInitializing => _initializing;
  // Full transcript so far + current partial (if any).
  String get text {
    final combined = [_sessionText, _partialText]
        .where((s) => s.trim().isNotEmpty)
        .join(' ')
        .trim();
    if (combined.isNotEmpty) return combined;
    return _finalText.isNotEmpty ? _finalText : '';
  }

  // Final transcript so far for the current session.
  String get finalText => _sessionText.isNotEmpty ? _sessionText : _finalText;
  double get confidence => _confidence;
  double get soundLevel => _soundLevel;
  String? get localeId => _localeId;

  Future<void> initialize({String preferredLocale = 'fr_FR'}) async {
    if (_initializing) return;
    // Permit re-initialization only if not available or forced
    if (_available && _speech.isAvailable) {
      debugPrint('STT Service: Already available and initialized.');
      return;
    }

    _initializing = true;
    notifyListeners();

    try {
      debugPrint('STT Service: Starting initialization...');
      _available = await _speech.initialize(
        onError: (error) {
          debugPrint('STT Service Error: ${error.errorMsg}');
          if (error.errorMsg.contains('busy')) {
            _timeoutCount++;
            // Don't auto-restart if we already tried 3 times
            if (_timeoutCount < 3 && !_manualStop) {
              debugPrint('STT Service: Busy, attempting recovery...');
              _restartAfterDelay();
            }
          }
        },
        onStatus: (status) {
          debugPrint('STT Service Status: $status');
          if (status == 'done' || status == 'notListening') {
            // Engine can stop on its own. Keep UI state stable (user intent),
            // but track engine state and restart if the user didn't stop.
            _engineListening = false;
            notifyListeners();

            if (_listening && !_manualStop) {
              debugPrint(
                  'STT Service: Engine stopped unexpectedly, restarting...');
              _restartAfterDelay();
            }
          } else if (status == 'listening') {
            _engineListening = true;
            notifyListeners();
          }
        },
      );

      // NOTE:
      // On Android, relying on permission_handler can fail if the project isn't
      // fully configured. speech_to_text already exposes permission state; we
      // use that to match the behavior of LiveTranscriptionScreen.
      final hasPermission = await _speech.hasPermission;
      if (!hasPermission) {
        debugPrint('STT Service: Microphone permission not granted');
        _available = false;
      }

      if (_available) {
        final locales = await _speech.locales();
        debugPrint('STT Service: Found ${locales.length} locales');
        var target = locales.firstWhere(
          (l) => l.localeId == preferredLocale,
          orElse: () => locales.firstWhere(
            (l) => l.localeId.startsWith('fr'),
            orElse: () => locales.isNotEmpty
                ? locales.first
                : stt.LocaleName('fr_FR', 'Français'),
          ),
        );
        _localeId = target.localeId;
        debugPrint('STT Service: Active locale set to $_localeId');
      } else {
        debugPrint('STT Service: speech_to_text returned unavailable');
      }
    } catch (e) {
      debugPrint('STT Service: Init Exception: $e');
      _available = false;
    }

    _initializing = false;
    debugPrint('STT Service: Initialization finished. Available: $_available');
    notifyListeners();
  }

  Future<void> startListening({String? localeId, bool resetText = true}) async {
    // Invalidate any pending delayed restarts from prior engine cycles.
    _restartToken++;
    if (!_available) {
      debugPrint(
          'STT Service: Cannot start, not available. Attempting late init...');
      await initialize(preferredLocale: localeId ?? _localeId ?? 'fr_FR');
      if (!_available) {
        _listening = false;
        notifyListeners();
        return;
      }
    }

    // UI state: once user starts, we keep it true until stopListening().
    _listening = true;
    notifyListeners();

    if (_engineListening || _restartPending) {
      debugPrint('STT Service: Engine already listening or restart pending');
      return;
    }

    // Ensure any previous session is torn down
    try {
      await _speech.stop();
      await _speech.cancel();
    } catch (_) {}
    await Future.delayed(const Duration(milliseconds: 200));

    _manualStop = false;
    _partialText = '';
    if (resetText) {
      _finalText = '';
      _sessionText = '';
      _confidence = 0.0;
      _soundLevel = 0.0;
      _timeoutCount = 0;
    }

    debugPrint('STT Service: listen() starting for ${localeId ?? _localeId}');

    try {
      await _speech.listen(
        localeId: localeId ?? _localeId,
        listenFor: const Duration(hours: 24),
        pauseFor: const Duration(minutes: 5),
        listenMode: stt.ListenMode.dictation,
        partialResults: true,
        cancelOnError: false,
        onResult: (res) {
          final words = res.recognizedWords.trim();
          if (res.finalResult) {
            if (words.isNotEmpty) {
              if (_sessionText.isEmpty) {
                _sessionText = words;
              } else if (!_sessionText.endsWith(words)) {
                _sessionText = '$_sessionText $words'.trim();
              }
            }
            _finalText = _sessionText;
            _confidence = (res.confidence > 0 ? res.confidence : _confidence);
            _partialText = '';
            debugPrint('STT Service: Final result (session): $_finalText');
          } else {
            _partialText = words;
          }
          notifyListeners();
        },
        onSoundLevelChange: (level) {
          _soundLevel = level;
          notifyListeners();
        },
      );
      _engineListening = true;
      notifyListeners();
    } catch (e) {
      debugPrint('STT Service: Listen Exception: $e');
      _engineListening = false;
      // If we couldn't start a session, reflect it in UI.
      _listening = false;
      notifyListeners();
    }
  }

  Future<void> stopListening() async {
    debugPrint('STT Service: stopListening() called');
    // Invalidate any pending delayed restarts.
    _restartToken++;
    _manualStop = true;
    _listening = false;
    _engineListening = false;
    _restartPending = false;
    await _speech.stop();
    // Capture the last partial chunk (some engines only promote it after stop).
    final partial = _partialText.trim();
    if (partial.isNotEmpty) {
      if (_sessionText.isEmpty) {
        _sessionText = partial;
      } else if (!_sessionText.endsWith(partial)) {
        _sessionText = '$_sessionText $partial'.trim();
      }
    }
    _finalText = _sessionText;
    _partialText = '';
    notifyListeners();
  }

  Future<void> cancel() async {
    debugPrint('STT Service: cancel() called');
    // Invalidate any pending delayed restarts.
    _restartToken++;
    _engineListening = false;
    await _speech.cancel();
    _partialText = '';
    _soundLevel = 0.0;
    notifyListeners();
  }

  void _restartAfterDelay(
      {Duration delay = const Duration(milliseconds: 100)}) {
    final now = DateTime.now();
    // Throttle restarts to avoid infinite rapid loops, but allow faster recovery
    if (now.difference(_lastRestart).inMilliseconds < 500) return;
    _lastRestart = now;
    if (_engineListening || _restartPending || _initializing) {
      debugPrint(
          'STT Service: Restart skipped (engine already listening or pending)');
      return;
    }

    // Capture a token so we can cancel this delayed restart if the user
    // manually stops or starts a new session before the timer fires.
    final token = _restartToken;
    _restartPending = true;
    Future.delayed(delay, () async {
      if (token != _restartToken) {
        _restartPending = false;
        debugPrint('STT Service: Restart canceled (token changed)');
        return;
      }
      _restartPending = false;
      await cancel();
      // Short pause to clear audio buffer
      await Future.delayed(const Duration(milliseconds: 50));
      if (token != _restartToken) {
        debugPrint('STT Service: Restart canceled after cancel()');
        return;
      }
      if (_listening && !_manualStop && !_engineListening && !_initializing) {
        await startListening(localeId: _localeId, resetText: false);
      } else {
        debugPrint(
            'STT Service: Restart aborted (manual stop or still listening)');
      }
    });
  }

  void clear() {
    _partialText = '';
    _finalText = '';
    _sessionText = '';
    _confidence = 0.0;
    _timeoutCount = 0;
    notifyListeners();
  }
}
