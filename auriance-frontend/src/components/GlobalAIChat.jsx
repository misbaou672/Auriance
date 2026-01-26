import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, LifeBuoy, Terminal } from 'lucide-react';

// 🧠 CERVEAU DE L'ASSISTANT (Mode Naturel & Contexte Projet)
const KNOWLEDGE_BASE = [
    {
        keywords: ['bio-scan', 'bioscan', 'biocan', 'bonhomme', 'visuel', 'corps'],
        response: "C'est notre système de visualisation 3D. En gros, dès que vous citez une partie du corps (genre 'mal au genou'), elle s'allume en temps réel sur le mannequin. C'est super pour avoir un aperçu rapide des symptômes."
    },
    {
        keywords: ['eco', 'ecoscan', 'plante', 'arbre', 'nature'],
        response: "Ah, l'Eco-Scan ! C'est le même principe que pour le corps humain, mais pour les plantes. Si vous parlez de 'racines' ou de 'feuilles', l'arbre réagit. On a ajouté ça pour montrer que notre algo marche sur n'importe quel domaine, pas juste la santé."
    },
    {
        keywords: ['comment', 'marche', 'fonctionne', 'principe', 'logique'],
        response: "Le principe est simple : votre voix est captée par le navigateur, transcrite en texte instantanément, et mon algorithme analyse ce texte en direct pour détecter des mots-clés. Ensuite, on envoie tout ça au backend Python qui structure les données pour les sauvegarder proprement."
    },
    {
        keywords: ['transcri', 'micro', 'voix', 'parler'],
        response: "Pour transcrire, vous avez juste à cliquer sur le gros bouton micro. Je m'occupe du reste. Je gère même les silences pour couper les phrases intelligemment."
    },
    {
        keywords: ['pdf', 'export', 'rapport', 'sauver'],
        response: "Pas de souci, tout est dans l'Historique. Vous pouvez cliquer sur un dossier et générer un PDF propre avec toutes les infos extraites. C'est pratique pour l'archivage."
    },
    {
        keywords: ['bug', 'marche pas', 'galère', 'planté', 'soucis'],
        response: "Mince... Ça arrive. Essayez déjà de rafraîchir la page (F5), souvent ça règle le problème de connexion au micro. Si ça persiste, vérifiez que vous avez bien autorisé l'accès au micro dans votre navigateur."
    },
    {
        keywords: ['tech', 'stack', 'dev', 'codé', 'react', 'python'],
        response: "Côté technique, on est sur du solide : React et Vite pour l'interface (super rapide), Tailwind pour le design, et du Python derrière pour l'intelligence. C'est une architecture moderne."
    },
    {
        keywords: ['qui es tu', 't\'es qui', 'ton nom', 'présente toi'],
        response: "Je suis l'IA d'Auriance. Je suis là pour vous assister et vous expliquer comment tout ça fonctionne. Je connais le projet par ❤."
    },
    {
        keywords: ['bonjour', 'salut', 'hello', 'yo', 'coucou', 'hillo'],
        response: "Salut ! 👋 Je suis là si vous avez besoin d'aide ou si vous avez une question sur le projet. N'hésitez pas."
    },
    {
        keywords: ['ca va', 'ça va', 'forme'],
        response: "Toujours opérationnel ! Prêt à analyser de la data. Et vous, tout roule ?"
    },
    {
        keywords: ['merci', 'super', 'cool', 'top', 'génial'],
        response: "Avec plaisir ! Si vous avez d'autres questions, je suis dans le coin."
    }
];

export default function GlobalAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Bonjour ! Je suis l'assistant du projet. Je peux vous expliquer comment ça marche ou vous aider si vous êtes bloqué. Dites-moi tout !" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Algorithme de recherche de réponse "Naturelle"
    const findBestResponse = (userInput) => {
        const lowerInput = userInput.toLowerCase();

        // 1. Recherche directe dans la base de connaissance
        const match = KNOWLEDGE_BASE.find(entry =>
            entry.keywords.some(keyword => lowerInput.includes(keyword))
        );

        if (match) return match.response;

        // 2. Réponses par défaut plus naturelles (Fallback)
        if (lowerInput.length < 3) return "Oui ?";
        if (lowerInput.includes('?')) return "Bonne question... Pour être honnête, je devrais vérifier dans le code source. Mais en général, tout se passe dans l'Historique ou les Paramètres.";

        return "Je vois. Je peux vous aider à naviguer si vous voulez. Demandez-moi par exemple 'Comment marche le Bio-Scan ?' ou 'J'ai un bug'.";
    };

    // Algorithme Hybride : API Gemini -> Fallback Local
    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        const newMessages = [...messages, { role: 'user', content: userMsg }];

        setMessages(newMessages);
        setInput("");
        setIsTyping(true);

        try {
            // 1. TENTATIVE VIA API BACKEND (GEMINI)
            const response = await fetch('http://localhost:8090/api/auriance/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'assistant',
                        content: typeof m.content === 'string' ? m.content : "Info visuelle"
                    })),
                    model: "gemini-1.5-pro"
                })
            });

            const data = await response.json();

            if (response.ok && data.role) {
                // Succès API
                setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
            } else {
                throw new Error("API Error or Missing Key");
            }

        } catch (error) {
            console.warn("⚠️ API Gemini indisponible, passage en mode Expert Local:", error);

            // 2. FALLBACK : CERVEAU LOCAL (Si pas d'internet ou pas de clé)
            // Simulation délai
            setTimeout(() => {
                const localResponse = findBestResponse(userMsg);
                // On ajoute un petit disclaimer debug si en mode dev
                // const debugPrefix = "(Mode Hors-Ligne) "; 
                setMessages(prev => [...prev, { role: 'assistant', content: localResponse }]);
            }, 1000);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* FAB Button (Toujours visible avec effet pulsation si inactif) */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 ${isOpen ? 'bg-rose-500 rotate-90 text-white' : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : (
                    <div className="relative">
                        <Bot className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    </div>
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className="fixed bottom-24 right-6 w-[380px] h-[600px] z-[59] rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-xl bg-slate-900/95 flex flex-col font-sans"
                    >
                        {/* Header Premium */}
                        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-violet-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner border border-white/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base tracking-wide">Assistant Auriance</h3>
                                    <div className="flex items-center gap-1.5 opacity-90">
                                        <Terminal className="w-3 h-3 text-emerald-300" />
                                        <span className="text-emerald-300 text-[10px] font-mono font-medium uppercase tracking-wider">v2.1 (Neural)</span>
                                    </div>
                                </div>
                            </div>
                            <LifeBuoy className="w-5 h-5 text-white/50 hover:text-white cursor-pointer transition-colors" title="Aide" />
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/30">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none'
                                            : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-2xl rounded-tl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800/50 border border-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1.5">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-slate-950/50">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez une question..."
                                    className="w-full bg-slate-900 text-white pl-4 pr-12 py-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder-slate-500 shadow-inner"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                }
            `}</style>
        </>
    );
}
