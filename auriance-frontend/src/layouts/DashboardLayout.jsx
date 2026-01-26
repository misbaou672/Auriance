import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Mic,
    Clock,
    Settings,
    LogOut,
    LayoutDashboard,
    FileText
} from 'lucide-react';

const DashboardLayout = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Tableau de bord', path: '/app/dashboard' },
        { icon: Mic, label: 'Nouvelle Session', path: '/app/workstation' },
        { icon: Clock, label: 'Historique', path: '/app/history' },
        // { icon: FileText, label: 'Modèles', path: '/app/templates' },
        { icon: Settings, label: 'Paramètres', path: '/app/settings' },
    ];

    return (
        <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">

            {/* Sidebar Latérale */}
            <aside className="w-64 bg-neutral-900 border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Auriance</h1>
                            <p className="text-xs text-neutral-400">Workspace Pro</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
                        Menu Principal
                    </div>

                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-white'}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Déconnexion</span>
                    </button>

                    <div className="mt-4 flex items-center gap-3 px-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-black">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.username || 'Utilisateur'}</p>
                            <p className="text-xs text-neutral-500 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto relative bg-neutral-950">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
