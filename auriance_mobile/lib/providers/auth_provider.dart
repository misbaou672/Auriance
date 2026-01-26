import 'package:flutter/foundation.dart';
import '../models/auth_models.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../navigation.dart';
import '../constants/feature_flags.dart';

/// Authentication State Provider
class AuthProvider extends ChangeNotifier {
  final ApiService _apiService;
  final StorageService _storageService;

  User? _currentUser;
  String? _authToken;
  bool _isLoading = false;
  String? _error;
  bool _isLoggedIn = false;
  bool _handlingUnauthorized = false;

  // Getters
  User? get currentUser => _currentUser;
  String? get authToken => _authToken;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _isLoggedIn;

  AuthProvider({
    required ApiService apiService,
    required StorageService storageService,
  })  : _apiService = apiService,
        _storageService = storageService {
    _apiService.setUnauthorizedHandler(_handleUnauthorized);
    _initializeAuth();
  }

  /// Initialize authentication from saved token
  Future<void> _initializeAuth() async {
    try {
      final token = await _storageService.getToken();
      if (token != null && token.isNotEmpty) {
        _authToken = token;
        _apiService.setAuthToken(token);
        _isLoggedIn = true;

        // Load user data
        final userData = await _storageService.getUserData();
        if (userData != null) {
          // Parse and restore user (implementation depends on JSON structure)
          _isLoggedIn = true;
        }
      }
    } catch (e) {
      debugPrint('Error initializing auth: $e');
      _isLoggedIn = false;
    }
    notifyListeners();
  }

  /// Register new user
  Future<bool> register(RegisterRequest request) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.register(request);

      // Save token
      _authToken = response.accessToken;
      _currentUser = response.user;
      _isLoggedIn = true;

      await _storageService.saveToken(response.accessToken);
      _apiService.setAuthToken(response.accessToken);

      debugPrint('User registered successfully: ${response.user.username}');
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoggedIn = false;
      debugPrint('Registration error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Login user
  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final request = LoginRequest(username: username, password: password);
      final response = await _apiService.login(request);

      // Save token and user
      _authToken = response.accessToken;
      _currentUser = response.user;
      _isLoggedIn = true;

      await _storageService.saveToken(response.accessToken);
      _apiService.setAuthToken(response.accessToken);

      debugPrint('User logged in: ${response.user.username}');
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoggedIn = false;
      debugPrint('Login error: $e');
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Logout user
  Future<void> logout() async {
    try {
      _currentUser = null;
      _authToken = null;
      _isLoggedIn = false;

      await _storageService.clearToken();
      await _storageService.clearUserData();
      _apiService.clearAuthToken();

      debugPrint('User logged out');
    } catch (e) {
      debugPrint('Logout error: $e');
    } finally {
      notifyListeners();
    }
  }

  /// Clear error message
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Handle 401 globally: logout + navigate to login
  Future<void> _handleUnauthorized() async {
    if (_handlingUnauthorized) return;
    _handlingUnauthorized = true;
    await logout();
    final targetRoute = FeatureFlags.skipLogin ? '/home' : '/login';
    navigatorKey.currentState
        ?.pushNamedAndRemoveUntil(targetRoute, (r) => false);
    _handlingUnauthorized = false;
  }
}
