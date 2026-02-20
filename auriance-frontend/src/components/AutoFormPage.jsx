"use client";
import React, { useState, useRef, useEffect } from "react";
import {
    FileText,
    Wand2,
    Download,
    Copy,
    Check,
    Edit3,
    Save,
    Sparkles,
    AlertCircle,
    Printer,
    Send,
    History,
    Plus,
    Mic,
    MicOff,
    StopCircle,
    Loader2,
    Activity,
    Leaf,
    Hammer,
    ArrowRight,
    AlertTriangle,
    CheckCircle,
    X,
    Sun,
    Moon,
    Globe,
    ChevronDown,
    ArrowLeft,
    Trash2
} from "lucide-react";
import { VoiceWave } from "./VoiceWave";
import { saveConsultation, savePdf, saveTranscription, exportTranscriptionPdf, saveExtraction } from "../services/api";
import { createVoiceRecognizer, isWebSpeechSupported } from '../../sdk/auriance-voice-sdk.js';
import { useLanguage } from '../contexts/LanguageContext';

// Mapping from global language code to speech recognition locale
const LANG_TO_LOCALE = {
    'FR': 'fr-FR', 'EN': 'en-US', 'ES': 'es-ES', 'DE': 'de-DE', 'IT': 'it-IT',
    'PT': 'pt-PT', 'ZH': 'zh-CN', 'AR': 'ar-SA', 'JA': 'ja-JP', 'RU': 'ru-RU'
};

const templates = [
    { id: 1, name: "Consultation générale", fields: 12 },
    { id: 2, name: "Ordonnance", fields: 8 },
    { id: 3, name: "Certificat médical", fields: 6 },
    { id: 4, name: "Compte-rendu hospitalier", fields: 15 },
    { id: 5, name: "Bilan sanguin", fields: 20 },
];

const LANGUAGES = [
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'zh-CN', label: 'Mandarin', flag: '🇨🇳' },
    { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
    { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { code: 'ar-SA', label: 'Arabic', flag: '🇸🇦' },
    { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { code: 'bn-BD', label: 'Bengali', flag: '🇧🇩' },
    { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
    { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'ur-PK', label: 'Urdu', flag: '🇵🇰' },
];

const TRANSLATIONS = {
    'en-US': {
        titlePrefix: "AUTO", titleSuffix: "FORM",
        description: "Select a field, dictate your observations and let AI automatically structure your technical or medical report.",
        voiceCardTitle: "Voice Dictation", voiceCardStatusIdle: "TAP TO SPEAK", voiceCardStatusListening: "LISTENING...",
        rawTranscript: "Raw transcript", quickTemplates: "Quick Templates", demoButton: "FILL WITH DEMO DATA",
        generatedReport: "Generated Report", autoExtraction: "Automatic entity extraction", waitingData: "Waiting for data...",
        btnValidate: "VALIDATE", btnExport: "EXPORT PDF", btnClear: "CLEAR",
        modalClearTitle: "Clear everything?", modalClearMessage: "This action will reset the form and transcription. Continue?",
        modalSaveSuccess: "Save Successful", modalSaveSuccessMessage: "The form has been successfully saved.",
        modalErrorSTT: "Your browser does not support voice recognition.",
        config: {
            medical: {
                label: "Health", fields: ["Patient", "Age", "Symptoms", "Prescribed Med", "Diagnosis", "Recommendations"],
                triggers: { "Patient": ['patient', 'mr', 'mrs', 'child', 'name', 'subject'], "Age": ['age', 'years old', 'he is', 'she is', 'old'], "Symptoms": ['symptoms', 'symptom', 'signs', 'pain', 'hurts', 'complains', 'reason'], "Prescribed Med": ['medication', 'treatment', 'prescribe', 'prescription', 'take', 'give'], "Diagnosis": ['diagnosis', 'conclusion', 'result', 'it is', 'suffering from'], "Recommendations": ['recommendation', 'advice', 'see again', 'appointment', 'watch out'] }
            },
            biodiversity: {
                label: "Biodiversity", fields: ["Species", "Number", "Location", "Behavior", "Weather"],
                triggers: { "Species": ['species', 'animal', 'seen', 'observed', 'bird', 'mammal'], "Number": ['number', 'quantity', 'count', 'individuals', 'subjects'], "Location": ['location', 'place', 'near', 'beside', 'in', 'on'], "Behavior": ['behavior', 'action', 'doing', 'was', 'moving'], "Weather": ['weather', 'conditions', 'sun', 'rain', 'wind', 'sky'] }
            },
            construction: {
                label: "Construction", fields: ["Project", "Progress", "Issue", "Next Step", "Date"],
                triggers: { "Project": ['site', 'project', 'location', 'client', 'building', 'tower'], "Progress": ['progress', 'percent', 'status', 'stage', 'advancement'], "Issue": ['problem', 'blocking', 'issue', 'delay', 'incident', 'alert'], "Next Step": ['next', 'step', 'action', 'to do', 'plan'], "Date": ['date', 'day', 'today'] }
            }
        }
    },
    'zh-CN': {
        titlePrefix: "自动", titleSuffix: "表格",
        description: "选择领域，口述观察结果，让人工智能自动构建您的技术或医疗报告。",
        voiceCardTitle: "语音听写", voiceCardStatusIdle: "点击说话", voiceCardStatusListening: "正在倾听...",
        rawTranscript: "原始文本", quickTemplates: "快捷模板", demoButton: "使用演示数据填充",
        generatedReport: "生成的报告", autoExtraction: "自动实体提取", waitingData: "等待数据...",
        btnValidate: "验证", btnExport: "导出 PDF", btnClear: "清除",
        modalClearTitle: "全部清除？", modalClearMessage: "此操作将重置表格和听写。是否继续？",
        modalSaveSuccess: "保存成功", modalSaveSuccessMessage: "表格已成功保存。",
        modalErrorSTT: "您的浏览器不支持语音识别。",
        config: {
            medical: {
                label: "健康", fields: ["患者", "年龄", "症状", "处方药", "诊断", "建议"],
                triggers: { "患者": ['患者', '先生', '女士', '小孩', '名字'], "年龄": ['年龄', '岁', '他', '她'], "症状": ['症状', '征兆', '疼痛', '不舒服', '投诉'], "处方药": ['药物', '治疗', '开药', '处方', '服用'], "诊断": ["诊断", "结论", "结果", "患有"], "建议": ["建议", "劝告", "复诊", "预约", "注意"] }
            },
            biodiversity: {
                label: "生物多样性", fields: ["物种", "数量", "地点", "行为", "天气"],
                triggers: { "物种": ['物种', '动物', '看到', '观察到', '鸟', '哺乳动物'], "数量": ['数量', '多少', '计数', '个体'], "地点": ['地点', '地方', '靠近', '在...旁边', '在'], "行为": ['行为', '动作', '正在做', '当时是'], "天气": ['天气', '情况', '太阳', '下雨', '风', '天空'] }
            },
            construction: {
                label: "建筑", fields: ["项目", "进度", "问题", "下一步", "日期"],
                triggers: { "项目": ['工地', '项目', '地点', '客户', '建筑'], "进度": ['进度', '百分比', '状态', '阶段'], "问题": ['问题', '阻碍', '延迟', '事故', '警告'], "下一步": ['下一步', '步骤', '行动', '要做', '计划'], "日期": ['日期', '天', '今天'] }
            }
        }
    },
    'hi-IN': {
        titlePrefix: "ऑटो", titleSuffix: "फ़ॉर्म",
        description: "एक क्षेत्र चुनें, अपनी टिप्पणियों को बोलें और AI को स्वचालित रूप से आपकी तकनीकी या चिकित्सा रिपोर्ट तैयार करने दें।",
        voiceCardTitle: "वॉइस डिक्टेशन", voiceCardStatusIdle: "बोलने के लिए टैप करें", voiceCardStatusListening: "सुन रहा हूँ...",
        rawTranscript: "रॉ ट्रांसक्रिप्ट", quickTemplates: "त्वरित टेम्प्लेट", demoButton: "डेमो डेटा के साथ भरें",
        generatedReport: "जनरेट की गई रिपोर्ट", autoExtraction: "स्वचालित इकाई निष्कर्षण", waitingData: "डेटा की प्रतीक्षा है...",
        btnValidate: "पुष्टि करें", btnExport: "PDF निर्यात करें", btnClear: "साफ़ करें",
        modalClearTitle: "सब साफ़ करें?", modalClearMessage: "यह कार्रवाई फ़ॉर्म और डिक्टेशन को रीसेट कर देगी। जारी रखें?",
        modalSaveSuccess: "सफलतापूर्वक सहेजा गया", modalSaveSuccessMessage: "फ़ॉर्म सफलतापूर्वक सहेज लिया गया है।",
        modalErrorSTT: "आपका ब्राउज़र वॉइस रिकग्निशन का समर्थन नहीं करता है।",
        config: {
            medical: {
                label: "स्वास्थ्य", fields: ["मरीज", "आयु", "लक्षण", "निर्धारित दवा", "निदान", "सिफारिशें"],
                triggers: { "मरीज": ['मरीज', 'श्रीमान', 'श्रीमती', 'बच्चा', 'नाम'], "आयु": ['आयु', 'उम्र', 'साल'], "लक्षण": ['लक्षण', 'दर्द', 'तकलीफ', 'शिकायत'], "निर्धारित दवा": ['दवा', 'उपचार', 'नुस्खा'], "निदान": ['निदान', 'निष्कर्ष', 'परिणाम'], "सिफारिशें": ['सिफारिश', 'सलाह', 'नियुक्ति', 'ध्यान दें'] }
            },
            biodiversity: {
                label: "जैव विविधता", fields: ["प्रजाति", "संख्या", "स्थान", "व्यवहार", "मौसम"],
                triggers: { "प्रजाति": ['प्रजाति', 'जानवर', 'देखा', 'पक्षी'], "संख्या": ['संख्या', 'गिनती'], "स्थान": ['स्थान', 'जगह', 'पास'], "व्यवहार": ['व्यवहार', 'काम'], "मौसम": ['मौसम', 'धूप', 'बारिश'] }
            },
            construction: {
                label: "निर्माण", fields: ["परियोजना", "प्रगति", "समस्या", "अगला कदम", "तारीख"],
                triggers: { "परियोजना": ['साइट', 'परियोजना', 'ग्राहक'], "प्रगति": ['प्रगति', 'प्रतिशत', 'स्थिति'], "समस्या": ['समस्या', 'देरी', 'घटना'], "अगला कदम": ['अगला', 'कदम', 'योजना'], "तारीख": ['तारीख', 'आज'] }
            }
        }
    },
    'es-ES': {
        titlePrefix: "AUTO", titleSuffix: "FORMULARIO",
        description: "Seleccione un campo, dicte sus observaciones y deje que la IA estructure automáticamente su informe técnico o médico.",
        voiceCardTitle: "Dictado de Voz", voiceCardStatusIdle: "PULSA PARA HABLAR", voiceCardStatusListening: "ESCUCHANDO...",
        rawTranscript: "Transcripción bruta", quickTemplates: "Modelos Rápidos", demoButton: "RELLENAR CON DATOS DEMO",
        generatedReport: "Informe Generado", autoExtraction: "Extracción automática de entidades", waitingData: "Esperando datos...",
        btnValidate: "VALIDAR", btnExport: "EXPORTAR PDF", btnClear: "BORRAR",
        modalClearTitle: "¿Borrar todo?", modalClearMessage: "Esta acción restablecerá el formulario y la transcripción. ¿Continuar?",
        modalSaveSuccess: "Guardado Exitoso", modalSaveSuccessMessage: "El formulario se ha guardado correctamente.",
        modalErrorSTT: "Su navegador no admite el reconocimiento de voz.",
        config: {
            medical: {
                label: "Salud", fields: ["Paciente", "Edad", "Síntomas", "Medicina prescrita", "Diagnóstico", "Recomendaciones"],
                triggers: { "Paciente": ['paciente', 'señor', 'señora', 'niño', 'nombre'], "Edad": ['edad', 'años', 'tiene'], "Síntomas": ['sintomas', 'dolor', 'duele', 'signos'], "Medicina prescrita": ['medicamento', 'tratamiento', 'receta', 'prescribo'], "Diagnóstico": ['diagnostico', 'conclusion', 'resultado'], "Recomendaciones": ['recomendacion', 'consejo', 'cita', 'atencion'] }
            },
            biodiversity: {
                label: "Biodiversidad", fields: ["Especie", "Número", "Lugar", "Comportamiento", "Clima"],
                triggers: { "Especie": ['especie', 'animal', 'visto', 'ave'], "Número": ['numero', 'cantidad'], "Lugar": ['lugar', 'sitio', 'cerca'], "Comportamiento": ['comportamiento', 'accion'], "Clima": ['clima', 'tiempo', 'sol', 'lluvia'] }
            },
            construction: {
                label: "Obra", fields: ["Proyecto", "Progreso", "Problema", "Próxima etapa", "Fecha"],
                triggers: { "Proyecto": ['obra', 'proyecto', 'cliente'], "Progreso": ['progreso', 'porcentaje', 'estado'], "Problema": ['problema', 'retraso', 'incidente'], "Próxima etapa": ['siguiente', 'paso', 'hacer'], "Fecha": ['fecha', 'dia', 'hoy'] }
            }
        }
    },
    'ar-SA': {
        titlePrefix: "تلقائي", titleSuffix: "نموذج",
        description: "حدد مجالاً، وقم بإملاء ملاحظاتك واترك الذكاء الاصطناعي ينظم تقريرك الفني أو الطبي تلقائيًا.",
        voiceCardTitle: "الإملاء الصوتي", voiceCardStatusIdle: "اضغط للتحدث", voiceCardStatusListening: "جاري الاستماع...",
        rawTranscript: "النص الخام", quickTemplates: "قوالب سريعة", demoButton: "ملء ببيانات تجريبية",
        generatedReport: "التقرير المولد", autoExtraction: "استخراج الكيانات تلقائيًا", waitingData: "في انتظار البيانات...",
        btnValidate: "تصديق", btnExport: "تصدير PDF", btnClear: "مسح",
        modalClearTitle: "مسح الكل؟", modalClearMessage: "سيؤدي هذا الإجراء إلى إعادة تعيين النموذج والإملاء. هل ترغب في الاستمرار؟",
        modalSaveSuccess: "تم الحفظ بنجاح", modalSaveSuccessMessage: "تم حفظ النموذج بنجاح.",
        modalErrorSTT: "متصفحك لا يدعم التعرف على الصوت.",
        config: {
            medical: {
                label: "الصحة", fields: ["المريض", "العمر", "الأعراض", "الدواء الموصوف", "التشخيص", "التوصيات"],
                triggers: { "المريض": ['مريض', 'سيد', 'سيدة', 'طفل', 'اسم'], "العمر": ['عمر', 'سن', 'سنة'], "الأعراض": ['أعراض', 'ألم', 'يؤلم', 'علامات'], "الدواء الموصوف": ['دواء', 'علاج', 'وصفة', 'روشتة'], "التشخيص": ['تشخيص', 'استنتاج', 'نتيجة'], "التوصيات": ['توصية', 'نصيحة', 'موعد', 'انتباه'] }
            },
            biodiversity: {
                label: "التنوع البيولوجي", fields: ["النوع", "العدد", "الموقع", "السلوك", "الطقس"],
                triggers: { "النوع": ['نوع', 'حيوان', 'رؤية', 'طائر'], "العدد": ['عدد', 'كمية'], "الموقع": ['موقع', 'مكان', 'قرب'], "السلوك": ['سلوك', 'حركة'], "الطقس": ['طقس', 'جو', 'شمس', 'مطر'] }
            },
            construction: {
                label: "البناء", fields: ["المشروع", "التقدم", "المشكلة", "الخطوة التالية", "التاريخ"],
                triggers: { "المشروع": ['موقع', 'مشروع', 'عميل'], "التقدم": ['تقدم', 'نسبة', 'حالة'], "المشكلة": ['مشكلة', 'تأخير', 'حادث'], "الخطوة التالية": ['خطوة', 'قادم', 'خطة'], "التاريخ": ['تاريخ', 'يوم', 'اليوم'] }
            }
        }
    },
    'fr-FR': {
        titlePrefix: "AUTO", titleSuffix: "FORMULAIRE",
        description: "Sélectionnez un domaine, dictez vos observations et laissez l'IA structurer automatiquement votre rapport technique ou médical.",
        voiceCardTitle: "Dictée Vocale", voiceCardStatusIdle: "APPUYEZ POUR PARLER", voiceCardStatusListening: "ÉCOUTE EN COURS...",
        rawTranscript: "Transcription brute", quickTemplates: "Modèles Rapides", demoButton: "REMPLIR AVEC DONNÉES DÉMO",
        generatedReport: "Rapport Généré", autoExtraction: "Extraction automatique des entités", waitingData: "En attente de données...",
        btnValidate: "VALIDER", btnExport: "EXPORT PDF", btnClear: "EFFACER",
        modalClearTitle: "Tout effacer ?", modalClearMessage: "Cette action réinitialisera le formulaire et la transcription. Continuer ?",
        modalSaveSuccess: "Sauvegarde Réussie", modalSaveSuccessMessage: "La fiche a été enregistrée avec succès.",
        modalErrorSTT: "Votre navigateur ne supporte pas la reconnaissance vocale.",
        config: {
            medical: {
                label: "Santé", fields: ["Nom du patient", "Âge", "Symptômes", "Médicament prescrit", "Diagnostic", "Recommandations"],
                triggers: { "Nom du patient": ['patient', 'monsieur', 'madame', 'enfant', 'nom', 'sujet', 'nom du patient'], "Âge": ['age', 'age de', 'il a', 'elle a', 'vie'], "Symptômes": ['symptomes', 'symptome', 'signes', 'douleur', 'mal a', 'plaint de', 'motif'], "Médicament prescrit": ['medicament', 'traitement', 'prescris', 'ordonnance', 'prendre', 'donne'], "Diagnostic": ['diagnostic', 'conclusion', 'resultat', 'il s\'agit de', 'est une', 'a une'], "Recommandations": ['recommandation', 'conseil', 'revoir', 'rendez-vous', 'attention'] }
            },
            biodiversity: {
                label: "Biodiversité", fields: ["Espèce", "Nombre", "Lieu", "Comportement", "Météo"],
                triggers: { "Espèce": ['espece', 'animal', 'vu', 'observ', 'oiseau', 'mammifere'], "Nombre": ['nombre', 'quantite', 'compte', 'individus', 'sujets'], "Lieu": ['lieu', 'endroit', 'pres de', 'a cote de', 'dans', 'sur'], "Comportement": ['comportement', 'action', 'train de', 'faisait', 'entrain'], "Météo": ['meteo', 'temps', 'soleil', 'pluie', 'vent', 'ciel'] }
            },
            construction: {
                label: "Chantier", fields: ["Projet", "Avancement", "Problème", "Prochaine étape", "Date"],
                triggers: { "Projet": ['chantier', 'projet', 'site', 'client', 'batiment', 'immeuble'], "Avancement": ['avancement', 'progression', 'pourcent', 'etat', 'stade'], "Problème": ['probleme', 'bloquant', 'souci', 'retard', 'incident', 'alerte'], "Prochaine étape": ['suite', 'prochaine', 'etape', 'action', 'faire', 'prevoir'], "Date": ['date', 'jour', 'aujourd\'hui'] }
            }
        }
    },
    'bn-BD': {
        titlePrefix: "অটো", titleSuffix: "ফর্ম",
        description: "একটি ক্ষেত্র নির্বাচন করুন, আপনার পর্যবেক্ষণ বলুন এবং AI কে স্বয়ংক্রিয়ভাবে আপনার প্রযুক্তিগত বা চিকিৎসা প্রতিবেদন তৈরি করতে দিন।",
        voiceCardTitle: "ভয়েস ডিক্টেশন", voiceCardStatusIdle: "কথা বলতে ট্যাপ করুন", voiceCardStatusListening: "শুনছি...",
        rawTranscript: "ট্রান্সক্রিপ্ট", quickTemplates: "দ্রুত টেম্পলেট", demoButton: "ডেমো ডেটা দিয়ে পূরণ করুন",
        generatedReport: "জেনারেট করা রিপোর্ট", autoExtraction: "স্বয়ংক্রিয় তথ্য নিষ্কাশন", waitingData: "ডেটার জন্য অপেক্ষা...",
        btnValidate: "যাচাই করুন", btnExport: "PDF এক্সপোর্ট করুন", btnClear: "মুছে ফেলুন",
        modalClearTitle: "সব মুছবেন?", modalClearMessage: "এটি ফর্ম এবং ডিক্টেশন রিসেট করবে। চালিয়ে যাবেন?",
        modalSaveSuccess: "সফলভাবে সংরক্ষিত", modalSaveSuccessMessage: "ফর্মটি সফলভাবে সংরক্ষিত হয়েছে।",
        modalErrorSTT: "আপনার ব্রাউজার ভয়েস রিকগনিশন সমর্থন করে না।",
        config: {
            medical: {
                label: "স্বাস্থ্য", fields: ["রোগী", "বয়স", "লক্ষণ", "নির্ধারিত ওষুধ", "রোগনির্ণয়", "পরামর্শ"],
                triggers: { "রোগী": ['রোগী', 'নাম'], "বয়স": ['বয়স', 'বছর'], "লক্ষণ": ['লক্ষণ', 'ব্যথা'], "নির্ধারিত ওষুধ": ['ওষুধ', 'চিকিৎসা'], "রোগনির্ণয়": ['রোগনির্ণয়', 'ফলাফল'], "পরামর্শ": ['পরামর্শ', 'পরামর্শ', 'দেখা'] }
            },
            biodiversity: {
                label: "জীববৈচিত্র্য", fields: ["প্রজাতি", "সংখ্যা", "স্থান", "আচরণ", "আবহাওয়া"],
                triggers: { "প্রজাতি": ['প্রজাতি', 'পাখি'], "সংখ্যা": ['সংখ্যা'], "স্থান": ['জায়গা'], "আচরণ": ['আচরণ'], "আবহাওয়া": ['আবহাওয়া', 'রোদ'] }
            },
            construction: {
                label: "নির্মাণ", fields: ["প্রকল্প", "অগ্রগতি", "সমস্যা", "পরবর্তী ধাপ", "তারিখ"],
                triggers: { "প্রকল্প": ['সাইট', 'প্রকল্প'], "অগ্রগতি": ['অগ্রগতি', 'শতাংশ'], "সমস্যা": ['সমস্যা', 'দেরি'], "পরবর্তী ধাপ": ['ধাপ', 'পরিকল্পনা'], "তারিখ": ['তারিখ', 'আজ'] }
            }
        }
    },
    'pt-PT': {
        titlePrefix: "AUTO", titleSuffix: "FORMULÁRIO",
        description: "Selecione uma área, dite as suas observações e deixe a IA estruturar automaticamente o seu relatório técnico ou médico.",
        voiceCardTitle: "Ditado por Voz", voiceCardStatusIdle: "TOQUE PARA FALAR", voiceCardStatusListening: "A OUVIR...",
        rawTranscript: "Transcrição bruta", quickTemplates: "Modelos Rápidos", demoButton: "PREENCHER COM DADOS DEMO",
        generatedReport: "Relatório Gerado", autoExtraction: "Extração automática de entidades", waitingData: "A aguardar dados...",
        btnValidate: "VALIDAR", btnExport: "EXPORTAR PDF", btnClear: "LIMPAR",
        modalClearTitle: "Limpar tudo?", modalClearMessage: "Esta ação irá repor o formulário e a transcrição. Continuar?",
        modalSaveSuccess: "Guardado com Sucesso", modalSaveSuccessMessage: "O formulário foi guardado com sucesso.",
        modalErrorSTT: "O seu navegador não suporta reconhecimento de voz.",
        config: {
            medical: {
                label: "Saúde", fields: ["Paciente", "Idade", "Sintomas", "Medicamento", "Diagnóstico", "Recomendações"],
                triggers: { "Paciente": ['paciente', 'senhor', 'senhora', 'nome'], "Idade": ['idade', 'anos'], "Sintomas": ['sintomas', 'dor', 'dói'], "Medicamento": ['medicamento', 'tratamento'], "Diagnóstico": ['diagnostico', 'conclusao'], "Recomendações": ['recomendação', 'conselho', 'consulta'] }
            },
            biodiversity: {
                label: "Biodiversidade", fields: ["Espécie", "Número", "Local", "Comportamento", "Clima"],
                triggers: { "Espécie": ['especie', 'animal', 'visto'], "Número": ['numero', 'quantidade'], "Local": ['local', 'lugar'], "Comportamento": ['comportamento', 'acao'], "Clima": ['clima', 'tempo', 'sol'] }
            },
            construction: {
                label: "Obra", fields: ["Projeto", "Progresso", "Problema", "Próximo passo", "Data"],
                triggers: { "Projeto": ['obra', 'projeto', 'cliente'], "Progresso": ['progresso', 'percentagem'], "Problema": ['problema', 'atraso'], "Próximo passo": ['passo', 'plano'], "Data": ['data', 'hoje'] }
            }
        }
    },
    'ru-RU': {
        titlePrefix: "АВТО", titleSuffix: "ФОРМА",
        description: "Выберите область, продиктуйте свои наблюдения, и ИИ автоматически структурирует ваш технический или медицинский отчет.",
        voiceCardTitle: "Голосовой ввод", voiceCardStatusIdle: "НАЖМИТЕ, ЧТОБЫ ГОВОРИТЬ", voiceCardStatusListening: "СЛУШАЮ...",
        rawTranscript: "Текст", quickTemplates: "Шаблоны", demoButton: "ЗАПОЛНИТЬ ДЕМО-ДАННЫМИ",
        generatedReport: "Отчет", autoExtraction: "Автоматическое извлечение данных", waitingData: "Ожидание данных...",
        btnValidate: "ПОДТВЕРДИТЬ", btnExport: "ЭКСПОРТ PDF", btnClear: "ОЧИСТИТЬ",
        modalClearTitle: "Очистить всё?", modalClearMessage: "Это действие сбросит форму и текст. Продолжить?",
        modalSaveSuccess: "Сохранено", modalSaveSuccessMessage: "Форма успешно сохранена.",
        modalErrorSTT: "Ваш браузер не поддерживает распознавание речи.",
        config: {
            medical: {
                label: "Здоровье", fields: ["Пациент", "Возраст", "Симптомы", "Лекарство", "Диагноз", "Рекомендации"],
                triggers: { "Пациент": ['пациент', 'имя'], "Возраст": ['возраст', 'лет'], "Симптомы": ['симптомы', 'боль'], "Лекарство": ['лекарство', 'рецепт'], "Диагноз": ['диагноз', 'вывод'], "Рекомендации": ['совет', 'запись'] }
            },
            biodiversity: {
                label: "Биоразнообразие", fields: ["Вид", "Количество", "Место", "Поведение", "Погода"],
                triggers: { "Вид": ['вид', 'животное'], "Количество": ['количество'], "Место": ['место'], "Поведение": ['поведение'], "Погода": ['погода', 'солнце'] }
            },
            construction: {
                label: "Стройка", fields: ["Проект", "Прогресс", "Проблема", "Шаг", "Дата"],
                triggers: { "Проект": ['объект', 'проект'], "Прогресс": ['прогресс', 'процентов'], "Проблема": ['проблема', 'задержка'], "Шаг": ['шаг', 'план'], "Дата": ['дата', 'сегодня'] }
            }
        }
    },
    'ur-PK': {
        titlePrefix: "آٹو", titleSuffix: "فارم",
        description: "ایک فیلڈ منتخب کریں، اپنے مشاہدات لکھائیں اور AI کو خود بخود آپ کی تکنیکی یا طبی رپورٹ تیار کرنے دیں۔",
        voiceCardTitle: "وائس ڈکٹیشن", voiceCardStatusIdle: "بولنے کے لیے کلک کریں", voiceCardStatusListening: "سن رہا ہے...",
        rawTranscript: "نص", quickTemplates: "ٹیمپلیٹس", demoButton: "ڈیمو ڈیٹا بھریں",
        generatedReport: "رپورٹ", autoExtraction: "خودکار نکالنا", waitingData: "ڈیٹا کا انتظار ہے...",
        btnValidate: "تصدیق", btnExport: "ایکسپور트 PDF", btnClear: "صاف کریں",
        modalClearTitle: "سب صاف کریں؟", modalClearMessage: "یہ عمل فارم اور ڈکٹیشن کو دوبارہ ترتیب دے گا۔ جاری رکھیں؟",
        modalSaveSuccess: "محفوظ ہو گیا", modalSaveSuccessMessage: "فارم کامیابی سے محفوظ ہو گیا ہے۔",
        modalErrorSTT: "آپ کا براؤزر وائس ریکگنیشن کی حمایت نہیں کرتا ہے۔",
        config: {
            medical: {
                label: "صحت", fields: ["مریض", "عمر", "علامات", "تجویز کردہ دوا", "تشخیص", "سفارشات"],
                triggers: { "مریض": ['مریض', 'نام'], "عمر": ['عمر', 'سال'], "علامات": ['علامات', 'درد'], "تجویز کردہ دوا": ['دوا', 'علاج'], "تشخیص": ['تشخیص', 'نتیجہ'], "سفارشات": ['سفارش', 'مشورہ'] }
            },
            biodiversity: {
                label: "حیاتیاتی تنوع", fields: ["قسم", "تعداد", "مقام", "رویہ", "موسم"],
                triggers: { "قسم": ['قسم', 'جانور'], "تعداد": ['تعداد'], "مقام": ['مقام'], "رویہ": ['رویہ'], "موسم": ['موسم', 'دھوپ'] }
            },
            construction: {
                label: "تعمیر", fields: ["منصوبہ", "ترقی", "مسئلہ", "اگلا قدم", "تاریخ"],
                triggers: { "منصوبہ": ['سائٹ', 'منصوبہ'], "ترقی": ['ترقی', 'فیصد'], "مسئلہ": ['مسئلہ', 'تاخیر'], "اگلا قدم": ['قدم', 'منصوبہ'], "تاریخ": ['تاریخ', 'آج'] }
            }
        }
    }
};

export default function AutoFormPage({ onBack }) {
    const { t: translate, currentLanguage } = useLanguage();
    const [isDark, setIsDark] = useState(true);
    const [language, setLanguage] = useState(LANG_TO_LOCALE[currentLanguage] || 'fr-FR');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [formType, setFormType] = useState("medical");
    const [selectedTemplate, setSelectedTemplate] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGenerated, setIsGenerated] = useState(false);

    // Sync speech recognition language with global language
    useEffect(() => {
        const newLocale = LANG_TO_LOCALE[currentLanguage];
        if (newLocale && newLocale !== language) {
            setLanguage(newLocale);
        }
    }, [currentLanguage]);

    // Use global translations if available, fallback to local TRANSLATIONS
    const getGlobalT = () => {
        const localeToGlobal = { 'fr-FR': 'FR', 'en-US': 'EN', 'es-ES': 'ES', 'de-DE': 'DE', 'it-IT': 'IT', 'pt-PT': 'PT', 'zh-CN': 'ZH', 'ar-SA': 'AR', 'ja-JP': 'JA', 'ru-RU': 'RU' };
        const globalLang = localeToGlobal[language];

        if (globalLang) {
            const keys = ['back', 'rawTranscript', 'quickTemplates', 'demoButton', 'generatedReport', 'autoExtraction', 'waitingData', 'btnValidate', 'btnExport', 'btnClear', 'modalClearTitle', 'modalClearMessage', 'modalSaveSuccess', 'modalSaveSuccessMessage', 'modalErrorSTT', 'currentDomain'];
            const result = {};
            keys.forEach(key => {
                const globalValue = translate(`dashboard.autoForm.${key}`);
                result[key] = globalValue !== `dashboard.autoForm.${key}` ? globalValue : (TRANSLATIONS[language]?.[key] || TRANSLATIONS['fr-FR'][key]);
            });
            // Keep local config (fields/triggers specific to speech recognition language)
            result.config = TRANSLATIONS[language]?.config || TRANSLATIONS['fr-FR'].config;
            // Copy remaining keys from local translations
            const localT = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
            Object.keys(localT).forEach(key => {
                if (!(key in result)) result[key] = localT[key];
            });
            return result;
        }
        return TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
    };
    const t = getGlobalT();

    const [editingField, setEditingField] = useState(null);
    const [copied, setCopied] = useState(false);
    const [fields, setFields] = useState(t.config[formType].fields.map(f => ({ label: f, value: "", editable: true })));
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'info', // 'info', 'success', 'error', 'confirm'
        title: '',
        message: '',
        onConfirm: null
    });

    const showModal = ({ type = 'info', title, message, onConfirm = null }) => {
        setModalConfig({ isOpen: true, type, title, message, onConfirm });
    };

    // STT State
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognizerRef = useRef(null);

    // SDK recognizer lifecycle
    useEffect(() => {
        recognizerRef.current = createVoiceRecognizer({ lang: language });
        recognizerRef.current.onResult(({ fullText }) => setTranscript(fullText));
        recognizerRef.current.onError(({ message }) => {
            console.error("Speech recognition error:", message);
            setIsListening(false);
            setIsGenerating(false);
        });
        return () => recognizerRef.current?.destroy();
    }, [language]);

    // Update fields when form type or language changes
    useEffect(() => {
        const currentLangConfig = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
        setFields(currentLangConfig.config[formType].fields.map(f => ({ label: f, value: "", editable: true })));
        setTranscript("");
        setIsGenerated(false);
    }, [formType, language]);

    useEffect(() => {
        if (transcript) {
            processTranscript(transcript);
        }
    }, [transcript]);

    const processTranscript = (text) => {
        if (!text) return;
        const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normalizedText = normalize(text);
        const currentLangConfig = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
        const currentConfig = currentLangConfig.config[formType];
        let matches = [];

        Object.entries(currentConfig.triggers).forEach(([label, triggers]) => {
            triggers.forEach(rawTrigger => {
                const trigger = normalize(rawTrigger);
                const regex = new RegExp(`(?:^|[\\s\\.,;:-])(?<trigger>${trigger})(?:[\\s\\.,;:-]|$)`, 'gi');
                let m;
                while ((m = regex.exec(normalizedText)) !== null) {
                    let triggerEnd = m.index + m[0].length;
                    matches.push({
                        label: label,
                        index: m.index,
                        contentStartIndex: triggerEnd
                    });
                }
            });
        });

        matches.sort((a, b) => a.index - b.index);
        const newValues = {};

        matches.forEach((match, i) => {
            let contentStart = match.contentStartIndex;
            let nextMatch = matches[i + 1];
            let contentEnd = nextMatch ? nextMatch.index : text.length;

            if (contentEnd > contentStart) {
                let rawValue = text.substring(contentStart, contentEnd);
                let cleanValue = rawValue
                    .replace(/^[:\-\s,]+/, '')
                    .replace(/^(du|de|le|la|les|des|un|une|est|a)\s+/i, '')
                    .replace(/[\.,\s]+$/, '')
                    .trim();

                if (match.label === "Avancement" && !cleanValue.includes("%")) {
                    if (/^\d+$/.test(cleanValue)) cleanValue += "%";
                }

                if (cleanValue.length > 0) {
                    newValues[match.label] = cleanValue.charAt(0).toUpperCase() + cleanValue.slice(1);
                }
            }
        });

        setFields(prev => prev.map(f => {
            if (newValues[f.label]) {
                return { ...f, value: newValues[f.label] };
            }
            return f;
        }));
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        if (!isWebSpeechSupported()) {
            showModal({ type: 'error', title: 'Erreur Navigateur', message: t.modalErrorSTT || "Votre navigateur ne supporte pas la reconnaissance vocale." });
            return;
        }
        recognizerRef.current?.start();
        setIsListening(true);
        setIsGenerating(true);
        if (!isGenerated) setIsGenerated(true);
    };

    const stopListening = () => {
        recognizerRef.current?.stop();
        setIsListening(false);
        setIsGenerating(false);
    };

    const handleCopy = async () => {
        const text = fields.map(f => `${f.label}: ${f.value}`).join("\n");
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            const currentLangConfig = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
            const currentConfig = currentLangConfig.config[formType];

            // 1. Sauvegarder d'abord la transcription textuelle pour l'historique global
            let transcriptionId = null;
            const formattedFields = fields
                .filter(f => f.value && f.value.trim() !== "")
                .map(f => `${f.label}: ${f.value}`)
                .join("\n");

            const textToSave = formattedFields || transcript || `${t.generatedReport} ${currentConfig.label}`;

            try {
                const transResult = await saveTranscription({
                    text: textToSave,
                    duration: 0,
                    language: language.split('-')[0],
                    type: formType // medical, biodiversity, construction
                }, token);
                if (transResult && transResult.id) {
                    transcriptionId = transResult.id;
                }
            } catch (transError) {
                console.warn("Échec sauvegarde transcription, on continue avec l'extraction seule:", transError);
            }

            // 2. Préparer les données extraites
            const extractedData = {};
            fields.forEach(f => {
                extractedData[f.label] = f.value || "";
            });

            // 3. Sauvegarder dans /data/extractions avec le service centralisé
            await saveExtraction({
                transcription_id: transcriptionId,
                form_type: currentConfig.label,
                type: formType, // medical, biodiversity, construction
                full_name: fields[0]?.value || "",
                email: "",
                phone: "",
                address: "",
                extra_fields: extractedData
            }, token);

            // 4. Sauvegarde SPÉCIFIQUE (ex: Base de données Médicale Structurée)
            if (formType === "medical") {
                try {
                    const patientValue = fields[0]?.value || "";
                    const parts = patientValue.split(" ");
                    const nom = parts.length > 1 ? parts.slice(1).join(" ") : patientValue;
                    const prenom = parts.length > 1 ? parts[0] : "";

                    const consultationData = {
                        transcription: transcript || "Transcription automatique",
                        nom: nom || "Inconnu",
                        prenom: prenom || "",
                        age: parseInt(fields[1]?.value?.replace(/\D/g, '')) || 0,
                        symptomes: fields[2]?.value || "Non précisé",
                        diagnostic: fields[4]?.value || "Non précisé",
                        traitement: `${fields[3]?.value}\n${fields[5]?.value}`.trim() || "Aucun traitement"
                    };

                    await saveConsultation(consultationData, token);
                } catch (medError) {
                    console.warn("La sauvegarde structurée médicale a échoué (mais l'historique est OK):", medError);
                }
            }

            showModal({
                type: 'success',
                title: t.modalSaveSuccess,
                message: t.modalSaveSuccessMessage
            });

        } catch (error) {
            console.error("Erreur critique sauvegarde:", error);
            showModal({ type: 'error', title: 'Erreur Sauvegarde', message: "Une erreur est survenue lors de l'enregistrement. Vérifiez votre connexion." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = () => {
        showModal({
            type: 'confirm',
            title: t.modalClearTitle,
            message: t.modalClearMessage,
            onConfirm: () => {
                setTranscript("");
                const currentLangConfig = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
                setFields(currentLangConfig.config[formType].fields.map(f => ({ label: f, value: "", editable: true })));
                setIsGenerated(false);
                setIsListening(false);
                if (recognitionRef.current) recognitionRef.current.stop();
            }
        });
    };

    const handleExportPdf = async () => {
        const textContent = fields
            .filter(f => f.value && f.value.trim() !== "")
            .map(f => `${f.label}: ${f.value}`)
            .join("\n\n");

        if (!textContent || textContent.trim().length === 0) {
            showModal({ type: 'info', title: 'Contenu Vide', message: 'Aucune donnée à exporter.' });
            return;
        }

        try {
            setIsExporting(true);
            const token = localStorage.getItem('token');
            const mainDetail = fields[0].value || "Document";
            const title = `${FORM_CONFIGS[formType].label} - ${mainDetail}`;

            const pdfBlob = await exportTranscriptionPdf(
                { text: textContent, duration: 0, language: language, title: title, type: formType },
                token
            );

            const url = window.URL.createObjectURL(new Blob([pdfBlob], { type: 'application/octet-stream' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `Auriance_${formType}_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => { document.body.removeChild(link); window.URL.revokeObjectURL(url); }, 100);
            showModal({ type: 'success', title: 'Export PDF', message: 'Le fichier PDF a été téléchargé.' });
        } catch (error) {
            showModal({ type: 'error', title: 'Erreur Export', message: 'Impossible de générer le fichier PDF.' });
        } finally {
            setIsExporting(false);
        }
    };

    const updateField = (label, value) => {
        setFields(prev => prev.map(f => f.label === label ? { ...f, value } : f));
    };

    const handleGenerateValues = () => {
        const currentLangConfig = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];
        const f = currentLangConfig.config[formType].fields;

        if (formType === "medical") {
            setFields([
                { label: f[0], value: language === 'fr-FR' ? "Jean Dupont" : (language === 'es-ES' ? "Juan Pérez" : "John Doe"), editable: true },
                { label: f[1], value: language === 'fr-FR' ? "45 ans" : (language === 'es-ES' ? "45 años" : "45 years"), editable: true },
                { label: f[2], value: language === 'fr-FR' ? "Migraine sévère" : (language === 'es-ES' ? "Migraña severa" : "Severe migraine"), editable: true },
                { label: f[3], value: "Triptan 50mg", editable: true },
                { label: f[4], value: language === 'fr-FR' ? "Migraine ophtalmique" : (language === 'es-ES' ? "Migraña oftálmica" : "Ophthalmic migraine"), editable: true },
                { label: f[5], value: language === 'fr-FR' ? "Repos dans le noir" : (language === 'es-ES' ? "Descanso en la oscuridad" : "Rest in the dark"), editable: true },
            ]);
        } else if (formType === "biodiversity") {
            setFields([
                { label: f[0], value: language === 'fr-FR' ? "Mésange bleue" : (language === 'es-ES' ? "Herrerillo común" : "Blue tit"), editable: true },
                { label: f[1], value: "3", editable: true },
                { label: f[2], value: language === 'fr-FR' ? "Chêne centenaire" : (language === 'es-ES' ? "Roble centenario" : "Hundred-year-old oak"), editable: true },
                { label: f[3], value: language === 'fr-FR' ? "Nidification" : (language === 'es-ES' ? "Anidación" : "Nesting"), editable: true },
                { label: f[4], value: language === 'fr-FR' ? "Ensoleillé" : (language === 'es-ES' ? "Soleado" : "Sunny"), editable: true },
            ]);
        } else {
            setFields([
                { label: f[0], value: "Tour Horizon", editable: true },
                { label: f[1], value: "60%", editable: true },
                { label: f[2], value: language === 'fr-FR' ? "Retard béton" : (language === 'es-ES' ? "Retraso hormigón" : "Concrete delay"), editable: true },
                { label: f[3], value: language === 'fr-FR' ? "Coulage dalle" : (language === 'es-ES' ? "Vaciado de losa" : "Slab pouring"), editable: true },
                { label: f[4], value: new Date().toLocaleDateString(language), editable: true },
            ]);
        }
        setIsGenerated(true);
    };

    return (
        <div className={`min-h-screen p-6 relative overflow-hidden transition-colors duration-500 ease-in-out ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-opacity duration-700 ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-opacity duration-700 ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'}`} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b transition-colors duration-500 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                    <div className="flex-1">
                        {/* Back Button & Title Row */}
                        <div className="flex items-center gap-4 mb-2">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className={`p-2 rounded-full transition-all group ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                                    title="Retour"
                                >
                                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            )}

                            <h1 className={`text-4xl font-light tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                AUTO <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">FORMULAIRE</span>
                            </h1>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className={`p-2 rounded-full transition-all duration-300 ${isDark
                                    ? 'bg-white/5 text-yellow-400 hover:bg-white/10 ring-1 ring-white/10'
                                    : 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm ring-1 ring-slate-300'
                                    }`}
                            >
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>

                        <p className={`max-w-xl transition-colors duration-500 lg:text-lg ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                            {t.description}
                        </p>
                    </div>

                    {/* Selector */}
                    <div className={`flex p-1 rounded-xl border backdrop-blur-sm transition-all duration-500 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        {Object.entries(t.config).map(([key, config]) => {
                            const Icon = key === 'medical' ? Activity : (key === 'biodiversity' ? Leaf : Hammer);
                            const color = key === 'medical' ? 'cyan' : (key === 'biodiversity' ? 'emerald' : 'amber');
                            const isActive = formType === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setFormType(key)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? `bg-${color}-500/10 text-${color}-600 shadow-lg shadow-${color}-500/10 ring-1 ring-${color}-500/20`
                                        : `${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200 font-semibold'}`
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN - CONTROLS */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Recording Card */}
                        <div className={`border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            <div className={`absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition duration-500 blur-xl`} />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={`text-lg font-medium flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        <Mic className="w-5 h-5 text-cyan-400" />
                                        {t.voiceCardTitle}
                                    </h3>

                                    <div className="flex items-center gap-2 relative">
                                        {isListening && <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-pulse mr-2" />}

                                        {/* Language Selector */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowLangMenu(!showLangMenu)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${isDark
                                                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                                <span>{LANGUAGES.find(l => l.code === language)?.flag}</span>
                                                <ChevronDown className="w-3 h-3 opacity-50" />
                                            </button>

                                            {showLangMenu && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setShowLangMenu(false)}
                                                    />
                                                    <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl z-20 max-h-64 overflow-y-auto custom-scrollbar p-1.5 ${isDark
                                                        ? 'bg-slate-900 border-white/10'
                                                        : 'bg-white border-slate-200'
                                                        }`}>
                                                        {LANGUAGES.map((lang) => (
                                                            <button
                                                                key={lang.code}
                                                                onClick={() => {
                                                                    setLanguage(lang.code);
                                                                    setShowLangMenu(false);
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${language === lang.code
                                                                    ? isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-700'
                                                                    : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                <span className="text-lg">{lang.flag}</span>
                                                                <span className="flex-1 text-left">{lang.label}</span>
                                                                {language === lang.code && <CheckCircle className="w-3 h-3" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center py-8">
                                    <button
                                        onClick={toggleListening}
                                        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening
                                            ? 'bg-rose-500/20'
                                            : isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'
                                            }`}
                                    >
                                        <div className={`absolute inset-0 rounded-full border ${isListening ? 'border-rose-500/50 animate-ping' : isDark ? 'border-white/10' : 'border-slate-300'}`} />
                                        {isListening ? (
                                            <StopCircle className="w-10 h-10 text-rose-500" />
                                        ) : (
                                            <Mic className="w-10 h-10 text-cyan-400" />
                                        )}
                                    </button>
                                    <p className={`mt-4 text-sm font-mono text-center font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>
                                        {isListening ? t.voiceCardStatusListening : t.voiceCardStatusIdle}
                                    </p>
                                </div>

                                {transcript && (
                                    <div className={`mt-6 p-4 rounded-xl border max-h-40 overflow-y-auto custom-scrollbar transition-colors ${isDark ? 'bg-black/40 border-white/5 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-900 font-medium'}`}>
                                        <p className="text-xs font-mono mb-2 uppercase opacity-50">{t.rawTranscript}</p>
                                        <p className="text-sm italic leading-relaxed">"{transcript}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Templates Card */}
                        <div className={`border rounded-2xl p-6 backdrop-blur-xl transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            <h3 className={`text-lg font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                <FileText className="w-5 h-5 text-violet-400" />
                                {t.quickTemplates}
                            </h3>
                            <div className="space-y-2">
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTemplate(t.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all ${selectedTemplate === t.id
                                            ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20 font-bold'
                                            : `${isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 font-medium'} border border-transparent`
                                            }`}
                                    >
                                        <span>{t.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-md ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-700 font-bold'}`}>{t.fields} chps</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Demo Button */}
                        <button
                            onClick={handleGenerateValues}
                            className={`w-full py-3 px-4 rounded-xl border border-dashed transition-all text-sm font-mono flex items-center justify-center gap-2 ${isDark
                                ? 'border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 hover:bg-white/5'
                                : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                        >
                            <Wand2 className="w-4 h-4" />
                            {t.demoButton}
                        </button>
                    </div>

                    {/* RIGHT COLUMN - RESULT */}
                    <div className="lg:col-span-8">
                        <div className={`h-full border rounded-2xl p-8 backdrop-blur-xl relative transition-all duration-500 ${isGenerated
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-50 translate-y-4 grayscale'
                            } ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200 shadow-2xl shadow-slate-200/50'
                            }`}>

                            {/* Form Header */}
                            <div className={`flex items-start justify-between mb-8 pb-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                                        <Wand2 className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-700'}`} />
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.generatedReport}</h2>
                                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.autoExtraction}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {/* Les boutons ont été déplacés en bas pour correspondre au style Transcription Live */}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid md:grid-cols-2 gap-6 mb-10">
                                {fields.map((field, idx) => (
                                    <div key={idx} className={`space-y-2 group ${idx >= fields.length - 1 ? 'md:col-span-2' : ''}`}>
                                        <label className={`text-xs font-mono uppercase tracking-wider flex items-center justify-between font-bold ${isDark ? 'text-cyan-500/70' : 'text-cyan-700'}`}>
                                            {field.label}
                                            {field.editable && (
                                                <button
                                                    onClick={() => setEditingField(editingField === field.label ? null : field.label)}
                                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </label>

                                        {editingField === field.label ? (
                                            <textarea
                                                value={field.value}
                                                onChange={(e) => updateField(field.label, e.target.value)}
                                                className={`w-full rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 min-h-[50px] font-medium ${isDark
                                                    ? 'bg-black/50 border border-cyan-500/50 text-white'
                                                    : 'bg-white border border-cyan-600/50 text-slate-950 shadow-sm'
                                                    }`}
                                                autoFocus
                                                onBlur={() => setEditingField(null)}
                                            />
                                        ) : (
                                            <div className={`w-full rounded-lg p-3 min-h-[50px] flex items-center text-sm transition-colors border font-medium ${isDark
                                                ? 'bg-white/5 border-white/5 text-slate-300 group-hover:border-white/10'
                                                : 'bg-slate-50 border-slate-300 text-slate-900 group-hover:border-slate-400'
                                                }`}>
                                                {field.value || <span className="opacity-60 italic">{t.waitingData}</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Action Grid (Comme dans Live Transcription) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <button
                                    onClick={handleSave}
                                    disabled={!isGenerated}
                                    className={`group relative px-6 py-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-500/20 hover:border-cyan-500/50' : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 hover:border-cyan-300'}`}
                                >
                                    <div className="relative flex items-center justify-center gap-3 z-10">
                                        <Save className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                        <span className={`font-mono text-sm font-medium ${isDark ? 'text-cyan-100' : 'text-cyan-800'}`}>{t.btnValidate}</span>
                                    </div>
                                </button>

                                <button
                                    onClick={handleExportPdf}
                                    disabled={!isGenerated}
                                    className={`group relative px-6 py-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'bg-violet-950/30 hover:bg-violet-900/40 border-violet-500/20 hover:border-violet-500/50' : 'bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-300'}`}
                                >
                                    <div className="relative flex items-center justify-center gap-3 z-10">
                                        <Download className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                                        <span className={`font-mono text-sm font-medium ${isDark ? 'text-violet-100' : 'text-violet-800'}`}>{t.btnExport}</span>
                                    </div>
                                </button>

                                <button
                                    onClick={handleClear}
                                    disabled={!isGenerated && !transcript}
                                    className={`group relative px-6 py-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${isDark ? 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-500/20 hover:border-rose-500/50' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 hover:border-rose-300'}`}
                                >
                                    <div className="relative flex items-center justify-center gap-3 z-10">
                                        <Trash2 className={`w-5 h-5 group-hover:scale-110 transition-transform ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
                                        <span className={`font-mono text-sm font-medium ${isDark ? 'text-rose-100' : 'text-rose-800'}`}>{t.btnClear}</span>
                                    </div>
                                </button>
                            </div>

                            {/* Footer Status */}
                            <div className={`mt-8 pt-6 border-t flex items-center justify-between text-xs font-mono ${isDark ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-emerald-500" />
                                    <span>IA ENGINE: AURIANCE-NLP-V2</span>
                                </div>
                                <div>
                                    REF: {new Date().getTime().toString().slice(-8)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Modal Overlay - Style Dark conservé pour le contraste ou adapté ? 
               On va l'adapter au thème aussi pour la cohérence */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
                    <div className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${isDark
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
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                }`}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={() => {
                                                modalConfig.onConfirm?.();
                                                setModalConfig(prev => ({ ...prev, isOpen: false }));
                                            }}
                                            className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/25"
                                        >
                                            Confirmer
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/25"
                                    >
                                        Compris
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.05)'};
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
}
