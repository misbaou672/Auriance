import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../constants/app_theme.dart';
import '../constants/feature_flags.dart';
import '../providers/auth_provider.dart';
import '../services/storage_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    // Let the animation play a bit
    await Future.delayed(800.ms);
    final storage = context.read<StorageService>();
    final consent = await storage.isConsentAccepted();

    if (!consent) {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/consent');
      return;
    }

    final auth = context.read<AuthProvider>();
    if (FeatureFlags.skipLogin || auth.isLoggedIn) {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(AppColors.primaryValue),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/images/auriance_logo.png',
              height: 96,
              width: 96,
            )
                .animate()
                .fadeIn(duration: 600.ms)
                .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1)),
            const SizedBox(height: 12),
            Text(
              'AURIANCE',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.4,
              ),
            ).animate().fadeIn(duration: 700.ms),
            const SizedBox(height: 24),
            const SizedBox(
              width: 200,
              child: LinearProgressIndicator(
                color: Colors.white,
                backgroundColor: Colors.white24,
              ),
            ).animate().fadeIn(duration: 800.ms),
          ],
        ),
      ),
    );
  }
}
