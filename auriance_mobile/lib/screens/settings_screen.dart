import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_config.dart';
import '../constants/app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/storage_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late StorageService _storageService;
  String _selectedLanguage = 'fr';
  bool _keepLoggedIn = true;

  @override
  void initState() {
    super.initState();
    _storageService = context.read<StorageService>();
    _initSettings();
  }

  Future<void> _initSettings() async {
    final language = await _storageService.getPreferredLanguage() ?? 'fr';
    final keepLoggedIn = await _storageService.getKeepLoggedIn();

    if (!mounted) return;
    setState(() {
      _selectedLanguage = language;
      _keepLoggedIn = keepLoggedIn;
    });
  }

  Future<void> _saveLanguagePreference(String language) async {
    await _storageService.setPreferredLanguage(language);
    setState(() => _selectedLanguage = language);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'Language changed to: ${SupportedLanguages.languages[language]}'),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _saveKeepLoggedInPreference(bool value) async {
    await _storageService.setKeepLoggedIn(value);
    setState(() => _keepLoggedIn = value);
  }

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );

    if (confirmed ?? false) {
      if (mounted) {
        context.read<AuthProvider>().logout();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Paramètres',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        backgroundColor: Color(AppColors.primaryValue),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // App Info Section
            Text(
              'App Information',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: AppSpacing.md),
            Card(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  children: [
                    _buildInfoRow('App Name', AppEnv.appName),
                    Divider(height: AppSpacing.lg),
                    _buildInfoRow('Version', AppEnv.appVersion),
                    Divider(height: AppSpacing.lg),
                    _buildInfoRow(
                      'Environment',
                      AppEnv.isProduction ? 'Production' : 'Development',
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: AppSpacing.lg),

            // Preferences Section
            Text(
              'Preferences',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: AppSpacing.md),
            Card(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Preferred Language',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    SizedBox(height: AppSpacing.sm),
                    DropdownButton<String>(
                      value: _selectedLanguage,
                      isExpanded: true,
                      onChanged: (value) {
                        if (value != null) {
                          _saveLanguagePreference(value);
                        }
                      },
                      items: SupportedLanguages.languages.entries
                          .map((e) => DropdownMenuItem(
                                value: e.key,
                                child: Text(e.value),
                              ))
                          .toList(),
                    ),
                    SizedBox(height: AppSpacing.lg),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Keep Logged In',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            Text(
                              'Automatically login on app start',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                    color: Color(AppColors.textTertiaryValue),
                                  ),
                            ),
                          ],
                        ),
                        Switch(
                          value: _keepLoggedIn,
                          onChanged: _saveKeepLoggedInPreference,
                          activeThumbColor: Color(AppColors.primaryValue),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: AppSpacing.lg),

            // Recording Settings Section
            Text(
              'Recording Settings',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: AppSpacing.md),
            Card(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.md),
                child: Column(
                  children: [
                    _buildInfoRow(
                        'Audio Format', RecordingSettings.audioFormat),
                    Divider(height: AppSpacing.lg),
                    _buildInfoRow(
                      'Sample Rate',
                      '${RecordingSettings.sampleRate} Hz',
                    ),
                    Divider(height: AppSpacing.lg),
                    _buildInfoRow(
                        'Channels', RecordingSettings.numChannels.toString()),
                    Divider(height: AppSpacing.lg),
                    _buildInfoRow(
                      'Bit Rate',
                      '${RecordingSettings.bitRate ~/ 1000} kbps',
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: AppSpacing.lg),

            // Account Section
            Text(
              'Account',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: AppSpacing.md),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/profile'),
              icon: const Icon(Icons.person),
              label: const Text('Voir le profil'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(AppColors.primaryValue),
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              ),
            ),
            SizedBox(height: AppSpacing.sm),
            ElevatedButton.icon(
              onPressed: () => Navigator.pushNamed(context, '/consent'),
              icon: const Icon(Icons.privacy_tip),
              label: const Text('Confidentialité & Conditions'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(AppColors.primaryValue),
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              ),
            ),
            SizedBox(height: AppSpacing.sm),
            ElevatedButton.icon(
              onPressed: _logout,
              icon: const Icon(Icons.logout),
              label: const Text('Logout'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Color(AppColors.primaryValue),
              ),
        ),
      ],
    );
  }
}
