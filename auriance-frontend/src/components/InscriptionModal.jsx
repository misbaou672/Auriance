import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { Check, ArrowLeft, Sun, Moon, Loader2, X } from 'lucide-react';

export default function InscriptionModal({ isOpen, onClose }) {
    const [isDark, setIsDark] = useState(false);
    const [step, setStep] = useState(1); // 1: Choix, 2: Inscription, 3: Demo, 4: Success
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        organization: '',
        phone: '',
    });

    if (!isOpen) return null;

    const toggleTheme = () => setIsDark(!isDark);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                prenom: formData.firstName,
                nom: formData.lastName,
                organization: formData.organization // Si le backend le supporte
            });
            setStep(4); // Success screen
        } catch (err) {
            setError(err.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsLoading(false);
        }
    };

    const theme = isDark ? {
        bg: 'bg-slate-900',
        textMain: 'text-white',
        textMuted: 'text-slate-400',
        cardRg: 'bg-[#131420]',
        inputBg: 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500',
        sidePanel: 'bg-slate-950',
        featureIcon: 'text-indigo-400 bg-indigo-500/10'
    } : {
        bg: 'bg-white',
        textMain: 'text-slate-900',
        textMuted: 'text-slate-500',
        cardRg: 'bg-white',
        inputBg: 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500',
        sidePanel: 'bg-slate-50',
        featureIcon: 'text-indigo-600 bg-indigo-50'
    };

    // Close button overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8" onClick={handleOverlayClick}>
            <div className={`w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>

                {/* LEFT PANEL Info */}
                <div className={`md:w-5/12 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden ${theme.sidePanel}`}>
                    {/* Background blob */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <span className="font-bold text-xl">A</span>
                            </div>
                            <span className={`text-2xl font-bold ${theme.textMain}`}>Auriance</span>
                        </div>

                        <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme.textMain}`}>
                            Commencez votre essai <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">gratuit</span>
                        </h2>
                        <p className={`text-lg mb-12 leading-relaxed ${theme.textMuted}`}>
                            14 jours d'essai gratuit, sans engagement. Découvrez comment l'IA peut transformer vos consultations.
                        </p>

                        <div className="space-y-6">
                            <h3 className={`font-semibold ${theme.textMain}`}>Ce qui est inclus :</h3>
                            {[
                                'Transcription temps réel illimitée',
                                'Génération automatique de formulaires',
                                'Extraction intelligente des données',
                                'Export PDF et intégration',
                                'Support prioritaire 24/7'
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${theme.featureIcon}`}>
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className={theme.textMuted}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6">
                        <p className={`italic mb-4 text-sm ${theme.textMuted}`}>"Auriance a révolutionné ma pratique. Je gagne près d'une heure par jour sur la documentation."</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400" />
                            <div>
                                <p className={`font-semibold text-sm ${theme.textMain}`}>Dr. Sophie Laurent</p>
                                <p className={`text-xs ${theme.textMuted}`}>Médecin généraliste, Paris</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Tools Right */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
                    <button
                        onClick={toggleTheme}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-800 text-yellow-400 border border-white/10' : 'bg-white text-slate-700 border border-slate-200'}`}
                        title={isDark ? "Mode Clair" : "Mode Sombre"}
                    >
                        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={onClose}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 ${isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
                        title="Retour à l'accueil"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                {/* RIGHT PANEL Form */}
                <div className={`md:w-7/12 p-8 md:p-12 overflow-y-auto relative ${theme.bg}`}>

                    {step === 4 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                                <Check className="w-10 h-10" />
                            </div>
                            <h3 className={`text-3xl font-bold ${theme.textMain}`}>Compte créé !</h3>
                            <p className={theme.textMuted}>
                                Votre inscription a été validée. Vous pouvez maintenant vous connecter à votre espace.
                            </p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-500/25"
                            >
                                Accéder à mon compte
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <div className="mb-8">
                                <h2 className={`text-2xl font-bold mb-2 ${theme.textMain}`}>Créer votre compte</h2>
                                <p className={theme.textMuted}>Rejoignez plus de 2000 professionnels de santé</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={`text-sm font-medium ${theme.textMain}`}>Prénom</label>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Jean"
                                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.inputBg}`}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`text-sm font-medium ${theme.textMain}`}>Nom</label>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Dupont"
                                            className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.inputBg}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Nom d'utilisateur</label>
                                    <input
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="dr.dupont"
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.inputBg}`}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Email professionnel</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="docteur@clinique.fr"
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.inputBg}`}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Mot de passe</label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.inputBg}`}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-sm font-medium ${theme.textMain}`}>Établissement (optionnel)</label>
                                    <input
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        placeholder="Clinique Saint-Martin"
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme.inputBg}`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continuer <ArrowRight className="w-5 h-5" /></>}
                                </button>

                                <p className={`text-center text-sm mt-4 ${theme.textMuted}`}>
                                    Déjà un compte ? <a href="/login" className="text-indigo-500 hover:text-indigo-400 font-medium hover:underline">Se connecter</a>
                                </p>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Icone flèche droite pour le bouton
function ArrowRight({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}