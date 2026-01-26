
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Send } from 'lucide-react';

const GlobalAIChat = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const recognitionRef = useRef(null);
    const audioRef = useRef(null);
    const scrollRef = useRef(null);

    // Initialisation
    useEffect(() => {
        // Message d'accueil
        setMessages([{
            role: 'assistant',
            text: "Bonjour, je suis Auriance. Comment puis-je vous aider aujourd'hui ?"
        }]);

        if (window.webkitSpeechRecognition) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false; // Le navigateur décide quand c'est fini (silence)
            recognition.lang = 'fr-FR';
            recognition.interimResults = true; // On garde pour voir ce qu'on dit

            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptObj = event.results[current][0];
                const text = transcriptObj.transcript;

                setTranscript(text);

                // On n'envoie que si c'est final ET qu'il y a du contenu substantiel
                if (event.results[current].isFinal) {
                    // Petite pause pour s'assurer que l'utilisateur a vraiment fini
                    setTimeout(() => {
                        handleSendMessage(text);
                    }, 500);
                }
            };

            recognition.onspeechend = () => {
                // L'utilisateur a arrêté de parler, le navigateur va bientôt envoyer 'onend'
                // On peut montrer un état "Analyse..."
            };

            recognition.onend = () => {
                setIsListening(false);
            };
            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleListening = () => {
        // Si l'IA parle, on la fait taire immédiatement quand on clique sur le micro
        if (isSpeaking && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            setTranscript('');
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Ajouter message utilisateur
        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setTranscript('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8090/api/auriance/voice/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, language: 'fr-FR' })
            });

            const data = await response.json();

            if (data.success) {
                // Ajouter réponse IA
                const aiMsg = { role: 'assistant', text: data.ai_text };
                setMessages(prev => [...prev, aiMsg]);

                // Jouer l'audio si disponible
                if (data.audio_url) {
                    setIsSpeaking(true);
                    if (audioRef.current) {
                        try {
                            const audioUrl = `http://localhost:8090${data.audio_url}?t=${Date.now()}`;
                            audioRef.current.src = audioUrl;
                            audioRef.current.load(); // Force le rechargement
                            const playPromise = audioRef.current.play();

                            if (playPromise !== undefined) {
                                playPromise.catch(e => {
                                    console.error("Erreur lecture audio:", e);
                                    setIsSpeaking(false);
                                });
                            }
                            audioRef.current.onended = () => setIsSpeaking(false);
                        } catch (e) {
                            console.error("Exception audio:", e);
                            setIsSpeaking(false);
                        }
                    }
                } else {
                    // Pas d'audio, on ne fait rien de spécial (le texte est déjà affiché)
                }
            } else {
                console.error("Erreur backend:", data);
                let errorText = "Je n'ai pas réussi à traiter votre demande.";
                if (data.detail) errorText += ` (${data.detail})`;
                setMessages(prev => [...prev, { role: 'system', text: errorText }]);
            }
        } catch (error) {
            console.error("Erreur chat:", error);
            setMessages(prev => [...prev, { role: 'system', text: "Désolé, une erreur est survenue." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] w-[450px] h-[700px] flex flex-col shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-white/20">
            <audio ref={audioRef} className="hidden" />

            <div className="flex-1 bg-black border border-white/10 flex flex-col relative h-full">

                {/* Header */}
                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-violet-900/90 to-cyan-900/90 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-600 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xs font-bold text-white tracking-wide">AURIANCE</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-red-500/20 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-black/95">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl backdrop-blur-md border text-sm ${msg.role === 'user'
                                ? 'bg-white/10 border-white/20 text-white rounded-tr-none'
                                : 'bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border-violet-500/30 text-white/90 rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1.5">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-4 border-t border-white/10 bg-black/90 backdrop-blur-xl">
                    {/* Visualizer (Fake) */}
                    {(isListening || isSpeaking) && (
                        <div className="flex justify-center items-center gap-1 h-6 mb-3">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-0.5 bg-gradient-to-t from-cyan-500 to-violet-500 rounded-full transition-all duration-75 ease-in-out`}
                                    style={{
                                        height: `${Math.random() * 100}%`,
                                        animation: 'pulse 0.5s infinite alternate'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    <div className="relative">
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder={isListening ? "Écoute..." : "Message..."}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-3 pr-24 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none h-12 scrollbar-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(transcript);
                                }
                            }}
                        />
                        <div className="absolute right-1.5 top-1.5 flex gap-1.5">
                            <button
                                onClick={toggleListening}
                                className={`p-2 rounded-xl transition-all ${isListening
                                    ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => handleSendMessage(transcript)}
                                disabled={!transcript.trim()}
                                className="p-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalAIChat;
