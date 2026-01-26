import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    const footerLinks = {
        product: {
            title: t('footer.product') || 'Produit',
            links: [
                { label: t('nav.features'), href: '#features' },
                { label: t('nav.pricing'), href: '#pricing' },
                { label: t('security.badge') || 'Sécurité', href: '#security' },
                { label: t('nav.faq'), href: '#faq' },
                { label: 'API', href: '/api-docs' },
            ],
        },
        company: {
            title: t('footer.company') || 'Entreprise',
            links: [
                { label: t('footer.about') || 'À propos', href: '/about' },
                { label: t('footer.blog') || 'Blog', href: '/blog' },
                { label: t('footer.careers') || 'Carrières', href: '/careers' },
                { label: t('footer.press') || 'Presse', href: '/press' },
                { label: t('nav.contact'), href: '#contact' },
            ],
        },
        legal: {
            title: t('footer.legal') || 'Légal',
            links: [
                { label: t('footer.legal_mentions') || 'Mentions légales', href: '/legal' },
                { label: t('footer.terms') || 'CGU', href: '/terms' },
                { label: t('footer.privacy') || 'Confidentialité', href: '/privacy' },
                { label: 'RGPD', href: '/gdpr' },
                { label: 'Cookies', href: '/cookies' },
            ],
        },
        support: {
            title: t('footer.support') || 'Support',
            links: [
                { label: t('footer.help_center') || "Centre d'aide", href: '/help' },
                { label: t('nav.docs'), href: '/docs' },
                { label: 'Status', href: 'https://status.auriance.com' },
                { label: t('footer.community') || 'Communauté', href: '/community' },
            ],
        },
    };

    const socialLinks = [
        { icon: Twitter, href: 'https://twitter.com/auriance', label: 'Twitter' },
        { icon: Linkedin, href: 'https://linkedin.com/company/auriance', label: 'LinkedIn' },
        { icon: Github, href: 'https://github.com/auriance', label: 'GitHub' },
        { icon: Mail, href: 'mailto:contact@auriance.com', label: 'Email' },
    ];

    return (
        <footer id="contact" className="bg-gray-900 text-white pt-20 pb-8">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 pb-12 border-b border-white/10">
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                                <Mic className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">Auriance</span>
                        </Link>
                        <p className="text-white/60 mb-6 max-w-xs leading-relaxed">
                            {t('footer.description') || "La voix devient votre assistant intelligent. Transcription IA et génération de documents pour tous les professionnels."}
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([key, section]) => (
                        <div key={key}>
                            <h3 className="font-semibold mb-4">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-white/60 hover:text-white transition-colors text-sm"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/40 text-sm">
                        © {new Date().getFullYear()} Auriance. {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-white/40">
                        <span>Made with love in France</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>v1.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}