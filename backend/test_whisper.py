import whisper
import torch

print("🔧 Test Whisper...")
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA disponible: {torch.cuda.is_available()}")

# Charger le modèle tiny (rapide)
model = whisper.load_model("tiny")
print("✅ Whisper tiny chargé avec succès!")

# Test avec un petit fichier si disponible
import os
if os.path.exists("test.wav"):
    print("🎵 Transcription test.wav...")
    result = model.transcribe("test.wav")
    print(f"Texte transcrit: {result['text'][:100]}...")
else:
    print("⚠️ Pas de test.wav trouvé - OK pour le moment")
