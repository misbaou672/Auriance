import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../constants/app_theme.dart';
import '../constants/feature_flags.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.currentUser;

    return Scaffold(
      appBar: AppBar(title: const Text('Mon profil')),
      body: Padding(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (user != null) ...[
              Text('Nom d\'utilisateur: ${user.username}'),
              const SizedBox(height: AppSpacing.sm),
              Text('Email: ${user.email}'),
              const SizedBox(height: AppSpacing.sm),
              Text('Nom complet: ${user.fullName}'),
              const SizedBox(height: AppSpacing.sm),
              Text('Compte actif: ${user.isActive ? 'Oui' : 'Non'}'),
            ] else ...[
              const Text('Aucun utilisateur connecté.'),
            ],
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await context.read<AuthProvider>().logout();
                  if (context.mounted) {
                    final target = FeatureFlags.skipLogin ? '/home' : '/login';
                    Navigator.pushNamedAndRemoveUntil(
                        context, target, (r) => false);
                  }
                },
                icon: const Icon(Icons.logout),
                label: const Text('Se déconnecter'),
              ),
            )
          ],
        ),
      ),
    );
  }
}
