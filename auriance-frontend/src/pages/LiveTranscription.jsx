import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, FileDown, Mic, Moon, Sun, Globe, Check, ChevronDown, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import VoiceOrb from '../components/VoiceOrb';
import BodyMap from '../components/BodyMap';
import { saveTranscription, exportTranscriptionPdf, API_BASE_URL } from '../services/api';
import { createVoiceRecognizer, isWebSpeechSupported } from '../../sdk/auriance-voice-sdk.js';

const LANGUAGES = [
    { code: 'multi', label: 'FR + EN (Bilingue)', flag: '🌐' },
    { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'zh-CN', label: 'Mandarin', flag: '🇨🇳' },
    { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
    { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { code: 'ar-SA', label: 'Arabic', flag: '🇸🇦' },
    { code: 'bn-BD', label: 'Bengali', flag: '🇧🇩' },
    { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
    { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'ur-PK', label: 'Urdu', flag: '🇵🇰' },
    { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
];

const TRANSLATIONS = {
    'multi': {
        back: "RETOUR",
        statusActive: "ENREGISTREMENT BILINGUE",
        statusReady: "MODE BILINGUE PRÊT",
        titlePrefix: "AURIANCE",
        titleSuffix: "VOICE",
        recordingInCourse: "● Capture Audio bilingue FR+EN...",
        waitingCommand: "Mode bilingue actif",
        orbInit: "Initialiser",
        terminalLabel: "live_transcript.txt",
        charsLabel: "caractères",
        systemReadyToTranscribe: "Mode bilingue : parlez en français ou anglais...",
        btnSave: "SAUVEGARDER",
        btnExport: "EXPORT PDF",
        btnClear: "EFFACER",
        modalClearTitle: "Tout effacer ?",
        modalClearMessage: "Cette action est irréversible. Voulez-vous continuer ?",
        modalCancel: "Annuler",
        modalConfirm: "Confirmer",
        modalSuccessTitle: "PDF Exporté",
        modalSuccessMessage: "Le fichier a été téléchargé.",
        modalErrorTitle: "Erreur Export",
        modalErrorMessage: "Impossible de générer le PDF.",
        modalSaveSuccess: "Sauvegardé",
        modalSaveSuccessMsg: "La transcription a été enregistrée dans votre historique.",
        modalClearSuccess: "Effacé",
        modalClearSuccessMsg: "La transcription a été réinitialisée.",
        modalNoTranscript: "Transcription vide",
        modalNoTranscriptMsg: "Aucune transcription à sauvegarder.",
        modalMicroErrorTitle: "Erreur Micro",
        modalMicroErrorMessage: "Impossible d'accéder au microphone. Vérifiez vos permissions.",
        modalMicroUnavailable: 'Micro indisponible.',
    },
    'en-US': {
        back: "BACK",
        statusActive: "RECORDING ACTIVE",
        statusReady: "SYSTEM READY",
        titlePrefix: "AURIANCE",
        titleSuffix: "VOICE",
        recordingInCourse: "● Audio capture in progress...",
        waitingCommand: "Waiting for voice command",
        orbInit: "Initialize",
        terminalLabel: "live_transcript.txt",
        charsLabel: "chars",
        systemReadyToTranscribe: "The system is ready to transcribe...",
        btnSave: "SAVE",
        btnExport: "EXPORT PDF",
        btnClear: "CLEAR",
        modalClearTitle: "Clear everything?",
        modalClearMessage: "This action is irreversible. Do you want to continue?",
        modalCancel: "Cancel",
        modalConfirm: "Confirm",
        modalSuccessTitle: "PDF Exported",
        modalSuccessMessage: "The file has been downloaded.",
        modalErrorTitle: "Export Error",
        modalErrorMessage: "Unable to generate the PDF.",
        modalSaveSuccess: "Saved",
        modalSaveSuccessMsg: "The transcription has been saved to your history.",
        modalClearSuccess: "Cleared",
        modalClearSuccessMsg: "The transcription has been reset.",
        modalNoTranscript: "Empty Transcription",
        modalNoTranscriptMsg: "No transcription to save.",
        modalMicroErrorTitle: "Microphone Error",
        modalMicroErrorMessage: "Unable to access microphone. Check your permissions.",
        modalMicroUnavailable: 'Microphone unavailable.',
    },
    'zh-CN': {
        back: "返回",
        statusActive: "正在录音",
        statusReady: "系统就绪",
        titlePrefix: "AURIANCE",
        titleSuffix: "语音",
        recordingInCourse: "● 正在捕获音频...",
        waitingCommand: "等待语音命令",
        orbInit: "初始化",
        terminalLabel: "live_transcript.txt",
        charsLabel: "字符",
        systemReadyToTranscribe: "系统已准备好转录...",
        btnSave: "保存",
        btnExport: "导出 PDF",
        btnClear: "清除",
        modalClearTitle: "全部清除？",
        modalClearMessage: "此操作不可逆。是否继续？",
        modalCancel: "取消",
        modalConfirm: "确认",
        modalSuccessTitle: "PDF 已导出",
        modalSuccessMessage: "文件已下载。",
        modalErrorTitle: "导出错误",
        modalErrorMessage: "无法生成 PDF。",
        modalSaveSuccess: "已保存",
        modalSaveSuccessMsg: "转录已保存到您的历史记录中。",
        modalClearSuccess: "已清除",
        modalClearSuccessMsg: "转录已重置。",
        modalNoTranscript: "空转录",
        modalNoTranscriptMsg: "没有可保存的转录。",
        modalMicroErrorTitle: "麦克风错误",
        modalMicroErrorMessage: "无法访问麦克风。请检查您的权限。",
        modalMicroUnavailable: '麦克风不可用。',
    },
    'hi-IN': {
        back: "पीछे",
        statusActive: "रिकॉर्डिंग सक्रिय",
        statusReady: "सिस्टम तैयार",
        titlePrefix: "AURIANCE",
        titleSuffix: "वॉइस",
        recordingInCourse: "● ऑडियो कैप्चर जारी है...",
        waitingCommand: "वॉइस कमांड की प्रतीक्षा है",
        orbInit: "आरंभ करें",
        terminalLabel: "live_transcript.txt",
        charsLabel: "वर्ण",
        systemReadyToTranscribe: "सिस्टम ट्रांसक्राइब करने के लिए तैयार है...",
        btnSave: "सहेजें",
        btnExport: "PDF निर्यात करें",
        btnClear: "साफ़ करें",
        modalClearTitle: "सब साफ़ करें?",
        modalClearMessage: "यह कार्रवाई अपरिवर्तनीय है। क्या आप जारी रखना चाहते हैं?",
        modalCancel: "रद्द करें",
        modalConfirm: "पुष्टि करें",
        modalSuccessTitle: "PDF निर्यात किया गया",
        modalSuccessMessage: "फ़ाइल डाउनलोड हो गई है।",
        modalErrorTitle: "निर्यात त्रुटि",
        modalErrorMessage: "PDF जनरेट करने में असमर्थ।",
        modalSaveSuccess: "सहेजा गया",
        modalSaveSuccessMsg: "ट्रांसक्रिप्शन आपके इतिहास में सहेज लिया गया है।",
        modalClearSuccess: "साफ़ किया गया",
        modalClearSuccessMsg: "ट्रांसक्रिप्शन रीसेट कर दिया गया है।",
        modalNoTranscript: "खाली ट्रांसक्रिप्शन",
        modalNoTranscriptMsg: "सहेजने के लिए कोई ट्रांसक्रिप्शन नहीं है।",
        modalMicroErrorTitle: "माइक्रोफ़ोन त्रुटि",
        modalMicroErrorMessage: "माइक्रोफ़ोन तक पहुँचने में असमर्थ। अपनी अनुमतियाँ जाँचें।",
        modalMicroUnavailable: 'माइक्रोफ़ोन अनुपलब्ध है।',
    },
    'es-ES': {
        back: "VOLVER",
        statusActive: "GRABACIÓN ACTIVA",
        statusReady: "SISTEMA LISTO",
        titlePrefix: "AURIANCE",
        titleSuffix: "VOICE",
        recordingInCourse: "● Captura de audio en curso...",
        waitingCommand: "Esperando comando de voz",
        orbInit: "Inicializar",
        terminalLabel: "live_transcript.txt",
        charsLabel: "caracteres",
        systemReadyToTranscribe: "El sistema está listo para transcribir...",
        btnSave: "GUARDAR",
        btnExport: "EXPORTAR PDF",
        btnClear: "BORRAR",
        modalClearTitle: "¿Borrar todo?",
        modalClearMessage: "Esta acción es irreversible. ¿Desea continuar?",
        modalCancel: "Cancelar",
        modalConfirm: "Confirmar",
        modalSuccessTitle: "PDF Exportado",
        modalSuccessMessage: "El archivo ha sido descargado.",
        modalErrorTitle: "Error de Exportación",
        modalErrorMessage: "No se pudo generar el PDF.",
        modalSaveSuccess: "Guardado",
        modalSaveSuccessMsg: "La transcripción se ha guardado en su historial.",
        modalClearSuccess: "Borrado",
        modalClearSuccessMsg: "La transcripción ha sido reiniciada.",
        modalNoTranscript: "Transcripción vacía",
        modalNoTranscriptMsg: "No hay transcripción para guardar.",
        modalMicroErrorTitle: "Error de Micrófono",
        modalMicroErrorMessage: "No se puede acceder al micrófono. Verifica tus permisos.",
        modalMicroUnavailable: 'Micrófono no disponible.',
    },
    'ar-SA': {
        back: "رجوع",
        statusActive: "التسجيل نشط",
        statusReady: "النظام جاهز",
        titlePrefix: "AURIANCE",
        titleSuffix: "صوت",
        recordingInCourse: "● جاري التقاط الصوت...",
        waitingCommand: "في انتظار الأوامر الصوتية",
        orbInit: "بدء",
        terminalLabel: "live_transcript.txt",
        charsLabel: "حرف",
        systemReadyToTranscribe: "النظام جاهز للنسخ...",
        btnSave: "حفظ",
        btnExport: "تصدير PDF",
        btnClear: "مسح",
        modalClearTitle: "مسح الكل؟",
        modalClearMessage: "هذا الإجراء لا رجعة فيه. هل تريد الاستمرار؟",
        modalCancel: "إلغاء",
        modalConfirm: "تأكيد",
        modalSuccessTitle: "تم تصدير PDF",
        modalSuccessMessage: "تم تحميل الملف.",
        modalErrorTitle: "خطأ في التصدير",
        modalErrorMessage: "تعذر إنشاء ملف PDF.",
        modalSaveSuccess: "تم الحفظ",
        modalSaveSuccessMsg: "تم حفظ النسخ في سجلك.",
        modalClearSuccess: "تم المسح",
        modalClearSuccessMsg: "تمت إعادة تعيين النسخ.",
        modalNoTranscript: "نسخ فارغ",
        modalNoTranscriptMsg: "لا يوجد نسخ للحفظ.",
        modalMicroErrorTitle: "خطأ في الميكروفون",
        modalMicroErrorMessage: "تعذر الوصول إلى الميكروفون. تحقق من أذوناتك.",
        modalMicroUnavailable: 'الميكروفون غير متاح.',
    },
    'fr-FR': {
        back: "RETOUR",
        statusActive: "ENREGISTREMENT ACTIF",
        statusReady: "SYSTÈME PRÊT",
        titlePrefix: "AURIANCE",
        titleSuffix: "VOICE",
        recordingInCourse: "● Capture Audio en cours...",
        waitingCommand: "En attente de commande vocale",
        orbInit: "Initialiser",
        terminalLabel: "live_transcript.txt",
        charsLabel: "caractères",
        systemReadyToTranscribe: "Le système est prêt à transcrire...",
        btnSave: "SAUVEGARDER",
        btnExport: "EXPORT PDF",
        btnClear: "EFFACER",
        modalClearTitle: "Tout effacer ?",
        modalClearMessage: "Cette action est irréversible. Voulez-vous continuer ?",
        modalCancel: "Annuler",
        modalConfirm: "Confirmer",
        modalSuccessTitle: "PDF Exporté",
        modalSuccessMessage: "Le fichier a été téléchargé.",
        modalErrorTitle: "Erreur Export",
        modalErrorMessage: "Impossible de générer le PDF.",
        modalSaveSuccess: "Sauvegardé",
        modalSaveSuccessMsg: "La transcription a été enregistrée dans votre historique.",
        modalClearSuccess: "Effacé",
        modalClearSuccessMsg: "La transcription a été réinitialisée.",
        modalNoTranscript: "Transcription vide",
        modalNoTranscriptMsg: "Aucune transcription à sauvegarder.",
        modalMicroErrorTitle: "Erreur Micro",
        modalMicroErrorMessage: "Impossible d'accéder au microphone. Vérifiez vos permissions.",
        modalMicroUnavailable: 'Micro indisponible.',
    },
    'bn-BD': {
        back: "ফিরুন",
        statusActive: "রেকর্ডিং সক্রিয়",
        statusReady: "সিস্টেম প্রস্তুত",
        titlePrefix: "AURIANCE",
        titleSuffix: "ভয়েস",
        recordingInCourse: "● অডিও ক্যাপচার চলছে...",
        waitingCommand: "ভয়েস কমান্ডের জন্য অপেক্ষা করছে",
        orbInit: "শুরু করুন",
        terminalLabel: "live_transcript.txt",
        charsLabel: "অক্ষর",
        systemReadyToTranscribe: "সিস্টেম ট্রান্সক্রাইব করার জন্য প্রস্তুত...",
        btnSave: "সংরক্ষণ করুন",
        btnExport: "PDF এক্সপোর্ট",
        btnClear: "মুছে ফেলুন",
        modalClearTitle: "সব মুছবেন?",
        modalClearMessage: "এটি অপরিবর্তনীয়। আপনি কি চালিয়ে যেতে চান?",
        modalCancel: "বাতিল",
        modalConfirm: "নিশ্চিত করুন",
        modalSuccessTitle: "PDF এক্সপোর্ট সফল",
        modalSuccessMessage: "ফাইলটি ডাউনলোড হয়েছে।",
        modalErrorTitle: "এক্সপোর্ট ত্রুটি",
        modalErrorMessage: "PDF তৈরি করা সম্ভব হয়নি।",
        modalSaveSuccess: "সংরক্ষিত",
        modalSaveSuccessMsg: "ট্রান্সক্রিপশনটি ইতিহাসে সংরক্ষিত হয়েছে।",
        modalClearSuccess: "মুছে ফেলা হয়েছে",
        modalClearSuccessMsg: "ট্রান্সক্রিপশন রিসেট করা হয়েছে।",
        modalNoTranscript: "খালি ট্রান্সক্রিপশন",
        modalNoTranscriptMsg: "সংরক্ষণের জন্য কোনো ট্রান্সক্রিপশন নেই।",
        modalMicroErrorTitle: "মাইক্রোফোন ত্রুটি",
        modalMicroErrorMessage: "মাইক্রোফোন অ্যাক্সেস করতে অক্ষম। আপনার অনুমতিগুলি পরীক্ষা করুন।",
        modalMicroUnavailable: 'মাইক্রোফোন অনুপলব্ধ।',
    },
    'pt-PT': {
        back: "VOLTAR",
        statusActive: "GRAVAÇÃO ATIVA",
        statusReady: "SISTEMA PRONTO",
        titlePrefix: "AURIANCE",
        titleSuffix: "VOICE",
        recordingInCourse: "● Captura de áudio em curso...",
        waitingCommand: "Aguardando comando de voz",
        orbInit: "Inicializar",
        terminalLabel: "live_transcript.txt",
        charsLabel: "caracteres",
        systemReadyToTranscribe: "O sistema está pronto para transcrever...",
        btnSave: "GUARDAR",
        btnExport: "EXPORTAR PDF",
        btnClear: "LIMPAR",
        modalClearTitle: "Limpar tudo?",
        modalClearMessage: "Esta ação é irreversível. Quer continuar?",
        modalCancel: "Cancelar",
        modalConfirm: "Confirmar",
        modalSuccessTitle: "PDF Exportado",
        modalSuccessMessage: "O ficheiro foi descarregado.",
        modalErrorTitle: "Erro de Exportação",
        modalErrorMessage: "Não foi possível gerar o PDF.",
        modalSaveSuccess: "Guardado",
        modalSaveSuccessMsg: "A transcrição foi guardada no seu histórico.",
        modalClearSuccess: "Limpo",
        modalClearSuccessMsg: "A transcrição foi reiniciada.",
        modalNoTranscript: "Transcrição vazia",
        modalNoTranscriptMsg: "Nenhuma transcrição para guardar.",
        modalMicroErrorTitle: "Erro de Microfone",
        modalMicroErrorMessage: "Não é possível aceder ao microfone. Verifique as suas permissões.",
        modalMicroUnavailable: 'Microfone indisponível.',
    },
    'ru-RU': {
        back: "НАЗАД",
        statusActive: "ЗАПИСЬ АКТИВНА",
        statusReady: "СИСТЕМА ГОТОВА",
        titlePrefix: "AURIANCE",
        titleSuffix: "ГОЛОС",
        recordingInCourse: "● Идет захват звука...",
        waitingCommand: "Ожидание голосовой команды",
        orbInit: "Инициализировать",
        terminalLabel: "live_transcript.txt",
        charsLabel: "симв.",
        systemReadyToTranscribe: "Система готова к транскрибации...",
        btnSave: "СОХРАНИТЬ",
        btnExport: "ЭКСПОРТ PDF",
        btnClear: "ОЧИСТИТЬ",
        modalClearTitle: "Очистить всё?",
        modalClearMessage: "Это действие необратимо. Хотите продолжить?",
        modalCancel: "Отмена",
        modalConfirm: "Подтвердить",
        modalSuccessTitle: "PDF экспортирован",
        modalSuccessMessage: "Файл загружен.",
        modalErrorTitle: "Ошибка экспорта",
        modalErrorMessage: "Не удалось создать PDF.",
        modalSaveSuccess: "Сохранено",
        modalSaveSuccessMsg: "Транскрипция сохранена в вашей истории.",
        modalClearSuccess: "Очищено",
        modalClearSuccessMsg: "Транскрипция была сброшена.",
        modalNoTranscript: "Пустая транскрипция",
        modalNoTranscriptMsg: "Нет транскрипции для сохранения.",
        modalMicroErrorTitle: "Ошибка микрофона",
        modalMicroErrorMessage: "Невозможно получить доступ к микрофону. Проверьте свои разрешения.",
        modalMicroUnavailable: 'Микрофон недоступен.',
    },
    'ur-PK': {
        back: "واپس",
        statusActive: "ریکارڈنگ فعال",
        statusReady: "سسٹم تیار ہے",
        titlePrefix: "AURIANCE",
        titleSuffix: "آواز",
        recordingInCourse: "● آڈیو کیپچر جاری ہے...",
        waitingCommand: "آواز کے حکم کا انتظار ہے",
        orbInit: "شروع کریں",
        terminalLabel: "live_transcript.txt",
        charsLabel: "حروف",
        systemReadyToTranscribe: "سسٹم ٹرانسکرائب کرنے کے لیے تیار ہے...",
        btnSave: "محفوظ کریں",
        btnExport: "ایکسپورٹ PDF",
        btnClear: "صاف کریں",
        modalClearTitle: "سب صاف کریں؟",
        modalClearMessage: "یہ عمل ابدی ہے۔ کیا آپ جاری رکھنا چاہتے ہیں؟",
        modalCancel: "منسوخ کریں",
        modalConfirm: "تصدیق کریں",
        modalSuccessTitle: "PDF ایکسپورٹ ہو گیا",
        modalSuccessMessage: "فائل ڈاؤن لوڈ ہو گئی ہے۔",
        modalErrorTitle: "ایکسپورٹ کی خرابی",
        modalErrorMessage: "PDF تیار کرنے میں ناکام۔",
        modalSaveSuccess: "محفوظ ہو گیا",
        modalSaveSuccessMsg: "ٹرانسکرپشن آپ کی تاریخ میں محفوظ ہو گئی ہے۔",
        modalClearSuccess: "صاف کر دیا گیا",
        modalClearSuccessMsg: "ٹرانسکرپشن ری سیٹ کر دیا گیا ہے۔",
        modalNoTranscript: "خالی ٹرانسکرپشن",
        modalNoTranscriptMsg: "محفوظ کرنے کے لیے کوئی ٹرانسکرپشن نہیں ہے۔",
        modalMicroErrorTitle: "مائیکروفون کی خرابی",
        modalMicroErrorMessage: "مائیکروفون تک رسائی ممکن نہیں۔ اپنی اجازتیں چیک کریں۔",
        modalMicroUnavailable: 'مائیکروفون دستیاب نہیں ہے۔',
    },
    'de-DE': {
        back: 'Zurück',
        statusActive: 'Aktiv',
        statusReady: 'Bereit',
        orbInit: 'Klicken zum Starten',
        titlePrefix: 'Live-',
        titleSuffix: 'Transkription',
        recordingInCourse: 'Aufnahme läuft...',
        waitingCommand: 'Warten auf Befehl',
        terminalLabel: 'Terminal',
        charsLabel: 'Zeichen',
        systemReadyToTranscribe: 'Das System ist bereit, Ihre Stimme zu transkribieren.',
        btnSave: 'Speichern',
        btnExport: 'PDF exportieren',
        btnClear: 'Löschen',
        modalSaveSuccess: 'Speichern erfolgreich',
        modalSaveSuccessMsg: 'Ihre Transkription wurde erfolgreich gespeichert.',
        modalSuccessTitle: 'PDF exportiert',
        modalSuccessMessage: 'Die Datei wurde heruntergeladen.',
        modalErrorTitle: 'Exportfehler',
        modalErrorMessage: 'PDF konnte nicht generiert werden.',
        modalClearTitle: 'Alles löschen?',
        modalClearMessage: 'Diese Aktion ist irreversibel. Möchten Sie fortfahren?',
        modalClearSuccess: 'Gelöscht',
        modalClearSuccessMsg: 'Die Transkription wurde zurückgesetzt.',
        modalNoTranscript: 'Leere Transkription',
        modalNoTranscriptMsg: 'Keine Transkription zum Speichern vorhanden.',
        modalMicroErrorTitle: 'Mikrofonfehler',
        modalMicroErrorMessage: "Zugriff auf das Mikrofon nicht möglich. Überprüfen Sie Ihre Berechtigungen.",
        modalMicroUnavailable: 'Mikrofon nicht verfügbar.',
    },
    'it-IT': {
        back: 'Indietro',
        statusActive: 'Attivo',
        statusReady: 'Pronto',
        orbInit: 'Clicca per iniziare',
        titlePrefix: 'Trascrizione',
        titleSuffix: 'in diretta',
        recordingInCourse: 'Registrazione in corso...',
        waitingCommand: 'In attesa di comando',
        terminalLabel: 'Terminale',
        charsLabel: 'caratteri',
        systemReadyToTranscribe: 'Il sistema è pronto a trascrivere la tua voce.',
        btnSave: 'Salva',
        btnExport: 'Esporta PDF',
        btnClear: 'Cancella',
        modalSaveSuccess: 'Salvataggio riuscito',
        modalSaveSuccessMsg: 'La tua trascrizione è stata salvata con successo.',
        modalSuccessTitle: 'PDF Esportato',
        modalSuccessMessage: 'Il file è stato scaricato.',
        modalErrorTitle: 'Errore Esportazione',
        modalErrorMessage: 'Impossibile generare il PDF.',
        modalClearTitle: 'Cancellare tutto?',
        modalClearMessage: 'Questa azione è irreversibile. Vuoi continuare?',
        modalClearSuccess: 'Cancellato',
        modalClearSuccessMsg: 'La trascrizione è stata ripristinata.',
        modalNoTranscript: 'Trascrizione vuota',
        modalNoTranscriptMsg: 'Nessuna trascrizione da salvare.',
        modalMicroErrorTitle: 'Errore Microfono',
        modalMicroErrorMessage: "Impossibile accedere al microfono. Controlla i tuoi permessi.",
        modalMicroUnavailable: 'Microfono non disponibile.',
    },
    'ja-JP': {
        back: '戻る',
        statusActive: 'アクティブ',
        statusReady: '準備完了',
        orbInit: 'クリックして開始',
        titlePrefix: 'ライブ',
        titleSuffix: '文字起こし',
        recordingInCourse: '録音中...',
        waitingCommand: 'コマンド待機中',
        terminalLabel: 'ターミナル',
        charsLabel: '文字',
        systemReadyToTranscribe: 'システムはあなたの音声を文字起こしする準備ができています。',
        btnSave: '保存',
        btnExport: 'PDFエクスポート',
        btnClear: 'クリア',
        modalSaveSuccess: '保存成功',
        modalSaveSuccessMsg: '文字起こしが正常に保存されました。',
        modalSuccessTitle: 'PDFエクスポート済み',
        modalSuccessMessage: 'ファイルがダウンロードされました。',
        modalErrorTitle: 'エクスポートエラー',
        modalErrorMessage: 'PDFを生成できませんでした。',
        modalClearTitle: 'すべてクリアしますか？',
        modalClearMessage: 'この操作は元に戻せません。続行しますか？',
        modalClearSuccess: 'クリア済み',
        modalClearSuccessMsg: '文字起こしがリセットされました。',
        modalNoTranscript: '空の文字起こし',
        modalNoTranscriptMsg: '保存する文字起こしがありません。',
        modalMicroErrorTitle: 'マイクエラー',
        modalMicroErrorMessage: "マイクにアクセスできません。権限を確認してください。",
        modalMicroUnavailable: 'マイクが利用できません。',
    },
};

import { useLanguage } from '../contexts/LanguageContext';

// Mapping from global language code to speech recognition locale
const LANG_TO_LOCALE = {
    'FR': 'fr-FR', 'EN': 'en-US', 'ES': 'es-ES', 'DE': 'de-DE', 'IT': 'it-IT',
    'PT': 'pt-PT', 'ZH': 'zh-CN', 'AR': 'ar-SA', 'JA': 'ja-JP', 'RU': 'ru-RU'
};

export default function LiveTranscription({ onBack, user }) {
    const { t: translate, currentLanguage } = useLanguage();
    const [theme, setTheme] = useState('dark');
    const isDark = theme === 'dark';
    const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    const [language, setLanguage] = useState(LANG_TO_LOCALE[currentLanguage] || 'fr-FR');

    // Sync speech recognition language with global language
    useEffect(() => {
        const newLocale = LANG_TO_LOCALE[currentLanguage];
        if (newLocale && newLocale !== language) {
            setLanguage(newLocale);
        }
    }, [currentLanguage]);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const langMenuRef = useRef(null);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'info', // 'info', 'success', 'error', 'confirm'
        title: '',
        message: '',
        onConfirm: null
    });

    const [selectedWord, setSelectedWord] = useState(null);
    const [wordPosition, setWordPosition] = useState({ x: 0, y: 0 });

    // Dictionnaire médical pour suggestions
    const medicalDict = ['douleur', 'migraine', 'patient', 'consultation', 'traitement', 'diagnostic', 'ordonnance', 'symptôme', 'allergie', 'doliprane', 'ibuprofène', 'paracétamol', 'aspirine', 'tension', 'température', 'pouls'];

    // Fonction Levenshtein pour similarité
    const levenshteinDistance = (a, b) => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const getSuggestions = (word) => {
        const lower = word.toLowerCase();
        const suggestions = medicalDict
            .map(dictWord => ({
                word: dictWord,
                distance: levenshteinDistance(lower, dictWord.toLowerCase())
            }))
            .filter(item => item.distance <= 3)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 4)
            .map(item => item.word);
        return suggestions.length > 0 ? suggestions : [word];
    };

    const handleWordClick = (word, event) => {
        const rect = event.target.getBoundingClientRect();
        setWordPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
        setSelectedWord(word);
    };

    const replaceWord = (oldWord, newWord) => {
        const regex = new RegExp(`\\b${oldWord}\\b`, 'gi');
        setTranscript(prev => prev.replace(regex, newWord));
        setSelectedWord(null);
    };

    const deleteWord = (word) => {
        const regex = new RegExp(`\\b${word}\\b\\s?`, 'gi');
        setTranscript(prev => prev.replace(regex, '').replace(/\s+/g, ' ').trim());
        setSelectedWord(null);
    };

    const showModal = ({ type = 'info', title, message, onConfirm = null }) => {
        setModalConfig({ isOpen: true, type, title, message, onConfirm });
    };

    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [audioLevel, setAudioLevel] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [sttAvailable, setSttAvailable] = useState(true);
    const [sttError, setSttError] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const isProcessingRef = useRef(false);
    const chunkQueueRef = useRef([]);
    const isSendingRef = useRef(false);
    const recognizerRef = useRef(null);

    // Feature Bio-Scan
    const [showBodyMap, setShowBodyMap] = useState(true);

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const transcribeBlob = async (blob, { append = true } = {}) => {
        if (!blob || blob.size === 0) return;
        const formData = new FormData();
        formData.append('audio_file', blob, 'recording.webm');
        // Pour le mode bilingue, envoyer 'auto' ou 'fr' au backend Whisper
        const transcribeLang = language === 'multi' ? 'auto' : language.split('-')[0];
        formData.append('language', transcribeLang);

        const response = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();

        if (response.ok && result?.success && result?.transcription?.text) {
            setTranscript(prev => {
                const next = result.transcription.text.trim();
                if (!next) return prev;
                if (!append) return next;
                return prev ? `${prev} ${next}` : next;
            });
        } else if (result?.error || result?.detail) {
            const errorMessage = result?.error || result?.detail;
            setTranscript(prev => prev || `❌ Erreur transcription: ${errorMessage}`);
        }
    };

    // SDK recognizer lifecycle
    useEffect(() => {
        return () => {
            recognizerRef.current?.destroy();
            mediaRecorderRef.current?.stream?.getTracks?.().forEach(track => track.stop());
        };
    }, []);

    // Restart recognizer when language changes mid-recording
    useEffect(() => {
        if (recognizerRef.current && isRecording) {
            recognizerRef.current.setLang(language === 'multi' ? '' : language);
        }
    }, [language]);

    const startWebSpeech = ({ resetText = true } = {}) => {
        if (!isWebSpeechSupported()) {
            setSttAvailable(false);
            return false;
        }

        if (recognizerRef.current) recognizerRef.current.destroy();

        const rec = createVoiceRecognizer({
            lang: language === 'multi' ? '' : language,
            continuous: true,
            interimResults: true,
            maxAlternatives: 10,
            autoRestart: true,
            restartDebounceMs: 500,
            punctuation: true,
        });

        rec.onResult(({ fullText }) => {
            setTranscript(fullText);
            setSttError('');
        });

        rec.onError(({ error, message }) => {
            if (error === 'not-allowed' || error === 'service-not-allowed') {
                setSttAvailable(false);
            }
            setSttError(`❌ ${message}`);
        });

        rec.onStateChange(({ state }) => {
            if (state === 'listening' || state === 'restarting') {
                setIsRecording(true);
            }
        });

        recognizerRef.current = rec;

        if (resetText) setTranscript('');
        const ok = rec.start(resetText);
        if (ok) {
            setIsRecording(true);
            setSttError('');
        }
        return ok;
    };

    const stopWebSpeech = () => {
        recognizerRef.current?.stop();
    };

    const startMediaRecorderFallback = async () => {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
            setTranscript('❌ Micro indisponible.');
            return false;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                audioChunksRef.current.push(event.data);
                chunkQueueRef.current.push(event.data);
                flushQueue();
            }
        };

        mediaRecorder.onstop = async () => {
            isProcessingRef.current = true;
            await flushQueue();
            try {
                const blobType = mediaRecorder.mimeType || 'audio/webm';
                const fullBlob = new Blob(audioChunksRef.current, { type: blobType });
                await transcribeBlob(fullBlob, { append: false });
            } catch (error) {
                console.error('Erreur transcription finale:', error);
            }
            isProcessingRef.current = false;
        };

        mediaRecorder.start(2000);
        setTranscript('🎙️ Écoute en cours...');
        setIsRecording(true);
        return true;
    };

    const flushQueue = async () => {
        if (isSendingRef.current) return;
        isSendingRef.current = true;
        try {
            while (chunkQueueRef.current.length > 0) {
                const blob = chunkQueueRef.current.shift();
                if (!blob || blob.size === 0) continue;
                try {
                    await transcribeBlob(blob, { append: true });
                } catch (error) {
                    console.error('Erreur transcription:', error);
                }
            }
        } finally {
            isSendingRef.current = false;
        }
    };

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
                setAudioLevel(Math.random() * 0.5 + 0.5);
            }, 100);
        } else {
            setElapsedTime(0);
            setAudioLevel(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const toggleRecording = async () => {
        if (isRecording) {
            stopWebSpeech();
            mediaRecorderRef.current?.stop();
            mediaRecorderRef.current?.stream?.getTracks?.().forEach(track => track.stop());
            setIsRecording(false);
            return;
        }
        if (isProcessingRef.current) return;

        const started = startWebSpeech({ resetText: true });
        if (started) return;

        try {
            await startMediaRecorderFallback();
        } catch (error) {
            console.error('Erreur micro:', error);
            showModal({ type: 'error', title: t.modalMicroErrorTitle, message: t.modalMicroErrorMessage });
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Use global translations if available, fallback to local TRANSLATIONS for languages not in global context
    const getGlobalT = () => {
        // Map speech recognition locale to global language code
        const localeToGlobal = { 'fr-FR': 'FR', 'en-US': 'EN', 'es-ES': 'ES', 'de-DE': 'DE', 'it-IT': 'IT', 'pt-PT': 'PT', 'zh-CN': 'ZH', 'ar-SA': 'AR', 'ja-JP': 'JA', 'ru-RU': 'RU' };
        const globalLang = localeToGlobal[language];

        if (globalLang) {
            const keys = ['back', 'statusActive', 'statusReady', 'titlePrefix', 'titleSuffix', 'recordingInCourse', 'waitingCommand', 'orbInit', 'terminalLabel', 'charsLabel', 'systemReadyToTranscribe', 'btnSave', 'btnExport', 'btnClear', 'modalClearTitle', 'modalClearMessage', 'modalCancel', 'modalConfirm', 'modalSuccessTitle', 'modalSuccessMessage', 'modalErrorTitle', 'modalErrorMessage', 'modalSaveSuccess', 'modalSaveSuccessMsg', 'modalClearSuccess', 'modalClearSuccessMsg', 'modalNoTranscript', 'modalNoTranscriptMsg', 'modalMicroErrorTitle', 'modalMicroErrorMessage', 'modalMicroUnavailable'];
            const result = {};
            keys.forEach(key => {
                const globalValue = translate(`dashboard.liveTranscription.${key}`);
                result[key] = globalValue !== `dashboard.liveTranscription.${key}` ? globalValue : (TRANSLATIONS[language]?.[key] || TRANSLATIONS['fr-FR'][key]);
            });
            return result;
        }
        return TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
    };
    const t = getGlobalT();

    const handleSave = async () => {
        if (!transcript || transcript.trim().length === 0) {
            showModal({ type: 'info', title: t.modalNoTranscript, message: t.modalNoTranscriptMsg });
            return;
        }
        try {
            const token = localStorage.getItem('token');
            // Pour le mode bilingue, utiliser 'fr' comme langue de base pour la sauvegarde
            const saveLang = language === 'multi' ? 'fr' : language.split('-')[0];
            const displayLocale = language === 'multi' ? 'fr-FR' : language;
            await saveTranscription({
                text: transcript,
                duration: Math.floor(elapsedTime / 10),
                language: saveLang,
                title: `Transcription du ${new Date().toLocaleDateString(displayLocale)}`,
                type: 'live'
            }, token);
            showModal({ type: 'success', title: t.modalSaveSuccess, message: t.modalSaveSuccessMsg });
        } catch (error) {
            showModal({ type: 'error', title: 'Erreur', message: 'Échec de la sauvegarde.' });
        }
    };

    const handleExportPdf = async () => {
        if (!transcript) return;
        try {
            const token = localStorage.getItem('token');
            // Pour le mode bilingue, utiliser 'fr' comme langue de base
            const exportLang = language === 'multi' ? 'fr' : language.split('-')[0];
            const pdfBlob = await exportTranscriptionPdf({
                text: transcript,
                duration: Math.floor(elapsedTime / 10),
                language: exportLang,
                title: `Transcription_${new Date().toISOString().split('T')[0]}`,
                type: 'live'
            }, token);

            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/octet-stream' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `Transcription_Auriance_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

            showModal({ type: 'success', title: t.modalSuccessTitle, message: t.modalSuccessMessage });
        } catch (error) {
            showModal({ type: 'error', title: t.modalErrorTitle, message: t.modalErrorMessage });
        }
    };

    const handleClearTranscript = () => {
        if (!transcript) return;
        showModal({
            type: 'confirm',
            title: t.modalClearTitle,
            message: t.modalClearMessage,
            onConfirm: () => {
                setTranscript('');
                sessionTextRef.current = '';
                partialTextRef.current = '';
                setElapsedTime(0);
                showModal({ type: 'success', title: t.modalClearSuccess, message: t.modalClearSuccessMsg });
            }
        });
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white selection:bg-cyan-500/30 selection:text-cyan-200' : 'bg-slate-50 text-slate-900 selection:bg-cyan-200/50 selection:text-cyan-900'}`}>
            {/* Background Ambient Effects (Dark Mode Only) */}
            {isDark && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px]" />
                </div>
            )}

            {/* Header HUD */}
            <div className={`sticky top-0 z-20 border-b backdrop-blur-xl transition-colors ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-200 bg-white/70'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-200/50 text-slate-600 hover:text-slate-900'}`}
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-mono text-sm">{t.back}</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'}`}>
                            <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-cyan-500'}`} />
                            <span className={`text-xs font-mono tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                                {isRecording ? t.statusActive : t.statusReady}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-3 font-mono text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-400' : (isDark ? 'text-slate-600' : 'text-slate-400')}`} />
                            <span>{formatTime(Math.floor(elapsedTime / 10))}</span>
                        </div>

                        {/* Custom Language Dropdown */}
                        <div className="relative mx-2" ref={langMenuRef}>
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${isDark
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'}`}
                            >
                                <span className="text-sm">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                                <span className="text-xs font-semibold uppercase tracking-wide">{LANGUAGES.find(l => l.code === language)?.code.split('-')[0]}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showLangMenu && (
                                <div className={`absolute top-full mt-2 right-0 w-48 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ${isDark
                                    ? 'bg-slate-900/90 border-white/10 text-white'
                                    : 'bg-white/90 border-slate-200 text-slate-800'}`}
                                >
                                    <div className="p-1.5 flex flex-col gap-0.5">
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLanguage(lang.code);
                                                    setShowLangMenu(false);
                                                }}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${language === lang.code
                                                    ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                                                    : (isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900')
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">{lang.flag}</span>
                                                    <span>{lang.label}</span>
                                                </div>
                                                {language === lang.code && <Check className="w-3.5 h-3.5 opacity-70" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleTheme}
                            className={`h-9 w-9 rounded-full flex items-center justify-center transition ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                {/* Central Orb Section */}
                <div className="flex flex-col items-center justify-center mb-16 relative">
                    {/* Orb Glow Behind */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[80px] transition-opacity duration-1000 ${isDark ? 'bg-gradient-to-tr from-cyan-500/10 to-violet-500/10' : 'bg-gradient-to-tr from-cyan-400/20 to-violet-400/20'} ${isRecording ? 'opacity-100' : 'opacity-30'}`} />

                    <button
                        onClick={toggleRecording}
                        className={`relative group focus:outline-none transition-transform duration-500 ${isRecording ? 'scale-105' : 'hover:scale-[1.02]'}`}
                    >
                        <div className={`absolute inset-0 rounded-full border ${isDark ? 'border-white/10' : 'border-slate-900/10'} ${isRecording ? 'animate-ping opacity-20' : 'opacity-0'}`} />
                        <VoiceOrb isListening={isRecording} audioLevel={audioLevel} size={480} />

                        {!isRecording && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className={`text-xs font-mono tracking-[0.5em] uppercase ${isDark ? 'text-white/30' : 'text-slate-900/30'}`}>{t.orbInit}</span>
                            </div>
                        )}
                    </button>

                    <div className="mt-10 text-center space-y-2">
                        <h2 className={`text-3xl font-light tracking-[0.2em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {t.titlePrefix} <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{t.titleSuffix}</span>
                        </h2>
                        <p className={`text-sm tracking-widest uppercase transition-colors duration-300 ${isRecording ? 'text-rose-400' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                            {isRecording ? t.recordingInCourse : t.waitingCommand}
                        </p>
                    </div>
                </div>

                {/* Transcription Terminal */}
                <div className="relative group">
                    <div className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 bg-gradient-to-r from-cyan-500/20 to-violet-500/20`}></div>
                    <div className={`relative backdrop-blur-xl border rounded-2xl overflow-hidden shadow-2xl transition-colors ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/80 border-slate-200'}`}>
                        {/* Terminal Bar */}
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50/80 border-slate-200'}`}>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                            </div>

                            {/* Toggle Bio-Scan */}
                            <button
                                onClick={() => setShowBodyMap(!showBodyMap)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${showBodyMap
                                    ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600')
                                    : (isDark ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-400')
                                    }`}
                            >
                                <Activity className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">Bio-Scan</span>
                            </button>

                            <div className="flex items-center gap-4">
                                <div className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.terminalLabel}</div>
                                <div className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{transcript.length} {t.charsLabel}</div>
                            </div>
                        </div>

                        {/* Text Area */}
                        <div className={`p-0 min-h-[250px] transition-all duration-500 ease-in-out ${showBodyMap ? 'h-[600px]' : 'max-h-[500px]'}`}>
                            {showBodyMap ? (
                                <div className="flex flex-col lg:flex-row h-full">
                                    {/* Zone Texte Scrollable */}
                                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar h-full">
                                        {transcript ? (
                                            <p className={`text-lg leading-relaxed font-light ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {transcript.split(/\s+/).map((word, idx) => (
                                                    <span
                                                        key={idx}
                                                        onClick={(e) => handleWordClick(word, e)}
                                                        className={`inline-block mr-1 cursor-pointer hover:bg-cyan-500/20 px-1 rounded transition-colors ${isDark ? 'hover:text-cyan-300' : 'hover:text-cyan-700'}`}
                                                    >
                                                        {word}
                                                    </span>
                                                ))}
                                                {isRecording && (
                                                    <span className="inline-block w-2.5 h-5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                                                )}
                                            </p>
                                        ) : (
                                            <div className={`flex flex-col items-center justify-center h-full space-y-4 py-10 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                                <Mic className="w-12 h-12 opacity-20" />
                                                <p className="font-mono text-sm">{t.systemReadyToTranscribe}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Zone Bio-Scan (Fixe) */}
                                    <div className={`w-full lg:w-[350px] border-l ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50/50'} relative overflow-hidden`}>
                                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4">
                                            <BodyMap transcript={transcript} isDark={isDark} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Vue standard (Texte uniquement)
                                <div className="p-8 h-full overflow-y-auto custom-scrollbar max-h-[500px]">
                                    {transcript ? (
                                        <p className={`text-lg leading-relaxed font-light ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {transcript.split(/\s+/).map((word, idx) => (
                                                <span
                                                    key={idx}
                                                    onClick={(e) => handleWordClick(word, e)}
                                                    className={`inline-block mr-1 cursor-pointer hover:bg-cyan-500/20 px-1 rounded transition-colors ${isDark ? 'hover:text-cyan-300' : 'hover:text-cyan-700'}`}
                                                >
                                                    {word}
                                                </span>
                                            ))}
                                            {isRecording && (
                                                <span className="inline-block w-2.5 h-5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                                            )}
                                        </p>
                                    ) : (
                                        <div className={`flex flex-col items-center justify-center h-full space-y-4 py-10 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                            <Mic className="w-12 h-12 opacity-20" />
                                            <p className="font-mono text-sm">{t.systemReadyToTranscribe}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Correction Popup */}
                {selectedWord && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setSelectedWord(null)}
                        />
                        <div
                            className={`fixed z-50 backdrop-blur-xl border rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-black/80 border-cyan-500/30' : 'bg-white/90 border-cyan-300'}`}
                            style={{
                                left: `${wordPosition.x}px`,
                                top: `${wordPosition.y}px`,
                                transform: 'translate(-50%, -100%)'
                            }}
                        >
                            <div className={`text-xs font-mono mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Suggestions :</div>
                            <div className="space-y-1">
                                {getSuggestions(selectedWord).map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => replaceWord(selectedWord, suggestion)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'hover:bg-cyan-500/20 text-cyan-200' : 'hover:bg-cyan-100 text-cyan-800'}`}
                                    >
                                        {suggestion}
                                    </button>
                                ))}

                                {/* Séparateur */}
                                <div className={`border-t my-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}></div>

                                {/* Actions */}
                                <button
                                    onClick={() => deleteWord(selectedWord)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isDark ? 'hover:bg-rose-500/20 text-rose-300' : 'hover:bg-rose-100 text-rose-600'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Supprimer
                                </button>

                                <button
                                    onClick={() => setSelectedWord(null)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isDark ? 'hover:bg-slate-700/50 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Garder l'original
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <button
                        onClick={handleSave}
                        disabled={!transcript}
                        className={`group relative px-6 py-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-500/20 hover:border-cyan-500/50' : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 hover:border-cyan-300'}`}
                    >
                        <div className="relative flex items-center justify-center gap-3 z-10">
                            <Save className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                            <span className={`font-mono text-sm font-medium ${isDark ? 'text-cyan-100' : 'text-cyan-800'}`}>{t.btnSave}</span>
                        </div>
                    </button>

                    <button
                        onClick={handleExportPdf}
                        disabled={!transcript}
                        className={`group relative px-6 py-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'bg-violet-950/30 hover:bg-violet-900/40 border-violet-500/20 hover:border-violet-500/50' : 'bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-300'}`}
                    >
                        <div className="relative flex items-center justify-center gap-3 z-10">
                            <FileDown className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                            <span className={`font-mono text-sm font-medium ${isDark ? 'text-violet-100' : 'text-violet-800'}`}>{t.btnExport}</span>
                        </div>
                    </button>

                    <button
                        onClick={handleClearTranscript}
                        disabled={!transcript}
                        className={`group relative px-6 py-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-500/20 hover:border-rose-500/50' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 hover:border-rose-300'}`}
                    >
                        <div className="relative flex items-center justify-center gap-3 z-10">
                            <span className={`font-mono text-sm font-medium ${isDark ? 'text-rose-100' : 'text-rose-800'}`}>{t.btnClear}</span>
                        </div>
                    </button>
                </div>
            </main>

            {/* Custom Modal Overlay */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
                    <div className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl overflow-hidden ${isDark
                        ? 'bg-slate-900/95 border-white/10 text-white shadow-cyan-500/10'
                        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
                        }`}>
                        <div className="flex flex-col items-center text-center gap-5">
                            <div className={`p-4 rounded-full ring-1 ring-inset ${modalConfig.type === 'error' ? 'bg-rose-500/10 text-rose-500 ring-rose-500/20' :
                                modalConfig.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20' :
                                    'bg-cyan-500/10 text-cyan-500 ring-cyan-500/20'
                                }`}>
                                {modalConfig.type === 'error' && <AlertTriangle className="w-8 h-8" />}
                                {modalConfig.type === 'success' && <CheckCircle className="w-8 h-8" />}
                                {modalConfig.type === 'info' && <AlertTriangle className="w-8 h-8" />}
                                {modalConfig.type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight">{modalConfig.title}</h3>
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {modalConfig.message}
                                </p>
                            </div>

                            <div className="flex gap-3 w-full mt-2">
                                {modalConfig.type === 'confirm' ? (
                                    <>
                                        <button
                                            onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${isDark
                                                ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                        >
                                            {t.modalCancel || 'Cancel'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                modalConfig.onConfirm?.();
                                                setModalConfig(prev => ({ ...prev, isOpen: false }));
                                            }}
                                            className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/25"
                                        >
                                            {t.modalConfirm || 'Confirm'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/25"
                                    >
                                        OK
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
                }
            `}</style>
        </div>
    );
}
