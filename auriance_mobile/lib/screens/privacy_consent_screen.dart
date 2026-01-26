import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/storage_service.dart';
import '../constants/app_theme.dart';
import '../constants/feature_flags.dart';

/// Privacy & Terms consent screen
class PrivacyConsentScreen extends StatefulWidget {
  const PrivacyConsentScreen({super.key});

  @override
  State<PrivacyConsentScreen> createState() => _PrivacyConsentScreenState();
}

class _PrivacyConsentScreenState extends State<PrivacyConsentScreen> {
  bool _accepted = false;

  Future<void> _acceptConsent() async {
    final storage = context.read<StorageService>();
    await storage.setConsentAccepted(true);
    if (!mounted) return;
    Navigator.pushReplacementNamed(
      context,
      FeatureFlags.skipLogin ? '/home' : '/login',
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Confidentialité & Conditions')),
      body: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Protection des données patients',
              style: theme.textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'AURIANCE respecte la confidentialité des patients et applique des mesures de sécurité avancées.\n\n'
              '- Les enregistrements vocaux et transcriptions peuvent contenir des données de santé sensibles.\n'
              '- Vous pouvez choisir de sauvegarder localement ou sur le serveur.\n'
              '- Vous pouvez supprimer vos données à tout moment dans Historique.\n\n'
              'En utilisant l\'application, vous acceptez notre Politique de confidentialité et nos Conditions d\'utilisation.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.xl),
            Row(
              children: [
                Checkbox(
                  value: _accepted,
                  onChanged: (v) => setState(() => _accepted = v ?? false),
                ),
                const Expanded(
                  child: Text(
                    'J\'ai lu et j\'accepte la Politique de confidentialité et les Conditions.',
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _accepted ? _acceptConsent : null,
                child: const Text('Accepter et continuer'),
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            TextButton(
              onPressed: () => Navigator.pushNamed(context, '/terms'),
              child: const Text('Voir les Conditions détaillées'),
            ),
          ],
        ),
      ),
    );
  }
}
