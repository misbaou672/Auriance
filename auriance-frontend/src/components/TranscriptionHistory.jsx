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
    Mic,
} from 'lucide-react';
import { getTranscriptions, deleteTranscription, exportTranscriptionPdf } from '../services/api';

export default function TranscriptionHistory({ onClose }) {
    const [transcriptions, setTranscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await getTranscriptions(100);
            setTranscriptions(data);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette transcription ?')) return;

        try {
            await deleteTranscription(id);
            setTranscriptions(prev => prev.filter(t => t.id !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleExportPdf = async (item) => {
        try {
            const blob = await exportTranscriptionPdf(item.text, `Transcription #${item.id}`, item.language || 'fr');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transcription_${item.id}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erreur lors de l\'export PDF: ' + error.message);
        }
    };

    const filteredTranscriptions = transcriptions.filter(t =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
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
                            <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                Transcriptions
                            </span>
                        </h1>
                        <p className="text-slate-500 mt-1">Retrouvez et gérez toutes vos transcriptions</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>{transcriptions.length} transcriptions</span>
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
                        placeholder="Rechercher dans les transcriptions..."
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
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredTranscriptions.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-16"
                                    >
                                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">Aucune transcription trouvée</p>
                                    </motion.div>
                                ) : (
                                    filteredTranscriptions.map((item, index) => {
                                        const isSelected = selectedItem?.id === item.id;

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
                                                    borderLeftColor: '#6366f1',
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50">
                                                        <Mic className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-slate-900">
                                                                Transcription #{item.id}
                                                            </span>
                                                            <span className="text-xs text-slate-400">
                                                                {formatRelativeDate(item.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 line-clamp-2">{item.text}</p>
                                                        <div className="flex items-center gap-3 mt-3">
                                                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-indigo-50 text-indigo-600">
                                                                {item.language || 'fr-FR'}
                                                            </span>
                                                            {item.duration_seconds && (
                                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {item.duration_seconds.toFixed(0)}s
                                                                </span>
                                                            )}
                                                            {item.confidence_score && (
                                                                <span className="text-xs text-slate-400">
                                                                    {(item.confidence_score * 100).toFixed(0)}% confiance
                                                                </span>
                                                            )}
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
                                                Transcription #{selectedItem.id}
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
                                            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-indigo-50 text-indigo-600">
                                                {selectedItem.language || 'fr-FR'}
                                            </span>
                                            {selectedItem.confidence_score && (
                                                <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
                                                    {(selectedItem.confidence_score * 100).toFixed(0)}% confiance
                                                </span>
                                            )}
                                            {selectedItem.duration_seconds && (
                                                <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {selectedItem.duration_seconds.toFixed(0)}s
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <p className="text-slate-700 leading-relaxed font-serif">{selectedItem.text}</p>
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
