import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_theme.dart';
import '../constants/feature_flags.dart';
import '../models/auth_models.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_widgets.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _fullNameController;
  late TextEditingController _usernameController;
  late TextEditingController _emailController;
  late TextEditingController _passwordController;
  late TextEditingController _confirmPasswordController;
  bool _agreeToTerms = false;
  double _passwordScore = 0.0;

  @override
  void initState() {
    super.initState();
    _fullNameController = TextEditingController();
    _usernameController = TextEditingController();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _validateFullName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Nom requis';
    }
    if (value.length < 2) {
      return 'Au moins 2 caractères';
    }
    return null;
  }

  String? _validateUsername(String? value) {
    if (value == null || value.isEmpty) {
      return 'Nom d\'utilisateur requis';
    }
    if (value.length < 3) {
      return 'Au moins 3 caractères';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email requis';
    }
    if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        .hasMatch(value)) {
      return 'Email invalide';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Mot de passe requis';
    }
    if (value.length < 6) {
      return 'Au moins 6 caractères';
    }
    _passwordScore = _computePasswordStrength(value);
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Confirmez votre mot de passe';
    }
    if (value != _passwordController.text) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  }

  double _computePasswordStrength(String value) {
    int score = 0;
    if (value.length >= 8) score++;
    if (RegExp(r'[A-Z]').hasMatch(value)) score++;
    if (RegExp(r'[a-z]').hasMatch(value)) score++;
    if (RegExp(r'[0-9]').hasMatch(value)) score++;
    if (RegExp(r'[!@#\$%^&*(),.?":{}|<>]').hasMatch(value)) score++;
    return (score / 5).clamp(0.0, 1.0);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        return Scaffold(
          backgroundColor: Color(AppColors.bgLightValue),
          body: SingleChildScrollView(
            child: Column(
              children: [
                // Header avec logo bleu
                Container(
                  color: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
                  child: Column(
                    children: [
                      Image.asset(
                        'assets/images/auriance_logo.png',
                        height: 70,
                        width: 70,
                      ),
                      SizedBox(height: AppSpacing.md),
                      Text(
                        'AURIANCE',
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: Color(AppColors.primaryValue),
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),

                // Formulaire
                Padding(
                  padding: EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    children: [
                      SizedBox(height: AppSpacing.md),
                      Text(
                        'Créer un compte',
                        style: Theme.of(context)
                            .textTheme
                            .headlineMedium
                            ?.copyWith(
                              color: Color(AppColors.primaryValue),
                            ),
                      ),
                      SizedBox(height: AppSpacing.lg),
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            // Full Name
                            CustomTextField(
                              label: 'Nom complet',
                              hint: 'Votre nom complet',
                              controller: _fullNameController,
                              validator: _validateFullName,
                              icon: Icons.person_outline,
                            ),
                            SizedBox(height: AppSpacing.md),

                            // Username
                            CustomTextField(
                              label: 'Nom d\'utilisateur',
                              hint: 'Choisissez un nom d\'utilisateur',
                              controller: _usernameController,
                              validator: _validateUsername,
                              icon: Icons.person_outline,
                            ),
                            SizedBox(height: AppSpacing.md),

                            // Email
                            CustomTextField(
                              label: 'Email',
                              hint: 'votre.email@exemple.com',
                              controller: _emailController,
                              validator: _validateEmail,
                              icon: Icons.mail_outline,
                            ),
                            SizedBox(height: AppSpacing.md),

                            // Password
                            CustomTextField(
                              label: 'Mot de passe',
                              hint: 'Minimum 6 caractères',
                              controller: _passwordController,
                              validator: _validatePassword,
                              icon: Icons.lock_outline,
                              isPassword: true,
                            ),
                            SizedBox(height: AppSpacing.sm),
                            // Password strength indicator
                            Row(
                              children: [
                                Expanded(
                                  child: LinearProgressIndicator(
                                    value: _passwordScore,
                                    minHeight: 6,
                                    backgroundColor:
                                        Color(AppColors.borderValue),
                                    color: _passwordScore < 0.4
                                        ? Colors.red
                                        : _passwordScore < 0.7
                                            ? Colors.orange
                                            : Colors.green,
                                  ),
                                ),
                                SizedBox(width: AppSpacing.sm),
                                Text(
                                  _passwordScore < 0.4
                                      ? 'Faible'
                                      : _passwordScore < 0.7
                                          ? 'Moyen'
                                          : 'Fort',
                                  style: Theme.of(context).textTheme.bodySmall,
                                )
                              ],
                            ),
                            SizedBox(height: AppSpacing.md),

                            // Confirm Password
                            CustomTextField(
                              label: 'Confirmer le mot de passe',
                              hint: 'Confirmez votre mot de passe',
                              controller: _confirmPasswordController,
                              validator: _validateConfirmPassword,
                              icon: Icons.lock_outline,
                              isPassword: true,
                            ),
                            SizedBox(height: AppSpacing.md),

                            // Terms & Conditions
                            Row(
                              children: [
                                Checkbox(
                                  value: _agreeToTerms,
                                  onChanged: (value) {
                                    setState(
                                        () => _agreeToTerms = value ?? false);
                                  },
                                  activeColor: Color(AppColors.primaryValue),
                                ),
                                Expanded(
                                  child: Text(
                                    'J\'accepte la Politique de confidentialité et les Conditions d\'utilisation',
                                    style:
                                        Theme.of(context).textTheme.bodySmall,
                                  ),
                                ),
                                TextButton(
                                  onPressed: () =>
                                      Navigator.pushNamed(context, '/terms'),
                                  child: const Text('Voir'),
                                )
                              ],
                            ),

                            // Error message
                            if (authProvider.error != null)
                              ErrorMessage(
                                message: authProvider.error!,
                                onDismiss: authProvider.clearError,
                              ),

                            SizedBox(height: AppSpacing.lg),

                            // Register Button
                            CustomButton(
                              label: authProvider.isLoading
                                  ? 'Inscription...'
                                  : 'S\'inscrire',
                              onPressed: (!_agreeToTerms ||
                                      authProvider.isLoading)
                                  ? () {}
                                  : () async {
                                      if (_formKey.currentState!.validate()) {
                                        final request = RegisterRequest(
                                          username: _usernameController.text,
                                          email: _emailController.text,
                                          password: _passwordController.text,
                                          fullName: _fullNameController.text,
                                        );

                                        await authProvider.register(request);

                                        if (authProvider.isLoggedIn &&
                                            mounted) {
                                          Navigator.pushReplacementNamed(
                                            context,
                                            '/home',
                                          );
                                        }
                                      }
                                    },
                              backgroundColor: Color(AppColors.primaryValue),
                            ),

                            SizedBox(height: AppSpacing.md),

                            // Login link
                            if (!FeatureFlags.skipLogin)
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Déjà inscrit? ',
                                    style:
                                        Theme.of(context).textTheme.bodyMedium,
                                  ),
                                  GestureDetector(
                                    onTap: () =>
                                        Navigator.pushNamed(context, '/login'),
                                    child: Text(
                                      'Se connecter',
                                      style: TextStyle(
                                        color: Color(AppColors.primaryValue),
                                        fontWeight: FontWeight.bold,
                                        decoration: TextDecoration.underline,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
