import 'package:flutter/material.dart';

class WaveAnimation extends StatefulWidget {
  final bool isRecording;
  final double audioLevel;
  final AnimationController controller;
  final Widget child;

  const WaveAnimation({
    super.key,
    required this.isRecording,
    required this.audioLevel,
    required this.controller,
    required this.child,
  });

  @override
  State<WaveAnimation> createState() => _WaveAnimationState();
}

class _WaveAnimationState extends State<WaveAnimation>
    with SingleTickerProviderStateMixin {
  late Animation<double> _waveAnimation;

  @override
  void initState() {
    super.initState();
    _waveAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(widget.controller);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _waveAnimation,
      builder: (context, child) {
        final scale = 1.0 + (_waveAnimation.value * 0.2 * widget.audioLevel);

        return Container(
          width: 250,
          height: 250,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                Colors.blue.withOpacity(0.1),
                Colors.blue.withOpacity(0.2),
                Colors.blue.withOpacity(0.3),
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
            boxShadow: [
              if (widget.isRecording)
                BoxShadow(
                  color: Colors.blue.withOpacity(0.3),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
            ],
          ),
          child: Transform.scale(
            scale: scale,
            child: child,
          ),
        );
      },
      child: widget.child,
    );
  }
}
