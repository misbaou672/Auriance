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
    Sparkles,
    Copy,
    Check,
} from 'lucide-react';

// TODO: Remplacer par de vrais appels API quand les endpoints seront créés
// import { getGeneratedQueries, deleteGeneratedQuery, exportQueryPdf } from '../services/api';

export default function GeneratedQueriesHistory({ onClose }) {
    const [queries, setQueries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            // TODO: Remplacer par l'appel API réel
            // const data = await getGeneratedQueries(100);

            // Données de démo pour l'instant
            await new Promise(resolve => setTimeout(resolve, 500));
            const demoData = [
                {
                    id: 1,
                    query: "Quels sont les symptômes de la migraine ophtalmique ?",
                    context: "Patient Jean Dupont, 45 ans, consulte pour migraine sévère avec nausées.",
                    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    language: 'fr-FR',
                },
                {
                    id: 2,
                    query: "Quelle est la période de nidification des mésanges bleues ?",
                    context: "Observation de 3 mésanges bleues près du chêne centenaire dans le Parc Nord.",
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    language: 'fr-FR',
                },
                {
                    id: 3,
                    query: "Quelles sont les causes fréquentes de retard de livraison de béton ?",
                    context: "Chantier Tour Horizon : avancement à 60%. Retard de livraison béton signalé.",
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    language: 'fr-FR',
                },
                {
                    id: 4,
                    query: "Comment traiter les douleurs abdominales fonctionnelles ?",
                    context: "Patiente Marie Martin, 32 ans, douleurs abdominales. Examen clinique normal.",
                    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                    language: 'fr-FR',
                },
            ];
            setQueries(demoData);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette requête ?')) return;

        try {
            // TODO: Remplacer par l'appel API réel
            // await deleteGeneratedQuery(id);
            setQueries(prev => prev.filter(q => q.id !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(selectedItem.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Error copying:', error);
            alert('Erreur lors de la copie');
        }
    };

    const filteredQueries = queries.filter(q =>
        q.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.context.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                Requêtes Générées
                            </span>
                        </h1>
                        <p className="text-slate-500 mt-1">Retrouvez toutes vos requêtes générées par l'IA</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>{queries.length} requêtes</span>
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

                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher dans les requêtes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                </div>

                {/* Content */}
                <div className="flex gap-6">
                    {/* List */}
                    <div className="flex-1 space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredQueries.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">Aucune requête trouvée</p>
                                    </motion.div>
                                ) : (
                                    filteredQueries.map((item, index) => {
                                        const isSelected = selectedItem?.id === item.id;

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => setSelectedItem(item)}
                                                className={`cursor-pointer bg-white rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg ${isSelected
                                                        ? 'border-violet-300 shadow-lg ring-2 ring-violet-200'
                                                        : 'border-slate-200/60 hover:border-slate-300'
                                                    }`}
                                                style={{
                                                    borderLeftWidth: 4,
                                                    borderLeftColor: '#8b5cf6',
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-50">
                                                        <Sparkles className="w-5 h-5 text-violet-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-slate-900">
                                                                Requête #{item.id}
                                                            </span>
                                                            <span className="text-xs text-slate-400">
                                                                {formatRelativeDate(item.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-violet-700 font-medium mb-1 line-clamp-2">{item.query}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{item.context}</p>
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
                                                Requête #{selectedItem.id}
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
                                            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-violet-50 text-violet-600">
                                                IA Générée
                                            </span>
                                            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                                                {selectedItem.language}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <div className="text-xs font-medium text-slate-500 mb-2">Requête</div>
                                            <div className="text-sm text-violet-700 font-medium bg-violet-50 p-4 rounded-lg">
                                                {selectedItem.query}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-slate-500 mb-2">Contexte</div>
                                            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                                                {selectedItem.context}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 border-t border-slate-100 flex gap-3">
                                        <button
                                            onClick={() => handleCopy(selectedItem.query)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                                        >
                                            {copiedId === selectedItem.id ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copié !
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copier
                                                </>
                                            )}
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
