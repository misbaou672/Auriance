import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, User } from 'lucide-react';

// Mots-clés déclencheurs pour le mapping corporel
const BODY_KEYWORDS = {
    head: ['tête', 'crâne', 'céphalée', 'migraine', 'visage', 'yeux', 'nez', 'bouche', 'vertige'],
    neck: ['cou', 'cervicales', 'gorge', 'thyroïde', 'nuque', 'déglutition'],
    shoulders: ['épaule', 'trapèze', 'clavicule'],
    chest: ['poitrine', 'cœur', 'cardiaque', 'poumon', 'respiration', 'thorax', 'côtes', 'souffle', 'toux'],
    back: ['dos', 'lombaire', 'colonne', 'vertèbre', 'dorsale', 'rein'],
    arm_left: ['bras gauche', 'coude gauche', 'poignet gauche', 'main gauche'],
    arm_right: ['bras droit', 'coude droit', 'poignet droit', 'main droit'],
    stomach: ['ventre', 'abdomen', 'estomac', 'digestif', 'foie', 'intestins', 'nausée', 'douleur abdominale'],
    leg_left: ['jambe gauche', 'genou gauche', 'cheville gauche', 'pied gauche', 'hanche gauche'],
    leg_right: ['jambe droit', 'genou droit', 'cheville droite', 'pied droit', 'hanche droite'],
    general: ['fièvre', 'fatigue', 'corps', 'général']
};

const TREE_KEYWORDS = {
    racines: ['racine', 'radicelle', 'ancrage', 'base', 'souterrain'],
    tronc: ['tronc', 'écorce', 'fût', 'bois', 'tige'],
    branches: ['branche', 'rameau', 'bifurcation'],
    feuilles: ['feuille', 'folliole', 'limbe', 'photosynthèse', 'houppier'],
    fleurs: ['fleur', 'pétale', 'bourgeon', 'floraison', 'pollen'],
    fruits: ['fruit', 'graine', 'noix', 'baie']
};

export default function BodyMap({ transcript = "", isDark = true }) {
    const [activeParts, setActiveParts] = useState([]);
    const [mode, setMode] = useState('human'); // 'human' or 'tree'

    // Analyse du texte en temps réel pour activer les zones
    useEffect(() => {
        if (!transcript) return;

        const text = (transcript || "").toLowerCase();
        const detected = [];
        const KEYWORDS = mode === 'human' ? BODY_KEYWORDS : TREE_KEYWORDS;

        Object.entries(KEYWORDS).forEach(([part, keywords]) => {
            if (keywords.some(word => text.includes(word))) {
                detected.push(part);
            }
        });

        // SMART DETECTION (Combine Part + Side) for Human Mode
        if (mode === 'human') {
            const has = (words) => words.some(w => text.includes(w));
            const leftTerms = ['gauche', 'sinistre'];
            const rightTerms = ['droit', 'droite'];

            // Arms (includes shoulder/hand)
            const armTerms = ['bras', 'coude', 'poignet', 'main', 'épaule', 'avant-bras', 'doigt'];
            if (has(armTerms) && has(leftTerms)) detected.push('arm_left');
            if (has(armTerms) && has(rightTerms)) detected.push('arm_right');

            // Legs (includes hip/foot)
            const legTerms = ['jambe', 'genou', 'cheville', 'pied', 'hanche', 'cuisse', 'mollet', 'orteil'];
            if (has(legTerms) && has(leftTerms)) detected.push('leg_left');
            if (has(legTerms) && has(rightTerms)) detected.push('leg_right');
        }

        // On garde les zones actives si elles sont détectées
        setActiveParts([...new Set(detected)]);
    }, [transcript, mode]);

    const isPartActive = (part) => activeParts.includes(part);

    // Couleurs
    const glowColor = "#818cf8"; // Indigo 400
    const activeFill = "rgba(99, 102, 241, 0.4)"; // Indigo 500 avec opacité
    // Couleurs Human
    const strokeBase = isDark ? "#334155" : "#cbd5e1"; // Slate 700 ou 300
    const strokeActive = "#a5b4fc"; // Indigo 300

    // Couleurs Tree
    const treeStrokeBase = isDark ? "#3f6212" : "#84cc16";
    const treeActiveFill = "rgba(132, 204, 22, 0.4)"; // Lime 500 avec opacité
    const treeStrokeActive = "#bef264"; // Lime 300

    return (
        <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-500 ${isDark ? 'bg-slate-900/50' : 'bg-white/50'}`}>

            {/* Titre style HUD & Toggle */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeParts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className={`text-xs font-mono uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {mode === 'human' ? 'Bio-Scan' : 'Eco-Scan'} {activeParts.length > 0 ? 'ACTIVE' : 'STANDBY'}
                    </span>
                </div>

                <button
                    onClick={() => setMode(m => m === 'human' ? 'tree' : 'human')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors border ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                    title={mode === 'human' ? "Passer au mode végétal" : "Passer au mode humain"}
                >
                    {mode === 'human' ? 'ECO' : 'HUMAN'}
                </button>
            </div>

            {/* Visualisation SVG */}
            {mode === 'human' ? (
                <svg
                    viewBox="0 0 200 400"
                    className="w-full h-full max-h-[500px] drop-shadow-2xl"
                    style={{ filter: activeParts.length > 0 ? 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))' : 'none' }}
                >
                    <defs>
                        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={isDark ? "#1e293b" : "#f1f5f9"} />
                            <stop offset="100%" stopColor={isDark ? "#0f172a" : "#e2e8f0"} />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Silhouette de base (fantôme) pour la structure */}
                    <g stroke={strokeBase} strokeWidth="1" fill="url(#bodyGradient)" opacity="0.3">
                        {/* Head */}
                        <circle cx="100" cy="50" r="25" />
                        {/* Trunk */}
                        <path d="M75,75 L125,75 L115,200 L85,200 Z" />
                        {/* Arms */}
                        <path d="M75,80 L50,150" />
                        <path d="M125,80 L150,150" />
                        {/* Legs */}
                        <path d="M90,200 L75,350" />
                        <path d="M110,200 L125,350" />
                    </g>

                    {/* HEAD */}
                    <motion.circle
                        cx="100" cy="50" r="23"
                        initial={false}
                        animate={{
                            fill: isPartActive('head') ? activeFill : "transparent",
                            stroke: isPartActive('head') ? strokeActive : strokeBase,
                            strokeWidth: isPartActive('head') ? 2 : 1,
                            opacity: isPartActive('head') ? 1 : 0.5
                        }}
                        filter={isPartActive('head') ? "url(#glow)" : ""}
                    />

                    {/* NECK */}
                    <motion.rect
                        x="90" y="70" width="20" height="15"
                        initial={false}
                        animate={{
                            fill: isPartActive('neck') ? activeFill : "transparent",
                            stroke: isPartActive('neck') ? strokeActive : strokeBase,
                            opacity: isPartActive('neck') ? 1 : 0.5
                        }}
                    />

                    {/* CHEST */}
                    <motion.path
                        d="M 78 85 L 122 85 L 118 140 L 82 140 Z"
                        initial={false}
                        animate={{
                            fill: isPartActive('chest') ? activeFill : "transparent",
                            stroke: isPartActive('chest') ? strokeActive : strokeBase,
                            opacity: isPartActive('chest') ? 1 : 0.5
                        }}
                    />

                    {/* ABDOMEN / STOMACH */}
                    <motion.path
                        d="M 82 140 L 118 140 L 115 190 L 85 190 Z"
                        initial={false}
                        animate={{
                            fill: isPartActive('stomach') ? activeFill : "transparent",
                            stroke: isPartActive('stomach') ? strokeActive : strokeBase,
                            opacity: isPartActive('stomach') ? 1 : 0.5
                        }}
                    />

                    {/* SHOULDERS (Combined visual) */}
                    <motion.path
                        d="M 78 85 L 60 90 L 75 80 Z"
                        initial={false}
                        animate={{
                            fill: isPartActive('shoulders') || isPartActive('arm_left') ? activeFill : "transparent",
                            stroke: isPartActive('shoulders') ? strokeActive : strokeBase,
                            opacity: isPartActive('shoulders') ? 1 : 0.5
                        }}
                    />
                    <motion.path
                        d="M 122 85 L 140 90 L 125 80 Z"
                        initial={false}
                        animate={{
                            fill: isPartActive('shoulders') || isPartActive('arm_right') ? activeFill : "transparent",
                            stroke: isPartActive('shoulders') ? strokeActive : strokeBase,
                            opacity: isPartActive('shoulders') ? 1 : 0.5
                        }}
                    />

                    {/* ARMS */}
                    {/* Left Arm */}
                    <motion.path
                        d="M 60 90 L 45 140 L 40 160"
                        fill="none"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            stroke: isPartActive('arm_left') ? strokeActive : strokeBase,
                            strokeWidth: isPartActive('arm_left') ? 4 : 2,
                            opacity: isPartActive('arm_left') ? 1 : 0.5
                        }}
                    />

                    {/* Right Arm */}
                    <motion.path
                        d="M 140 90 L 155 140 L 160 160"
                        fill="none"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            stroke: isPartActive('arm_right') ? strokeActive : strokeBase,
                            strokeWidth: isPartActive('arm_right') ? 4 : 2,
                            opacity: isPartActive('arm_right') ? 1 : 0.5
                        }}
                    />

                    {/* LEGS */}
                    {/* Left Leg */}
                    <motion.path
                        d="M 85 190 L 75 270 L 70 350 L 60 360"
                        fill="none"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            stroke: isPartActive('leg_left') ? strokeActive : strokeBase,
                            strokeWidth: isPartActive('leg_left') ? 4 : 2,
                            opacity: isPartActive('leg_left') ? 1 : 0.5
                        }}
                    />

                    {/* Right Leg */}
                    <motion.path
                        d="M 115 190 L 125 270 L 130 350 L 140 360"
                        fill="none"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            stroke: isPartActive('leg_right') ? strokeActive : strokeBase,
                            strokeWidth: isPartActive('leg_right') ? 4 : 2,
                            opacity: isPartActive('leg_right') ? 1 : 0.5
                        }}
                    />

                    {/* BACK (Overlay dashed line if active) */}
                    {isPartActive('back') && (
                        <motion.path
                            d="M 100 70 L 100 190"
                            stroke={activeFill}
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                        />
                    )}
                </svg>
            ) : (
                // TREE VISUALIZATION
                <svg
                    viewBox="0 0 200 400"
                    className="w-full h-full max-h-[500px] drop-shadow-2xl"
                    style={{ filter: activeParts.length > 0 ? 'drop-shadow(0 0 10px rgba(132, 204, 22, 0.3))' : 'none' }}
                >
                    <defs>
                        <filter id="glowTree">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* TRONC (Main) */}
                    <motion.path
                        d="M 90 350 L 85 200 L 90 150 L 110 150 L 115 200 L 110 350 Z"
                        initial={false}
                        animate={{
                            fill: isPartActive('tronc') ? treeActiveFill : 'transparent',
                            stroke: isPartActive('tronc') ? treeStrokeActive : treeStrokeBase,
                            opacity: isPartActive('tronc') ? 1 : 0.5
                        }}
                    />

                    {/* RACINES */}
                    <motion.path
                        d="M 90 350 L 70 380 M 110 350 L 130 380 M 100 350 L 100 390"
                        fill="none"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            stroke: isPartActive('racines') ? treeStrokeActive : treeStrokeBase,
                            strokeWidth: isPartActive('racines') ? 3 : 1,
                            opacity: isPartActive('racines') ? 1 : 0.5
                        }}
                    />

                    {/* BRANCHES MAIN */}
                    <motion.path
                        d="M 90 150 L 60 100 M 110 150 L 140 100 M 100 150 L 100 80"
                        fill="none"
                        strokeLinecap="round"
                        initial={false}
                        animate={{
                            stroke: isPartActive('branches') || isPartActive('feuilles') ? treeStrokeActive : treeStrokeBase,
                            strokeWidth: isPartActive('branches') ? 3 : 1,
                            opacity: isPartActive('branches') || isPartActive('feuilles') ? 1 : 0.5
                        }}
                    />

                    {/* FEUILLES (Clusters) */}
                    <motion.circle
                        cx="60" cy="100" r="25"
                        initial={false}
                        animate={{
                            fill: isPartActive('feuilles') ? treeActiveFill : 'transparent',
                            stroke: isPartActive('feuilles') ? treeStrokeActive : treeStrokeBase,
                            opacity: isPartActive('feuilles') ? 0.8 : 0.3
                        }}
                    />
                    <motion.circle
                        cx="140" cy="100" r="25"
                        initial={false}
                        animate={{
                            fill: isPartActive('feuilles') ? treeActiveFill : 'transparent',
                            stroke: isPartActive('feuilles') ? treeStrokeActive : treeStrokeBase,
                            opacity: isPartActive('feuilles') ? 0.8 : 0.3
                        }}
                    />
                    <motion.circle
                        cx="100" cy="70" r="30"
                        initial={false}
                        animate={{
                            fill: isPartActive('feuilles') ? treeActiveFill : 'transparent',
                            stroke: isPartActive('feuilles') ? treeStrokeActive : treeStrokeBase,
                            opacity: isPartActive('feuilles') ? 0.8 : 0.3
                        }}
                    />

                    {/* FRUITS */}
                    <motion.circle cx="70" cy="90" r="4" fill={isPartActive('fruits') ? "#facc15" : "transparent"} stroke={isPartActive('fruits') ? "#fef08a" : "none"} />
                    <motion.circle cx="130" cy="90" r="4" fill={isPartActive('fruits') ? "#facc15" : "transparent"} stroke={isPartActive('fruits') ? "#fef08a" : "none"} />
                    <motion.circle cx="100" cy="60" r="4" fill={isPartActive('fruits') ? "#facc15" : "transparent"} stroke={isPartActive('fruits') ? "#fef08a" : "none"} />

                    {/* FLEURS */}
                    <motion.path
                        d="M 50 110 L 55 105 L 60 110 M 140 110 L 145 105 L 150 110"
                        fill="none"
                        stroke={isPartActive('fleurs') ? "#f472b6" : "transparent"}
                        strokeWidth="2"
                    />

                </svg>
            )}

            {/* Liste des zones détectées */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <AnimatePresence>
                    {activeParts.map(part => (
                        <motion.span
                            key={part}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${mode === 'human' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-lime-500/10 text-lime-600 border-lime-500/20'}`}
                        >
                            {part.replace('_', ' ')}
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
