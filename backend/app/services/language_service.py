"""Service multilingue : détection, traduction, support toutes langues."""
import logging
from typing import Optional, Tuple
from langdetect import detect, LangDetectException
import os

logger = logging.getLogger(__name__)

# Support langues : code ISO 639-1 (élargi pour couvrir la majorité des langues courantes)
SUPPORTED_LANGUAGES = {
    "auto": "Auto-détection",
    "fr": "Français",
    "en": "English",
    "es": "Español",
    "de": "Deutsch",
    "it": "Italiano",
    "pt": "Português",
    "pl": "Polski",
    "ru": "Русский",
    "ja": "日本語",
    "ko": "한국어",
    "zh": "中文",
    "ar": "العربية",
    "hi": "हिंदी",
    "tr": "Türkçe",
    "nl": "Nederlands",
    "sv": "Svenska",
    "no": "Norsk",
    "da": "Dansk",
    "fi": "Suomi",
    "el": "Ελληνικά",
    "th": "ไทย",
    "vi": "Tiếng Việt",
    "id": "Bahasa Indonesia",
    "uk": "Українська",
    "cs": "Čeština",
    "hu": "Magyar",
    "ro": "Română",
    "sk": "Slovenčina",
    "bg": "Български",
    "hr": "Hrvatski",
    "he": "עברית",
    "fa": "فارسی",
    "bn": "বাংলা",
    "ur": "اردو",
    "sw": "Kiswahili",
    "ta": "தமிழ்",
    "te": "తెలుగు",
    "mr": "मराठी",
    "gu": "ગુજરાતી",
    "pa": "ਪੰਜਾਬੀ",
    "kn": "ಕನ್ನಡ",
    "ml": "മലയാളം",
    "si": "සිංහල",
    "ms": "Bahasa Melayu",
    "fil": "Filipino",
    "am": "አማርኛ",
    "zu": "isiZulu",
    "xh": "isiXhosa",
    "st": "Sesotho",
    "yo": "Yorùbá",
    "ig": "Igbo",
    "ha": "Hausa",
    "so": "Soomaali",
    "af": "Afrikaans",
    "sq": "Shqip",
    "bs": "Bosanski",
    "mk": "Македонски",
    "sr": "Српски",
    "sl": "Slovenščina",
    "lt": "Lietuvių",
    "lv": "Latviešu",
    "et": "Eesti",
    "ga": "Gaeilge",
    "cy": "Cymraeg",
    "mt": "Malti",
    "is": "Íslenska",
    "eo": "Esperanto",
    "la": "Latina",
    "kk": "Қазақ",
    "uz": "Oʻzbek",
    "ky": "Кыргызча",
    "mn": "Монгол",
    "ne": "नेपाली",
    "lo": "ລາວ",
    "km": "ខ្មែរ",
    "my": "မြန်မာ",
    "jv": "Basa Jawa",
    "su": "Basa Sunda",
    "sm": "Gagana Sāmoa",
    "mi": "Māori",
    "qu": "Quechua",
    "ay": "Aymara",
    "gn": "Guarani",
    "ht": "Kreyòl ayisyen",
    "cr": "Cree",
}


class LanguageService:
    """Service pour détection et traduction multilingue."""
    
    def __init__(self):
        self.supported_langs = list(SUPPORTED_LANGUAGES.keys())
    
    def detect_language(self, text: str) -> Tuple[str, float]:
        """
        Détecte la langue d'un texte.
        
        Args:
            text: Texte à analyser
        
        Returns:
            Tuple (code_langue, confiance) ex: ("fr", 0.95)
        """
        try:
            if not text or len(text.strip()) < 3:
                return "unknown", 0.0
            
            lang_code = detect(text)
            logger.info(f"Langue détectée: {lang_code} pour '{text[:50]}...'")
            return lang_code, 0.95  # langdetect ne donne pas de score direct
        
        except LangDetectException:
            logger.warning(f"Impossible de détecter la langue: '{text[:30]}...'")
            return "unknown", 0.0
        except Exception as e:
            logger.error(f"Erreur détection langue: {e}")
            return "unknown", 0.0
    
    def translate_text(self, text: str, source_lang: str, target_lang: str = "fr") -> str:
        """
        Traduit un texte d'une langue à une autre.
        
        Args:
            text: Texte à traduire
            source_lang: Code langue source (ex: "en")
            target_lang: Code langue cible (défaut: "fr")
        
        Returns:
            Texte traduit
        """
        logger.info(f"🎯 translate_text START: text='{text[:50]}...', source={source_lang}, target={target_lang}")
        
        # Si source == target, détecter d'abord pour vérifier
        if source_lang == target_lang:
            logger.info(f"⚠️  Source == Target ({source_lang}), vérification détection...")
            detected, conf = self.detect_language(text)
            logger.info(f"🔍 Détection confirme: {detected} (confidence: {conf})")
            
            # Si la détection dit vraiment la même langue, pas besoin de traduire
            if detected == target_lang:
                logger.info(f"✅ Détection confirme même langue, pas traduction nécessaire")
                return text
            
            # Sinon, utiliser la langue détectée
            logger.info(f"🔄 Détection dit {detected}, va traduire {detected} → {target_lang}")
            source_lang = detected if detected != "unknown" else source_lang
        
        # Si unknown, ne pas traduire
        if source_lang == "unknown":
            logger.info(f"⏭️  Source unknown, retour texte original")
            return text
            
        try:
            # Utiliser deep-translator (plus stable)
            try:
                from deep_translator import GoogleTranslator
                logger.info(f"📦 GoogleTranslator import OK")
                logger.info(f"🔄 AVANT traduction {source_lang} → {target_lang}: text='{text}'")
                translator = GoogleTranslator(source=source_lang, target=target_lang)
                logger.info(f"✅ GoogleTranslator instance created")
                translated = translator.translate(text)
                logger.info(f"✅ APRÈS traduction: translated='{translated}'")
                logger.info(f"✅ Traduit: '{translated[:50]}...' (length: {len(translated)})")
                result = translated if translated else text
                logger.info(f"🎯 translate_text RESULT: '{result}'")
                return result
            except ImportError as ie:
                logger.error(f"❌ ImportError deep-translator: {ie}")
                logger.info(f"🎯 translate_text RESULT (ImportError): '{text}'")
                return text
            except Exception as te:
                logger.error(f"❌ Exception dans GoogleTranslator: {type(te).__name__}: {te}")
                logger.info(f"🎯 translate_text RESULT (Exception): '{text}'")
                return text
        
        except Exception as e:
            logger.error(f"❌ Erreur traduction globale: {e}")
            logger.info(f"🎯 translate_text RESULT (Global error): '{text}'")
            return text
    
    def get_language_name(self, lang_code: str) -> str:
        """Obtient le nom d'une langue en français."""
        return SUPPORTED_LANGUAGES.get(lang_code, "Inconnue")
    
    def is_supported_language(self, lang_code: str) -> bool:
        """Vérifie si une langue est supportée."""
        return lang_code in self.supported_langs

    def clamp_language(self, lang_code: Optional[str], fallback: str = "fr") -> str:
        """Retourne une langue supportée ou un fallback."""
        if not lang_code or lang_code == "auto":
            return fallback
        return lang_code if self.is_supported_language(lang_code) else fallback


# Instance singleton
_language_service = None

def get_language_service() -> LanguageService:
    """Obtenir l'instance du service de langue."""
    global _language_service
    if _language_service is None:
        _language_service = LanguageService()
    return _language_service
