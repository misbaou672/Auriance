import 'package:flutter/material.dart';
import 'navigation_hub_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // La HomeScreen affiche le NavigationHubScreen
    // qui donne accès à tous les 22+ écrans et fonctionnalités
    return const NavigationHubScreen();
  }
}
