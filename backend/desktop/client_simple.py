# client_simple.py - CLIENT SANS PYAUDIO
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import requests
import threading
import time
from datetime import datetime

class SimpleAurianceClient:
    def __init__(self):
        self.server_url = "http://127.0.0.1:5000"
        
        # Interface
        self.root = tk.Tk()
        self.root.title("🎤 Auriance - Client Simple")
        self.root.geometry("800x600")
        self.root.configure(bg='#f8f9fa')
        
        self.setup_gui()
        self.check_server()
        
    def setup_gui(self):
        """Interface simple"""
        # Header
        header = tk.Frame(self.root, bg='#2e1d00', height=70)
        header.pack(fill=tk.X)
        
        tk.Label(header, 
                text="🎤 AURIANCE CLIENT SIMPLE",
                font=('Arial', 18, 'bold'),
                fg='white',
                bg='#2e1d00').pack(pady=15)
        
        # Contenu
        main = tk.Frame(self.root, bg='#f8f9fa', padx=20, pady=20)
        main.pack(fill=tk.BOTH, expand=True)
        
        # Instructions
        tk.Label(main,
                text="Ce client utilise le mode fichier :",
                font=('Arial', 11),
                bg='#f8f9fa').pack(pady=(0, 10))
        
        tk.Label(main,
                text="1. Enregistrez un fichier audio (.wav) avec un autre logiciel",
                font=('Arial', 10),
                bg='#f8f9fa',
                fg='#666666').pack(anchor='w')
        
        tk.Label(main,
                text="2. Cliquez sur 'Choisir fichier'",
                font=('Arial', 10),
                bg='#f8f9fa',
                fg='#666666').pack(anchor='w')
        
        tk.Label(main,
                text="3. Le fichier sera transcrit par le serveur",
                font=('Arial', 10),
                bg='#f8f9fa',
                fg='#666666').pack(anchor='w')
        
        # Bouton fichier
        self.file_btn = tk.Button(main,
                                 text="📁 CHOISIR UN FICHIER AUDIO",
                                 font=('Arial', 12, 'bold'),
                                 bg='#2e1d00',
                                 fg='white',
                                 height=2,
                                 width=30,
                                 command=self.select_file)
        self.file_btn.pack(pady=20)
        
        # Status
        self.status_label = tk.Label(main,
                                    text="Prêt...",
                                    font=('Arial', 11),
                                    bg='#f8f9fa',
                                    fg='#666666')
        self.status_label.pack(pady=5)
        
        # Résultats
        result_frame = tk.LabelFrame(main,
                                    text=" Résultat ",
                                    font=('Arial', 11, 'bold'),
                                    bg='white',
                                    fg='#2e1d00',
                                    padx=15,
                                    pady=15)
        result_frame.pack(fill=tk.BOTH, expand=True)
        
        self.result_text = scrolledtext.ScrolledText(result_frame,
                                                    height=15,
                                                    wrap=tk.WORD,
                                                    font=('Arial', 10),
                                                    bg='#fafafa',
                                                    relief=tk.FLAT)
        self.result_text.pack(fill=tk.BOTH, expand=True)
        
        # Message d'accueil
        welcome = """🎤 AURIANCE CLIENT SIMPLE

Ce client fonctionne avec des fichiers audio :
• Format recommandé : WAV, 16kHz, mono
• Taille max : 10MB
• Durée : 1-60 secondes

Instructions :
1. Enregistrez un fichier audio (.wav)
   (Utilisez l'enregistreur Windows ou un autre logiciel)
2. Cliquez sur "CHOISIR UN FICHIER AUDIO"
3. Sélectionnez votre fichier
4. La transcription apparaîtra ici

Le serveur doit tourner sur http://127.0.0.1:5000
"""
        self.result_text.insert(tk.END, welcome)
        
    def check_server(self):
        """Vérifier le serveur"""
        def check():
            try:
                r = requests.get(f"{self.server_url}/api/health", timeout=3)
                if r.status_code == 200:
                    self.update_status("✅ Serveur connecté", "#28a745")
                else:
                    self.update_status("⚠️ Serveur en erreur", "#ffc107")
            except:
                self.update_status("❌ Serveur non connecté", "#dc3545")
                
        threading.Thread(target=check, daemon=True).start()
        
    def update_status(self, text, color):
        self.root.after(0, lambda: self.status_label.config(text=text, fg=color))
        
    def select_file(self):
        """Sélectionner un fichier audio"""
        from tkinter import filedialog
        
        filepath = filedialog.askopenfilename(
            title="Sélectionnez un fichier audio",
            filetypes=[
                ("Fichiers audio", "*.wav *.mp3 *.ogg *.flac"),
                ("Tous les fichiers", "*.*")
            ]
        )
        
        if filepath:
            self.process_file(filepath)
            
    def process_file(self, filepath):
        """Traiter le fichier"""
        self.update_status("⚡ Envoi au serveur...", "#ff9800")
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, f"📁 Fichier: {filepath}\n")
        self.result_text.insert(tk.END, "Envoi au serveur en cours...\n\n")
        
        threading.Thread(target=self.send_to_server, args=(filepath,), daemon=True).start()
        
    def send_to_server(self, filepath):
        """Envoyer le fichier au serveur"""
        try:
            with open(filepath, 'rb') as audio_file:
                files = {'audio': audio_file}
                
                start = time.time()
                r = requests.post(f"{self.server_url}/api/transcribe",
                                 files=files,
                                 timeout=30)
                proc_time = time.time() - start
                
                if r.status_code == 200:
                    result = r.json()
                    if result.get('success'):
                        self.show_result(result, proc_time)
                    else:
                        self.show_error(result.get('error', 'Erreur inconnue'))
                else:
                    self.show_error(f"Erreur serveur: {r.status_code}")
                    
        except requests.exceptions.ConnectionError:
            self.show_error("Serveur non connecté")
        except Exception as e:
            self.show_error(f"Erreur: {str(e)[:100]}")
            
    def show_result(self, result, proc_time):
        """Afficher résultat"""
        text = result.get('text', '')
        display = f"""✅ TRANSCRIPTION RÉUSSIE
Temps: {proc_time:.2f}s

{text}

---
Informations:
• Langue: {result.get('language', 'N/A')}
• Timestamp: {result.get('timestamp', 'N/A')}
"""
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, display)
        self.update_status(f"✅ Transcription terminée", "#28a745")
        
    def show_error(self, message):
        """Afficher erreur"""
        error = f"""❌ ERREUR

{message}

Vérifiez que:
• Le serveur tourne (http://127.0.0.1:5000)
• Le fichier est un audio valide
• Le fichier n'est pas trop gros
"""
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, error)
        self.update_status("❌ Erreur", "#dc3545")
        
    def run(self):
        """Lancer l'application"""
        self.root.mainloop()

if __name__ == "__main__":
    print("=" * 60)
    print("🎤 AURIANCE CLIENT SIMPLE")
    print("=" * 60)
    print("Ce client fonctionne avec des fichiers audio.")
    print("Enregistrez d'abord un fichier .wav avec un autre logiciel.")
    print("=" * 60)
    
    app = SimpleAurianceClient()
    app.run()