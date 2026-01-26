import sys
import keyboard
import pyautogui
import threading
from flask import Flask
import requests
import tempfile
import pyaudio
import wave
import os

class AurianceSystemService:
    """Service d'intégration système comme Handy"""
    
    def __init__(self, server_url="http://localhost:5000"):
        self.server_url = server_url
        self.is_listening = False
        self.audio = pyaudio.PyAudio()
        self.setup_global_hotkey()
    
    def setup_global_hotkey(self):
        """Définir le raccourci global (Ctrl+Espace)"""
        keyboard.add_hotkey('ctrl+space', self.toggle_listening)
        print("🎤 Raccourci activé: Ctrl+Espace pour parler")
    
    def toggle_listening(self):
        """Activer/désactiver l'écoute"""
        if not self.is_listening:
            self.start_listening()
        else:
            self.stop_listening()
    
    def start_listening(self):
        """Démarrer l'enregistrement"""
        print("🔴 Enregistrement... Parlez maintenant")
        self.is_listening = True
        threading.Thread(target=self.record_and_transcribe).start()
    
    def stop_listening(self):
        """Arrêter l'enregistrement"""
        print("⏹️ Arrêt enregistrement")
        self.is_listening = False
    
    def record_and_transcribe(self):
        """Enregistrer et transcrire"""
        # Configuration audio
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 16000
        CHUNK = 1024
        RECORD_SECONDS = 10  # Maximum 10 secondes
        
        stream = self.audio.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=RATE,
            input=True,
            frames_per_buffer=CHUNK
        )
        
        frames = []
        
        # Enregistrement
        for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
            if not self.is_listening:
                break
            data = stream.read(CHUNK)
            frames.append(data)
        
        stream.stop_stream()
        stream.close()
        
        if frames:
            self.process_audio(frames, FORMAT, CHANNELS, RATE)
    
    def process_audio(self, frames, format, channels, rate):
        """Traiter l'audio et insérer le texte"""
        # Sauvegarder en WAV
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            wf = wave.open(temp_file.name, 'wb')
            wf.setnchannels(channels)
            wf.setsampwidth(self.audio.get_sample_size(format))
            wf.setframerate(rate)
            wf.writeframes(b''.join(frames))
            wf.close()
            
            # Transcrire via votre API
            try:
                with open(temp_file.name, 'rb') as audio_file:
                    files = {'audio': audio_file}
                    response = requests.post(
                        f"{self.server_url}/api/auriance/transcribe", 
                        files=files
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if result['success']:
                            text = result['text']
                            print(f"📝 Transcris: {text}")
                            
                            # Insérer dans l'application active (comme Handy)
                            self.insert_text(text)
                        else:
                            print(f"❌ Erreur: {result.get('error', 'Unknown error')}")
                    else:
                        print(f"❌ HTTP Error: {response.status_code}")
            
            except Exception as e:
                print(f"❌ Erreur transcription: {e}")
            
            finally:
                # Nettoyer
                os.unlink(temp_file.name)
    
    def insert_text(self, text):
        """Insérer le texte dans l'application active"""
        try:
            # Simuler Ctrl+A (sélectionner tout) puis taper
            pyautogui.hotkey('ctrl', 'a')  # Sélectionner le texte existant
            pyautogui.write(text)  # Taper le nouveau texte
            print(f"✅ Texte inséré: {text}")
        except Exception as e:
            print(f"❌ Erreur insertion: {e}")

if __name__ == "__main__":
    service = AurianceSystemService()
    print("🚀 Service Auriance démarré. Appuyez sur Ctrl+Espace pour parler.")
    print("💡 Gardez la fenêtre ouverte en arrière-plan.")
    
    try:
        # Garder le programme actif
        keyboard.wait('esc')  # Échap pour quitter
    except KeyboardInterrupt:
        print("\n👋 Arrêt du service")