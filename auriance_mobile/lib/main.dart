import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'constants/app_theme.dart';
import 'navigation.dart';
import 'providers/auth_provider.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/privacy_consent_screen.dart';
import 'screens/terms_screen.dart';
import 'screens/recording_screen.dart';
import 'screens/live_transcription_screen.dart';
import 'screens/history_screen.dart';
import 'screens/auto_form_saved_page.dart';
import 'screens/settings_screen.dart';
import 'screens/consultation_session_screen.dart';
import 'screens/form_auto_fill_screen.dart';
import 'screens/generated_queries_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/debug_vector_screen.dart';
import 'screens/medical_search_screen.dart';
import 'screens/medical_history_screen.dart';
import 'screens/multi_database_screen.dart';
import 'screens/rag_history_screen.dart';
import 'screens/admin_dashboard_screen.dart';
import 'screens/navigation_hub_screen.dart';
// import 'screens/backend_test_page.dart';
import 'services/api_service.dart';
import 'services/audio_service.dart';
// Duplicate import removed
import 'services/stt_remote_service.dart';
import 'services/stt_service.dart';
import 'services/storage_service.dart';

Future<void> main() async {
  // Load environment variables (optional in release/dev to avoid crash when .env is absent)
  await dotenv.load(fileName: '.env', isOptional: true);

  // Initialize storage
  final storageService = StorageService();
  await storageService.init();

  runApp(
    MultiProvider(
      providers: [
        // Services
        Provider<ApiService>(create: (_) => ApiService()),
        Provider<StorageService>(create: (_) => storageService),
        ChangeNotifierProvider<AudioService>(
          create: (_) => AudioService(),
        ),
        ChangeNotifierProvider<SttService>(
          create: (_) => SttService(),
        ),
        Provider<SttRemoteService>(create: (_) => SttRemoteService()),

        // Providers (depends on services)
        ChangeNotifierProxyProvider2<ApiService, StorageService, AuthProvider>(
          create: (context) => AuthProvider(
            apiService: context.read<ApiService>(),
            storageService: context.read<StorageService>(),
          ),
          update: (context, api, storage, previous) =>
              previous ??
              AuthProvider(
                apiService: api,
                storageService: storage,
              ),
        ),
      ],
      child: const AurianceApp(),
    ),
  );
}

class AurianceApp extends StatelessWidget {
  const AurianceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AURIANCE',
      debugShowCheckedModeBanner: false,
      navigatorKey: navigatorKey,
      theme: _buildTheme(),
      home: const SplashScreen(),
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/nav-hub': (_) => const NavigationHubScreen(),
        '/consent': (_) => const PrivacyConsentScreen(),
        '/terms': (_) => const TermsScreen(),
        '/home': (_) => const HomeScreen(),
        '/profile': (_) => const ProfileScreen(),
        '/recording': (_) => const RecordingScreen(),
        '/live': (_) => const LiveTranscriptionScreen(),
        '/session': (_) => const ConsultationSessionScreen(),
        '/history': (_) => const HistoryScreen(),
        '/auto-form-saved': (_) => const AutoFormSavedPage(),
        '/settings': (_) => const SettingsScreen(),
        '/form-auto-fill': (_) => const FormAutoFillScreen(formData: {}),
        '/generated-queries': (_) => const GeneratedQueriesScreen(),
        '/debug-vector': (_) => const DebugVectorScreen(),
        '/medical-search': (_) => const MedicalSearchScreen(),
        '/medical-history': (_) => const MedicalHistoryScreen(),
        '/rag-multi': (_) => const MultiDatabaseScreen(),
        '/rag-history': (_) => const RagHistoryScreen(),
        '/admin-dashboard': (_) => const AdminDashboardScreen(),
        // '/backend-test': (_) => const BackendTestPage(),
      },
    );
  }

  /// Build app theme
  ThemeData _buildTheme() {
    final baseText = GoogleFonts.interTextTheme();
    final headline = GoogleFonts.playfairDisplayTextTheme();

    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Color(AppColors.primaryValue),
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: Color(AppColors.bgLightValue),

      // AppBar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: Color(AppColors.primaryValue),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),

      // Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Color(AppColors.primaryValue),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          padding: EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
        ),
      ),

      // Text Field Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Color(AppColors.bgLightValue),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(
            color: Color(AppColors.borderValue),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(
            color: Color(AppColors.borderValue),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(
            color: Color(AppColors.primaryValue),
            width: 2,
          ),
        ),
        contentPadding: EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.md,
        ),
        hintStyle: TextStyle(
          color: Color(AppColors.textTertiaryValue),
        ),
      ),

      // Text Theme
      textTheme: baseText.copyWith(
        headlineLarge: headline.headlineLarge?.copyWith(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: Color(AppColors.textPrimaryValue),
          letterSpacing: -0.5,
        ),
        headlineMedium: headline.headlineMedium?.copyWith(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: Color(AppColors.textPrimaryValue),
        ),
        titleLarge: baseText.titleLarge?.copyWith(
          fontWeight: FontWeight.w700,
          color: Color(AppColors.textPrimaryValue),
        ),
        titleMedium: baseText.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
          color: Color(AppColors.textPrimaryValue),
        ),
        titleSmall: baseText.titleSmall?.copyWith(
          fontWeight: FontWeight.w600,
          color: Color(AppColors.textPrimaryValue),
        ),
        bodyLarge: baseText.bodyLarge?.copyWith(
          color: Color(AppColors.textSecondaryValue),
        ),
        bodyMedium: baseText.bodyMedium?.copyWith(
          color: Color(AppColors.textSecondaryValue),
        ),
        bodySmall: baseText.bodySmall?.copyWith(
          color: Color(AppColors.textTertiaryValue),
        ),
        labelLarge: baseText.labelLarge?.copyWith(
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
    );
  }
}

/// Root screen that handles navigation based on auth state
// SplashScreen handles initial routing; _RootScreen removed

// SplashScreen handles initial routing; _RootScreen removed
