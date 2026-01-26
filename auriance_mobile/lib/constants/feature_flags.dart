import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Feature flags / dev toggles controlled via `.env`.
class FeatureFlags {
  /// When true, the app bypasses authentication screens and navigates directly
  /// to the main features.
  ///
  /// `.env`:
  ///   SKIP_LOGIN=true
  static bool get skipLogin {
    final raw = (dotenv.env['SKIP_LOGIN'] ?? '').trim().toLowerCase();
    return raw == 'true' || raw == '1' || raw == 'yes';
  }
}
