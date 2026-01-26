# auriance_client.py - CLIENT STREAMING COMPLET
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import pyaudio
import socketio
import base64
import threading
import time
import numpy as np
from datetime import datetime

class AurianceStreamingClient:
    def __init__(self):
        self.recording = False
        self.streaming = False
        self.sio = None
        
        # Configuration audio
        self.CHUNK = 1024
        self.FORMAT = pyaudio.paInt16
        self.CHANNELS = 1
        self.RATE = 16000
        
        # Configuration serveur
        self.server_url = "ws://127.0.0.1:5000"
        
        # Interface
        self.root = tk.Tk()
        self.root.title("🎤 Auriance - Streaming Vocal")
        self.root.geometry("800x600")
        self.root.configure(bg='#f5f7fa')
        
        self.setup_gui()
        self.setup_audio()
        self.setup_websocket()
        
    def setup_gui(self):
        """Interface utilisateur"""
        # Header
        header = tk.Frame(self.root, bg='#2e1d00', height=80)
        header.pack(fill=tk.X)
        
        tk.Label(header,
                text="🎤 AURIANCE - PARLEZ, C'EST TRANSCRIT",
                font=('Arial', 16, 'bold'),
                fg='white',
                bg='#2e1d00').pack(pady=20)
        
        # Contenu principal
        main = tk.Frame(self.root, bg='#f5f7fa', padx=20, pady=20)
        main.pack(fill=tk.BOTH, expand=True)
        
        # Instructions
        instructions = tk.LabelFrame(main,
                                    text=" Instructions ",
                                    font=('Arial', 10, 'bold'),
                                    bg='white',
                                    fg='#2e1d00',
                                    padx=15,
                                    pady=15)
        instructions.pack(fill=tk.X, pady=(0, 15))
        
        tk.Label(instructions,
                text="1. Cliquez sur 'PARLER'",
                font=('Arial', 9),
                bg='white').pack(anchor='w')
        tk.Label(instructions,
                text="2. Parlez normalement dans votre micro",
                font=('Arial', 9),
                bg='white').pack(anchor='w')
        tk.Label(instructions,
                text="3. La transcription apparaît en temps réel",
                font=('Arial', 9),
                bg='white').pack(anchor='w')
        tk.Label(instructions,
                text="4. Cliquez sur 'ARRÊTER' quand vous avez fini",
                font=('Arial', 9),
                bg='white').pack(anchor='w')
        
        # Bouton principal
        self.record_btn = tk.Button(main,
                                   text="🎤 PARLER",
                                   font=('Arial', 14, 'bold'),
                                   bg='#2e1d00',
                                   fg='white',
                                   activebackground='#3a2a1f',
                                   activeforeground='white',
                                   height=2,
                                   width=30,
                                   cursor='hand2',
                                   command=self.toggle_streaming)
        self.record_btn.pack(pady=20)
        
        # Timer
        self.timer_label = tk.Label(main,
                                   text="00:00",
                                   font=('Arial', 24, 'bold'),
                                   bg='#f5f7fa',
                                   fg='#2e1d00')
        self.timer_label.pack(pady=5)
        
        # Statut
        self.status_label = tk.Label(main,
                                    text="Prêt à parler...",
                                    font=('Arial', 11),
                                    bg='#f5f7fa',
                                    fg='#666666')
        self.status_label.pack(pady=5)
        
        # Zone de transcription en direct
        live_frame = tk.LabelFrame(main,
                                  text=" Transcription en direct ",
                                  font=('Arial', 11, 'bold'),
                                  bg='white',
                                  fg='#2e1d00',
                                  padx=15,
                                  pady=15)
        live_frame.pack(fill=tk.X, pady=(10, 5))
        
        self.live_text = tk.Text(live_frame,
                                height=4,
                                wrap=tk.WORD,
                                font=('Arial', 10),
                                bg='#fff3cd',
                                fg='#856404',
                                relief=tk.FLAT,
                                padx=10,
                                pady=10)
        self.live_text.pack(fill=tk.X)
        self.live_text.insert(tk.END, "Votre transcription apparaîtra ici en temps réel...")
        self.live_text.config(state='disabled')
        
        # Journal complet
        journal_frame = tk.LabelFrame(main,
                                     text=" Journal complet ",
                                     font=('Arial', 11, 'bold'),
                                     bg='white',
                                     fg='#2e1d00',
                                     padx=15,
                                     pady=15)
        journal_frame.pack(fill=tk.BOTH, expand=True)
        
        self.journal_text = scrolledtext.ScrolledText(journal_frame,
                                                     height=10,
                                                     wrap=tk.WORD,
                                                     font=('Arial', 10),
                                                     bg='#fafafa',
                                                     relief=tk.FLAT,
                                                     padx=10,
                                                     pady=10)
        self.journal_text.pack(fill=tk.BOTH, expand=True)
        
        # Message initial
        self.journal_text.insert(tk.END, f"Démarrage: {datetime.now().strftime('%H:%M:%S')}\n")
        self.journal_text.insert(tk.END, "=" * 50 + "\n\n")
        
    def setup_audio(self):
        """Configurer l'audio"""
        try:
            self.audio = pyaudio.PyAudio()
            print("✅ Audio configuré")
        except Exception as e:
            messagebox.showerror("Erreur Audio", f"Microphone non disponible: {e}")
            self.audio = None
            
    def setup_websocket(self):
        """Configurer WebSocket"""
        self.sio = socketio.Client()
        
        @self.sio.event
        def connect():
            print("✅ Connecté au serveur")
            self.update_status("✅ Connecté", "#28a745")
            
        @self.sio.event
        def transcription(data):
            """Reçoit une transcription"""
            text = data.get('text', '').strip()
            if text:
                # Mettre à jour l'interface
                self.root.after(0, self.update_transcription, text, data.get('partial', False))
                
        @self.sio.event
        def disconnect():
            print("❌ Déconnecté du serveur")
            self.update_status("❌ Déconnecté", "#dc3545")
            
    def connect_websocket(self):
        """Se connecter au WebSocket"""
        if not self.sio.connected:
            try:
                self.sio.connect('http://127.0.0.1:5000')
                return True
            except Exception as e:
                print(f"❌ Erreur connexion: {e}")
                self.update_status("❌ Serveur non connecté", "#dc3545")
                return False
        return True
        
    def update_transcription(self, text, is_partial):
        """Mettre à jour la transcription"""
        # Zone en direct
        self.live_text.config(state='normal')
        self.live_text.delete(1.0, tk.END)
        self.live_text.insert(tk.END, text)
        self.live_text.config(state='disabled')
        
        # Journal complet (seulement les transcriptions finales)
        if not is_partial:
            timestamp = datetime.now().strftime("%H:%M:%S")
            self.journal_text.insert(tk.END, f"[{timestamp}] {text}\n")
            self.journal_text.see(tk.END)
            
    def update_status(self, text, color):
        """Mettre à jour le statut"""
        self.status_label.config(text=text, fg=color)
        
    def toggle_streaming(self):
        """Démarrer/arrêter le streaming"""
        if not self.recording:
            self.start_streaming()
        else:
            self.stop_streaming()
            
    def start_streaming(self):
        """Démarrer le streaming"""
        if not self.audio:
            messagebox.showerror("Erreur", "Microphone non disponible")
            return
            
        # Connecter au WebSocket
        if not self.connect_websocket():
            return
            
        self.recording = True
        self.streaming = True
        self.start_time = time.time()
        
        # Mettre à jour l'interface
        self.record_btn.config(
            text="⏹️ ARRÊTER",
            bg='#dc3545',
            activebackground='#c82333'
        )
        self.update_status("🔴 Enregistrement en cours...", "#dc3545")
        
        # Effacer la zone en direct
        self.live_text.config(state='normal')
        self.live_text.delete(1.0, tk.END)
        self.live_text.insert(tk.END, "Parlez maintenant...")
        self.live_text.config(state='disabled')
        
        # Ajouter au journal
        self.journal_text.insert(tk.END, f"\n--- Session démarrée ---\n")
        
        # Démarrer le timer
        self.update_timer()
        
        # Démarrer le thread de streaming
        self.stream_thread = threading.Thread(target=self.stream_audio, daemon=True)
        self.stream_thread.start()
        
    def stream_audio(self):
        """Streamer l'audio au serveur"""
        try:
            # Ouvrir le stream audio
            stream = self.audio.open(
                format=self.FORMAT,
                channels=self.CHANNELS,
                rate=self.RATE,
                input=True,
                frames_per_buffer=self.CHUNK
            )
            
            print("🎤 Streaming audio démarré")
            
            while self.streaming:
                try:
                    # Lire l'audio
                    data = stream.read(self.CHUNK, exception_on_overflow=False)
                    
                    # Encoder en base64
                    audio_b64 = base64.b64encode(data).decode('utf-8')
                    
                    # Envoyer au serveur
                    self.sio.emit('stream_audio', {'audio': audio_b64})
                    
                except Exception as e:
                    print(f"❌ Erreur audio: {e}")
                    break
                    
            # Fermer le stream
            stream.stop_stream()
            stream.close()
            print("🛑 Streaming audio arrêté")
            
        except Exception as e:
            print(f"❌ Erreur streaming: {e}")
            self.root.after(0, lambda: messagebox.showerror("Erreur", f"Microphone: {str(e)[:100]}"))
            
    def stop_streaming(self):
        """Arrêter le streaming"""
        self.recording = False
        self.streaming = False
        
        # Arrêter le WebSocket
        if self.sio and self.sio.connected:
            self.sio.emit('stream_stop')
            
        # Mettre à jour l'interface
        self.record_btn.config(
            text="🎤 PARLER",
            bg='#2e1d00',
            activebackground='#3a2a1f'
        )
        self.update_status("✅ Prêt", "#28a745")
        
        # Ajouter au journal
        duration = int(time.time() - self.start_time)
        self.journal_text.insert(tk.END, f"--- Session terminée ({duration}s) ---\n\n")
        
        # Effacer la zone en direct
        self.live_text.config(state='normal')
        self.live_text.delete(1.0, tk.END)
        self.live_text.insert(tk.END, "Cliquez sur PARLER pour recommencer...")
        self.live_text.config(state='disabled')
        
    def update_timer(self):
        """Mettre à jour le timer"""
        if self.recording:
            elapsed = int(time.time() - self.start_time)
            minutes = elapsed // 60
            seconds = elapsed % 60
            self.timer_label.config(text=f"{minutes:02d}:{seconds:02d}")
            self.root.after(1000, self.update_timer)
        else:
            self.timer_label.config(text="00:00")
            
    def on_closing(self):
        """Fermeture de l'application"""
        self.streaming = False
        self.recording = False
        
        if self.sio and self.sio.connected:
            self.sio.disconnect()
            
        if self.audio:
            self.audio.terminate()
            
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
        
        self.root.mainloop()

# Installation vérification
if __name__ == "__main__":
    print("=" * 60)
    print("🎤 AURIANCE - STREAMING VOCAL")
    print("=" * 60)
    print("Instructions:")
    print("1. Assurez-vous que le serveur tourne")
    print("2. Cliquez sur PARLER")
    print("3. Parlez normalement")
    print("4. La transcription apparaît en temps réel")
    print("=" * 60)
    
    # Vérifier les dépendances
    try:
        import pyaudio
    except ImportError:
        print("❌ PyAudio non installé")
        print("Installez avec: python -m pip install pyaudio")
        input("Appuyez sur Entrée pour quitter...")
        exit(1)
        
    try:
        import socketio
    except ImportError:
        print("❌ SocketIO non installé")
        print("Installez avec: python -m pip install python-socketio")
        input("Appuyez sur Entrée pour quitter...")
        exit(1)
    
    # Lancer l'application
    app = AurianceStreamingClient()
    app.run()