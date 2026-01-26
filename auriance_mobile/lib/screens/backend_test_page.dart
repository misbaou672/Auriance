import 'package:flutter/material.dart';

import 'package:dio/dio.dart';

import '../constants/api_constants.dart';

class BackendTestPage extends StatefulWidget {
  const BackendTestPage({super.key});

  @override
  State<BackendTestPage> createState() => _BackendTestPageState();
}

class _BackendTestPageState extends State<BackendTestPage> {
  String _result = 'Appuie pour tester la connexion';
  String _currentUrl = '';

  @override
  void initState() {
    super.initState();
    _currentUrl = ApiConstants.baseUrl;
  }

  Future<void> testBackendGet() async {
    setState(() => _result = 'Test en cours sur $_currentUrl...');
    try {
      // On teste un endpoint simple comme / (root) ou /health
      final response = await Dio().get(_currentUrl);
      setState(() => _result =
          '✅ SUCCÈS!\nCode: ${response.statusCode}\nData: ${response.data}');
    } catch (e) {
      if (e is DioException) {
        setState(
            () => _result = '❌ ERREUR DIO:\n${e.message}\nType: ${e.type}');
      } else {
        setState(() => _result = '❌ ERREUR:\n$e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Diagnostique Réseau')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              color: Colors.blue.shade50,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  "URL Configurée:\n$_currentUrl",
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 16),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: testBackendGet,
              icon: const Icon(Icons.network_check),
              label: const Text('TESTER LA CONNEXION'),
              style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(20),
                  backgroundColor: Colors.blue.shade700,
                  foregroundColor: Colors.white),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.grey.shade100,
              height: 200,
              child: SingleChildScrollView(
                child: Text(_result,
                    style: const TextStyle(fontFamily: 'monospace')),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
