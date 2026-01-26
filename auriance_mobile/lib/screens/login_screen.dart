import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_theme.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _usernameController;
  late TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _usernameController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
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

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Mot de passe requis';
    }
    if (value.length < 6) {
      return 'Au moins 6 caractères';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        return Scaffold(
          body: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(AppColors.primaryValue),
                  Color(AppColors.accentValue),
                ],
              ),
            ),
            child: SafeArea(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo et Titre (animés ou juste stylés)
                      Container(
                        padding: EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 10,
                              offset: Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Image.asset(
                          'assets/images/auriance_logo.png',
                          height: 80,
                          width: 80,
                        ),
                      ),
                      SizedBox(height: 24),
                      Text(
                        'AURIANCE',
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 2.0,
                          shadows: [
                            Shadow(
                              blurRadius: 10.0,
                              color: Colors.black45,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Votre Assistant Intelligent',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.white70,
                          letterSpacing: 0.5,
                        ),
                      ),
                      SizedBox(height: 48),

                      // Carte de Connexion
                      Card(
                        elevation: 8,
                        shadowColor: Colors.black26,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        color: Colors.white,
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Text(
                                  'Connexion',
                                  textAlign: TextAlign.center,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineMedium
                                      ?.copyWith(
                                        color: Color(AppColors.primaryValue),
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                SizedBox(height: 32),

                                // Username
                                CustomTextField(
                                  label: 'Nom d\'utilisateur',
                                  hint: 'Entrez votre identifiant',
                                  controller: _usernameController,
                                  validator: _validateUsername,
                                  icon: Icons.person_outline,
                                ),
                                SizedBox(height: 20),

                                // Password
                                CustomTextField(
                                  label: 'Mot de passe',
                                  hint: 'Entrez votre mot de passe',
                                  controller: _passwordController,
                                  validator: _validatePassword,
                                  icon: Icons.lock_outline,
                                  isPassword: true,
                                ),
                                SizedBox(height: 24),

                                // Error message
                                if (authProvider.error != null)
                                  Container(
                                    margin: EdgeInsets.only(bottom: 16),
                                    padding: EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.red.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                          color: Colors.red.shade200),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.error_outline,
                                            color: Colors.red, size: 20),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            authProvider.error!,
                                            style: TextStyle(
                                                color: Colors.red.shade800,
                                                fontSize: 13),
                                          ),
                                        ),
                                        IconButton(
                                          icon: Icon(Icons.close,
                                              size: 16, color: Colors.red),
                                          onPressed: authProvider.clearError,
                                          padding: EdgeInsets.zero,
                                          constraints: BoxConstraints(),
                                        )
                                      ],
                                    ),
                                  ),

                                // Login Button
                                Container(
                                  height: 50,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    gradient: LinearGradient(
                                      colors: [
                                        Color(AppColors.primaryValue),
                                        Color(AppColors.accentValue),
                                      ],
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Color(AppColors.primaryValue)
                                            .withOpacity(0.3),
                                        spreadRadius: 1,
                                        blurRadius: 8,
                                        offset: Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: ElevatedButton(
                                    onPressed: authProvider.isLoading
                                        ? null
                                        : () async {
                                            if (_formKey.currentState!
                                                .validate()) {
                                              await authProvider.login(
                                                _usernameController.text,
                                                _passwordController.text,
                                              );
                                              if (authProvider.isLoggedIn &&
                                                  mounted) {
                                                Navigator.pushReplacementNamed(
                                                  context,
                                                  '/home',
                                                );
                                              }
                                            }
                                          },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.transparent,
                                      shadowColor: Colors.transparent,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    child: authProvider.isLoading
                                        ? SizedBox(
                                            height: 24,
                                            width: 24,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                              valueColor:
                                                  AlwaysStoppedAnimation(
                                                      Colors.white),
                                            ),
                                          )
                                        : Text(
                                            'SE CONNECTER',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 1.0,
                                              color: Colors.white,
                                            ),
                                          ),
                                  ),
                                ),

                                SizedBox(height: 24),

                                // Register link
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      'Pas encore membre ? ',
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                    GestureDetector(
                                      onTap: () => Navigator.pushNamed(
                                          context, '/register'),
                                      child: Text(
                                        'Créer un compte',
                                        style: TextStyle(
                                          color: Color(AppColors.primaryValue),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(height: 16),
                                Center(
                                  child: TextButton(
                                    onPressed: () =>
                                        Navigator.pushNamed(context, '/terms'),
                                    child: Text(
                                      'Mentions légales',
                                      style: TextStyle(
                                          color: Colors.grey.shade400,
                                          fontSize: 12),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
