import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/pdf_service.dart';
import '../services/file_storage_service.dart';
import '../models/transcription_models.dart';
import '../widgets/voice_orb_widget.dart';

class LiveTranscriptionScreen extends StatefulWidget {
  const LiveTranscriptionScreen({super.key});

  @override
  State<LiveTranscriptionScreen> createState() =>
      _LiveTranscriptionScreenState();
}

class _LiveTranscriptionScreenState extends State<LiveTranscriptionScreen> {
  late stt.SpeechToText _speech;
  bool _isListening = false;
  bool _speechAvailable = false;
  bool _microPermission = false;
  String _transcript = '';
  String _sessionTranscript = '';
  String _selectedLanguage = 'fr_FR';
  List<Map<String, String>> _languages = [];
  // For translation target language
  List<LanguageInfo> _supportedLanguages = [];
  String _selectedTargetLang = 'en';
  bool _isLoadingLanguages = true;
  bool _isSavingPdf = false;
  bool _isSavingDb = false;
  bool _isTranslating = false;
  String? _translatedText;
  double _soundLevel = 0.0;

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initSpeech();
      _loadSupportedLanguages();
    });
  }

  Future<void> _initSpeech() async {
    _speechAvailable = await _speech.initialize(
      onStatus: (status) {
        debugPrint('STT status: $status');
        if (status == 'done' || status == 'notListening') {
          // Certains moteurs Android arrêtent la dictée au bout de quelques secondes.
          // Tant que l'utilisateur n'a pas appuyé sur STOP, on redémarre automatiquement.
          if (_isListening) {
            _flushSessionTranscript();
            _restartListening();
          }
        }
      },
      onError: (error) {
        debugPrint('STT error: ${error.errorMsg}');
        if (_isListening &&
            (error.errorMsg.contains('error_no_match') ||
                error.errorMsg.contains('error_speech_timeout'))) {
          // Erreurs fréquentes quand l'utilisateur fait une pause.
          _restartListening();
          return;
        }

        setState(() => _isListening = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Erreur STT: ${error.errorMsg}'),
              backgroundColor: Colors.red),
        );
      },
    );
    _microPermission = await _speech.hasPermission;
    debugPrint('Micro permission: $_microPermission');
    _languages = (await _speech.locales())
        .map((l) => {'localeId': l.localeId, 'name': l.name})
        .toList();
    // Ajoute l'option "Auto" pour la détection automatique
    _languages.insert(0, {'localeId': 'auto', 'name': '🔍 Auto-détection'});
    // Sélectionne la langue du device si dispo, sinon "Auto"
    final deviceLocale = await _speech.systemLocale();
    if (deviceLocale != null &&
        _languages.any((l) => l['localeId'] == deviceLocale.localeId)) {
      _selectedLanguage = deviceLocale.localeId;
    } else {
      _selectedLanguage = 'auto'; // Par défaut: auto-détection
    }
    setState(() {});
  }

  void _handleSttResult(dynamic result) {
    debugPrint('STT result: ${result.recognizedWords}');
    setState(() {
      _sessionTranscript = result.recognizedWords;
      if (result.finalResult && _sessionTranscript.trim().isNotEmpty) {
        final cleanedText = _cleanupTranscription(_sessionTranscript);
        // Anti-doublon: ne pas ajouter si déjà présent à la fin
        if (cleanedText.isNotEmpty &&
            !_transcript.trim().endsWith(cleanedText)) {
          _transcript += (_transcript.isEmpty ? '' : ' ') + cleanedText;
        }
        _sessionTranscript = '';
      }
    });
  }

  void _flushSessionTranscript() {
    if (_sessionTranscript.trim().isEmpty) return;

    final cleanedText = _cleanupTranscription(_sessionTranscript);
    // Anti-doublon
    if (cleanedText.isNotEmpty && !_transcript.trim().endsWith(cleanedText)) {
      setState(() {
        _transcript += (_transcript.isEmpty ? '' : ' ') + cleanedText;
        _sessionTranscript = '';
      });
    } else {
      setState(() => _sessionTranscript = '');
    }
  }

  void _restartListening() {
    // On évite les collisions "busy": stop + délai court + relance.
    Future<void>(() async {
      try {
        await _speech.stop();
      } catch (_) {}

      await Future.delayed(const Duration(milliseconds: 250));
      if (!mounted || !_isListening) return;

      try {
        await _speech.listen(
          onResult: _handleSttResult,
          listenMode: stt.ListenMode.dictation,
          localeId: _selectedLanguage == 'auto' ? null : _selectedLanguage,
          partialResults: true,
          cancelOnError: false,
          listenFor: const Duration(minutes: 2),
          pauseFor: const Duration(seconds: 3),
        );
      } catch (e) {
        debugPrint('Erreur restart listen: $e');
      }
    });
  }

  Future<void> _loadSupportedLanguages() async {
    try {
      final api = context.read<ApiService>();
      final langs = await api.getSupportedLanguages();
      langs.sort((a, b) => a.name.compareTo(b.name));
      setState(() {
        _supportedLanguages = langs;
        _isLoadingLanguages = false;
        final codes = langs.map((e) => e.code).toSet();
        if (!codes.contains(_selectedTargetLang)) {
          _selectedTargetLang = codes.contains('en')
              ? 'en'
              : (codes.isNotEmpty ? codes.first : _selectedTargetLang);
        }
      });
    } catch (e) {
      setState(() => _isLoadingLanguages = false);
      debugPrint('Erreur chargement langues: $e');
    }
  }

  Future<void> _startListening() async {
    if (!_speechAvailable) {
      debugPrint('Service vocal non disponible');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Service vocal non disponible'),
            backgroundColor: Colors.red),
      );
      return;
    }
    // Vérifie la permission micro
    final hasPermission = await _speech.hasPermission;
    debugPrint('Micro permission (startListening): $hasPermission');
    if (!hasPermission) {
      final granted = await _speech.initialize();
      debugPrint('Permission micro demandée, accordée: $granted');
      if (!granted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Permission micro refusée'),
              backgroundColor: Colors.red),
        );
        return;
      }
    }
    setState(() {
      _isListening = true;
      // Ne pas effacer la transcription, juste préparer la session
      _sessionTranscript = '';
      _translatedText = null;
    });
    try {
      await _speech.listen(
        onResult: _handleSttResult,
        listenMode: stt.ListenMode.dictation,
        localeId: _selectedLanguage == 'auto' ? null : _selectedLanguage,
        partialResults: true,
        cancelOnError: false,
        onSoundLevelChange: (level) {
          setState(() => _soundLevel = level.clamp(0.0, 1.0));
          debugPrint('Niveau sonore: $level');
        },
        listenFor: const Duration(minutes: 2),
        pauseFor: const Duration(seconds: 3),
      );
    } catch (e) {
      debugPrint('Erreur listen: $e');
      if (e.toString().contains('busy')) {
        await _speech.stop();
        await Future.delayed(const Duration(milliseconds: 300));
        try {
          await _speech.listen(
            onResult: _handleSttResult,
            listenMode: stt.ListenMode.dictation,
            localeId: _selectedLanguage == 'auto' ? null : _selectedLanguage,
            partialResults: true,
            cancelOnError: false,
            onSoundLevelChange: (level) {
              debugPrint('Niveau sonore: $level');
            },
            listenFor: const Duration(minutes: 2),
            pauseFor: const Duration(seconds: 3),
          );
        } catch (e2) {
          debugPrint('Erreur listen (busy): $e2');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('Erreur STT (busy): ${e2.toString()}'),
                backgroundColor: Colors.red),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Erreur STT: ${e.toString()}'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _stopListening() async {
    await _speech.stop();
    _flushSessionTranscript();
    setState(() {
      _isListening = false;
    });
  }

  void _handleStartStop() {
    if (_isListening) {
      _stopListening();
    } else {
      _startListening();
    }
  }

  void _clearTranscript() {
    setState(() {
      _transcript = '';
      _sessionTranscript = '';
      _translatedText = null;
    });
  }

  /// Nettoie et améliore la transcription
  String _cleanupTranscription(String text) {
    if (text.isEmpty) return text;

    final cleaned = text.replaceAll(RegExp(r'\s+'), ' ').trim();
    final words = cleaned.split(' ').where((w) => w.isNotEmpty).toList();
    if (words.isEmpty) return '';

    // Déduplication très conservative: supprime uniquement les doublons consécutifs.
    final result = <String>[words.first];
    for (int i = 1; i < words.length; i++) {
      final prev = result.last.toLowerCase();
      final cur = words[i].toLowerCase();
      if (cur != prev) {
        result.add(words[i]);
      }
    }

    return result.join(' ');
  }

  Future<void> _savePdf() async {
    if (_transcript.trim().isEmpty) return;
    setState(() => _isSavingPdf = true);
    try {
      final path = await PdfService.saveTranscriptionPdf(
        text: _transcript,
        title: 'Transcription',
        languageCode: _selectedLanguage,
        preferAppMedia:
            true, // Always save in Android/media/com.example.auriance_mobile
      );
      if (mounted) {
        if (path.isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(
                    'Erreur: PDF non sauvegardé (chemin inaccessible ou permissions manquantes).'),
                backgroundColor: Colors.red),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('PDF sauvegardé: $path'),
                backgroundColor: Colors.green),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Erreur PDF: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isSavingPdf = false);
    }
  }

  Future<void> _saveDb() async {
    // S'assurer que tout le texte est capturé
    _flushSessionTranscript();

    if (_transcript.trim().isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Rien à sauvegarder (texte vide)'),
              backgroundColor: Colors.orange),
        );
      }
      return;
    }
    setState(() => _isSavingDb = true);

    bool localSaveSuccess = false;
    String? localError;
    try {
      await FileStorageService().saveHistoryEntry(
        type: 'transcription_temps_reel',
        transcription: _transcript,
      );
      localSaveSuccess = true;
    } catch (e) {
      localError = e.toString();
      debugPrint('✗ Erreur sauvegarde locale: $e');
    }

    try {
      final api = context.read<ApiService>();
      await api.createTranscription(
        CreateTranscriptionRequest(
          text: _transcript,
          language: _selectedLanguage,
          durationSeconds: 0,
          confidenceScore: 1.0,
          audioFilePath: null,
        ),
      );
      if (mounted) {
        final msg = localSaveSuccess
            ? '✓ Sauvegardé (local + serveur)'
            : '✓ Sauvegardé (serveur uniquement)';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = 'Erreur serveur: $e';
        if (e.toString().contains('Connection refused') ||
            e.toString().contains('SocketException')) {
          errorMsg = localSaveSuccess
              ? '⚠ Serveur inaccessible. Sauvegardé localement.'
              : '✗ Serveur inaccessible et erreur locale: $localError';
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            backgroundColor: localSaveSuccess ? Colors.orange : Colors.red,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      setState(() => _isSavingDb = false);
    }
  }

  Future<void> _translate() async {
    if (_transcript.trim().isEmpty) return;
    setState(() => _isTranslating = true);
    try {
      final api = context.read<ApiService>();
      // Si "Auto" est sélectionné, LibreTranslate sait gérer source_language='auto'.
      String sourceLangShort = _selectedLanguage == 'auto'
          ? 'auto'
          : _selectedLanguage.split('_').first;
      String targetLangShort = _selectedTargetLang.split('_').first;
      final resp = await api.translateText(
        text: _transcript,
        sourceLang: sourceLangShort,
        targetLang: targetLangShort,
      );
      setState(() => _translatedText = resp['translated_text'] ?? '');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Erreur traduction: $e'),
              backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isTranslating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transcription Live (STT)'),
        backgroundColor: Colors.blue.shade700,
        foregroundColor: Colors.white,
      ),
      backgroundColor: Colors.grey.shade50,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Icon(_isListening ? Icons.mic : Icons.mic_none,
                    color: _isListening ? Colors.red : Colors.grey, size: 32),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _speechAvailable
                            ? (_isListening
                                ? 'Écoute en cours...'
                                : 'Appuyez sur démarrer pour parler')
                            : 'Service vocal non disponible',
                        style: TextStyle(
                          fontWeight: _isListening
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: _speechAvailable ? null : Colors.red.shade900,
                        ),
                      ),
                      Text(
                        'Micro: ${_microPermission ? "OK" : "NON"} | STT: ${_speechAvailable ? "OK" : "NON"}',
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey.shade700),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: DropdownButton<String>(
                    value: _selectedLanguage,
                    isExpanded: true,
                    onChanged: _isListening
                        ? null
                        : (value) {
                            if (value != null) {
                              setState(() => _selectedLanguage = value);
                            }
                          },
                    items: _languages
                        .map((l) => DropdownMenuItem(
                              value: l['localeId'],
                              child: Text(l['name'] ?? l['localeId']!),
                            ))
                        .toList(),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Target language selector for translation
            if (!_isLoadingLanguages && _supportedLanguages.isNotEmpty)
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Langue de traduction'),
                        DropdownButton<String>(
                          value: _selectedTargetLang,
                          isExpanded: true,
                          onChanged: _isTranslating
                              ? null
                              : (value) {
                                  if (value != null) {
                                    setState(() => _selectedTargetLang = value);
                                  }
                                },
                          items: _supportedLanguages
                              .map((lang) => DropdownMenuItem(
                                    value: lang.code,
                                    child: Text(
                                        '${lang.name} (${lang.nativeName})'),
                                  ))
                              .toList(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 16),
            Center(
              child: VoiceOrbWidget(
                isListening: _isListening,
                soundLevel: _soundLevel,
                onTap: _handleStartStop,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        (_transcript.isEmpty && _sessionTranscript.isEmpty)
                            ? 'Appuyez sur "DÉMARRER" et dictez votre texte...'
                            : '$_transcript $_sessionTranscript',
                        style: const TextStyle(fontSize: 18),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.save),
                              label: const Text('Sauvegarder en base'),
                              onPressed: _isSavingDb ? null : _saveDb,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                foregroundColor: Colors.white,
                                minimumSize: const Size(0, 48),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.picture_as_pdf),
                              label: const Text('Exporter PDF'),
                              onPressed: _isSavingPdf ? null : _savePdf,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.deepPurple,
                                foregroundColor: Colors.white,
                                minimumSize: const Size(0, 48),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.translate),
                        label: const Text('Traduire'),
                        onPressed: _isTranslating ? null : _translate,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(0, 48),
                        ),
                      ),
                      if (_translatedText != null &&
                          _translatedText!.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        const Divider(),
                        Text('Traduction :',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                        Text(_translatedText!,
                            style: const TextStyle(
                                fontSize: 16, color: Colors.blue)),
                      ],
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _handleStartStop,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isListening ? Colors.red : Colors.blue,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(0, 48),
                    ),
                    child: Text(_isListening ? 'STOP' : 'DÉMARRER'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _transcript.isNotEmpty ? _clearTranscript : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey.shade400,
                      foregroundColor: Colors.black,
                      minimumSize: const Size(0, 48),
                    ),
                    child: const Text('EFFACER'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
