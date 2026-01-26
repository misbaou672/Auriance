import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Local Storage Service for AURIANCE
class StorageService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _languageKey = 'preferred_language';
  static const String _keepLoggedInKey = 'keep_logged_in';
  static const String _consentAcceptedKey = 'privacy_consent_accepted';

  late SharedPreferences _prefs;
  bool _initialized = false;
  // Use secure storage for sensitive data (tokens)
  final FlutterSecureStorage _secure = const FlutterSecureStorage();

  /// Initialize SharedPreferences
  Future<void> init() async {
    if (!_initialized) {
      _prefs = await SharedPreferences.getInstance();
      _initialized = true;
    }
  }

  /// Ensure initialized
  Future<void> _ensureInitialized() async {
    if (!_initialized) {
      await init();
    }
  }

  // ============ TOKEN MANAGEMENT ============

  /// Save authentication token
  Future<void> saveToken(String token) async {
    // Store token in secure storage
    await _secure.write(key: _tokenKey, value: token);
  }

  /// Get saved token
  Future<String?> getToken() async {
    // Read token from secure storage first; fallback to prefs if needed
    final token = await _secure.read(key: _tokenKey);
    if (token != null && token.isNotEmpty) return token;
    await _ensureInitialized();
    return _prefs.getString(_tokenKey);
  }

  /// Clear token
  Future<void> clearToken() async {
    await _secure.delete(key: _tokenKey);
    await _ensureInitialized();
    await _prefs.remove(_tokenKey);
  }

  // ============ USER DATA ============

  /// Save user data (JSON string)
  Future<void> saveUserData(String userData) async {
    await _ensureInitialized();
    await _prefs.setString(_userKey, userData);
  }

  /// Get user data
  Future<String?> getUserData() async {
    await _ensureInitialized();
    return _prefs.getString(_userKey);
  }

  /// Clear user data
  Future<void> clearUserData() async {
    await _ensureInitialized();
    await _prefs.remove(_userKey);
  }

  // ============ PREFERENCES ============

  /// Save preferred language
  Future<void> setPreferredLanguage(String languageCode) async {
    await _ensureInitialized();
    await _prefs.setString(_languageKey, languageCode);
  }

  /// Get preferred language
  Future<String?> getPreferredLanguage() async {
    await _ensureInitialized();
    return _prefs.getString(_languageKey) ?? 'fr';
  }

  /// Save keep logged in preference
  Future<void> setKeepLoggedIn(bool value) async {
    await _ensureInitialized();
    await _prefs.setBool(_keepLoggedInKey, value);
  }

  /// Get keep logged in preference
  Future<bool> getKeepLoggedIn() async {
    await _ensureInitialized();
    return _prefs.getBool(_keepLoggedInKey) ?? false;
  }

  /// Set privacy & terms consent accepted
  Future<void> setConsentAccepted(bool value) async {
    await _ensureInitialized();
    await _prefs.setBool(_consentAcceptedKey, value);
  }

  /// Get privacy & terms consent status
  Future<bool> isConsentAccepted() async {
    await _ensureInitialized();
    return _prefs.getBool(_consentAcceptedKey) ?? false;
  }

  // ============ UTILITY ============

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Clear all data (logout)
  Future<void> clearAll() async {
    await _ensureInitialized();
    await _prefs.clear();
  }
}
