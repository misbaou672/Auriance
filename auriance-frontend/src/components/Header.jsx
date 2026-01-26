import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Mic, Sparkles, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Header = ({ onNavigate, onNavigateToLogin, currentUser, onNavigateToDashboard, isDark }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const { currentLanguage, changeLanguage, t } = useLanguage();

    const navLinks = [
        { href: '#features', label: t('nav.features') },
        { href: '#demo', label: t('nav.demo') || 'Démo' }, // Fallback if missing
        { href: '#pricing', label: t('nav.pricing') },
        // { href: '#security', label: t('nav.security') }, // Add key later if needed
        { href: '#faq', label: 'FAQ' },
    ];

    const AVAILABLE_LANGUAGES = [
        { code: 'FR', flag: '🇫🇷', label: 'Français' },
        { code: 'EN', flag: '🇬🇧', label: 'English' },
        { code: 'ES', flag: '🇪🇸', label: 'Español' },
        { code: 'DE', flag: '🇩🇪', label: 'Deutsch' },
        { code: 'IT', flag: '🇮🇹', label: 'Italiano' },
        { code: 'PT', flag: '🇵🇹', label: 'Português' },
        { code: 'RU', flag: '🇷🇺', label: 'Русский' },
        { code: 'ZH', flag: '🇨🇳', label: '中文 (Chinese)' },
        { code: 'JA', flag: '🇯🇵', label: '日本語 (Japanese)' },
        { code: 'AR', flag: '🇸🇦', label: 'العربية (Arabic)' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
                ? `glass py-3 shadow-lg ${isDark ? 'shadow-black/20 bg-slate-900/80' : 'shadow-indigo-500/5'}`
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-300 rounded-full animate-pulse" />
                    </div>
                    <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <span className="gradient-text">Auriance</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={(e) => {
                                const targetId = link.href.replace('#', '');
                                const element = document.getElementById(targetId);

                                if (element) {
                                    e.preventDefault();
                                    element.scrollIntoView({ behavior: 'smooth' });
                                    return;
                                }

                                if (onNavigate) {
                                    e.preventDefault();
                                    onNavigate(targetId);
                                }
                            }}
                            className={`text-sm font-medium transition-colors relative group ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 group-hover:w-full" />
                        </a>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                            <Globe className="w-4 h-4" />
                            <span className="text-sm font-medium">{currentLanguage}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {isLangMenuOpen && (
                            <div className={`absolute top-full right-0 mt-2 w-48 max-h-80 overflow-y-auto rounded-xl shadow-xl animate-in fade-in zoom-in border custom-scrollbar ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-100'}`}>
                                {AVAILABLE_LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            changeLanguage(lang.code);
                                            setIsLangMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${currentLanguage === lang.code
                                            ? (isDark ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600')
                                            : (isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50')
                                            }`}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="font-medium">{lang.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {currentUser ? (
                        <button
                            onClick={onNavigateToDashboard}
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 transition-opacity font-medium gap-2 shadow-lg shadow-indigo-500/25 px-4 py-2 rounded-lg text-white flex items-center"
                        >
                            <Sparkles className="w-4 h-4" />
                            {t('nav.dashboard')}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => onNavigateToLogin && onNavigateToLogin()}
                                className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                {t('nav.login')}
                            </button>
                            <Link
                                to="/inscription"
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 transition-opacity font-medium gap-2 shadow-lg shadow-indigo-500/25 px-4 py-2 rounded-lg text-white inline-flex items-center"
                            >
                                <Sparkles className="w-4 h-4" />
                                {t('home.hero.cta_demo')}
                            </Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu (Simplified for brevity, but should use translations too) */}
            <div
                className={`md:hidden absolute top-full left-0 right-0 border-t overflow-hidden transition-all duration-300 ${isMobileMenuOpen
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                    } ${isDark ? 'glass border-white/10 bg-slate-900/90' : 'glass border-gray-200 bg-white/90'}`}
            >
                <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-2">
                    {navLinks.map((link) => (
                        <a key={link.href} href={link.href} className={`py-3 px-4 rounded-lg text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{link.label}</a>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;