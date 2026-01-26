"""
Service de transcription multi-moteurs (Whisper, Silero, Vosk)
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import os

router = APIRouter()

# Importer les bibliothèques si installées
try:
    import whisper
except ImportError:
    whisper = None
try:
    import torch
except ImportError:
    torch = None
try:
    import vosk
except ImportError:
    vosk = None
try:
    import soundfile as sf
except ImportError:
    sf = None
try:
    import silero
except ImportError:
    silero = None

@router.post("/stt/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    engine: Optional[str] = "whisper"
):
    """Transcrit un fichier audio avec le moteur choisi"""
    # Sauvegarder temporairement
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    result = None
    try:
        if engine == "whisper" and whisper:
            model = whisper.load_model("base")
            result = model.transcribe(temp_path)
            text = result["text"]
        elif engine == "vosk" and vosk:
            from vosk import Model, KaldiRecognizer
            import wave
            wf = wave.open(temp_path, "rb")
            model = Model(lang="fr")
            rec = KaldiRecognizer(model, wf.getframerate())
            text = ""
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if rec.AcceptWaveform(data):
                    res = rec.Result()
                    text += res
            text += rec.FinalResult()
        elif engine == "silero" and silero:
            # Placeholder: Silero STT Python API n'est pas standard, à adapter selon install
            text = "[Silero non implémenté ici]"
        else:
            raise HTTPException(status_code=400, detail="Aucun moteur STT valide trouvé")
    finally:
        os.remove(temp_path)
    return {"text": text, "engine": engine}
