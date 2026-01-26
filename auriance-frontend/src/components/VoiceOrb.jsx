import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedOrb({ audioLevel = 0, isListening = false }) {
    const meshRef = useRef(null);
    const materialRef = useRef(null);

    const baseDistort = 0.3;
    const distortAmount = baseDistort + audioLevel * 0.7;

    const gradientShader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uAudioLevel: { value: 0 },
            uColor1: { value: new THREE.Color('#ffffff') },
            uColor2: { value: new THREE.Color('#ff6b9d') },
            uColor3: { value: new THREE.Color('#9b59b6') },
            uColor4: { value: new THREE.Color('#3498db') },
            uColor5: { value: new THREE.Color('#1abc9c') },
        },
        vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float uTime;
      uniform float uAudioLevel;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vUv = uv;
        vNormal = normal;

        float noise = snoise(position * 2.0 + uTime * 0.5) * (0.1 + uAudioLevel * 0.3);
        vec3 newPosition = position + normal * noise;

        vPosition = newPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
        fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float uTime;
      uniform float uAudioLevel;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform vec3 uColor4;
      uniform vec3 uColor5;

      void main() {
        float t = uTime * 0.3;
        float wave1 = sin(vPosition.x * 3.0 + t) * 0.5 + 0.5;
        float wave2 = sin(vPosition.y * 3.0 + t * 1.3) * 0.5 + 0.5;
        float wave3 = sin(vPosition.z * 3.0 + t * 0.7) * 0.5 + 0.5;

        float audioBoost = 1.0 + uAudioLevel * 2.0;

        vec3 color = uColor1;
        color = mix(color, uColor2, wave1 * audioBoost);
        color = mix(color, uColor3, wave2 * 0.6);
        color = mix(color, uColor4, wave3 * 0.5);
        color = mix(color, uColor5, (wave1 + wave2) * 0.3);

        float fresnel = pow(1.0 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 2.0);
        color += fresnel * 0.3 * audioBoost;

        float innerGlow = 0.5 + uAudioLevel * 0.5;
        color *= innerGlow + 0.5;

        gl_FragColor = vec4(color, 0.95);
      }
    `
    }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uAudioLevel.value = audioLevel;
        }
        if (meshRef.current) {
            const speed = isListening ? 0.0025 : 0.0012;
            meshRef.current.rotation.y += speed;
            meshRef.current.rotation.x += speed * 0.5;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={meshRef} scale={1.5}>
                <sphereGeometry args={[1, 128, 128]} />
                <shaderMaterial ref={materialRef} {...gradientShader} transparent side={THREE.DoubleSide} />
            </mesh>
            <mesh scale={1.4}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.1}
                    distort={distortAmount}
                    speed={3}
                    roughness={0}
                />
            </mesh>
            <mesh scale={1.8}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial
                    color="#9b59b6"
                    transparent
                    opacity={0.05 + audioLevel * 0.1}
                    side={THREE.BackSide}
                />
            </mesh>
        </Float>
    );
}

function ParticleRing({ audioLevel = 0 }) {
    const pointsRef = useRef(null);

    const particles = useMemo(() => {
        const count = 100;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i += 1) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 2.2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(angle) * radius;
            positions[i * 3 + 2] = 0;
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z = state.clock.elapsedTime * 0.2;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particles, 3]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.03 + audioLevel * 0.05}
                color="#ffffff"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function Scene({ audioLevel = 0, isListening = false }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9b59b6" />
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#3498db" />
            <AnimatedOrb audioLevel={audioLevel} isListening={isListening} />
            <ParticleRing audioLevel={audioLevel} />
            <Environment preset="night" />
        </>
    );
}

export default function VoiceOrb({ size = 280, isListening = false, audioLevel = 0 }) {
    const safeLevel = Number.isFinite(audioLevel) ? Math.max(0, Math.min(1, audioLevel)) : 0;

    return (
        <div className="relative flex items-center justify-center">
            <div
                className="absolute rounded-full blur-3xl transition-all duration-300"
                style={{
                    width: size * 1.5,
                    height: size * 1.5,
                    background: `radial-gradient(circle, 
            rgba(0, 230, 255, ${0.1 + safeLevel * 0.2}) 0%, 
            rgba(255, 50, 150, ${0.08 + safeLevel * 0.15}) 40%,
            transparent 70%)`,
                    transform: `scale(${1 + safeLevel * 0.2})`,
                }}
            />

            <div
                className="relative"
                style={{
                    width: size,
                    height: size,
                }}
            >
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <Scene audioLevel={safeLevel} isListening={isListening} />
                </Canvas>
            </div>
        </div>
    );
}
