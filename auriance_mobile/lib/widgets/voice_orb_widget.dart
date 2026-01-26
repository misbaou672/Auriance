import 'package:flutter/material.dart';
import 'dart:math' as math;

/// Widget qui affiche une boule animée (comme Siri/Alexa) qui réagit à la voix
class VoiceOrbWidget extends StatefulWidget {
  final bool isListening;
  final double soundLevel; // 0.0 à 1.0
  final VoidCallback? onTap;

  const VoiceOrbWidget({
    super.key,
    required this.isListening,
    this.soundLevel = 0.0,
    this.onTap,
  });

  @override
  State<VoiceOrbWidget> createState() => _VoiceOrbWidgetState();
}

class _VoiceOrbWidgetState extends State<VoiceOrbWidget>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _waveController;
  late AnimationController _shimmerController;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _waveController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _shimmerController = AnimationController(
      duration: const Duration(milliseconds: 2500),
      vsync: this,
    );
  }

  @override
  void didUpdateWidget(VoiceOrbWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isListening && !oldWidget.isListening) {
      _pulseController.repeat(reverse: true);
      _waveController.repeat();
      _shimmerController.repeat();
    } else if (!widget.isListening && oldWidget.isListening) {
      _pulseController.stop();
      _pulseController.reset();
      _waveController.stop();
      _waveController.reset();
      _shimmerController.stop();
      _shimmerController.reset();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _waveController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: SizedBox(
        width: 300,
        height: 300,
        child: AnimatedBuilder(
          animation: Listenable.merge([
            _pulseController,
            _waveController,
            _shimmerController,
          ]),
          builder: (context, child) {
            // Scale basé sur le son (0% à 50% de croissance)
            final soundScale =
                widget.isListening ? 1.0 + (widget.soundLevel * 0.5) : 1.0;

            // Pulse légère
            final pulseValue = widget.isListening
                ? (math.sin(_pulseController.value * 2 * math.pi) * 0.05) + 1.0
                : 1.0;

            final finalScale = soundScale * pulseValue;

            return Stack(
              alignment: Alignment.center,
              children: [
                // Ondes extérieures (4 couches)
                if (widget.isListening) ...[
                  for (int i = 0; i < 4; i++) _buildWave(i),
                ],

                // Boule principale COMPLÈTEMENT BLEUE
                Transform.scale(
                  scale: finalScale,
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: widget.isListening
                            ? [
                                const Color(0xFF64B5F6), // Bleu clair centre
                                const Color(0xFF42A5F5), // Bleu moyen
                                const Color(0xFF1E88E5), // Bleu vif
                                const Color(0xFF1565C0), // Bleu foncé bord
                              ]
                            : [
                                const Color(0xFFE0E0E0),
                                const Color(0xFFBDBDBD),
                                const Color(0xFF9E9E9E),
                                const Color(0xFF757575),
                              ],
                        stops: const [0.0, 0.3, 0.7, 1.0],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: widget.isListening
                              ? const Color(0xFF2196F3).withOpacity(0.6)
                              : Colors.grey.withOpacity(0.4),
                          blurRadius: 40 + (widget.soundLevel * 60),
                          spreadRadius: 10 + (widget.soundLevel * 20),
                        ),
                      ],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Shimmer effect
                        if (widget.isListening)
                          Transform.rotate(
                            angle: _shimmerController.value * 2 * math.pi,
                            child: Container(
                              width: 200,
                              height: 200,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: SweepGradient(
                                  colors: [
                                    Colors.white.withOpacity(0.0),
                                    Colors.white.withOpacity(0.3),
                                    Colors.white.withOpacity(0.0),
                                  ],
                                  stops: const [0.0, 0.5, 1.0],
                                ),
                              ),
                            ),
                          ),

                        // Icône micro
                        Icon(
                          widget.isListening ? Icons.mic : Icons.mic_none,
                          size: 64,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ),

                // Particules qui orbitent
                if (widget.isListening && widget.soundLevel > 0.2) ...[
                  for (int i = 0; i < 12; i++) _buildParticle(i),
                ],
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildWave(int index) {
    final progress = (_waveController.value + (index * 0.2)) % 1.0;
    final opacity = (1.0 - progress) * 0.6;
    final scale = 1.0 + (progress * 0.8) + (widget.soundLevel * 0.3);

    return Transform.scale(
      scale: scale,
      child: Container(
        width: 200,
        height: 200,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: const Color(0xFF2196F3).withOpacity(opacity),
            width: 2.5,
          ),
        ),
      ),
    );
  }

  Widget _buildParticle(int index) {
    final angle = (index / 12) * 2 * math.pi;
    final distance = 100 + (widget.soundLevel * 50);
    final angleWithRotation = angle + (_waveController.value * 2 * math.pi);

    final x = math.cos(angleWithRotation) * distance;
    final y = math.sin(angleWithRotation) * distance;

    return Transform.translate(
      offset: Offset(x, y),
      child: Container(
        width: 6 + (widget.soundLevel * 6),
        height: 6 + (widget.soundLevel * 6),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withOpacity(0.9),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF64B5F6).withOpacity(0.8),
              blurRadius: 8,
              spreadRadius: 2,
            ),
          ],
        ),
      ),
    );
  }
}
