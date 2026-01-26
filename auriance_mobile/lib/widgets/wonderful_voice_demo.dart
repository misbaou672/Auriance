import 'package:flutter/material.dart';

class WonderfulVoiceDemo extends StatelessWidget {
  const WonderfulVoiceDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(Icons.warning, color: Colors.orange),
            SizedBox(height: 8),
            Text('Demo disabled temporarily'),
          ],
        ),
      ),
    );
  }
}
