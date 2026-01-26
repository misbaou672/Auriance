import 'package:flutter/material.dart';
import '../constants/app_theme.dart';

/// Minimal Terms of Use screen (placeholder)
class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Conditions d\'utilisation')),
      body: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: ListView(
          children: [
            Text('Conditions d\'utilisation',
                style: theme.textTheme.titleLarge),
            const SizedBox(height: AppSpacing.md),
            Text(
              'Cette application est destinée aux professionnels de santé et au grand public pour l\'aide à la documentation médicale.\n\n'
              'Responsabilités:\n- Ne pas partager d\'informations sensibles sans consentement.\n- Respecter la confidentialité des patients.\n- Utiliser les fonctionnalités conformément aux réglementations locales.\n\n'
              'Sécurité:\n- Les données peuvent être chiffrées au repos sur l\'appareil.\n- Utilisez des connexions sécurisées HTTPS lorsque disponible.\n\n'
              'Contact:\nPour toute question, merci de contacter le support AURIANCE.',
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
