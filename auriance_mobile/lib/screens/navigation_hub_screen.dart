import 'package:flutter/material.dart';
import 'admin_dashboard_screen.dart';
import 'consultation_session_screen.dart';
import 'debug_vector_screen.dart';
import 'form_auto_fill_screen.dart';
import 'generated_queries_screen.dart';
import 'history_screen.dart';
import 'live_transcription_screen.dart';
import 'medical_history_screen.dart';
import 'medical_search_screen.dart';
import 'multi_database_screen.dart';
import 'privacy_consent_screen.dart';
import 'profile_screen.dart';
import 'rag_history_screen.dart';
import 'recording_screen.dart';
import 'settings_screen.dart';
import 'terms_screen.dart';
import 'voice_recording_screen.dart';

class NavigationHubScreen extends StatelessWidget {
  const NavigationHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final navItems = [
      // _NavItem('🔧', 'Test\nConnexion', BackendTestPage(), Colors.black),
      _NavItem('🎤', 'Transcription\nIA Live', LiveTranscriptionScreen(),
          Colors.blue),
      _NavItem(
          '🎙️', 'Enregistrement\nAudio', RecordingScreen(), Colors.purple),
      _NavItem(
          '📋', 'Historique\nConsultations', HistoryScreen(), Colors.green),
      _NavItem('🩺', 'Session\nConsultation', ConsultationSessionScreen(),
          Colors.red),
      _NavItem('📝', 'Formulaire\nAuto-Vocal',
          FormAutoFillScreen(formData: const {}), Colors.orange),
      _NavItem(
          '🔍', 'Requêtes\nGenerées', GeneratedQueriesScreen(), Colors.indigo),
      _NavItem('🏥', 'Recherche\nMédical', MedicalSearchScreen(), Colors.teal),
      _NavItem('📚', 'Dossier\nMédical', MedicalHistoryScreen(), Colors.amber),
      _NavItem('👤', 'Profil', ProfileScreen(), Colors.cyan),
      _NavItem('⚙️', 'Paramètres', SettingsScreen(), Colors.grey),
      _NavItem('🐛', 'Debug\nVecteur', DebugVectorScreen(), Colors.pink),
      _NavItem('📊', 'Dashboard\nAdmin', AdminDashboardScreen(), Colors.lime),
      _NavItem('💾', 'Multi-BD', MultiDatabaseScreen(), Colors.brown),
      _NavItem('🤖', 'Historique\nRAG', RagHistoryScreen(), Colors.deepOrange),
      _NavItem(
          '🔐', 'Confidentialité', PrivacyConsentScreen(), Colors.blueGrey),
      _NavItem('📄', 'Conditions', TermsScreen(), Colors.deepPurple),
      _NavItem('🎵', 'Voix', VoiceRecordingScreen(), Colors.lightBlue),
    ];

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.blue.shade600,
        title: const Text(
          '🌟 Auriance Hub',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 22),
        ),
        centerTitle: true,
        actions: [
          Padding(
            padding: EdgeInsets.all(8),
            child: CircleAvatar(
              backgroundColor: Colors.white24,
              child: Icon(Icons.home, color: Colors.white),
            ),
          ),
        ],
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(12),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.95,
        ),
        itemCount: navItems.length,
        itemBuilder: (context, index) {
          final item = navItems[index];
          return _NavCard(
            emoji: item.emoji,
            label: item.label,
            screen: item.screen,
            color: item.color,
          );
        },
      ),
    );
  }
}

class _NavItem {
  final String emoji;
  final String label;
  final Widget screen;
  final Color color;

  _NavItem(this.emoji, this.label, this.screen, this.color);
}

class _NavCard extends StatefulWidget {
  final String emoji;
  final String label;
  final Widget screen;
  final Color color;

  const _NavCard({
    required this.emoji,
    required this.label,
    required this.screen,
    required this.color,
  });

  @override
  State<_NavCard> createState() => _NavCardState();
}

class _NavCardState extends State<_NavCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => widget.screen,
          ),
        ),
        onHover: (value) => setState(() => _isHovered = value),
        child: AnimatedScale(
          scale: _isHovered ? 1.05 : 1.0,
          duration: Duration(milliseconds: 200),
          child: Card(
            elevation: _isHovered ? 8 : 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    widget.color.withValues(
                      red: widget.color.red.toDouble(),
                      green: widget.color.green.toDouble(),
                      blue: widget.color.blue.toDouble(),
                      alpha: 0.1 * 255,
                    ),
                    widget.color.withValues(
                      red: widget.color.red.toDouble(),
                      green: widget.color.green.toDouble(),
                      blue: widget.color.blue.toDouble(),
                      alpha: 0.05 * 255,
                    ),
                  ],
                ),
                border: Border.all(
                  color: widget.color.withValues(
                    red: widget.color.red.toDouble(),
                    green: widget.color.green.toDouble(),
                    blue: widget.color.blue.toDouble(),
                    alpha: 0.3 * 255,
                  ),
                  width: 2,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Emoji
                  Text(
                    widget.emoji,
                    style: const TextStyle(fontSize: 45),
                  ),
                  const SizedBox(height: 12),
                  // Label
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      widget.label,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                        height: 1.3,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Accent line
                  Container(
                    width: 30,
                    height: 3,
                    decoration: BoxDecoration(
                      color: widget.color,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
