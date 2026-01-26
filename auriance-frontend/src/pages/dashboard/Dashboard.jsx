import React from 'react';
import { Clock, Activity, FileText, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
    const navigate = useNavigate();

    // Données simulées pour l'exemple
    const stats = [
        { label: 'Rapports générés', value: '12', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Temps économisé', value: '4h 30', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Sessions actives', value: '1', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ];

    const recentActivity = [
        { id: 1, title: 'Consultation - Mme Dupont', date: 'Il y a 2 heures', type: 'Cardiologie' },
        { id: 2, title: 'Compte rendu chantier B', date: 'Hier, 14:30', type: 'BTP' },
        { id: 3, title: 'Note vocale rapide', date: 'Hier, 09:15', type: 'Mémo' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Bonjour, {user?.username || 'Expert'} 👋</h1>
                    <p className="text-neutral-400">Voici ce qui se passe sur votre espace de travail aujourd'hui.</p>
                </div>
                <button
                    onClick={() => navigate('/app/workstation')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nouvelle Transcription
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} p-3 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-medium text-neutral-500 bg-white/5 px-2 py-1 rounded-full">+12% cette semaine</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-neutral-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Activité Récente</h2>
                        <button
                            onClick={() => navigate('/app/history')}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                        >
                            Voir tout <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium group-hover:text-indigo-300 transition-colors">{item.title}</h3>
                                        <p className="text-sm text-neutral-500">{item.type} • {item.date}</p>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-5 h-5 text-neutral-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Passez à la vitesse supérieure</h3>
                        <p className="text-indigo-100 text-sm mb-4 relative z-10">Débloquez les modèles personnalisés et l'export illimité avec le plan Pro.</p>
                        <button className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors relative z-10">
                            Voir les offres
                        </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">État du système</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400">Serveur API</span>
                                <span className="flex items-center gap-2 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Opérationnel</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-400">Base Vectorielle</span>
                                <span className="flex items-center gap-2 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Connecté</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
