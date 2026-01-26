/// App Environment Variables
class AppEnv {
  // NOTE: Use ApiConstants.baseUrl for API URL (configured via .env)
  // static const String apiUrl is deprecated - use ApiConstants.baseUrl instead
  static const String appName = 'AURIANCE';
  static const String appVersion = '1.0.0';
  static const bool isProduction = false;
  static const bool enableLogging = true;
}

/// Languages supported by AURIANCE
class SupportedLanguages {
  static const Map<String, String> languages = {
    'fr': 'Français',
    'en': 'English',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'nl': 'Nederlands',
    'pl': 'Polski',
    'ru': 'Русский',
    'ja': '日本語',
    'zh': '中文',
    'ar': 'العربية',
  };

  static String getLanguageName(String code) => languages[code] ?? code;
  static List<String> getCodes() => languages.keys.toList();
}

/// Recording Settings
class RecordingSettings {
  static const String audioFormat = 'wav'; // wav, aac, m4a, flac, aiff, opus
  static const int sampleRate = 16000; // Hz (16kHz for speech recognition)
  static const int numChannels = 1; // Mono
  static const int bitRate = 128000; // 128 kbps
  static const int bufferSize = 4096;

  // Timeouts
  static const Duration maxRecordingDuration = Duration(minutes: 30);
  static const Duration minRecordingDuration = Duration(seconds: 1);
}
