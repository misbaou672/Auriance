"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    FileText,
    Download,
    Trash2,
    Calendar,
    Clock,
    Activity,
    Leaf,
    HardHat,
    ChevronRight,
    X,
    Mic,
    Sun,
    Moon,
    ArrowLeft,
    ChevronDown,
    Check
} from "lucide-react"
import { getTranscriptions, deleteTranscription, deleteExtraction, exportTranscriptionPdf, API_BASE_URL } from "../services/api"

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
    { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
];

const TRANSLATIONS = {
    'fr-FR': {
        history: "Historique",
        subtitle: "Intelligence vocale & Données structurées",
        searchPlaceholder: "Rechercher dans vos archives...",
        tabAudio: "Audio",
        tabForms: "Formulaires",
        typeLive: "Live",
        typeMedical: "Santé",
        typeBio: "Biodiversité",
        typeCons: "Chantier",
        emptyState: "Aucune donnée disponible",
        details: "Détails",
        refId: "Ref ID",
        extractedData: "Données Extraites",
        exportPdf: "Exporter PDF",
        sync: "Synchronisation...",
        deleteConfirm: "Voulez-vous vraiment supprimer cet élément ?",
        deleteError: "Erreur lors de la suppression.",
        pdfError: "Erreur lors de la génération du PDF.",
        ago: "Il y a",
        minutes: "min",
        hours: "h",
        yesterday: "Hier",
        days: "jours",
        other: "Autre",
        audioShort: "Vocal",
        formShort: "Dossier",
        back: "Retour"
    },
    'en-US': {
        history: "History",
        subtitle: "Voice Intelligence & Structured Data",
        searchPlaceholder: "Search your archives...",
        tabAudio: "Audio",
        tabForms: "Forms",
        typeLive: "Live",
        typeMedical: "Health",
        typeBio: "Biodiversity",
        typeCons: "Construction",
        emptyState: "No data available",
        details: "Details",
        refId: "Ref ID",
        extractedData: "Extracted Data",
        exportPdf: "Export PDF",
        sync: "Synchronizing...",
        deleteConfirm: "Are you sure you want to delete this item?",
        deleteError: "Error during deletion.",
        pdfError: "Error during PDF generation.",
        ago: "",
        minutes: "min ago",
        hours: "h ago",
        yesterday: "Yesterday",
        days: "days ago",
        other: "Other",
        audioShort: "Voice",
        formShort: "File",
        back: "Back"
    },
    'es-ES': {
        history: "Historial",
        subtitle: "Inteligencia de voz y datos estructurados",
        searchPlaceholder: "Busca en tus archivos...",
        tabAudio: "Audio",
        tabForms: "Formularios",
        typeLive: "Directo",
        typeMedical: "Salud",
        typeBio: "Biodiversidad",
        typeCons: "Construcción",
        emptyState: "No hay datos disponibles",
        details: "Detalles",
        refId: "ID de ref.",
        extractedData: "Datos extraídos",
        exportPdf: "Exportar PDF",
        sync: "Sincronizando...",
        deleteConfirm: "¿Seguro que quieres eliminar este elemento?",
        deleteError: "Error al eliminar.",
        pdfError: "Error al generar el PDF.",
        ago: "Hace",
        minutes: "min",
        hours: "h",
        yesterday: "Ayer",
        days: "días",
        other: "Otro",
        audioShort: "Vocal",
        formShort: "Expediente",
        back: "Volver"
    },
    'de-DE': {
        history: "Verlauf",
        subtitle: "Sprachintelligenz & Strukturierte Daten",
        searchPlaceholder: "Suchen Sie in Ihren Archiven...",
        tabAudio: "Audio",
        tabForms: "Formulare",
        typeLive: "Live",
        typeMedical: "Gesundheit",
        typeBio: "Biodiversität",
        typeCons: "Baustelle",
        emptyState: "Keine Daten verfügbar",
        details: "Details",
        refId: "Ref ID",
        extractedData: "Extrahierte Daten",
        exportPdf: "PDF exportieren",
        sync: "Synchronisierung...",
        deleteConfirm: "Möchten Sie dieses Element wirklich löschen?",
        deleteError: "Fehler beim Löschen.",
        pdfError: "Fehler bei der PDF-Erstellung.",
        ago: "Vor",
        minutes: "Min.",
        hours: "Std.",
        yesterday: "Gestern",
        days: "Tagen",
        other: "Andere",
        audioShort: "Stimme",
        formShort: "Akte",
        back: "Zurück"
    },
    'it-IT': {
        history: "Cronologia",
        subtitle: "Intelligenza vocale e dati strutturati",
        searchPlaceholder: "Cerca nei tuoi archivi...",
        tabAudio: "Audio",
        tabForms: "Moduli",
        typeLive: "Live",
        typeMedical: "Salute",
        typeBio: "Biodiversità",
        typeCons: "Cantiere",
        emptyState: "Nessun dato disponibile",
        details: "Dettagli",
        refId: "Rif. ID",
        extractedData: "Dati estratti",
        exportPdf: "Esporta PDF",
        sync: "Sincronizzazione...",
        deleteConfirm: "Sei sicuro di voler eliminare questo elemento?",
        deleteError: "Errore durante l'eliminazione.",
        pdfError: "Errore durante la generazione del PDF.",
        ago: "",
        minutes: "min fa",
        hours: "ore fa",
        yesterday: "Ieri",
        days: "giorni fa",
        other: "Altro",
        audioShort: "Voce",
        formShort: "File",
        back: "Indietro"
    },
    'ja-JP': {
        history: "履歴",
        subtitle: "音声インテリジェンスと構造化データ",
        searchPlaceholder: "アーカイブを検索...",
        tabAudio: "オーディオ",
        tabForms: "フォーム",
        typeLive: "ライブ",
        typeMedical: "健康",
        typeBio: "生物多様性",
        typeCons: "建設",
        emptyState: "データがありません",
        details: "詳細",
        refId: "参照ID",
        extractedData: "抽出データ",
        exportPdf: "PDFエクスポート",
        sync: "同期中...",
        deleteConfirm: "この項目を本当に削除しますか？",
        deleteError: "削除エラーが発生しました。",
        pdfError: "PDF生成エラーが発生しました。",
        ago: "",
        minutes: "分前",
        hours: "時間前",
        yesterday: "昨日",
        days: "日前",
        other: "その他",
        audioShort: "音声",
        formShort: "ファイル",
        back: "戻る"
    },
    'zh-CN': {
        history: "历史记录",
        subtitle: "语音智能与结构化数据",
        searchPlaceholder: "在档案中搜索...",
        tabAudio: "音频",
        tabForms: "表单",
        typeLive: "现场",
        typeMedical: "健康",
        typeBio: "生物多样性",
        typeCons: "施工",
        emptyState: "暂无数据",
        details: "详情",
        refId: "参考ID",
        extractedData: "提取的数据",
        exportPdf: "导出PDF",
        sync: "同步中...",
        deleteConfirm: "您确定要删除此项吗？",
        deleteError: "删除失败。",
        pdfError: "生成PDF失败。",
        ago: "",
        minutes: "分钟前",
        hours: "小时前",
        yesterday: "昨天",
        days: "天前",
        other: "其他",
        audioShort: "语音",
        formShort: "文件",
        back: "返回"
    },
    'hi-IN': {
        history: "इतिहास",
        subtitle: "वॉयस इंटेलिजेंस और स्ट्रक्चर्ड डेटा",
        searchPlaceholder: "अपने संग्रह में खोजें...",
        tabAudio: "ऑडियो",
        tabForms: "फॉर्म",
        typeLive: "लाइव",
        typeMedical: "स्वास्थ्य",
        typeBio: "जैव विविधता",
        typeCons: "निर्माण",
        emptyState: "कोई डेटा उपलब्ध नहीं है",
        details: "विवरण",
        refId: "संदर्भ आईडी",
        extractedData: "निकाला गया डेटा",
        exportPdf: "PDF निर्यात करें",
        sync: "सिंक हो रहा है...",
        deleteConfirm: "क्या आप वाकई इस आइटम को हटाना चाहते हैं?",
        deleteError: "हटाने के दौरान त्रुटि।",
        pdfError: "PDF बनाने के दौरान त्रुटि।",
        ago: "",
        minutes: "मिनट पहले",
        hours: "घंटे पहले",
        yesterday: "कल",
        days: "दिन पहले",
        other: "अन्य",
        audioShort: "आवाज",
        formShort: "फ़ाइल",
        back: "पीछे"
    },
    'ar-SA': {
        history: "السجل",
        subtitle: "ذكاء الصوت والبيانات المهيكلة",
        searchPlaceholder: "البحث في أرشيفك...",
        tabAudio: "صوت",
        tabForms: "نماذج",
        typeLive: "مباشر",
        typeMedical: "صحة",
        typeBio: "التنوع البيولوجي",
        typeCons: "بناء",
        emptyState: "لا توجد بيانات متاحة",
        details: "تفاصيل",
        refId: "رقم المرجع",
        extractedData: "البيانات المستخرجة",
        exportPdf: "تصدير PDF",
        sync: "جاري المزامنة...",
        deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذا العنصر؟",
        deleteError: "خطأ أثناء الحذف.",
        pdfError: "خطأ أثناء إنشاء ملف PDF.",
        ago: "منذ",
        minutes: "دقيقة",
        hours: "ساعة",
        yesterday: "أمس",
        days: "أيام",
        other: "آخر",
        audioShort: "صوت",
        formShort: "ملف",
        back: "رجوع"
    },
    'ru-RU': {
        history: "История",
        subtitle: "Голосовой интеллект и структурированные данные",
        searchPlaceholder: "Поиск в архивах...",
        tabAudio: "Аудио",
        tabForms: "Формы",
        typeLive: "Живой",
        typeMedical: "Здоровье",
        typeBio: "Биоразнообразие",
        typeCons: "Строительство",
        emptyState: "Нет доступных данных",
        details: "Детали",
        refId: "ID ссылки",
        extractedData: "Извлеченные данные",
        exportPdf: "Экспорт PDF",
        sync: "Синхронизация...",
        deleteConfirm: "Вы уверены, что хотите удалить этот элемент?",
        deleteError: "Ошибка при удалении.",
        pdfError: "Ошибка при создании PDF.",
        ago: "",
        minutes: "мин. назад",
        hours: "ч. назад",
        yesterday: "Вчера",
        days: "дн. назад",
        other: "Другое",
        audioShort: "Голос",
        formShort: "Файл",
        back: "Назад"
    },
    'bn-BD': {
        history: "ইতিহাস",
        subtitle: "ভয়েস ইন্টেলিজেন্স এবং স্ট্রাকচারড ডেটা",
        searchPlaceholder: "আপনার সংরক্ষণাগারে অনুসন্ধান করুন...",
        tabAudio: "অডিও",
        tabForms: "ফর্ম",
        typeLive: "লাইভ",
        typeMedical: "স্বাস্থ্য",
        typeBio: "জীববৈচিত্র্য",
        typeCons: "নির্মাণ সাইট",
        emptyState: "কোন তথ্য পাওয়া যায়নি",
        details: "বিস্তারিত",
        refId: "রেফারেন্স আইডি",
        extractedData: "নিষ্কাশিত তথ্য",
        exportPdf: "PDF এক্সপোর্ট",
        sync: "সিঙ্ক্রোনাইজ হচ্ছে...",
        deleteConfirm: "আপনি কি নিশ্চিতভাবে এই আইটেমটি মুছতে চান?",
        deleteError: "মুছার সময় ত্রুটি।",
        pdfError: "PDF তৈরির সময় ত্রুটি।",
        ago: "",
        minutes: "মিনিট আগে",
        hours: "ঘন্টা আগে",
        yesterday: "গতকাল",
        days: "দিন আগে",
        other: "অন্যান্য",
        audioShort: "ভয়েস",
        formShort: "ফাইল",
        back: "ফিরুন"
    },
    'pt-PT': {
        history: "Histórico",
        subtitle: "Inteligência de voz e dados estruturados",
        searchPlaceholder: "Pesquise os seus arquivos...",
        tabAudio: "Áudio",
        tabForms: "Formulários",
        typeLive: "Direto",
        typeMedical: "Saúde",
        typeBio: "Biodiversidade",
        typeCons: "Construção",
        emptyState: "Nenhum dado disponível",
        details: "Detalhes",
        refId: "Ref ID",
        extractedData: "Dados Extraídos",
        exportPdf: "Exportar PDF",
        sync: "Sincronização...",
        deleteConfirm: "Tem a certeza que deseja eliminar este item?",
        deleteError: "Erro ao eliminar.",
        pdfError: "Erro ao gerar o PDF.",
        ago: "Há",
        minutes: "min",
        hours: "h",
        yesterday: "Ontem",
        days: "dias",
        other: "Outro",
        audioShort: "Vocal",
        formShort: "Ficheiro",
        back: "Voltar"
    },
    'ur-PK': {
        history: "تاریخچہ",
        subtitle: "وائس انٹیلیجنس اور سٹرکچرڈ ڈیٹا",
        searchPlaceholder: "اپنے آرکائیوز میں تلاش کریں...",
        tabAudio: "آڈیو",
        tabForms: "فارمز",
        typeLive: "براہ راست",
        typeMedical: "صحت",
        typeBio: "حیاتیاتی تنوع",
        typeCons: "تعمیراتی سائٹ",
        emptyState: "کوئی ڈیٹا دستیاب نہیں",
        details: "تفصیلات",
        refId: "حوالہ آئی ڈی",
        extractedData: "نکالا گیا ڈیٹا",
        exportPdf: "PDF ایکسپورٹ",
        sync: "مطابقت پذیری جاری ہے...",
        deleteConfirm: "کیا آپ واقعی اس آئٹم کو حذف کرنا چاہتے ہیں؟",
        deleteError: "حذف کرنے کے دوران خرابی۔",
        pdfError: "PDF تیار کرنے کے دوران خرابی۔",
        ago: "",
        minutes: "منٹ پہلے",
        hours: "گھنٹے پہلے",
        yesterday: "کل",
        days: "دن پہلے",
        other: "دیگر",
        audioShort: "آواز",
        formShort: "فائل",
        back: "واپس"
    },
};

// Fonction utilitaire pour normaliser les types venant de la DB
const normalizeType = (type) => {
    if (!type) return 'live';
    const t = type.toLowerCase();
    if (t.includes('med') || t.includes('sant') || t.includes('heal')) return 'medical';
    if (t.includes('bio')) return 'biodiversity';
    if (t.includes('const') || t.includes('chant')) return 'construction';
    if (t.includes('live') || t.includes('trans')) return 'live';
    return 'live';
};

export default function HistoryPage({ onBack, user }) {
    const [transcriptions, setTranscriptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [activeTab, setActiveTab] = useState('transcriptions'); // transcriptions | extractions
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark for "Deep Tech" feel
    const [language, setLanguage] = useState('fr-FR');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const langMenuRef = useRef(null);

    const t = TRANSLATIONS[language] || TRANSLATIONS['fr-FR'];

    const typeConfig = {
        live: { icon: Mic, color: "#d273f5ff", label: t.typeLive, bgColor: "bg-violet-50 dark:bg-violet-500/10" },
        medical: { icon: Activity, color: "#10b981", label: t.typeMedical, bgColor: "bg-emerald-50 dark:bg-emerald-500/10" },
        biodiversity: { icon: Leaf, color: "#06b6d4", label: t.typeBio, bgColor: "bg-cyan-50 dark:bg-cyan-500/10" },
        construction: { icon: HardHat, color: "#d98c06ff", label: t.typeCons, bgColor: "bg-amber-50 dark:bg-amber-500/10" },
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        loadHistory();
    }, [activeTab]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            // Load Transcriptions
            if (activeTab === 'transcriptions') {
                const data = await getTranscriptions(100);
                // Map API data to our format
                const mapped = data.map(trans => ({
                    id: trans.id,
                    text: trans.text,
                    type: normalizeType(trans.type),
                    date: new Date(trans.created_at),
                    duration: trans.duration_seconds || 0,
                    language: trans.language || 'fr-FR',
                    confidence: trans.confidence_score || 0.95
                }));
                setTranscriptions(mapped);
            } else {
                // Load Auto Forms (Extractions) from API
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/data/extractions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const mapped = data.map(e => ({
                        id: e.id,
                        text: `${e.full_name || 'Sans titre'} - ${JSON.stringify(e.extra_fields || {})}`,
                        type: normalizeType(e.type || e.form_type),
                        date: new Date(e.created_at),
                        duration: 0,
                        language: 'fr-FR',
                        confidence: 1.0,
                        isExtraction: true,
                        details: e
                    }));
                    setTranscriptions(mapped);
                }
            }
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTranscriptions = transcriptions.filter((item) => {
        const matchesSearch = (item.text || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !filterType || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const formatRelativeDate = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${t.ago} ${minutes}${t.minutes}`;
        if (hours < 24) return `${t.ago} ${hours}${t.hours}`;
        if (days === 1) return t.yesterday;
        if (days < 7) return `${t.ago} ${days} ${t.days}`;
        return date.toLocaleDateString(language);
    };

    const handleDelete = async (item) => {
        if (!window.confirm(t.deleteConfirm)) return;
        try {
            if (item.isExtraction) {
                await deleteExtraction(item.id);
            } else {
                await deleteTranscription(item.id);
            }
            // Mettre à jour la liste locale
            setTranscriptions(prev => prev.filter(trans => trans.id !== item.id));
            if (selectedItem?.id === item.id) setSelectedItem(null);
        } catch (error) {
            console.error("Erreur suppression:", error);
            alert(t.deleteError);
        }
    };

    const handleExportPdf = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const title = item.isExtraction ? `${t.formShort} ${item.type}` : `${t.typeLive}`;

            // Si c'est une extraction, on formate le texte pour le PDF
            let textToExport = item.text;
            if (item.isExtraction && item.details && item.details.extra_fields) {
                textToExport = Object.entries(item.details.extra_fields)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join("\n");
            }

            const pdfBlob = await exportTranscriptionPdf({
                text: textToExport,
                title: title,
                language: item.language,
                duration: item.duration,
                type: item.type
            }, token);

            const url = window.URL.createObjectURL(new Blob([pdfBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title}_${item.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Erreur export PDF:", error);
            alert(t.pdfError);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} p-8 -m-8`}>
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] opacity-20 ${isDarkMode ? 'bg-violet-600' : 'bg-violet-200'}`} />
                <div className={`absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-[100px] opacity-10 ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-200'}`} />
            </div>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className={`p-2.5 rounded-2xl transition-all duration-300 group border ${isDarkMode ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shadow-sm'}`}
                                    title={t.back}
                                >
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            )}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/10' : 'bg-slate-900/5'} backdrop-blur-xl border border-white/10 shadow-inner`}>
                                <FileText className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight">
                                <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{t.history}</span>
                            </h1>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} ml-15`}>{t.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language Selection HUD */}
                        <div className="relative" ref={langMenuRef}>
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all border backdrop-blur-xl shadow-lg ${isDarkMode
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                            >
                                <span className="text-lg">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                                <span className="text-xs font-bold uppercase tracking-widest">{language.split('-')[0]}</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {showLangMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`absolute top-full mt-3 right-0 w-48 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border backdrop-blur-3xl overflow-hidden z-50 ${isDarkMode
                                            ? 'bg-slate-900/90 border-white/10 text-white'
                                            : 'bg-white/90 border-slate-200 text-slate-800'}`}
                                    >
                                        <div className="p-2 flex flex-col gap-1">
                                            {LANGUAGES.map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => {
                                                        setLanguage(lang.code);
                                                        setShowLangMenu(false);
                                                    }}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${language === lang.code
                                                        ? (isDarkMode ? 'bg-white/10 text-white ring-1 ring-white/20' : 'bg-slate-100 text-slate-900 ring-1 ring-slate-200')
                                                        : (isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900')
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{lang.flag}</span>
                                                        <span>{lang.label}</span>
                                                    </div>
                                                    {language === lang.code && <Check className="w-4 h-4 text-cyan-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-yellow-400 border border-white/10' : 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-600 border border-slate-900/5'} backdrop-blur-xl`}
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 hover:rotate-45 transition-transform" /> : <Moon className="w-5 h-5 hover:-rotate-12 transition-transform" />}
                        </button>

                        <div className={`flex p-1 rounded-2xl backdrop-blur-xl shadow-inner ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-900/5 border border-slate-900/5'}`}>
                            {[
                                { id: 'transcriptions', label: t.tabAudio, icon: Mic },
                                { id: 'extractions', label: t.tabForms, icon: FileText }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setSelectedItem(null); setFilterType(null); }}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-500 ${activeTab === tab.id
                                        ? 'bg-white shadow-lg text-slate-900 scale-100'
                                        : `${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} scale-95`}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Filters Row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-4"
                >
                    <div className="relative flex-1 group">
                        <div className={`absolute inset-0 rounded-2xl blur-md opacity-20 group-focus-within:opacity-40 transition-opacity ${isDarkMode ? 'bg-violet-600' : 'bg-violet-200'}`} />
                        <div className="relative">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none transition-all duration-300 ${isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:bg-white/10'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm focus:shadow-md'
                                    } border`}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar">
                        {Object.entries(typeConfig).map(([type, config]) => {
                            const Icon = config.icon;
                            const isActive = filterType === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(isActive ? null : type)}
                                    className={`flex items-center gap-2 px-5 py-4 rounded-2xl border transition-all duration-500 whitespace-nowrap group ${isActive
                                        ? `${isDarkMode ? 'bg-white text-slate-900 border-white' : 'bg-slate-900 text-white border-slate-900'} shadow-lg scale-105`
                                        : `${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:shadow-sm'}`
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} style={{ color: isActive ? '' : config.color }} />
                                    <span className="text-sm font-bold tracking-tight">{config.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* List of items */}
                    <div className="flex-1 space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <div className={`w-12 h-12 rounded-full border-t-2 border-r-2 ${isDarkMode ? 'border-violet-400' : 'border-violet-600'} animate-spin mb-4`} />
                                <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{t.sync}</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredTranscriptions.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`text-center py-24 rounded-3xl border-2 border-dashed ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}
                                    >
                                        <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                                            <FileText className={`w-10 h-10 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
                                        </div>
                                        <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.emptyState}</p>
                                    </motion.div>
                                ) : (
                                    filteredTranscriptions.map((item, index) => {
                                        const config = typeConfig[item.type] || { icon: FileText, color: '#64748b', label: t.other, bgColor: isDarkMode ? 'bg-slate-800' : 'bg-slate-50' };
                                        const Icon = config.icon;
                                        const isSelected = selectedItem?.id === item.id;

                                        return (
                                            <motion.div
                                                key={item.id}
                                                layoutId={`card-${item.id}`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.4, delay: index * 0.03 }}
                                                onClick={() => setSelectedItem(item)}
                                                className={`group cursor-pointer rounded-3xl p-6 border transition-all duration-500 relative overflow-hidden ${isSelected
                                                    ? `${isDarkMode ? 'bg-white/10 ring-2 ring-violet-500/50' : 'bg-white ring-2 ring-violet-500/20 shadow-xl'}`
                                                    : `${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-violet-200 hover:shadow-lg'}`
                                                    }`}
                                            >
                                                {/* Active Accent Bar */}
                                                <div
                                                    className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                                    style={{ backgroundColor: config.color }}
                                                />

                                                <div className="flex items-start gap-5">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 ${config.bgColor} backdrop-blur-sm shadow-inner`}>
                                                        <Icon className="w-7 h-7" style={{ color: config.color }} />
                                                    </div>

                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {activeTab === 'extractions' ? t.formShort : t.audioShort} #{item.id}
                                                                </span>
                                                                <span className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {item.language?.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                                <Clock className="w-3 h-3" />
                                                                {formatRelativeDate(item.date)}
                                                            </div>
                                                        </div>

                                                        <p className={`text-base font-medium leading-relaxed line-clamp-2 ${isSelected ? (isDarkMode ? 'text-white' : 'text-slate-900') : (isDarkMode ? 'text-slate-300' : 'text-slate-600')}`}>
                                                            {item.text}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-4 pt-1">
                                                            <span
                                                                className={`text-[11px] px-3 py-1 rounded-lg font-black tracking-wider uppercase transition-colors duration-300`}
                                                                style={{ backgroundColor: `${config.color}${isDarkMode ? '25' : '15'}`, color: config.color }}
                                                            >
                                                                {config.label}
                                                            </span>

                                                            {item.duration > 0 && (
                                                                <div className={`flex items-center gap-1.5 text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
                                                                    {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                                                                </div>
                                                            )}

                                                            {item.confidence && (
                                                                <div className={`h-1 flex-1 max-w-[60px] rounded-full overflow-hidden ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${item.confidence * 100}%` }}
                                                                        className="h-full bg-emerald-500"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${isSelected ? 'bg-violet-500 text-white rotate-90 shadow-lg' : 'bg-transparent text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-600 dark:group-hover:bg-white/10 dark:group-hover:text-white'}`}>
                                                        <ChevronRight className="w-6 h-6" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Detail Panel - Right Sidebar */}
                    <AnimatePresence>
                        {selectedItem && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="hidden lg:block sticky top-24 w-full lg:w-[450px] group"
                            >
                                <div className={`relative flex flex-col rounded-[2.5rem] border overflow-hidden backdrop-blur-3xl shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-slate-200'
                                    }`}>
                                    {/* Glass reflection effect */}
                                    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                                    {/* Panel Header */}
                                    <div className="relative p-6 pb-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {t.details}
                                                </h3>
                                                <span className={`text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {t.refId} #{selectedItem.id}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedItem(null)}
                                                className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {typeConfig[selectedItem.type] && (
                                                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center gap-2`}
                                                    style={{ backgroundColor: `${typeConfig[selectedItem.type].color}20`, color: typeConfig[selectedItem.type].color }}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: typeConfig[selectedItem.type].color }} />
                                                    {typeConfig[selectedItem.type].label}
                                                </div>
                                            )}
                                            <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                                {formatRelativeDate(selectedItem.date)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Panel Body */}
                                    <div className="relative p-7 pt-0 overflow-y-auto max-h-[350px] custom-scrollbar">
                                        <div className={`p-6 rounded-3xl ${isDarkMode ? 'bg-black/20 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
                                            <p className={`text-base leading-relaxed font-serif whitespace-pre-wrap ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {selectedItem.text}
                                            </p>
                                        </div>

                                        {selectedItem.details && selectedItem.details.extra_fields && (
                                            <div className="mt-8 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`} />
                                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        {t.extractedData}
                                                    </h4>
                                                    <div className={`h-[1px] flex-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`} />
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    {Object.entries(selectedItem.details.extra_fields).map(([key, val]) => (
                                                        <motion.div
                                                            key={key}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`p-4 rounded-2xl flex justify-between items-center transition-all duration-300 border ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:shadow-md'
                                                                }`}
                                                        >
                                                            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{key}</span>
                                                            <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{val || '-'}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Fixed Bottom */}
                                    <div className={`relative p-6 pt-4 pb-6 backdrop-blur-md border-t ${isDarkMode ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-slate-200'
                                        }`}>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleExportPdf(selectedItem)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-500 shadow-lg active:scale-95 ${isDarkMode
                                                    ? 'bg-white text-slate-900 hover:bg-slate-100'
                                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                                    }`}
                                            >
                                                <Download className="w-4 h-4" />
                                                {t.exportPdf}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(selectedItem)}
                                                className={`p-3 rounded-xl transition-all duration-500 shadow-lg active:scale-95 border ${isDarkMode
                                                    ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white'
                                                    : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white'
                                                    }`}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
