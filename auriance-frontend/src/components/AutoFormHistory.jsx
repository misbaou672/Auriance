import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    FileText,
    Download,
    Trash2,
    Calendar,
    Clock,
    ChevronRight,
    X,
    Activity,
    Leaf,
    HardHat,
} from 'lucide-react';

// TODO: Remplacer par de vrais appels API quand les endpoints seront créés
// import { getAutoForms, deleteAutoForm, exportAutoFormPdf } from '../services/api';

const typeConfig = {
    medical: { icon: Activity, color: '#10b981', label: 'Santé', bgColor: 'bg-emerald-50' },
    biodiversity: { icon: Leaf, color: '#06b6d4', label: 'Biodiversité', bgColor: 'bg-cyan-50' },
    construction: { icon: HardHat, color: '#f59e0b', label: 'Chantier', bgColor: 'bg-amber-50' },
};

export default function AutoFormHistory({ onClose }) {
    const [forms, setForms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterType, setFilterType] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            // TODO: Remplacer par l'appel API réel
            // const data = await getAutoForms(100);

            // Données de démo pour l'instant
            await new Promise(resolve => setTimeout(resolve, 500));
            const demoData = [
                {
                    id: 1,
                    type: 'medical',
                    fields: {
                        'Patient': 'Jean Dupont',
                        'Âge': '45 ans',
                        'Motif': 'Migraine sévère',
                        'Diagnostic': 'Migraine ophtalmique',
                        'Prescription': 'Triptan 50mg'
                    },
                    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    language: 'fr-FR',
                },
                {
                    id: 2,
                    type: 'biodiversity',
                    fields: {
                        'Espèce': 'Mésange bleue',
                        'Nombre': '3',
                        'Localisation': 'Parc Nord, chêne centenaire',
                        'Comportement': 'Nidification',
                        'Météo': 'Ensoleillé, 18°C'
                    },
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    language: 'fr-FR',
                },
                {
                    id: 3,
                    type: 'construction',
                    fields: {
                        'Projet': 'Tour Horizon',
                        'Avancement': '60%',
                        'Problème': 'Retard livraison béton',
                        'Prochaine étape': 'Coulage dalle 3ème étage vendredi'
                    },
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    language: 'fr-FR',
                },
            ];
            setForms(demoData);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce formulaire ?')) return;

        try {
            // TODO: Remplacer par l'appel API réel
            // await deleteAutoForm(id);
            setForms(prev => prev.filter(f => f.id !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleExportPdf = async (item) => {
        try {
            // TODO: Remplacer par l'appel API réel
            // const blob = await exportAutoFormPdf(item);
            alert('Export PDF à implémenter avec l\'API');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erreur lors de l\'export PDF');
        }
    };

    const filteredForms = forms.filter(f => {
        const fieldsText = Object.values(f.fields).join(' ').toLowerCase();
        const matchesSearch = fieldsText.includes(searchQuery.toLowerCase());
        const matchesType = !filterType || f.type === filterType;
        return matchesSearch && matchesType;
    });

    const formatRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days === 1) return 'Hier';
        if (days < 7) return `Il y a ${days} jours`;
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50 p-8 -m-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Historique des{' '}
                            <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                Formulaires
                            </span>
                        </h1>
                        <p className="text-slate-500 mt-1">Retrouvez et gérez tous vos formulaires auto-générés</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>{forms.length} formulaires</span>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher dans les formulaires..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                    </div>

                    {/* Type Filters */}
                    <div className="flex gap-2">
                        {Object.entries(typeConfig).map(([type, config]) => {
                            const Icon = config.icon;
                            const isActive = filterType === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(isActive ? null : type)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${isActive
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden md:inline text-sm font-medium">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex gap-6">
                    {/* List */}
                    <div className="flex-1 space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredForms.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">Aucun formulaire trouvé</p>
                                    </motion.div>
                                ) : (
                                    filteredForms.map((item, index) => {
                                        const config = typeConfig[item.type];
                                        const Icon = config.icon;
                                        const isSelected = selectedItem?.id === item.id;
                                        const previewText = Object.entries(item.fields).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' • ');

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setSelectedItem(item)}
                                                className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg ${isSelected
                                                        ? 'border-slate-300 shadow-lg ring-2 ring-slate-200'
                                                        : 'border-slate-200/60 hover:border-slate-300'
                                                    }`}
                                                style={{
                                                    borderLeftWidth: 4,
                                                    borderLeftColor: config.color,
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                                                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-slate-900">
                                                                Formulaire #{item.id}
                                                            </span>
                                                            <span className="text-xs text-slate-400">
                                                                {formatRelativeDate(item.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 line-clamp-2">{previewText}</p>
                                                        <div className="flex items-center gap-3 mt-3">
                                                            <span
                                                                className="text-xs px-2 py-1 rounded-full font-medium"
                                                                style={{ backgroundColor: `${config.color}15`, color: config.color }}
                                                            >
                                                                {config.label}
                                                            </span>
                                                            <span className="text-xs text-slate-400">
                                                                {Object.keys(item.fields).length} champs
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight
                                                        className={`w-5 h-5 text-slate-300 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''
                                                            }`}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Detail Panel */}
                    <AnimatePresence>
                        {selectedItem && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: 400 }}
                                exit={{ opacity: 0, x: 20, width: 0 }}
                                className="hidden lg:block"
                            >
                                <div className="sticky top-8 bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                                    {/* Header */}
                                    <div className="p-6 border-b border-slate-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-slate-900">
                                                Formulaire #{selectedItem.id}
                                            </h3>
                                            <button
                                                onClick={() => setSelectedItem(null)}
                                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Meta */}
                                        <div className="flex flex-wrap gap-2">
                                            <span
                                                className="text-xs px-3 py-1.5 rounded-full font-medium"
                                                style={{
                                                    backgroundColor: `${typeConfig[selectedItem.type].color}15`,
                                                    color: typeConfig[selectedItem.type].color,
                                                }}
                                            >
                                                {typeConfig[selectedItem.type].label}
                                            </span>
                                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                                                {selectedItem.language}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 max-h-96 overflow-y-auto">
                                        <div className="space-y-4">
                                            {Object.entries(selectedItem.fields).map(([label, value]) => (
                                                <div key={label} className="border-b border-slate-100 pb-3 last:border-0">
                                                    <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
                                                    <div className="text-sm text-slate-900">{value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 border-t border-slate-100 flex gap-3">
                                        <button
                                            onClick={() => handleExportPdf(selectedItem)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedItem.id)}
                                            className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
