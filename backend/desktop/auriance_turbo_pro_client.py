# auriance_turbo_pro_client_optimized.py
import tkinter as tk
from tkinter import ttk, scrolledtext, font, messagebox
import sounddevice as sd
import numpy as np
import threading
import tempfile
import requests
import os
import keyboard
import time
import wave
import json
import socketio
from deep_translator import GoogleTranslator
from datetime import datetime

class AurianceTurboProOptimized:
    def __init__(self):
        self.recording = False
        self.streaming_mode = False
        self.frames = []
        self.recording_thread = None
        self.stop_event = threading.Event()
        self.sio = None
        self.streaming_text = ""
        
        # Fenêtre principale
        self.root = tk.Tk()
        self.root.title("🎤 Auriance TURBO PRO OPTIMIZED - Transcription en Temps Réel")
        self.root.geometry("900x700")
        self.root.configure(bg='#0f172a')
        
        # Variables
        self.mode_var = tk.StringVar(value="pro")
        self.lang_var = tk.StringVar(value="auto")
        self.transport_var = tk.StringVar(value="http")  # http ou websocket
        
        # Configuration
        self.server_url = "http://127.0.0.1:5000"
        self.ws_url = "ws://127.0.0.1:5000"
        self.translator = GoogleTranslator(source='auto', target='fr')
        
        # Setup
        self.setup_gui()
        self.setup_hotkeys()
        self.setup_websocket()
        
        # Vérifier le serveur
        self.check_server()
        
    def setup_gui(self):
        """Configuration de l'interface graphique optimisée"""
        # Header avec gradient moderne
        header_frame = tk.Frame(self.root, bg='#1e293b', height=120)
        header_frame.pack(fill=tk.X)
        header_frame.pack_propagate(False)
        
        # Titre principal
        title_label = tk.Label(header_frame, 
                              text="🎤 AURIANCE TURBO PRO OPTIMIZED",
                              font=('Segoe UI', 26, 'bold'),
                              fg='#60a5fa',
                              bg='#1e293b')
        title_label.pack(pady=(20, 5))
        
        # Sous-titre
        subtitle_label = tk.Label(header_frame,
                                 text="Transcription vocale en temps réel • 99+ langues • Silero VAD • PostgreSQL",
                                 font=('Segoe UI', 10),
                                 fg='#94a3b8',
                                 bg='#1e293b')
        subtitle_label.pack()
        
        # Badge de statut
        self.status_badge = tk.Label(header_frame,
                                    text="● CONNECTÉ",
                                    font=('Segoe UI', 9, 'bold'),
                                    fg='#10b981',
                                    bg='#1e293b')
        self.status_badge.pack(pady=5)
        
        # Contenu principal
        main_frame = tk.Frame(self.root, bg='#0f172a', padx=30, pady=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Panel de configuration avancée
        config_frame = tk.LabelFrame(main_frame,
                                    text=" ⚙️  CONFIGURATION AVANCÉE ",
                                    font=('Segoe UI', 12, 'bold'),
                                    bg='#1e293b',
                                    fg='#60a5fa',
                                    padx=20,
                                    pady=15,
                                    relief=tk.GROOVE,
                                    borderwidth=2)
        config_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Grille de configuration
        config_grid = tk.Frame(config_frame, bg='#1e293b')
        config_grid.pack(fill=tk.X)
        
        # Langue (liste étendue)
        lang_frame = tk.Frame(config_grid, bg='#1e293b')
        lang_frame.grid(row=0, column=0, padx=10, pady=5, sticky='w')
        
        tk.Label(lang_frame,
                text="🌍 Langue:",
                font=('Segoe UI', 10),
                fg='#cbd5e1',
                bg='#1e293b').pack(side=tk.LEFT, padx=(0, 10))
        
        # Liste de 99+ langues
        languages = [
            ("auto", "🔍 Auto-détection (99+ langues)"),
            ("fr", "🇫🇷 Français"),
            ("en", "🇺🇸 English"),
            ("es", "🇪🇸 Español"),
            ("de", "🇩🇪 Deutsch"),
            ("it", "🇮🇹 Italiano"),
            ("pt", "🇵🇹 Português"),
            ("ja", "🇯🇵 日本語"),
            ("ko", "🇰🇷 한국어"),
            ("zh", "🇨🇳 中文"),
            ("ru", "🇷🇺 Русский"),
            ("ar", "🇸🇦 العربية"),
            ("hi", "🇮🇳 हिन्दी"),
            ("nl", "🇳🇱 Nederlands"),
            ("tr", "🇹🇷 Türkçe"),
            ("pl", "🇵🇱 Polski"),
            ("sv", "🇸🇪 Svenska"),
            ("da", "🇩🇰 Dansk"),
            ("no", "🇳🇴 Norsk"),
            ("fi", "🇫🇮 Suomi"),
            ("vi", "🇻🇳 Tiếng Việt"),
            ("th", "🇹🇭 ไทย"),
            ("he", "🇮🇱 עברית"),
        ]
        
        self.lang_combobox = ttk.Combobox(lang_frame,
                                         textvariable=self.lang_var,
                                         values=[f"{code} - {name}" for code, name in languages],
                                         state="readonly",
                                         width=35,
                                         font=('Segoe UI', 10))
        self.lang_combobox.pack(side=tk.LEFT)
        self.lang_combobox.current(0)
        
        # Mode de transport
        transport_frame = tk.Frame(config_grid, bg='#1e293b')
        transport_frame.grid(row=0, column=1, padx=10, pady=5, sticky='w')
        
        tk.Label(transport_frame,
                text="📡 Transport:",
                font=('Segoe UI', 10),
                fg='#cbd5e1',
                bg='#1e293b').pack(side=tk.LEFT, padx=(0, 10))
        
        ttk.Radiobutton(transport_frame,
                       text="HTTP (Standard)",
                       variable=self.transport_var,
                       value="http").pack(side=tk.LEFT, padx=5)
        
        ttk.Radiobutton(transport_frame,
                       text="WebSocket (Streaming)",
                       variable=self.transport_var,
                       value="websocket").pack(side=tk.LEFT, padx=5)
        
        # Mode de transcription
        mode_frame = tk.Frame(config_grid, bg='#1e293b')
        mode_frame.grid(row=1, column=0, padx=10, pady=5, sticky='w')
        
        tk.Label(mode_frame,
                text="🎛️ Mode:",
                font=('Segoe UI', 10),
                fg='#cbd5e1',
                bg='#1e293b').pack(side=tk.LEFT, padx=(0, 10))
        
        ttk.Radiobutton(mode_frame,
                       text="Standard",
                       variable=self.mode_var,
                       value="standard").pack(side=tk.LEFT, padx=5)
        
        ttk.Radiobutton(mode_frame,
                       text="PRO (Silero VAD)",
                       variable=self.mode_var,
                       value="pro").pack(side=tk.LEFT, padx=5)
        
        # Boutons d'action
        action_frame = tk.Frame(config_grid, bg='#1e293b')
        action_frame.grid(row=1, column=1, padx=10, pady=5, sticky='w')
        
        self.stream_toggle_btn = tk.Button(action_frame,
                                          text="▶️ Démarrer Streaming",
                                          font=('Segoe UI', 10, 'bold'),
                                          bg='#3b82f6',
                                          fg='white',
                                          command=self.toggle_streaming,
                                          width=20)
        self.stream_toggle_btn.pack(side=tk.LEFT, padx=5)
        
        self.test_btn = tk.Button(action_frame,
                                 text="🧪 Tester API",
                                 font=('Segoe UI', 10),
                                 bg='#8b5cf6',
                                 fg='white',
                                 command=self.test_api,
                                 width=15)
        self.test_btn.pack(side=tk.LEFT, padx=5)
        
        # Bouton d'enregistrement principal
        self.record_btn = tk.Button(main_frame,
                                   text="🎤  DÉMARRER L'ENREGISTREMENT  (Ctrl + Espace)",
                                   font=('Segoe UI', 14, 'bold'),
                                   bg='#10b981',
                                   fg='white',
                                   activebackground='#059669',
                                   activeforeground='white',
                                   height=2,
                                   width=50,
                                   cursor='hand2',
                                   relief=tk.FLAT,
                                   command=self.toggle_record)
        self.record_btn.pack(pady=(10, 15))
        
        # Indicateurs de performance en temps réel
        perf_frame = tk.Frame(main_frame, bg='#0f172a')
        perf_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.latency_label = tk.Label(perf_frame,
                                     text="⏱️ Latence: -- ms",
                                     font=('Segoe UI', 10),
                                     fg='#60a5fa',
                                     bg='#0f172a')
        self.latency_label.pack(side=tk.LEFT, padx=20)
        
        self.lang_detected_label = tk.Label(perf_frame,
                                           text="🌍 Langue: --",
                                           font=('Segoe UI', 10),
                                           fg='#60a5fa',
                                           bg='#0f172a')
        self.lang_detected_label.pack(side=tk.LEFT, padx=20)
        
        self.confidence_label = tk.Label(perf_frame,
                                        text="🎤 Confiance: --%",
                                        font=('Segoe UI', 10),
                                        fg='#60a5fa',
                                        bg='#0f172a')
        self.confidence_label.pack(side=tk.LEFT, padx=20)
        
        # Zone de résultats avec onglets
        notebook = ttk.Notebook(main_frame)
        notebook.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Onglet Transcription
        transcribe_frame = tk.Frame(notebook, bg='#1e293b')
        notebook.add(transcribe_frame, text="📝 Transcription")
        
        self.result_text = scrolledtext.ScrolledText(transcribe_frame,
                                                    height=20,
                                                    wrap=tk.WORD,
                                                    font=('Consolas', 11),
                                                    bg='#0f172a',
                                                    fg='#e2e8f0',
                                                    relief=tk.FLAT,
                                                    padx=15,
                                                    pady=15)
        self.result_text.pack(fill=tk.BOTH, expand=True)
        
        # Onglet Entités extraites
        entities_frame = tk.Frame(notebook, bg='#1e293b')
        notebook.add(entities_frame, text="🏷️ Entités extraites")
        
        self.entities_text = scrolledtext.ScrolledText(entities_frame,
                                                      height=20,
                                                      wrap=tk.WORD,
                                                      font=('Consolas', 11),
                                                      bg='#0f172a',
                                                      fg='#e2e8f0',
                                                      relief=tk.FLAT,
                                                      padx=15,
                                                      pady=15)
        self.entities_text.pack(fill=tk.BOTH, expand=True)
        
        # Onglet Statistiques
        stats_frame = tk.Frame(notebook, bg='#1e293b')
        notebook.add(stats_frame, text="📊 Statistiques")
        
        self.stats_text = scrolledtext.ScrolledText(stats_frame,
                                                   height=20,
                                                   wrap=tk.WORD,
                                                   font=('Consolas', 11),
                                                   bg='#0f172a',
                                                   fg='#e2e8f0',
                                                   relief=tk.FLAT,
                                                   padx=15,
                                                   pady=15)
        self.stats_text.pack(fill=tk.BOTH, expand=True)
        
        # Footer
        footer_frame = tk.Frame(self.root, bg='#1e293b', height=50)
        footer_frame.pack(fill=tk.X, side=tk.BOTTOM)
        footer_frame.pack_propagate(False)
        
        server_info = f"📍  Serveur: {self.server_url}  |  🎤  Modèle: Whisper Tiny  |  🔊  VAD: Silero  |  🗄️  PostgreSQL"
        tk.Label(footer_frame,
                text=server_info,
                font=('Segoe UI', 9),
                fg='#94a3b8',
                bg='#1e293b').pack(pady=15)
        
        # Instructions initiales
        self.show_welcome_message()
        
        print("✅ Interface TURBO PRO OPTIMIZED initialisée")
        
    def setup_websocket(self):
        """Configurer la connexion WebSocket"""
        try:
            self.sio = socketio.Client()
            
            @self.sio.event
            def connect():
                print("✅ WebSocket connecté")
                self.root.after(0, lambda: self.update_status("● STREAMING CONNECTÉ", '#10b981'))
            
            @self.sio.event
            def stream_update(data):
                print(f"📡 Données streaming: {data}")
                self.root.after(0, lambda: self.handle_stream_data(data))
            
            @self.sio.event
            def connected(data):
                print(f"🔌 Connecté: {data}")
            
            @self.sio.event
            def disconnect():
                print("❌ WebSocket déconnecté")
                self.root.after(0, lambda: self.update_status("● DÉCONNECTÉ", '#ef4444'))
            
        except Exception as e:
            print(f"⚠️ WebSocket non disponible: {e}")
            self.sio = None
            
    def handle_stream_data(self, data):
        """Traiter les données de streaming en temps réel"""
        if data.get('type') == 'transcription':
            text = data.get('text', '')
            confidence = data.get('confidence', 0)
            entities = data.get('entities', [])
            
            # Mettre à jour l'interface
            current_text = self.result_text.get(1.0, tk.END).strip()
            if "TRANSCRIPTION EN STREAMING" not in current_text:
                self.result_text.delete(1.0, tk.END)
                self.result_text.insert(tk.END, "🎤 TRANSCRIPTION EN STREAMING (temps réel)\n")
                self.result_text.insert(tk.END, "=" * 50 + "\n\n")
            
            self.result_text.insert(tk.END, f"{text} ")
            self.result_text.see(tk.END)
            
            # Mettre à jour les indicateurs
            self.confidence_label.config(text=f"🎤 Confiance: {confidence*100:.1f}%")
            
            # Afficher les entités extraites
            if entities:
                self.entities_text.delete(1.0, tk.END)
                for entity in entities:
                    self.entities_text.insert(tk.END, 
                        f"• [{entity.get('type', 'N/A').upper()}] {entity.get('value', 'N/A')}\n")
        
    def setup_hotkeys(self):
        """Configurer les raccourcis clavier"""
        try:
            keyboard.add_hotkey('ctrl+space', self.start_record)
            keyboard.add_hotkey('esc', self.stop_record)
            keyboard.add_hotkey('ctrl+s', self.toggle_streaming)
            print("✅ Raccourcis configurés: Ctrl+Espace, Échap, Ctrl+S")
        except Exception as e:
            print(f"⚠️ Erreur raccourcis: {e}")
            
    def check_server(self):
        """Vérifier la connexion au serveur"""
        try:
            response = requests.get(f"{self.server_url}/api/health", timeout=3)
            if response.status_code == 200:
                data = response.json()
                model = data.get('model', 'N/A')
                vad = "Silero" if data.get('vad_available') else "Basic"
                self.update_status(f"● CONNECTÉ ({model}, {vAD})", '#10b981')
                print(f"✅ Serveur: {data.get('status')}, VAD: {vad}")
            else:
                self.update_status("● SERVEUR LIMITÉ", '#f59e0b')
        except:
            self.update_status("● SERVEUR HORS LIGNE", '#ef4444')
            
    def update_status(self, text, color):
        """Mettre à jour le badge de statut"""
        self.status_badge.config(text=text, fg=color)
        self.root.update()
            
    def show_welcome_message(self):
        """Afficher le message de bienvenue"""
        welcome_text = """🚀 AURIANCE TURBO PRO - VERSION OPTIMISÉE
══════════════════════════════════════════════════════════════════

NOUVELLES FONCTIONNALITÉS :
• 🎤 Transcription en temps réel (WebSocket)
• 🔊 Silero VAD - Détection parole professionnelle
• 🌍 99+ langues supportées (Whisper Multilingue)
• ⚡ Whisper Tiny - Ultra rapide (< 2 secondes)
• 🏷️ Extraction automatique d'entités (noms, dates, emails...)
• 🗄️ Sauvegarde PostgreSQL + Statistiques

MODES DISPONIBLES :
1. Mode HTTP - Envoi fichier complet (standard)
2. Mode WebSocket - Streaming temps réel (avancé)

RACCORCIS :
• Ctrl + Espace : Démarrer/Arrêter l'enregistrement
• Échap : Arrêter l'enregistrement
• Ctrl + S : Basculer mode streaming

══════════════════════════════════════════════════════════════════
🎯 PRÊT À TRANSCRIRE - Choisissez votre mode et parlez !
"""
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, welcome_text)
        
    def toggle_streaming(self):
        """Basculer le mode streaming WebSocket"""
        if not self.sio:
            messagebox.showwarning("WebSocket non disponible", 
                                 "La bibliothèque socketio n'est pas installée.\n"
                                 "Installez avec: pip install python-socketio")
            return
            
        if not self.sio.connected:
            try:
                self.sio.connect(self.ws_url)
                self.stream_toggle_btn.config(text="⏹️ Arrêter Streaming", bg='#ef4444')
                self.update_status("● STREAMING ACTIF", '#10b981')
            except Exception as e:
                messagebox.showerror("Erreur connexion", f"Impossible de se connecter:\n{e}")
        else:
            self.sio.disconnect()
            self.stream_toggle_btn.config(text="▶️ Démarrer Streaming", bg='#3b82f6')
            self.update_status("● STREAMING ARRÊTÉ", '#6b7280')
            
    def test_api(self):
        """Tester l'API avec un fichier de test"""
        try:
            # Créer un fichier audio test
            sample_rate = 16000
            duration = 2.0
            t = np.linspace(0, duration, int(sample_rate * duration))
            audio_data = (32767 * 0.3 * np.sin(2 * np.pi * 440 * t)).astype(np.int16)
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
                temp_path = f.name
                with wave.open(temp_path, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)
                    wav_file.setframerate(sample_rate)
                    wav_file.writeframes(audio_data.tobytes())
            
            # Envoyer au serveur
            with open(temp_path, 'rb') as audio_file:
                start_time = time.time()
                response = requests.post(f"{self.server_url}/api/transcribe_pro",
                                        files={'audio': audio_file},
                                        data={'language': 'fr'},
                                        timeout=10)
                processing_time = time.time() - start_time
                
                if response.status_code == 200:
                    result = response.json()
                    messagebox.showinfo("Test API Réussi",
                                      f"✅ Transcription réussie !\n\n"
                                      f"Texte: {result.get('text', 'N/A')}\n"
                                      f"Temps: {processing_time:.2f}s\n"
                                      f"Langue: {result.get('detected_language', 'N/A')}")
                else:
                    messagebox.showerror("Erreur API", f"Code: {response.status_code}\n{response.text}")
            
            # Nettoyer
            os.unlink(temp_path)
            
        except Exception as e:
            messagebox.showerror("Erreur Test", f"Erreur lors du test:\n{e}")
            
    def start_record(self):
        """Démarrer l'enregistrement audio"""
        if self.recording:
            return
            
        self.recording = True
        self.frames = []
        self.stop_event.clear()
        
        # Mettre à jour l'interface
        self.record_btn.config(
            text="⏹️  ENREGISTREMENT EN COURS...  (Appuyez sur Échap)",
            bg='#ef4444',
            activebackground='#dc2626'
        )
        
        self.update_status("● ENREGISTREMENT...", '#f59e0b')
        
        # Effacer et afficher le statut
        self.result_text.delete(1.0, tk.END)
        recording_status = f"""🎤  ENREGISTREMENT EN COURS
══════════════════════════════════════════════════════════════════

CONFIGURATION :
• Mode: {"PRO (Silero VAD)" if self.mode_var.get() == "pro" else "Standard"}
• Langue: {self.lang_var.get().split(' - ')[1] if ' - ' in self.lang_var.get() else self.lang_var.get()}
• Transport: {"WebSocket Streaming" if self.transport_var.get() == "websocket" else "HTTP"}

INSTRUCTIONS :
1. Parlez clairement dans votre microphone
2. Le système détecte automatiquement la parole
3. Parlez pendant au moins 2-3 secondes
4. Appuyez sur [Échap] pour arrêter

STATUT : ●  ENREGISTREMENT ACTIF  ●

══════════════════════════════════════════════════════════════════
"""
        self.result_text.insert(tk.END, recording_status)
        
        # Démarrer l'enregistrement
        self.recording_thread = threading.Thread(target=self.record_audio)
        self.recording_thread.daemon = True
        self.recording_thread.start()
        
    def record_audio(self):
        """Enregistrer l'audio depuis le microphone"""
        try:
            samplerate = 16000
            channels = 1
            
            def audio_callback(indata, frames, time_info, status):
                if status:
                    print(f"⚠️ Status audio: {status}")
                if self.recording:
                    # En mode streaming WebSocket, envoyer immédiatement
                    if self.transport_var.get() == "websocket" and self.sio and self.sio.connected:
                        audio_data = (indata * 32767).astype(np.int16).tobytes()
                        # Encoder en base64 pour WebSocket
                        import base64
                        audio_b64 = base64.b64encode(audio_data).decode('utf-8')
                        self.sio.emit('audio_stream', {'audio': audio_b64})
                    
                    # Toujours sauvegarder pour le mode HTTP
                    audio_data = (indata * 32767).astype(np.int16).tobytes()
                    self.frames.append(audio_data)
            
            # Configuration de l'entrée audio
            with sd.InputStream(
                samplerate=samplerate,
                channels=channels,
                callback=audio_callback,
                blocksize=1024,  # Blocs plus petits pour streaming
                dtype='float32'
            ):
                while self.recording and not self.stop_event.is_set():
                    time.sleep(0.1)
                    
        except Exception as e:
            error_msg = f"Erreur microphone: {str(e)}"
            print(f"❌ {error_msg}")
            self.root.after(0, lambda: self.show_error(error_msg))
            
    def stop_record(self):
        """Arrêter l'enregistrement"""
        if not self.recording:
            return
            
        self.recording = False
        self.stop_event.set()
        
        if self.recording_thread and self.recording_thread.is_alive():
            self.recording_thread.join(timeout=2.0)
            
        # Réinitialiser le bouton
        self.record_btn.config(
            text="🎤  DÉMARRER L'ENREGISTREMENT  (Ctrl + Espace)",
            bg='#10b981',
            activebackground='#059669'
        )
        
        # Vérifier la longueur
        total_bytes = len(b''.join(self.frames)) if self.frames else 0
        if total_bytes < 16000:  # 1 seconde minimum
            self.update_status("● AUDIO TROP COURT", '#ef4444')
            self.result_text.insert(tk.END, f"\n\n⚠️  Audio trop court ({total_bytes} octets)\n")
            return
            
        # Si mode WebSocket, on a déjà streamé
        if self.transport_var.get() == "websocket" and self.sio and self.sio.connected:
            self.update_status("● STREAMING TERMINÉ", '#10b981')
            self.result_text.insert(tk.END, "\n\n✅ Streaming terminé\n")
            return
            
        # Mode HTTP : envoyer le fichier complet
        self.update_status("● TRANSCRIPTION...", '#f59e0b')
        threading.Thread(target=self.process_audio, daemon=True).start()
        
    def process_audio(self):
        """Traiter l'audio et l'envoyer au serveur (mode HTTP)"""
        temp_path = None
        try:
            print(f"🔊 Traitement audio: {len(self.frames)} trames")
            
            # Sauvegarder en fichier WAV
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as f:
                temp_path = f.name
                with wave.open(temp_path, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)
                    wav_file.setframerate(16000)
                    wav_file.writeframes(b''.join(self.frames))
            
            # Préparer les données
            with open(temp_path, 'rb') as audio_file:
                files = {'audio': audio_file}
                
                # Extraire le code langue
                lang_display = self.lang_var.get()
                if ' - ' in lang_display:
                    lang_code = lang_display.split(' - ')[0]
                else:
                    lang_code = lang_display
                
                data = {'language': lang_code}
                
                print(f"📤 Envoi à: {self.server_url}/api/transcribe_pro")
                print(f"📊 Taille: {os.path.getsize(temp_path)} octets")
                print(f"🌍 Langue: {lang_code}")
                
                # Envoyer
                start_time = time.time()
                response = requests.post(f"{self.server_url}/api/transcribe_pro", 
                                        files=files, 
                                        data=data, 
                                        timeout=30)
                processing_time = time.time() - start_time
                
                print(f"📥 Réponse: {response.status_code} ({processing_time:.2f}s)")
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result.get('success'):
                        # Mettre à jour l'interface
                        self.root.after(0, lambda: self.show_optimized_result(result, processing_time))
                    else:
                        error_msg = result.get('error', 'Erreur inconnue')
                        self.root.after(0, lambda: self.show_error(error_msg))
                else:
                    error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                    self.root.after(0, lambda: self.show_error(error_msg))
                    
        except requests.exceptions.Timeout:
            error_msg = "⏱️ Délai dépassé - Le serveur met trop de temps à répondre"
            self.root.after(0, lambda: self.show_error(error_msg))
        except Exception as e:
            error_msg = f"❌ Erreur: {str(e)}"
            print(f"💥 {error_msg}")
            self.root.after(0, lambda: self.show_error(error_msg))
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except:
                    pass
                    
    def show_optimized_result(self, result, proc_time):
        """Afficher les résultats optimisés"""
        try:
            text = result.get('text', '').strip()
            if not text:
                self.show_error("Aucun texte transcrit")
                return
            
            # Mettre à jour les indicateurs
            detected_lang = result.get('detected_language', 'N/A')
            confidence = result.get('confidence', 0)
            entities = result.get('entities', [])
            session_id = result.get('session_id', 'N/A')
            
            self.latency_label.config(text=f"⏱️ Latence: {proc_time*1000:.0f} ms")
            self.lang_detected_label.config(text=f"🌍 Langue: {detected_lang.upper()}")
            self.confidence_label.config(text=f"🎤 Confiance: {confidence*100:.1f}%")
            
            # Afficher transcription
            display_text = f"""✅  TRANSCRIPTION RÉUSSIE - MODE OPTIMISÉ
══════════════════════════════════════════════════════════════════

📊  PERFORMANCE :
• 🌍  Langue détectée : {detected_lang.upper()}
• 🎤  Confiance : {confidence*100:.1f}%
• ⚡  Temps de traitement : {proc_time:.2f} secondes
• 📝  Mots : {len(text.split())}
• 🔤  Caractères : {len(text)}
• 🆔  Session : {session_id}
• 🏷️  Entités détectées : {len(entities)}

══════════════════════════════════════════════════════════════════

📝  TEXTE TRANSCRIT :
──────────────────────────────────────────────────────────────────
{text}
──────────────────────────────────────────────────────────────────
"""
            
            if entities:
                display_text += f"""
🏷️  ENTITÉS EXTRACTES :
──────────────────────────────────────────────────────────────────
"""
                for entity in entities:
                    display_text += f"• [{entity.get('type', 'N/A').upper()}] {entity.get('value', 'N/A')}\n"
                display_text += "──────────────────────────────────────────────────────────────────\n"
            
            # Afficher dans l'interface
            self.result_text.delete(1.0, tk.END)
            self.result_text.insert(tk.END, display_text)
            
            # Afficher les entités dans l'onglet dédié
            self.entities_text.delete(1.0, tk.END)
            if entities:
                self.entities_text.insert(tk.END, "🏷️ ENTITÉS DÉTECTÉES :\n" + "="*40 + "\n\n")
                for entity in entities:
                    self.entities_text.insert(tk.END, 
                        f"• Type: {entity.get('type', 'N/A').upper()}\n"
                        f"  Valeur: {entity.get('value', 'N/A')}\n"
                        f"  Confiance: {entity.get('confidence', 0)*100:.1f}%\n"
                        f"{'-'*30}\n")
            
            # Récupérer les statistiques
            self.update_stats()
            
            self.update_status("● TRANSCRIPTION TERMINÉE", '#10b981')
            
        except Exception as e:
            print(f"⚠️ Erreur affichage: {e}")
            self.show_error(f"Erreur affichage: {str(e)}")
            
    def update_stats(self):
        """Mettre à jour les statistiques"""
        try:
            response = requests.get(f"{self.server_url}/api/stats", timeout=5)
            if response.status_code == 200:
                stats = response.json()
                
                stats_text = f"""📊  STATISTIQUES SYSTÈME
══════════════════════════════════════════════════════════════════

SYSTÈME :
• Modèle Whisper : {stats.get('system', {}).get('whisper_model', 'N/A')}
• Moteur VAD : {stats.get('system', {}).get('vad_engine', 'N/A')}
• Base de données : {stats.get('system', {}).get('database', 'N/A')}
• Statut : {stats.get('system', {}).get('status', 'N/A')}

STATISTIQUES :
• Transcriptons totales : {stats.get('total_transcriptions', 0)}
• Entités extraites : {stats.get('total_entities', 0)}
• Temps moyen : {stats.get('avg_processing_time', 0):.2f}s

LANGUES LES PLUS UTILISÉES :
"""
                for lang in stats.get('top_languages', []):
                    stats_text += f"• {lang.get('detected_language', 'N/A')} : {lang.get('count', 0)}\n"
                
                stats_text += "\n══════════════════════════════════════════════════════════════════\n"
                
                self.stats_text.delete(1.0, tk.END)
                self.stats_text.insert(tk.END, stats_text)
                
        except Exception as e:
            print(f"⚠️ Erreur stats: {e}")
            
    def show_error(self, error_message):
        """Afficher un message d'erreur"""
        error_display = f"""❌  ERREUR
══════════════════════════════════════════════════════════════════

{error_message}

══════════════════════════════════════════════════════════════════

🔧  DÉPANNAGE :
1. Vérifiez que le serveur tourne ({self.server_url})
2. Vérifiez votre microphone
3. Parlez plus fort et plus clairement
4. Enregistrez pendant au moins 3 secondes
5. Réduisez le bruit de fond

══════════════════════════════════════════════════════════════════
💡  Réessayez avec [Ctrl + Espace]
"""
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, error_display)
        
        self.update_status("● ERREUR", '#ef4444')
        
    def toggle_record(self):
        """Basculer entre démarrer/arrêter l'enregistrement"""
        if not self.recording:
            self.start_record()
        else:
            self.stop_record()
            
    def on_closing(self):
        """Gérer la fermeture de l'application"""
        self.recording = False
        self.stop_event.set()
        
        if self.sio and self.sio.connected:
            self.sio.disconnect()
            
        try:
            keyboard.unhook_all()
        except:
            pass
            
        self.root.destroy()
        
    def run(self):
        """Lancer l'application"""
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        # Centrer la fenêtre
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
        # Lancer la boucle principale
        self.root.mainloop()

if __name__ == "__main__":
    print("=" * 80)
    print("🎤  AURIANCE TURBO PRO CLIENT OPTIMIZED")
    print("=" * 80)
    print("📍  Connexion: http://127.0.0.1:5000")
    print("🎯  Raccourcis: Ctrl+Espace, Échap, Ctrl+S")
    print("🌍  Langues: 99+ avec auto-détection")
    print("⚡  Modes: HTTP Standard + WebSocket Streaming")
    print("🔊  VAD: Silero (détection parole professionnelle)")
    print("=" * 80)
    
    # Créer et lancer l'application
    app = AurianceTurboProOptimized()
    app.run()