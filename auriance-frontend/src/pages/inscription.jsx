import React, { useState } from 'react';
import {
    Mic,
    ArrowRight,
    Mail,
    Lock,
    Eye,
    EyeOff,
    User,
    Building2,
    Check,
    Sparkles,
    Sun,
    Moon,
    ArrowLeft
} from 'lucide-react';
import { registerUser } from '../services/api';

export default function Inscription({ onRegisterSuccess, onNavigateToLogin, onNavigateToHome }) {
    const [isDark, setIsDark] = useState(true);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        telephone: '',
        etablissement: '',
        specialite: '',
        nombrePatients: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1);

    const toggleTheme = () => setIsDark(!isDark);

    const benefits = [
        'Transcription temps réel illimitée',
        'Génération automatique de formulaires',
        'Extraction intelligente des données',
        'Export PDF et intégration DMP',
        'Support prioritaire 24/7'
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (step === 1) {
            setStep(2);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setIsLoading(true);

        try {
            const data = await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                nom: formData.nom,
                prenom: formData.prenom,
                organization: formData.etablissement
            });

            localStorage.setItem('token', data.access_token);

            if (onRegisterSuccess) {
                onRegisterSuccess(data);
            }
        } catch (err) {
            console.error('Erreur inscription:', err);
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setIsLoading(false);
        }
    };

    // Theme helper function to ensure consistency
    const getThemeClasses = () => ({
        container: isDark ? 'bg-slate-950' : 'bg-white',
        textMain: isDark ? 'text-white' : 'text-slate-900',
        textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
        input: isDark
            ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500',
        cardSide: isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-white',
        featureIcon: isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600',
        quoteBox: isDark ? 'bg-indigo-500/5 border-indigo-500/10 text-slate-300' : 'bg-white/60 border-indigo-100 text-slate-700',
        stepActive: isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white',
        stepInactive: isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400',
        stepTextActive: isDark ? 'text-indigo-400' : 'text-indigo-600',
        stepTextInactive: isDark ? 'text-slate-600' : 'text-slate-400',
        socialBtn: isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
    });

    const theme = getThemeClasses();

    return (
        <div className={`min-h-screen flex transition-colors duration-300 ${theme.container}`}>
            {/* LEFT SIDE - Presentation */}
            <div className={`hidden lg:flex lg:flex-1 relative overflow-hidden flex-col justify-between p-12 ${theme.cardSide}`}>
                {/* Background Orbs */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-violet-500/10 rounded-full blur-3xl opacity-60" />
                </div>

                <div className="relative z-10">
                    <button type="button" onClick={onNavigateToLogin} className="flex items-center gap-3 mb-12 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                            <span className="font-bold text-xl text-white">A</span>
                        </div>
                        <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600`}>Auriance</span>
                    </button>

                    <h2 className={`text-4xl font-bold mb-6 leading-tight ${theme.sideTextMain}`}>
                        Commencez votre essai <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">gratuit</span>
                    </h2>
                    <p className={`text-lg mb-10 leading-relaxed max-w-lg ${theme.sideTextMuted}`}>
                        14 jours d'essai gratuit, sans engagement. Découvrez comment l'IA peut transformer vos consultations.
                    </p>

                    <div className="space-y-5">
                        <p className={`text-sm font-semibold uppercase tracking-wider flex items-center gap-2 ${theme.sideTextMuted}`}>
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            Ce qui est inclus
                        </p>
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${theme.featureIcon}`}>
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                <span className={theme.sideTextMain}>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`relative z-10 mt-12 p-6 rounded-2xl border backdrop-blur-sm ${theme.quoteBox}`}>
                    <p className="italic mb-4">
                        "Auriance a révolutionné ma pratique. Je gagne près d'une heure par jour sur la documentation."
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400" />
                        <div>
                            <p className={`font-semibold text-sm ${theme.sideTextMain}`}>Dr. Sophie Laurent</p>
                            <p className={`text-xs ${theme.sideTextMuted}`}>Médecin généraliste, Paris</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - Form */}
            <div className={`flex-1 flex flex-col relative overflow-y-auto ${theme.container}`}>

                {/* Floating Tools Top Right - FIXED et Z-INDEX MAX */}
                <div className="fixed top-6 right-6 z-[9999] flex gap-3 pointer-events-auto">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Clic Retour FORCE");
                            if (onNavigateToHome) {
                                console.log("Using onNavigateToHome");
                                onNavigateToHome();
                            } else {
                                console.log("Fallback to root");
                                window.location.href = "/"; // Force reload to home
                            }
                        }}
                        className={`p-3 rounded-full transition-all hover:scale-105 shadow-md ${isDark ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'}`}
                        title="Retour à l'accueil"
                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className={`p-3 rounded-full transition-all hover:scale-105 shadow-md ${isDark ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'bg-white text-slate-600 border border-slate-200'}`}
                        title={isDark ? "Mode Clair" : "Mode Sombre"}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                <div className="w-full max-w-lg mx-auto p-8 my-auto">
                    {/* Mobile Header */}
                    <div className="lg:hidden mb-8">
                        <button type="button" onClick={onNavigateToLogin} className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                                <span className="font-bold text-lg">A</span>
                            </div>
                            <span className="text-xl font-bold text-indigo-600">Auriance</span>
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className={`flex items-center gap-2 ${step >= 1 ? theme.stepTextActive : theme.stepTextInactive}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? theme.stepActive : theme.stepInactive}`}>
                                1
                            </div>
                            <span className="text-sm font-semibold">Informations</span>
                        </div>
                        <div className={`flex-1 h-0.5 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`flex items-center gap-2 ${step >= 2 ? theme.stepTextActive : theme.stepTextInactive}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? theme.stepActive : theme.stepInactive}`}>
                                2
                            </div>
                            <span className="text-sm font-semibold">Sécurité</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold mb-2 ${theme.textMain}`}>
                            {step === 1 ? 'Créer votre compte' : 'Sécurisez votre compte'}
                        </h1>
                        <p className={theme.textMuted}>
                            {step === 1 ? 'Rejoignez plus de 2000 professionnels de santé' : 'Choisissez un mot de passe sécurisé'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {step === 1 ? (
                            <>
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Nom complet</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Dr. Jean Dupont"
                                            className={`pl-12 w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.input}`}
                                            value={`${formData.prenom}${formData.nom ? ` ${formData.nom}` : ''}`.trim()}
                                            onChange={(e) => {
                                                const value = e.target.value || '';
                                                const [first = '', ...rest] = value.split(' ');
                                                setFormData({ ...formData, prenom: first, nom: rest.join(' ').trim() });
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Nom d'utilisateur</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            name="username"
                                            placeholder="identifiant"
                                            className={`pl-12 w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.input}`}
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Email professionnel</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="docteur@clinique.fr"
                                            className={`pl-12 w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.input}`}
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Établissement (optionnel)</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            name="etablissement"
                                            placeholder="Clinique Saint-Martin"
                                            className={`pl-12 w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.input}`}
                                            value={formData.etablissement}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Minimum 8 caractères"
                                            className={`pl-12 pr-12 w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.input}`}
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Confirmer mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            name="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Confirmez"
                                            className={`pl-12 w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.input}`}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (step === 1 ? <>Continuer <ArrowRight className="w-5 h-5" /></> : 'Créer mon compte')}
                            </button>

                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className={`w-full py-3 rounded-xl bg-transparent border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 ${theme.textMuted} font-medium transition-colors`}
                                >
                                    Retour
                                </button>
                            )}
                        </div>
                    </form>

                    <p className={`text-center text-sm mt-8 ${theme.textMuted}`}>
                        Déjà un compte ?{' '}
                        <button onClick={onNavigateToLogin} className="text-indigo-500 hover:underline font-medium">Se connecter</button>
                    </p>
                </div>
            </div>
        </div>
    );
}