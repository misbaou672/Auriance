from fastapi import Body
from fastapi.responses import FileResponse
import tempfile
"""Routes API AURIANCE - Points d'entrée pour la plateforme vocale intelligente."""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import logging
import os
import tempfile
import uuid

from app.services.whisper_service import WhisperService
from app.services.nlp_service import NLPService
from app.services.query_generation_service import QueryGenerationService
from app.services.report_generation_service import ReportGenerationService
from app.services.rag_service import rag_service
from app.services.rag_service import rag_service
from app.services.language_service import get_language_service
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.user import User
from app.schemas import TranscriptionExportRequest # Import ajouté

logger = logging.getLogger(__name__)

# Initialiser les services
whisper_service = WhisperService()
nlp_service = NLPService()
query_service = QueryGenerationService()
report_service = ReportGenerationService()

router = APIRouter(prefix="/api/auriance", tags=["AURIANCE Core"])

# === Endpoint PDF ===
from fastapi import Body
from fastapi.responses import StreamingResponse
import io

@router.post("/save-pdf")
async def save_pdf(
    data: Dict[str, Any] = Body(...)
):
    """
    Génère un PDF médical à partir des données fournies (champs, titre, etc.).
    """
    try:
        # data doit contenir { title: ..., content: [ {label, value}... ] } ou { fields: ... }
        # Le report_service._format_as_pdf est maintenant capable de gérer ça dynamiquement.
        pdf_bytes = report_service._format_as_pdf(data)
        
        safe_title = "consultation"
        if "title" in data:
             safe_title = "".join(c for c in data["title"] if c.isalnum() or c in (' ', '-', '_')).rstrip().replace(' ', '_')
             
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename={safe_title}.pdf"
        })
    except Exception as e:
        logger.error(f"❌ Erreur génération PDF: {e}")
        raise HTTPException(500, f"Erreur PDF: {str(e)}")


@router.post("/export-transcription-pdf")
async def export_transcription_pdf(
    request: TranscriptionExportRequest
):
    """
    Génère un PDF premium avec un style unique par domaine (Santé, Bio, Chantier, Live).
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.colors import HexColor, white, black, grey
        from io import BytesIO
        from datetime import datetime

        # Extraction des données
        text = request.text
        title = request.title
        language = request.language
        # Normalisation du type pour correspondre aux clés de couleur
        raw_type = (request.type or "live").lower().strip()
        
        # Mapping ULTRA-ROBUSTE
        type_mapping = {
            "medical": "medical", "sante": "medical", "santé": "medical", "health": "medical", "patient": "medical",
            "biodiversity": "biodiversity", "biodiversite": "biodiversity", "biodiversité": "biodiversity", "bio": "biodiversity", "espece": "biodiversity", "espèce": "biodiversity",
            "construction": "construction", "chantier": "construction", "work": "construction", "projet": "construction", "btp": "construction",
            "live": "live", "transcription": "live"
        }
        
        doc_type = type_mapping.get(raw_type, "live")
        
        # SI TOUJOURS "LIVE", ON TENTE UNE DÉTECTION PAR MOTS-CLÉS DANS LE TITRE OU LE TEXTE
        if doc_type == "live":
            content_lower = (title + " " + text).lower()
            if any(k in content_lower for k in ["patient", "symptôme", "diagnostic", "santé", "médical"]):
                doc_type = "medical"
            elif any(k in content_lower for k in ["espèce", "biodiversité", "faune", "flore", "observation"]):
                doc_type = "biodiversity"
            elif any(k in content_lower for k in ["chantier", "travaux", "projet", "construction", "btp"]):
                doc_type = "construction"
        
        logger.info(f"🎨 PDF STYLE - Reçu: '{raw_type}' | Détecté: '{doc_type}'")
        
        # Configuration des couleurs
        COLORS = {
            "medical": HexColor("#10b981"),      # Vert Émeraude
            "biodiversity": HexColor("#06b6d4"), # Cyan
            "construction": HexColor("#f59e0b"), # Ambre/Orange
            "live": HexColor("#8b5cf6")          # Violet
        }
        main_color = COLORS.get(doc_type, COLORS["live"])
        
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        
        # --- EN-TÊTE PREMIUM ---
        # Bande de couleur latérale ou supérieure
        c.setFillColor(main_color)
        c.rect(0, height - 80, width, 80, fill=1, stroke=0)
        
        # Logo Texte "AURIANCE" dans l'en-tête
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(40, height - 50, "AURIANCE")
        
        # Type de document à droite
        type_labels = {
            "medical": "RAPPORT DE SANTÉ",
            "biodiversity": "OBSERVATION BIODIVERSITÉ",
            "construction": "RAPPORT DE CHANTIER",
            "live": "TRANSCRIPTION LIVE"
        }
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(width - 40, height - 48, type_labels.get(doc_type, "DOCUMENT"))
        c.setFont("Helvetica", 8)
        c.drawRightString(width - 40, height - 62, "PLATEFORME AURIANCE INTELLIGENTE")

        # --- CONTENU ---
        # Nettoyage du titre si commence par le domaine
        display_title = title
        prefixes = ["Santé - ", "Biodiversité - ", "Chantier - ", "Transcription Live - "]
        for prefix in prefixes:
            if display_title.startswith(prefix):
                display_title = display_title[len(prefix):]
        
        c.setFillColor(black)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(40, height - 130, display_title)
        
        # Metadata Box (Gris clair)
        c.setFillColorRGB(0.97, 0.97, 0.98)
        c.roundRect(40, height - 190, width - 80, 45, 5, fill=1, stroke=0)
        
        c.setFillColor(grey)
        c.setFont("Helvetica", 9)
        date_str = datetime.now().strftime("%d/%m/%Y à %H:%M")
        c.drawString(55, height - 165, f"DATE : {date_str}")
        c.drawString(55, height - 178, f"LANGUE : {language.upper()}")
        
        if request.duration:
            duration_str = f"{int(request.duration // 60)}:{int(request.duration % 60):02d}"
            c.drawRightString(width - 55, height - 165, f"DURÉE : {duration_str}")
        
        c.drawRightString(width - 55, height - 178, f"ID : {datetime.now().strftime('%Y%m%d%H%S')}")

        # Filigrane (Watermark) discret
        c.saveState()
        c.setFillColorRGB(0.9, 0.9, 0.9, alpha=0.1)
        c.setFont("Helvetica-Bold", 80)
        c.translate(width/2, height/2)
        c.rotate(45)
        c.drawCentredString(0, 0, "AURIANCE")
        c.restoreState()

        # --- TEXTE ET STRUCTURE ---
        y = height - 230
        c.setFillColor(black)
        
        # Analyse du texte : si contient des ":", on met les labels en gras
        lines = text.split('\n')
        for line in lines:
            if not line.strip():
                y -= 10
                continue
                
            if ":" in line:
                parts = line.split(":", 1)
                label = parts[0].strip() + " :"
                value = parts[1].strip()
                
                c.setFont("Helvetica-Bold", 11)
                c.setFillColor(main_color)
                c.drawString(40, y, label)
                
                # S'assurer que la valeur tient sur la ligne
                c.setFont("Helvetica", 11)
                c.setFillColor(black)
                label_width = c.stringWidth(label, "Helvetica-Bold", 11) + 5
                
                # Wrap long value
                max_val_width = width - 40 - label_width
                words = value.split()
                current_line = ""
                first_line = True
                
                for word in words:
                    test_line = current_line + word + " "
                    if c.stringWidth(test_line, "Helvetica", 11) < (max_val_width if first_line else width - 80):
                        current_line = test_line
                    else:
                        c.drawString(40 + (label_width if first_line else 20), y, current_line.strip())
                        y -= 16
                        current_line = word + " "
                        first_line = False
                        if y < 60:
                            c.showPage()
                            y = height - 60 # Sur nouvelle page
                
                c.drawString(40 + (label_width if first_line else 20), y, current_line.strip())
                y -= 22 # Espace après un bloc Label: Value
            else:
                # Texte normal (si pas de ":")
                c.setFont("Helvetica", 11)
                words = line.split()
                current_line = ""
                for word in words:
                    test_line = current_line + word + " "
                    if c.stringWidth(test_line, "Helvetica", 11) < width - 80:
                        current_line = test_line
                    else:
                        c.drawString(40, y, current_line.strip())
                        y -= 16
                        current_line = word + " "
                        if y < 60:
                            c.showPage()
                            y = height - 60
                c.drawString(40, y, current_line.strip())
                y -= 18

            # Vérification bas de page
            if y < 60:
                c.showPage()
                y = height - 60

        # Pied de page
        c.setStrokeColor(HexColor("#eeeeee"))
        c.line(40, 50, width - 40, 50)
        c.setFont("Helvetica", 8)
        c.setFillColor(grey)
        c.drawString(40, 38, "Document généré par l'IA Auriance - Propriété confidentielle")
        c.drawRightString(width - 40, 38, "Page 1/1")
        
        c.save()
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        # Nom de fichier
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_title = safe_title.replace(' ', '_')
        filename = f"Auriance_{doc_type.capitalize()}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        import traceback
        logger.error(f"❌ Erreur PDF: {e}\n{traceback.format_exc()}")
        raise HTTPException(500, f"Erreur PDF: {str(e)}")


@router.post("/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(..., description="Fichier audio à transcrire"),
    language: Optional[str] = Form(None, description="Code langue (fr, en, es, ar, zh...)")
):
    """
    ✅ ÉTAPE 1: Transcrire l'audio
    
    Reçoit un fichier audio et le transcrit avec Whisper.
    """
    try:
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(400, "Le fichier doit être un fichier audio")
        
        # Sauvegarder temporairement
        file_ext = os.path.splitext(audio_file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            temp_path = tmp.name
        
        content = await audio_file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Conversion audio (impératif pour Whisper/VAD si m4a)
        converted_path = whisper_service.convert_audio_format(temp_path)

        # Transcrire
        logger.info(f"Transcription de {audio_file.filename}...")
        result = await whisper_service.transcribe(converted_path, language=language)
        
        # Nettoyage
        for p in [temp_path, converted_path]:
            if os.path.exists(p):
                os.remove(p)
        
        return {
            "success": True,
            "transcription": result["text"],
            "language": result["language"],
            "confidence": result["confidence"],
            "file_name": audio_file.filename,
            "size": len(content)
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur transcription: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/transcribe-and-extract")
async def transcribe_and_extract(
    audio_file: UploadFile = File(...),
    language: Optional[str] = Form(None),
    fields: Optional[str] = Form(None, description="Champs à extraire (JSON)")
):
    """
    ✅ ÉTAPE 2: Transcrire + Extraire les infos
    
    Combine transcription et extraction NLP en une seule requête.
    Utile pour remplir des formulaires automatiquement.
    """
    try:
        # Étape 1: Transcrire
        file_ext = os.path.splitext(audio_file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            temp_path = tmp.name
        
        content = await audio_file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Conversion audio
        converted_path = whisper_service.convert_audio_format(temp_path)

        logger.info("Transcription + Extraction...")
        transcription_result = await whisper_service.transcribe(converted_path, language=language)
        text = transcription_result["text"]
        
        # Étape 2: Extraire les champs
        import json
        requested_fields = json.loads(fields) if fields else None
        extracted = await nlp_service.extract_fields(text, requested_fields)
        
        # Nettoyage
        for p in [temp_path, converted_path]:
            if os.path.exists(p):
                os.remove(p)
        
        return {
            "success": True,
            "transcription": text,
            "language": transcription_result["language"],
            "extracted_fields": extracted
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur transcription+extraction: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/generate-form-json")
async def generate_form_json(
    transcription: str = Form(..., description="Texte transcrit"),
    form_type: Optional[str] = Form(None, description="Type de formulaire")
):
    """
    ✅ ÉTAPE 3: Générer JSON pour formulaires
    
    Transforme la transcription en JSON pour remplir automatiquement des formulaires.
    
    Exemple: "Je m'appelle Jean, j'ai 30 ans" → {"name": "Jean", "age": "30"}
    """
    try:
        logger.info("Génération JSON formulaire...")
        
        form_schema = None
        if form_type:
            form_schema = {
                "type": form_type,
                "fields": ["name", "email", "phone", "age"]  # À adapter
            }
        
        form_json = await nlp_service.generate_form_json(transcription, form_schema)
        
        return {
            "success": True,
            "form_json": form_json
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur génération JSON: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/generate-sql-query")
async def generate_sql_query(
    intent: str = Form(..., description="Intention utilisateur"),
    context: Optional[str] = Form(None, description="Contexte (JSON)")
):
    """
    ✅ ÉTAPE 4: Générer requêtes SQL
    
    Transforme une intention en requête SQL exécutable.
    
    Exemple: "Afficher tous les projets sur la biodiversité"
    → SELECT * FROM projects WHERE content LIKE '%biodiversité%'
    """
    try:
        logger.info(f"Génération SQL pour: {intent}")
        
        import json
        extracted_fields = json.loads(context) if context else {}
        
        sql_result = await query_service.generate_sql(intent, extracted_fields)
        
        # Le service retourne un dict, on extrait la requête si possible
        sql_query = sql_result.get("query", "") if isinstance(sql_result, dict) else str(sql_result)
        
        return {
            "success": True,
            "sql": sql_query,
            "details": sql_result
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur génération SQL: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/generate-cypher-query")
async def generate_cypher_query(
    intent: str = Form(..., description="Intention utilisateur"),
    context: Optional[str] = Form(None, description="Contexte (JSON)")
):
    """
    ✅ ÉTAPE 4B: Générer requêtes Cypher (Neo4j)
    
    Transforme une intention en requête Cypher pour les graphes.
    
    Exemple: "Afficher les projets liés à la biodiversité"
    → MATCH (a:Project)-[r:RELATED_TO]->(b) RETURN a, r, b
    """
    try:
        logger.info(f"Génération Cypher pour: {intent}")
        
        import json
        extracted_fields = json.loads(context) if context else {}
        
        cypher_result = await query_service.generate_cypher(intent, extracted_fields)
        
        # Le service retourne un dict, on extrait la requête si possible
        cypher_query = cypher_result.get("query", "") if isinstance(cypher_result, dict) else str(cypher_result)
        
        return {
            "success": True,
            "cypher": cypher_query,
            "details": cypher_result
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur génération Cypher: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/rag-answer")
async def rag_answer(
    question: str = Form(..., description="Question utilisateur"),
    top_k: int = Form(5, description="Nombre de passages à récupérer"),
    language: Optional[str] = Form(None, description="Langue détectée (auto si None)"),
    translate_response: bool = Form(False, description="Traduire la réponse en langue originale"),
    response_language: Optional[str] = Form(None, description="Langue voulue pour la réponse (défaut: langue détectée)"),
):
    """
    🌍 Orchestration RAG MULTILINGUE :
    
    1) Détecte la langue de la question
    2) Traduit en français si nécessaire (RAG optimisé pour FR)
    3) Embed + cherche dans Qdrant, Postgres, Neo4j
    4) Passe le contexte au LLM santé
    5) Retourne la réponse (et traduit si nécessaire)
    
    Support: Toutes les langues (>100 langues détectées automatiquement)
    """
    try:
        lang_service = get_language_service()
        
        # Détecte la langue de la question
        if not language or language == "auto":
            detected_lang, confidence = lang_service.detect_language(question)
            logger.info(f"Langue détectée: {detected_lang} (confiance: {confidence})")
        else:
            detected_lang = language
            confidence = 1.0

        # Langue cible pour la réponse (défaut = langue détectée si supportée)
        target_language = lang_service.clamp_language(response_language or detected_lang, fallback="fr")
        
        # Traduit la question en français si ce n'est pas du français
        question_for_rag = question
        if detected_lang != "fr" and detected_lang != "unknown":
            logger.info(f"Traduction {detected_lang} → fr")
            question_for_rag = lang_service.translate_text(question, detected_lang, "fr")
            logger.info(f"Question traduite: {question_for_rag}")
        
        # RAG (optimisé en français)
        result = await rag_service.answer(
            question_for_rag,
            top_k=top_k,
            target_language=target_language,
            original_question=question,
        )

        response_text = result["answer"]
        # Si on veut forcer la traduction (au cas où le modèle ne respecte pas la langue cible)
        if translate_response and detected_lang not in ("unknown", None):
            if detected_lang != target_language:
                response_text = lang_service.translate_text(response_text, target_language, detected_lang)
                target_language = detected_lang
        
        return {
            "success": True,
            "detected_language": detected_lang,
            "language_name": lang_service.get_language_name(detected_lang),
            "language_confidence": confidence,
            "response_language": target_language,
            "question_original": question,
            "question_for_rag": question_for_rag,
            "answer": response_text,
            "hits_qdrant": result["hits_qdrant"],
            "hits_postgres": result["hits_postgres"],
            "hits_neo4j": result["hits_neo4j"],
            "sql_query": result.get("sql_query"),
            "cypher_query": result.get("cypher_query"),
            "vector_query": result.get("vector_query"),
            "qdrant_error": result.get("qdrant_error"),
            "postgres_error": result.get("postgres_error"),
            "neo4j_error": result.get("neo4j_error"),
            "translated": translate_response and detected_lang != "fr",
            "supported_languages": lang_service.supported_langs,
            "context_used": result.get("context_used", False),
        }
    except Exception as e:
        logger.error(f"❌ Erreur RAG: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/generate-report")
async def generate_report(
    transcription: str = Form(..., description="Texte transcrit"),
    report_type: Optional[str] = Form(None, description="Type de rapport"),
    format: str = Form("json", description="Format (json, markdown, pdf)"),
    extracted_fields: Optional[str] = Form(None, description="Champs extraits (JSON)")
):
    """
    ✅ ÉTAPE 5: Générer rapports
    
    Crée un rapport structuré à partir de la transcription.
    Supporte plusieurs formats: JSON, Markdown, PDF.
    
    Cas d'usage:
    - Rapport médical après consultation
    - Fiche d'observation biodiversité
    - Rapport administratif
    """
    try:
        logger.info(f"Génération rapport ({report_type or 'auto'})...")
        
        import json
        fields = json.loads(extracted_fields) if extracted_fields else {}
        
        report = await report_service.generate_report(
            transcription, 
            fields, 
            report_type, 
            format
        )
        
        return {
            "success": True,
            "report": report
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur génération rapport: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/translate-text")
async def translate_text(
    text: str = Form(..., description="Texte à traduire"),
    target_lang: str = Form("fr", description="Langue cible"),
    source_lang: Optional[str] = Form(None, description="Langue source (auto si None)"),
):
    """Traduction utilitaire pour la transcription en temps réel."""
    try:
        lang_service = get_language_service()

        # TOUJOURS détecter la langue du texte (le source_lang du STT peut être inexact)
        detected, confidence = lang_service.detect_language(text)
        logger.info(f"🌍 Détection langue: {detected} (confidence: {confidence}) pour: '{text[:50]}...'")

        # Normaliser les codes langue (enlever _FR, _US, etc.)
        if source_lang and "_" in source_lang:
            source_lang = source_lang.split("_")[0]
        
        # IMPORTANT: Utiliser TOUJOURS la langue détectée comme source (pas le STT locale)
        # Cela évite le problème où source==target quand le STT dit fr_FR mais on veut traduire vers fr
        source_lang = detected if detected != "unknown" else "en"
        logger.info(f"🔄 Source finale (détectée): {source_lang}")
        
        target_lang = lang_service.clamp_language(target_lang, fallback="fr")

        logger.info(f"🔄 Traduction {source_lang} → {target_lang}")
        translated = lang_service.translate_text(text, source_lang, target_lang)
        logger.info(f"📝 Résultat: original='{text[:50]}...' → translated='{translated[:50] if translated else 'VIDE'}...'")
        logger.info(f"📝 Même texte? {text == translated}")

        return {
            "success": True,
            "detected_language": detected,
            "language_confidence": confidence,
            "target_language": target_lang,
            "original_text": text,
            "translated_text": translated,
        }
    except Exception as e:
        logger.error(f"❌ Erreur traduction: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/form-json")
async def form_json_endpoint(
    transcription: str = Form(..., description="Transcription vocale"),
    form_type: Optional[str] = Form("medical", description="Type de formulaire: medical, admin, biodiversity")
):
    """
    🆕 REMPLISSAGE AUTOMATIQUE DE FORMULAIRE
    
    Transforme une transcription vocale en données structurées pour remplir un formulaire.
    
    Exemple d'entrée:
    "Le patient s'appelle Martin Dupont, 45 ans, homme, il a de la fièvre à 38, 
    une toux sèche, probable grippe, je prescris du paracétamol"
    
    Sortie JSON:
    {
        "nom": "Dupont",
        "prenom": "Martin",
        "age": 45,
        "genre": "Homme",
        "symptomes": "fièvre à 38, toux sèche",
        "diagnostic": "probable grippe",
        "traitement": "paracétamol"
    }
    """
    try:
        logger.info(f"🎯 Génération form-json ({form_type})...")
        
        # Utilisation du service NLP générique qui gère le dispatch selon form_type
        extracted = await nlp_service.extract_form_data(transcription, form_type)
        
        # Construction de la réponse JSON adaptée au type
        if form_type in ["biodiversity", "biodiversite"]:
            full_fields = {
                "espece": extracted.get("espece", ""),
                "nombre": extracted.get("nombre", ""),
                "lieu": extracted.get("lieu", ""),
                "comportement": extracted.get("comportement", ""),
                "meteo": extracted.get("meteo", ""),
            }
        elif form_type in ["construction", "chantier", "btp"]:
             full_fields = {
                "projet": extracted.get("projet", ""),
                "avancement": extracted.get("avancement", ""),
                "probleme": extracted.get("probleme", ""),
                "suite": extracted.get("suite", ""),  
                "date": extracted.get("date", ""),
            }
        else:
            # Médical (défaut)
            full_fields = {
                "nom": extracted.get("nom", ""),
                "prenom": extracted.get("prenom", ""),
                "age": extracted.get("age", ""),
                "genre": extracted.get("genre", ""),
                "symptomes": extracted.get("symptomes", ""),
                "diagnostic": extracted.get("diagnostic", ""),
                "traitement": extracted.get("traitement", ""),
                "temperature": extracted.get("temperature", ""),
            }
        
        import logging
        logging.getLogger("uvicorn.info").info(f"[FORM] Champs extraits ({form_type}): {full_fields}")
        return {
            "success": True,
            "form_json": full_fields,
            "transcription": transcription,
            "form_type": form_type
        }
    except Exception as e:
        logger.error(f"❌ Erreur génération form-json: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/save-consultation")
async def save_consultation(
    transcription: str = Form(...),
    nom: Optional[str] = Form(None),
    prenom: Optional[str] = Form(None),
    age: Optional[int] = Form(None),
    genre: Optional[str] = Form(None),
    symptomes: Optional[str] = Form(None),
    diagnostic: Optional[str] = Form(None),
    traitement: Optional[str] = Form(None),
    medecin_id: Optional[int] = Form(1),  # Par défaut médecin ID 1
    db: Session = Depends(get_db)
):
    """
    💾 SAUVEGARDER CONSULTATION EN BASE DE DONNÉES
    
    Sauvegarde une consultation médicale complète dans PostgreSQL.
    Crée ou met à jour le patient, puis crée la consultation.
    """
    try:
        logger.info(f"💾 Sauvegarde consultation: {prenom} {nom}...")

        # 2. Validation / Fallback du Médecin
        user = db.query(User).filter(User.id == medecin_id).first()
        if not user:
            logger.warning(f"⚠️ Médecin ID {medecin_id} introuvable. Fallback sur le premier user...")
            user = db.query(User).first()
            if not user:
                logger.warning("⚠️ Aucun user en base! Création d'un user par défaut 'Medecin'.")
                from app.services.auth_service import get_password_hash
                user = User(
                    email="medecin@auriance.com", 
                    hashed_password=get_password_hash("admin"),
                    full_name="Medecin Default",
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            medecin_id_final = user.id
        else:
            medecin_id_final = user.id

        # 3. Création ou Récupération du Patient
        patient = None
        if nom:
            full_name = f"{nom} {prenom}".strip() if prenom else nom
            # Recherche patient existant (match exact nom complet)
            patient = db.query(Patient).filter(Patient.name == full_name).first()
            
            if not patient:
                logger.info(f"🆕 Nouveau patient: {full_name}")
                patient = Patient(
                    name=full_name,
                    age=age,
                    user_id=medecin_id_final 
                )
                db.add(patient)
                db.commit()
                db.refresh(patient)
            else:
                # Mise à jour de l'âge si fourni
                if age and patient.age != age:
                    patient.age = age
                    db.commit()

        if not patient:
            # Cas fallback si pas de nom : on crée un patient "Inconnu"
            patient = Patient(name="Patient Inconnu", age=age, user_id=medecin_id_final)
            db.add(patient)
            db.commit()
            db.refresh(patient)
            
        # 4. Création Consultation
        consultation = Consultation(
            patient_id=patient.id,
            medecin_id=medecin_id_final,
            transcription=transcription,
            symptomes=symptomes,
            diagnostic=diagnostic,
            traitement=traitement,
            # Snapshots
            nom_snapshot=patient.name,
            age_snapshot=patient.age,
            genre_snapshot=genre
        )
        db.add(consultation)
        db.commit()
        db.refresh(consultation)
        logger.info(f"✅ Consultation sauvegardée - Patient ID: {patient.id}, Cons ID: {consultation.id}")
        
        return {
            "success": True,
            "message": "Consultation sauvegardée avec succès",
            "patient_id": patient.id,
            "consultation_id": consultation.id,
            "data": {
                "nom": nom,
                "prenom": prenom,
                "age": age,
                "genre": genre,
                "symptomes": symptomes,
                "diagnostic": diagnostic,
                "traitement": traitement
            }
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur sauvegarde consultation: {e}")
        # En cas d'erreur DB, on rollback
        try:
            db.rollback()
        except:
            pass
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.get("/consultations")
async def get_consultations(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    📜 RÉCUPÉRER HISTORIQUE DES CONSULTATIONS
    
    Retourne la liste des consultations enregistrées (pour l'onglet Formulaires).
    """
    try:
        consultations = db.query(Consultation).order_by(Consultation.created_at.desc()).offset(skip).limit(limit).all()
        
        # Enrichir avec le nom du patient si dispo
        results = []
        for c in consultations:
            patient_name = "Inconnu"
            if c.patient:
                patient_name = c.patient.name
            elif c.nom_snapshot:
                patient_name = c.nom_snapshot
                
            results.append({
                "id": c.id,
                "created_at": c.created_at,
                "patient_name": patient_name,
                "age": c.age_snapshot,
                "symptomes": c.symptomes,
                "diagnostic": c.diagnostic,
                "traitement": c.traitement,
                "transcription": c.transcription
            })
            
        return results
    except Exception as e:
        logger.error(f"❌ Erreur récupération consultations: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/generate-summary")
async def generate_summary(
    transcription: str = Form(..., description="Texte à résumer"),
    max_length: int = Form(200, description="Longueur max du résumé")
):
    """
    ✅ ÉTAPE 6: Générer résumés
    
    Crée un résumé concis du texte transcrit.
    Utile pour les notifications, aperçus, etc.
    """
    try:
        logger.info("Génération résumé...")
        
        summary = await report_service.generate_summary(transcription, max_length)
        
        return {
            "success": True,
            "summary": summary
        }
    
    except Exception as e:
        logger.error(f"❌ Erreur génération résumé: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


@router.post("/complete-pipeline")
async def complete_pipeline(
    audio_file: UploadFile = File(..., description="Fichier audio"),
    language: Optional[str] = Form(None),
    action: str = Form("transcribe", description="Action: transcribe, extract, query, report, all")
):
    """
    🚀 PIPELINE COMPLET AURIANCE
    
    Combine toutes les étapes en un seul appel pour plus de commodité.
    
    Actions disponibles:
    - transcribe: Seulement transcrire
    - extract: Transcrire + extraire
    - query: Transcrire + générer requête
    - report: Transcrire + générer rapport
    - all: Tout faire
    """
    try:
        logger.info(f"Pipeline AURIANCE complet - Action: {action}")
        
        # Sauvegarder audio
        file_ext = os.path.splitext(audio_file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            temp_path = tmp.name
        
        content = await audio_file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Conversion audio
        converted_path = whisper_service.convert_audio_format(temp_path)

        # Transcrire (toujours première étape)
        transcription_result = await whisper_service.transcribe(converted_path, language=language)
        text = transcription_result["text"]
        
        response = {
            "success": True,
            "transcription": text,
            "language": transcription_result["language"]
        }
        
        # Action extraction
        if action in ["extract", "all"]:
            extracted = await nlp_service.extract_fields(text)
            response["extracted_fields"] = extracted
        
        # Action requête
        if action in ["query", "all"]:
            sql_result = await query_service.generate_sql(text, {})
            response["sql"] = sql_result
        
        # Action rapport
        if action in ["report", "all"]:
            fields = response.get("extracted_fields", {})
            report = await report_service.generate_report(text, fields)
            response["report"] = report
        
        # Nettoyage
        for p in [temp_path, converted_path]:
            if os.path.exists(p):
                os.remove(p)
        
        return response
    
    except Exception as e:
        logger.error(f"❌ Erreur pipeline: {e}")
        raise HTTPException(500, f"Erreur: {str(e)}")


# ============ 🎤 RECHERCHE VOCALE MULTI-BASES ============
@router.post("/voice-search")
async def voice_multi_database_search(
    audio_file: UploadFile = File(..., description="Fichier audio à transcrir"),
    language: str = Form("auto", description="Code langue (auto, fr, en, es, ar, zh...)"),
    top_k: int = Form(4, description="Nombre de résultats par base"),
    translate_response: bool = Form(False, description="Traduire la réponse"),
    response_language: Optional[str] = Form(None, description="Langue cible pour traduction"),
):
    """
    🎤 RECHERCHE VOCALE MULTI-BASES
    
    Pipeline complet:
    1. Transcrit l'audio (Whisper)
    2. Génère SQL pour PostgreSQL
    3. Génère Cypher pour Neo4j
    4. Génère requête vector pour Qdrant
    5. Exécute les 3 requêtes en parallèle
    6. Agrège et synthétise la réponse RAG
    7. Optionnellement traduit la réponse
    
    Retourne: {
        "transcription": str,
        "language": str,
        "sql_query": str,
        "cypher_query": str,
        "vector_query": str,
        "postgres_results": list,
        "neo4j_results": list,
        "qdrant_results": list,
        "answer": str,
        "sources": list
    }
    """
    try:
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(400, "Le fichier doit être un fichier audio")
        
        # Sauvegarder temporairement
        file_ext = os.path.splitext(audio_file.filename)[1] or ".m4a"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            temp_path = tmp.name
        
        content = await audio_file.read()
        with open(temp_path, "wb") as f:
            f.write(content)
        
        logger.info(f"🎤 Transcription audio: {audio_file.filename}")
        
        # ÉTAPE 1: Transcription
        # Conversion audio
        converted_path = whisper_service.convert_audio_format(temp_path)
        
        transcription_result = await whisper_service.transcribe(converted_path, language=language)
        transcribed_text = transcription_result["text"]
        detected_language = transcription_result.get("language", language)
        
        # Cleanup
        for p in [temp_path, converted_path]:
            if os.path.exists(p):
                os.remove(p)
        
        logger.info(f"✅ Texte transcrit: {transcribed_text}")
        
        # ÉTAPE 2-4: Générer les requêtes pour les 3 bases
        logger.info("🔄 Génération des requêtes multi-bases...")
        context = {"transcription": transcribed_text}
        
        sql_query_result = await query_service.generate_sql(transcribed_text, context)
        sql_query = sql_query_result.get("query", "") if isinstance(sql_query_result, dict) else str(sql_query_result)
        
        cypher_query_result = await query_service.generate_cypher(transcribed_text, context)
        cypher_query = cypher_query_result.get("query", "") if isinstance(cypher_query_result, dict) else str(cypher_query_result)
        
        vector_query = transcribed_text  # Pour Qdrant, utiliser le texte directement
        
        logger.info(f"📊 SQL: {sql_query}")
        logger.info(f"📊 Cypher: {cypher_query}")
        
        # ÉTAPE 5: Exécuter les requêtes (via RAG Service)
        logger.info("🔍 Exécution des requêtes multi-bases...")
        rag_response = await rag_service.query_multi_databases(
            question=transcribed_text,
            top_k=top_k,
            language=detected_language,
            sql_query=sql_query,
            cypher_query=cypher_query,
            vector_query=vector_query,
        )
        
        # Ajouter les requêtes générées à la réponse
        response = {
            "success": True,
            "transcription": transcribed_text,
            "language": detected_language,
            "sql_query": sql_query,
            "cypher_query": cypher_query,
            "vector_query": vector_query,
        }
        
        # Intégrer les résultats RAG
        if isinstance(rag_response, dict):
            response.update(rag_response)
        else:
            response["answer"] = str(rag_response)
        
        # ÉTAPE 6 (optionnel): Traduction
        if translate_response and response_language and response_language != detected_language:
            logger.info(f"🌐 Traduction vers {response_language}...")
            try:
                lang_service = get_language_service()
                answer_text = response.get("answer", "")
                if answer_text:
                    translated = await lang_service.translate(
                        answer_text,
                        source_language=detected_language,
                        target_language=response_language
                    )
                    response["answer_translated"] = translated
                    response["response_language"] = response_language
            except Exception as e:
                logger.warning(f"⚠️ Erreur traduction: {e}")
        
        # Nettoyage
        os.remove(temp_path)
        
        logger.info("✅ Recherche vocale multi-bases terminée")
        return response
    
    except Exception as e:
        logger.error(f"❌ Erreur recherche vocale multi-bases: {e}", exc_info=True)
        raise HTTPException(500, f"Erreur recherche: {str(e)}")

