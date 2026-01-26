// src/pages/Login.jsx
import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Mic, Shield, Stethoscope, Zap, Sun, Moon, Check, ChevronDown } from 'lucide-react';
import { loginUser, getCurrentUser } from '../services/api';

const LANGUAGES = [
    { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
    { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', label: 'Mandarin', flag: '🇨🇳' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { code: 'ar-SA', label: 'Arabic', flag: '🇸🇦' },
    { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
    { code: 'bn-BD', label: 'Bengali', flag: '🇧🇩' },
    { code: 'ur-PK', label: 'Urdu', flag: '🇵🇰' },
];

const TRANSLATIONS = {
    'fr-FR': {
        welcome: "Bon retour parmi nous",
        subtitle: "Connectez-vous pour accéder à votre espace",
        emailLabel: "Adresse email",
        emailPlaceholder: "nom@exemple.com",
        passwordLabel: "Mot de passe",
        passwordPlaceholder: "Votre mot de passe",
        forgotPassword: "Mot de passe oublié ?",
        rememberMe: "Rester connecté",
        loginButton: "Se connecter",
        orContinue: "ou continuez avec",
        noAccount: "Pas encore de compte ?",
        createAccount: "Créer un compte",
        heroTitleStart: "L'IA de demain,",
        heroTitleEnd: "au service de tous",
        heroText: "Rejoignez des milliers de professionnels qui utilisent Auriance pour décupler leur productivité au quotidien.",
        statPrecision: "Précision",
        statTime: "Temps gagné",
        statCompliant: "Conforme"
    },
    'en-US': {
        welcome: "Welcome Back",
        subtitle: "Log in to access your dashboard",
        emailLabel: "Email Address",
        emailPlaceholder: "name@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Your password",
        forgotPassword: "Forgot password?",
        rememberMe: "Remember me",
        loginButton: "Sign In",
        orContinue: "or continue with",
        noAccount: "Don't have an account?",
        createAccount: "Create an account",
        heroTitleStart: "Tomorrow's AI,",
        heroTitleEnd: "serving everyone",
        heroText: "Join thousands of professionals using Auriance to boost their daily productivity.",
        statPrecision: "Precision",
        statTime: "Time Saved",
        statCompliant: "Compliant"
    },
    'de-DE': {
        welcome: "Willkommen zurück",
        subtitle: "Loggen Sie sich ein, um auf Ihren Bereich zuzugreifen",
        emailLabel: "E-Mail-Adresse",
        emailPlaceholder: "name@beispiel.com",
        passwordLabel: "Passwort",
        passwordPlaceholder: "Ihr Passwort",
        forgotPassword: "Passwort vergessen?",
        rememberMe: "Angemeldet bleiben",
        loginButton: "Anmelden",
        orContinue: "oder weiter mit",
        noAccount: "Noch kein Konto?",
        createAccount: "Konto erstellen",
        heroTitleStart: "Die KI von morgen,",
        heroTitleEnd: "im Dienste aller",
        heroText: "Schließen Sie sich Tausenden von Profis an, die Auriance nutzen, um ihre tägliche Produktivität zu steigern.",
        statPrecision: "Präzision",
        statTime: "Zeit gespart",
        statCompliant: "Konform"
    },
    'es-ES': {
        welcome: "Bienvenido de nuevo",
        subtitle: "Inicia sesión para acceder a tu espacio",
        emailLabel: "Dirección de correo",
        emailPlaceholder: "nombre@ejemplo.com",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "Tu contraseña",
        forgotPassword: "¿Olvidaste tu contraseña?",
        rememberMe: "Mantener sesión",
        loginButton: "Iniciar sesión",
        orContinue: "o continuar con",
        noAccount: "¿No tienes cuenta?",
        createAccount: "Crear una cuenta",
        heroTitleStart: "La IA del mañana,",
        heroTitleEnd: "al servicio de todos",
        heroText: "Únete a miles de profesionales que usan Auriance para multiplicar su productividad diaria.",
        statPrecision: "Precisión",
        statTime: "Tiempo ahorrado",
        statCompliant: "Conforme"
    },
    'pt-PT': {
        welcome: "Bem-vindo de volta",
        subtitle: "Faça login para acessar seu espaço",
        emailLabel: "Endereço de email",
        emailPlaceholder: "nome@exemplo.com",
        passwordLabel: "Senha",
        passwordPlaceholder: "Sua senha",
        forgotPassword: "Esqueceu a senha?",
        rememberMe: "Manter conectado",
        loginButton: "Entrar",
        orContinue: "ou continue com",
        noAccount: "Não tem conta?",
        createAccount: "Criar uma conta",
        heroTitleStart: "A IA de amanhã,",
        heroTitleEnd: "a serviço de todos",
        heroText: "Junte-se a milhares de profissionais que usam Auriance para impulsionar sua produtividade diária.",
        statPrecision: "Precisão",
        statTime: "Tempo ganho",
        statCompliant: "Conforme"
    },
    'it-IT': {
        welcome: "Bentornato",
        subtitle: "Accedi per entrare nel tuo spazio",
        emailLabel: "Indirizzo email",
        emailPlaceholder: "nome@esempio.com",
        passwordLabel: "Password",
        passwordPlaceholder: "La tua password",
        forgotPassword: "Password dimenticata?",
        rememberMe: "Resta connesso",
        loginButton: "Accedi",
        orContinue: "o continua con",
        noAccount: "Non hai un account?",
        createAccount: "Crea un account",
        heroTitleStart: "L'IA di domani,",
        heroTitleEnd: "al servizio di tutti",
        heroText: "Unisciti a migliaia di professionisti che usano Auriance per aumentare la loro produttività quotidiana.",
        statPrecision: "Precisione",
        statTime: "Tempo risparmiato",
        statCompliant: "Conforme"
    },
    'ru-RU': {
        welcome: "С возвращением",
        subtitle: "Войдите, чтобы получить доступ",
        emailLabel: "Электронная почта",
        emailPlaceholder: "imya@example.com",
        passwordLabel: "Пароль",
        passwordPlaceholder: "Ваш пароль",
        forgotPassword: "Забыли пароль?",
        rememberMe: "Запомнить меня",
        loginButton: "Войти",
        orContinue: "или продолжить с",
        noAccount: "Нет аккаунта?",
        createAccount: "Создать аккаунт",
        heroTitleStart: "ИИ завтрашнего дня,",
        heroTitleEnd: "для всех",
        heroText: "Присоединяйтесь к тысячам профессионалов, использующих Auriance для повышения продуктивности.",
        statPrecision: "Точность",
        statTime: "Экономия времени",
        statCompliant: "Соответствует"
    },
    'zh-CN': {
        welcome: "欢迎回来",
        subtitle: "登录以访问您的空间",
        emailLabel: "电子邮件地址",
        emailPlaceholder: "name@example.com",
        passwordLabel: "密码",
        passwordPlaceholder: "您的密码",
        forgotPassword: "忘记密码？",
        rememberMe: "保持登录",
        loginButton: "登录",
        orContinue: "或继续使用",
        noAccount: "还没有账号？",
        createAccount: "创建一个账号",
        heroTitleStart: "明日的人工智能，",
        heroTitleEnd: "服务于所有人",
        heroText: "加入成千上万使用 Auriance 提高日常生产力的专业人士。",
        statPrecision: "准确率",
        statTime: "节省时间",
        statCompliant: "合规"
    },
    'ja-JP': {
        welcome: "おかえりなさい",
        subtitle: "ログインしてアクセス",
        emailLabel: "メールアドレス",
        emailPlaceholder: "name@example.com",
        passwordLabel: "パスワード",
        passwordPlaceholder: "パスワードを入力",
        forgotPassword: "パスワードをお忘れですか？",
        rememberMe: "ログイン状態を保持",
        loginButton: "ログイン",
        orContinue: "または次で続ける",
        noAccount: "アカウントをお持ちでないですか？",
        createAccount: "アカウント作成",
        heroTitleStart: "明日のAI、",
        heroTitleEnd: "すべての人に",
        heroText: "Aurianceを使用して日々の生産性を向上させている何千もの専門家に加わりましょう。",
        statPrecision: "精度",
        statTime: "時間短縮",
        statCompliant: "準拠"
    },
    'ar-SA': {
        welcome: "مرحباً بعودتك",
        subtitle: "سجل الدخول للوصول إلى مساحتك",
        emailLabel: "البريد الإلكتروني",
        emailPlaceholder: "name@example.com",
        passwordLabel: "كلمة المرور",
        passwordPlaceholder: "كلمة مرورك",
        forgotPassword: "نسيت كلمة المرور؟",
        rememberMe: "تذكرني",
        loginButton: "تسجيل الدخول",
        orContinue: "أو الاستمرار مع",
        noAccount: "ليس لديك حساب؟",
        createAccount: "إنشاء حساب",
        heroTitleStart: "ذكاء الغد،",
        heroTitleEnd: "في خدمة الجميع",
        heroText: "انضم إلى آلاف المحترفين الذين يستخدمون Auriance لزيادة إنتاجيتهم اليومية.",
        statPrecision: "دقة",
        statTime: "وقت موفر",
        statCompliant: "متوافق"
    },
    'hi-IN': {
        welcome: "वापसी पर स्वागत है",
        subtitle: "अपने स्थान तक पहुँचने के लिए लॉगिन करें",
        emailLabel: "ईमेल पता",
        emailPlaceholder: "name@example.com",
        passwordLabel: "पासवर्ड",
        passwordPlaceholder: "आपका पासवर्ड",
        forgotPassword: "पासवर्ड भूल गए?",
        rememberMe: "मुझे याद रखें",
        loginButton: "साइन इन करें",
        orContinue: "या इसके साथ जारी रखें",
        noAccount: "खाता नहीं है?",
        createAccount: "खाता बनाएं",
        heroTitleStart: "कल का एआई,",
        heroTitleEnd: "सभी की सेवा में",
        heroText: "अपनी दैनिक उत्पादकता बढ़ाने के लिए Auriance का उपयोग करने वाले हजारों पेशेवरों में शामिल हों।",
        statPrecision: "सटीकता",
        statTime: "समय बचा",
        statCompliant: "अनुपालन"
    },
    'bn-BD': {
        welcome: "স্বাগতম",
        subtitle: "আপনার স্পেসে অ্যাক্সেস করতে লগইন করুন",
        emailLabel: "ইমেল ঠিকানা",
        emailPlaceholder: "name@example.com",
        passwordLabel: "পাসওয়ার্ড",
        passwordPlaceholder: "আপনার পাসওয়ার্ড",
        forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
        rememberMe: "আমাকে মনে রাখুন",
        loginButton: "সাইন ইন",
        orContinue: "বা এর সাথে চালিয়ে যান",
        noAccount: "অ্যাকাউন্ট নেই?",
        createAccount: "অ্যাকাউন্ট তৈরি করুন",
        heroTitleStart: "আগামীকালের এআই,",
        heroTitleEnd: "সবার সেবায়",
        heroText: "আপনার দৈনন্দিন উত্পাদনশীলতা বাড়াতে Auriance ব্যবহার করা হাজার হাজার পেশাদারদের সাথে যোগ দিন।",
        statPrecision: "নির্ভুলতা",
        statTime: "সময় বেঁচেছে",
        statCompliant: "সম্মত"
    },
    'ur-PK': {
        welcome: "خوش آمدید",
        subtitle: "اپنی جگہ تک رسائی حاصل کرنے کے لیے لاگ ان کریں",
        emailLabel: "ای میل پتہ",
        emailPlaceholder: "name@example.com",
        passwordLabel: "پاس ورڈ",
        passwordPlaceholder: "آپ کا پاس ورڈ",
        forgotPassword: "پاس ورڈ بھول گئے؟",
        rememberMe: "مجھے یاد رکھیں",
        loginButton: "سائن ان کریں",
        orContinue: "یا اس کے ساتھ جاری رکھیں",
        noAccount: "اکاؤنٹ نہیں ہے؟",
        createAccount: "اکاؤنٹ بنائیں",
        heroTitleStart: "کل کا اے آئی،",
        heroTitleEnd: "سب کی خدمت میں",
        heroText: "اپنی روزانہ کی پیداوری بڑھانے کے لیے Auriance استعمال کرنے والے ہزاروں پیشہ ور افراد میں شامل ہوں۔",
        statPrecision: "درستگی",
        statTime: "وقت بچا",
        statCompliant: "مطابق"
    }
};

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Theme & Language State
    const [theme, setTheme] = useState('light');
    const isDark = theme === 'dark';
    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    const [language, setLanguage] = useState('fr-FR');
    const [showLangMenu, setShowLangMenu] = useState(false);

    const t = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await loginUser(formData.username, formData.password);
            // Sauvegarder le token
            localStorage.setItem('token', data.access_token);

            // Récupérer les infos de l'utilisateur tout de suite
            const userInfo = await getCurrentUser(data.access_token);

            // Callback pour rediriger ou mettre à jour l'app avec les infos complètes
            if (onLoginSuccess) onLoginSuccess({ ...data, user: userInfo });
        } catch (err) {
            console.error(err);
            setError(err.message || "Identifiants incorrects");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
                {/* Language Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'}`}
                    >
                        <span className="text-sm">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                        <span className="text-xs font-semibold uppercase hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.code.split('-')[0]}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showLangMenu && (
                        <div className={`absolute top-full mt-2 right-0 w-48 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDark
                            ? 'bg-slate-900/90 border-white/10 text-white'
                            : 'bg-white/90 border-slate-200 text-slate-800'}`}
                        >
                            <div className="p-1.5 flex flex-col gap-0.5 max-h-64 overflow-y-auto custom-scrollbar">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setShowLangMenu(false);
                                        }}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${language === lang.code
                                            ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                                            : (isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900')
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span>{lang.label}</span>
                                        </div>
                                        {language === lang.code && <Check className="w-3.5 h-3.5 opacity-70" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition ${isDark
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm'}`}
                >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <button type="button" onClick={onNavigateToRegister} className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">Auriance</span>
                    </button>

                    <div className="space-y-2">
                        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.welcome}</h1>
                        <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t.subtitle}</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t.emailLabel}</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="username"
                                    type="text"
                                    placeholder={t.emailPlaceholder}
                                    className={`pl-12 h-12 w-full rounded-xl border-2 focus:border-blue-300 transition-colors outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'}`}
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t.passwordLabel}</label>
                                <button type="button" className="text-sm text-blue-600 hover:underline">{t.forgotPassword}</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={t.passwordPlaceholder}
                                    className={`pl-12 pr-12 h-12 w-full rounded-xl border-2 focus:border-blue-300 transition-colors outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input id="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                            <label htmlFor="remember" className="text-sm text-gray-500">{t.rememberMe}</label>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:opacity-90 transition-all shadow-lg shadow-blue-500/25 text-lg text-white gap-2 rounded-xl flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t.loginButton}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-sm text-gray-500">{t.orContinue}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" className={`h-12 rounded-xl border-2 bg-transparent flex items-center justify-center gap-2 ${isDark ? 'border-slate-800 text-white hover:bg-slate-900' : 'border-gray-200 text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                        <button type="button" className={`h-12 rounded-xl border-2 bg-transparent flex items-center justify-center gap-2 ${isDark ? 'border-slate-800 text-white hover:bg-slate-900' : 'border-gray-200 text-gray-900 hover:bg-gray-50'}`}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                            </svg>
                            Apple
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        {t.noAccount}{' '}
                        <button type="button" onClick={onNavigateToRegister} className="text-[#3b82f6] font-medium hover:underline">
                            {t.createAccount}
                        </button>
                    </p>
                </div>
            </div>



            <div className={`hidden lg:flex flex-1 relative overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-[#f4f6ff] via-[#f8fbff] to-white'}`}>
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
                    <div className="relative mb-12 group">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <img
                            src="/images/marketing.jpg"
                            alt="Auriance Vision"
                            className="relative w-80 h-80 rounded-full object-cover shadow-2xl border-[6px] border-white/90"
                        />
                    </div>

                    <div className="text-center max-w-md">
                        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {t.heroTitleStart}{' '}
                            <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">{t.heroTitleEnd}</span>
                        </h2>
                        <p className={`leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            {t.heroText}
                        </p>
                    </div>

                    <div className="flex gap-8 mt-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">92%</div>
                            <div className="text-sm text-gray-500">{t.statPrecision}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">45%</div>
                            <div className="text-sm text-gray-500">{t.statTime}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent">RGPD</div>
                            <div className="text-sm text-gray-500">{t.statCompliant}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
