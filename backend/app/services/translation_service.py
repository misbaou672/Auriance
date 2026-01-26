# app/services/translation_service.py
"""
Service de traduction multi-langues pour Auriance
Supporte 25 langues principales avec Google Translate API
"""

import os
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv

load_dotenv()

# Mapping des langues supportées (code ISO -> infos)
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "speakers": 1456448320, "native_name": "English"},
    "zh": {"name": "Mandarin Chinese", "speakers": 1138222350, "native_name": "普通话"},
    "hi": {"name": "Hindi", "speakers": 609454770, "native_name": "हिन्दी"},
    "es": {"name": "Spanish", "speakers": 559078890, "native_name": "Español"},
    "fr": {"name": "French", "speakers": 309804220, "native_name": "Français"},
    "ar": {"name": "Modern Standard Arabic", "speakers": 273989700, "native_name": "العربية"},
    "bn": {"name": "Bengali", "speakers": 272828760, "native_name": "বাংলা"},
    "ru": {"name": "Russian", "speakers": 254997130, "native_name": "Русский"},
    "pt": {"name": "Portuguese", "speakers": 263638850, "native_name": "Português"},
    "ur": {"name": "Urdu", "speakers": 231717940, "native_name": "اردو"},
    "id": {"name": "Indonesian", "speakers": 199113300, "native_name": "Bahasa Indonesia"},
    "de": {"name": "German", "speakers": 133245880, "native_name": "Deutsch"},
    "ja": {"name": "Japanese", "speakers": 123445570, "native_name": "日本語"},
    "yo": {"name": "Nigerian Pidgin", "speakers": 120650000, "native_name": "Naijá"},
    "arz": {"name": "Egyptian Arabic", "speakers": 102436230, "native_name": "اللهجة المصرية"},
    "mr": {"name": "Marathi", "speakers": 99216870, "native_name": "मराठी"},
    "te": {"name": "Telugu", "speakers": 95981790, "native_name": "తెలుగు"},
    "tr": {"name": "Turkish", "speakers": 90028000, "native_name": "Türkçe"},
    "ta": {"name": "Tamil", "speakers": 86640030, "native_name": "தமிழ்"},
    "yue": {"name": "Cantonese", "speakers": 86633370, "native_name": "粵語"},
    "vi": {"name": "Vietnamese", "speakers": 85807700, "native_name": "Tiếng Việt"},
    "wuu": {"name": "Wu Chinese", "speakers": 83421190, "native_name": "吳語"},
    "tl": {"name": "Tagalog", "speakers": 83054910, "native_name": "Tagalog"},
    "ko": {"name": "Korean", "speakers": 81740540, "native_name": "한국어"},
    "fa": {"name": "Farsi", "speakers": 78623350, "native_name": "فارسی"},
}


class TranslationService:
    """Service de traduction avec support multi-langues"""

    def __init__(self):
        """Initialise le service de traduction"""
        try:
            from google.cloud import translate_v2
            from google.oauth2 import service_account

            # Vérifier les credentials Google Cloud
            credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if credentials_path and os.path.exists(credentials_path):
                credentials = service_account.Credentials.from_service_account_file(
                    credentials_path
                )
                self.client = translate_v2.Client(credentials=credentials)
                self.use_google = True
                print("✅ Service Google Translate initialisé !")
            else:
                self.client = None
                self.use_google = False
                print(
                    "⚠️ Google Cloud credentials non trouvées, utilisation du mode LibreTranslate"
                )

        except ImportError:
            self.client = None
            self.use_google = False
            print("⚠️ google-cloud-translate non installé, utilisation du mode LibreTranslate")
        except Exception as e:
            print(f"⚠️ Erreur initialisation Google Translate: {e}")
            self.client = None
            self.use_google = False
        
        # Configuration LibreTranslate (serveur local via Docker ou en local)
        # Défaut: localhost pour le dev hors-docker.
        self.libretranslate_url = os.getenv("LIBRETRANSLATE_URL", "http://localhost:5000")
        print(f"📡 LibreTranslate URL: {self.libretranslate_url}")

    def get_supported_languages(self) -> Dict[str, Any]:
        """Retourne la liste des langues supportées"""
        return {
            "total": len(SUPPORTED_LANGUAGES),
            "languages": [
                {
                    "code": code,
                    "name": info["name"],
                    "native_name": info["native_name"],
                    "speakers": info["speakers"],
                }
                for code, info in sorted(
                    SUPPORTED_LANGUAGES.items(),
                    key=lambda x: x[1]["speakers"],
                    reverse=True,
                )
            ],
        }

    async def translate(
        self, text: str, source_language: str, target_language: str
    ) -> Dict[str, Any]:
        """
        Traduit un texte d'une langue à une autre

        Args:
            text: Texte à traduire
            source_language: Code langue source (ex: "fr")
            target_language: Code langue cible (ex: "en")

        Returns:
            Dict avec traduction et métadonnées
        """
        if not text or not text.strip():
            return {
                "status": "error",
                "error": "Texte vide",
                "original": text,
                "translated": "",
            }

        # Valider les codes langue
        if target_language not in SUPPORTED_LANGUAGES:
            return {
                "status": "error",
                "error": f"Langue cible non supportée: {target_language}",
                "supported_languages": list(SUPPORTED_LANGUAGES.keys()),
            }

        # Pas de traduction si source == cible
        if source_language == target_language:
            return {
                "status": "success",
                "original": text,
                "translated": text,
                "source_language": source_language,
                "target_language": target_language,
                "is_same_language": True,
                "confidence": 1.0,
            }

        try:
            if self.use_google and self.client:
                return await self._translate_google(
                    text, source_language, target_language
                )
            else:
                return await self._translate_fallback(
                    text, source_language, target_language
                )
        except Exception as e:
            print(f"❌ Erreur traduction: {e}")
            return {
                "status": "error",
                "error": str(e),
                "original": text,
                "translated": "",
            }

    async def _translate_google(
        self, text: str, source_language: str, target_language: str
    ) -> Dict[str, Any]:
        """Traduction via Google Cloud Translation API"""
        try:
            result = self.client.translate_text(
                text,
                source_language=source_language,
                target_language=target_language,
            )

            return {
                "status": "success",
                "original": text,
                "translated": result["translatedText"],
                "source_language": source_language,
                "target_language": target_language,
                "provider": "google_translate",
                "confidence": 0.95,  # Google Translate a une haute confiance
            }
        except Exception as e:
            print(f"❌ Erreur Google Translate: {e}")
            # Fallback si Google échoue
            return await self._translate_fallback(
                text, source_language, target_language
            )

    async def _translate_fallback(
        self, text: str, source_language: str, target_language: str
    ) -> Dict[str, Any]:
        """
        Traduction fallback via LibreTranslate:
        1. Local Docker
        2. Local install
        3. Public API
        """
        try:
            import httpx

            api_key = os.getenv("LIBRETRANSLATE_API_KEY", "").strip()

            # Liste des URLs à essayer (dans l'ordre de préférence)
            # Note: libretranslate.com nécessite généralement une API key, donc on l'ignore sans clé.
            urls_to_try = [self.libretranslate_url, "http://localhost:5000"]
            if api_key:
                urls_to_try.append("https://libretranslate.com")

            # Déduplique en gardant l'ordre
            seen: set[str] = set()
            urls_to_try = [u for u in urls_to_try if not (u in seen or seen.add(u))]
            
            for url in urls_to_try:
                try:
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        print(f"🔄 Tentative traduction avec: {url}")
                        
                        # Prépare le payload
                        payload = {
                            "q": text,
                            "source": source_language,
                            "target": target_language,
                        }
                        
                        if api_key:
                            payload["api_key"] = api_key
                        
                        response = await client.post(
                            f"{url}/translate",
                            json=payload,
                        )

                        if response.status_code == 200:
                            data = response.json()
                            print(f"✅ Réponse LibreTranslate: {data}")
                            
                            # Extrait la traduction (format: {"translatedText": "..."})
                            translated = data.get("translatedText", text)
                            
                            print(f"✅ Traduction réussie via {url}")
                            return {
                                "status": "success",
                                "original": text,
                                "translated": translated,
                                "source_language": source_language,
                                "target_language": target_language,
                                "provider": "libretranslate",
                                "confidence": 0.85,
                            }
                        else:
                            body_preview = (response.text or "").strip()
                            if len(body_preview) > 400:
                                body_preview = body_preview[:400] + "…"
                            print(
                                f"⚠️ {url} erreur {response.status_code} - {body_preview}"
                            )
                            
                except Exception as e:
                    print(f"⚠️ Erreur avec {url}: {type(e).__name__}: {e}")
                    continue
                    
        except Exception as e:
            print(f"⚠️ Erreur générale traduction fallback: {e}")

        # Fallback ultime
        print("ℹ️ Traduction non disponible, texte original retourné")
        return {
            "status": "partial",
            "original": text,
            "translated": text,
            "source_language": source_language,
            "target_language": target_language,
            "provider": "fallback",
            "confidence": 0.0,
            "message": "Traduction non disponible",
        }

    async def batch_translate(
        self, texts: List[str], source_language: str, target_language: str
    ) -> Dict[str, Any]:
        """
        Traduit plusieurs textes en une seule requête

        Args:
            texts: Liste de textes à traduire
            source_language: Code langue source
            target_language: Code langue cible

        Returns:
            Dict avec traductions multiples
        """
        translations = []
        errors = []

        for text in texts:
            try:
                result = await self.translate(
                    text, source_language, target_language
                )
                translations.append(result)
            except Exception as e:
                errors.append({"text": text, "error": str(e)})

        return {
            "status": "success" if not errors else "partial",
            "total": len(texts),
            "translated": len(translations),
            "errors": len(errors),
            "translations": translations,
            "error_details": errors if errors else None,
        }

    def validate_language_code(self, code: str) -> bool:
        """Valide si un code langue est supporté"""
        return code in SUPPORTED_LANGUAGES

    def get_language_info(self, code: str) -> Optional[Dict[str, Any]]:
        """Récupère les infos d'une langue"""
        if code not in SUPPORTED_LANGUAGES:
            return None
        info = SUPPORTED_LANGUAGES[code]
        return {
            "code": code,
            "name": info["name"],
            "native_name": info["native_name"],
            "speakers": info["speakers"],
        }
