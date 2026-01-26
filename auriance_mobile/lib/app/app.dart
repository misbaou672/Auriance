import 'package:flutter/material.dart';
import '../screens/recording_screen.dart';

/// Minimal app wrapper kept for compatibility with legacy imports.
class AurianceApp extends StatelessWidget {
  const AurianceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AURIANCE',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2e1d00),
          brightness: Brightness.light,
        ),
      ),
      home: const RecordingScreen(),
    );
  }
}
