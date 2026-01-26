import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/audio_recording_service.dart';
import '../services/api_service.dart';
import '../models/transcription_models.dart';
import '../widgets/language_selector_widget.dart';
import '../constants/app_theme.dart';

/// Écran pour enregistrer et importer des fichiers audio
class VoiceRecordingScreen extends StatefulWidget {
  const VoiceRecordingScreen({super.key});

  @override
  State<VoiceRecordingScreen> createState() => _VoiceRecordingScreenState();
}

class _VoiceRecordingScreenState extends State<VoiceRecordingScreen> {
  late final AudioRecordingService _audioService;
  bool _isRecording = false;
  String? _recordingPath;
  bool _isTranscribing = false;
  String? _transcription;
  String? _detectedLanguage;
  String? _translatedText;
  String _targetLanguage = 'en';
  List<LanguageInfo> _supportedLanguages = [];
  bool _isLoadingLanguages = true;
  bool _isTranslating = false;

  @override
  void initState() {
    super.initState();
    _audioService = AudioRecordingService();
    _loadSupportedLanguages();
  }

  /// Charger les langues supportées
  Future<void> _loadSupportedLanguages() async {
    try {
      final api = context.read<ApiService>();
      final languages = await api.getSupportedLanguages();
      setState(() {
        _supportedLanguages = languages;
        _isLoadingLanguages = false;
      });
    } catch (e) {
      setState(() => _isLoadingLanguages = false);
      if (mounted) {
        _showMessage('Erreur chargement langues: ${e.toString()}');
      }
    }
  }

  @override
  void dispose() {
    _audioService.dispose();
    super.dispose();
  }

  /// Démarrer l'enregistrement
  Future<void> _startRecording() async {
    final success = await _audioService.startRecording();
    if (success) {
      setState(() {
        _isRecording = true;
      });
      _showMessage('Enregistrement démarré', isSuccess: true);
    } else {
      _showMessage('Impossible de démarrer l\'enregistrement');
    }
  }

  /// Arrêter l'enregistrement
  Future<void> _stopRecording() async {
    final path = await _audioService.stopRecording();
    setState(() {
      _isRecording = false;
      _recordingPath = path;
    });

    if (path != null) {
      _showMessage('Enregistrement sauvegardé: $path', isSuccess: true);
    }
  }

  /// Annuler l'enregistrement
  Future<void> _cancelRecording() async {
    await _audioService.cancelRecording();
    setState(() {
      _isRecording = false;
      _recordingPath = null;
    });
    _showMessage('Enregistrement annulé');
  }

  /// Importer un fichier audio
  Future<void> _importAudioFile() async {
    final path = await _audioService.importAudioFile();
    if (path != null) {
      setState(() {
        _recordingPath = path;
        _transcription = null;
        _detectedLanguage = null;
        _translatedText = null;
      });
      _showMessage('Fichier importé, transcription en cours...',
          isSuccess: true);
      // Transcrire automatiquement
      await _transcribeAudioFile(path);
    } else {
      _showMessage('Importation annulée');
    }
  }

  /// Transcrire le fichier audio
  Future<void> _transcribeAudioFile(String filePath) async {
    setState(() => _isTranscribing = true);

    try {
      final api = context.read<ApiService>();
      final file = File(filePath);
      final audioBytes = await file.readAsBytes();
      final fileName = filePath.split('/').last;

      final result = await api.aurianceTranscribeBytes(
        audioBytes: audioBytes,
        fileName: fileName,
      );

      setState(() {
        _transcription = result['transcription'] as String?;
        _detectedLanguage = result['language'] as String?;
        _translatedText = null;
        _isTranscribing = false;
      });

      _showMessage('Transcription terminée!', isSuccess: true);
    } catch (e) {
      setState(() => _isTranscribing = false);
      _showMessage('Erreur transcription: ${e.toString()}');
    }
  }

  /// Traduire la transcription
  Future<void> _translateTranscription() async {
    if (_transcription == null || _detectedLanguage == null) {
      _showMessage('Pas de transcription à traduire');
      return;
    }

    if (_detectedLanguage == _targetLanguage) {
      _showMessage('Langues source et cible identiques');
      return;
    }

    setState(() => _isTranslating = true);

    try {
      final api = context.read<ApiService>();
      final result = await api.translateTranscription(
        transcriptionText: _transcription!,
        detectedLanguage: _detectedLanguage!,
        targetLanguage: _targetLanguage,
      );

      setState(() {
        _translatedText = result['translated_text'] as String?;
        _isTranslating = false;
      });

      _showMessage('Traduction réussie!', isSuccess: true);
    } catch (e) {
      setState(() => _isTranslating = false);
      _showMessage('Erreur traduction: ${e.toString()}');
    }
  }

  /// Afficher un message
  void _showMessage(String msg, {bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isSuccess ? Colors.green : Colors.red,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Enregistrement Vocal'),
        backgroundColor: Colors.blue[700],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Section Enregistrement
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      'Enregistrer votre voix',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 24),
                    if (!_isRecording)
                      ElevatedButton.icon(
                        onPressed: _startRecording,
                        icon: const Icon(Icons.mic),
                        label: const Text('Démarrer l\'enregistrement'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.all(16),
                        ),
                      )
                    else
                      Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(50),
                            ),
                            child: const Icon(
                              Icons.mic,
                              size: 48,
                              color: Colors.red,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Enregistrement en cours...',
                            style:
                                Theme.of(context).textTheme.bodyLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.red,
                                    ),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              ElevatedButton.icon(
                                onPressed: _stopRecording,
                                icon: const Icon(Icons.stop),
                                label: const Text('Arrêter'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                              ElevatedButton.icon(
                                onPressed: _cancelRecording,
                                icon: const Icon(Icons.delete),
                                label: const Text('Annuler'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.grey,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Section Importer
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      'Importer un fichier audio',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Sélectionnez un fichier audio (MP3, WAV, etc.) depuis votre appareil',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _importAudioFile,
                      icon: const Icon(Icons.upload_file),
                      label: const Text('Sélectionner un fichier'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.all(16),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Section Transcription
            if (_isTranscribing) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const CircularProgressIndicator(),
                      const SizedBox(height: 16),
                      Text(
                        'Transcription en cours...',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Section Résultat transcription
            if (_transcription != null) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.text_snippet, color: Colors.green),
                          const SizedBox(width: 8),
                          Text(
                            'Transcription',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          if (_detectedLanguage != null) ...[
                            const Spacer(),
                            Chip(
                              label: Text(_detectedLanguage!.toUpperCase()),
                              visualDensity: VisualDensity.compact,
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          _transcription!,
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Section Traduction
            if (_transcription != null && !_isLoadingLanguages) ...[
              Card(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.translate,
                              color: Color(AppColors.primaryValue)),
                          SizedBox(width: AppSpacing.sm),
                          Text(
                            'Traduction',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ],
                      ),
                      SizedBox(height: AppSpacing.md),
                      if (_supportedLanguages.isNotEmpty)
                        LanguageSelector(
                          onLanguageSelected: (lang) {
                            setState(() => _targetLanguage = lang);
                          },
                          selectedLanguageCode: _targetLanguage,
                          languages: _supportedLanguages,
                          title: 'Traduire vers',
                        ),
                      SizedBox(height: AppSpacing.md),
                      if (_isTranslating)
                        Center(
                          child: Column(
                            children: [
                              SizedBox(
                                width: 40,
                                height: 40,
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Color(AppColors.primaryValue),
                                  ),
                                ),
                              ),
                              SizedBox(height: AppSpacing.sm),
                              Text('Traduction en cours...',
                                  style: Theme.of(context).textTheme.bodySmall),
                            ],
                          ),
                        )
                      else
                        ElevatedButton.icon(
                          onPressed: _translateTranscription,
                          icon: const Icon(Icons.translate),
                          label: const Text('Traduire'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(AppColors.primaryValue),
                          ),
                        ),
                      if (_translatedText != null) ...[
                        SizedBox(height: AppSpacing.md),
                        Divider(height: 1, color: Color(AppColors.borderValue)),
                        SizedBox(height: AppSpacing.md),
                        Text(
                          'Texte traduit',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        SizedBox(height: AppSpacing.xs),
                        Container(
                          padding: EdgeInsets.all(AppSpacing.md),
                          decoration: BoxDecoration(
                            color: Color(AppColors.primaryValue).withAlpha(20),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _translatedText!,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              SizedBox(height: AppSpacing.lg),
            ],
            if (_recordingPath != null) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Fichier sélectionné',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.audio_file, color: Colors.blue),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _recordingPath!.split('/').last,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          ElevatedButton.icon(
                            onPressed: _isTranscribing
                                ? null
                                : () => _transcribeAudioFile(_recordingPath!),
                            icon: _isTranscribing
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.transcribe),
                            label: Text(
                              _isTranscribing
                                  ? 'Transcription...'
                                  : 'Re-transcrire',
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: () {
                              setState(() {
                                _recordingPath = null;
                                _transcription = null;
                                _detectedLanguage = null;
                              });
                            },
                            icon: const Icon(Icons.delete),
                            label: const Text('Effacer'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
