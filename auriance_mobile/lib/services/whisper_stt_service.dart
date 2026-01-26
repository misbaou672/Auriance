import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';

/// Real-time Whisper/Silero STT via backend WebSocket
class WhisperSttService extends ChangeNotifier {
  void clear() {
    _partialText = '';
    _finalText = '';
    notifyListeners();
  }

  final String wsUrl;
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  bool _connected = false;
  bool _listening = false;
  String _partialText = '';
  String _finalText = '';
  String? _language;
  String? _error;

  bool get isConnected => _connected;
  bool get isListening => _listening;
  String get text => _finalText.isNotEmpty ? _finalText : _partialText;
  String? get language => _language;
  String? get error => _error;

  WhisperSttService({required this.wsUrl});

  void connect() {
    debugPrint('[WhisperSttService] connect() called (wsUrl=$wsUrl)');
    // Fermer toute connexion existante proprement
    _subscription?.cancel();
    _channel?.sink.close();
    _connected = false;
    _listening = false;
    _partialText = '';
    _finalText = '';
    _language = null;
    _error = null;
    notifyListeners();
    try {
      _channel = WebSocketChannel.connect(Uri.parse(wsUrl));
      _connected = true;
      debugPrint('[WhisperSttService] WebSocket connected');
      _subscription = _channel!.stream.listen(_onData, onError: (error) {
        _onError(error);
        debugPrint('[WhisperSttService] WebSocket connection error: $error');
        _error = 'Erreur de connexion WebSocket: $error';
        notifyListeners();
      }, onDone: _onDone);
    } catch (e) {
      _error = 'Erreur de connexion WebSocket: $e';
      debugPrint('[WhisperSttService] $e');
      notifyListeners();
    }
  }

  void startListening() {
    debugPrint('[WhisperSttService] startListening() called');
    if (!_connected) {
      connect();
    }
    _listening = true;
    notifyListeners();
  }

  void sendAudioChunk(Uint8List chunk) {
    if (_channel != null && _connected) {
      debugPrint(
          '[WhisperSttService] Sending audio chunk of size: ${chunk.length}');
      _channel!.sink.add(chunk);
    } else {
      debugPrint('[WhisperSttService] Not connected, cannot send audio chunk');
    }
  }

  void stopListening() {
    debugPrint('[WhisperSttService] stopListening() called');
    _listening = false;
    _subscription?.cancel();
    _channel?.sink.close();
    _connected = false;
    notifyListeners();
  }

  void _onData(dynamic data) {
    debugPrint('[WhisperSttService] _onData: $data');
    try {
      final map = data is String ? jsonDecode(data) : data;
      if (map['error'] != null) {
        _error = map['error'];
        debugPrint('[WhisperSttService] Error from backend: $_error');
        notifyListeners();
        return;
      }
      if (map['text'] != null) {
        if (map['is_final'] == true) {
          _finalText = map['text'];
          debugPrint('[WhisperSttService] Final text: $_finalText');
        } else {
          _partialText = map['text'];
          debugPrint('[WhisperSttService] Partial text: $_partialText');
        }
        _language = map['language'];
        notifyListeners();
      }
      if ((map['text'] == null || map['text'].toString().trim().isEmpty) &&
          _listening) {
        _error = 'Aucune transcription reçue du backend.';
        debugPrint('[WhisperSttService] No transcription received');
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      debugPrint('[WhisperSttService] Exception in _onData: $e');
      notifyListeners();
    }
  }

  void _onError(error) {
    _error = error.toString();
    _connected = false;
    debugPrint('[WhisperSttService] WebSocket error: $_error');
    notifyListeners();
  }

  void _onDone() {
    debugPrint('[WhisperSttService] WebSocket connection closed');
    _connected = false;
    _listening = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _channel?.sink.close();
    super.dispose();
  }
}
