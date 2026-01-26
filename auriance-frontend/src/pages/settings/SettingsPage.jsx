import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mic,
    Shield,
    Palette,
    Volume2,
    Globe,
    Download,
    Trash2,
    ChevronRight,
    Camera,
    Plus,
    BookOpen,
    Check,
    AlertCircle,
    Square,
    Play
} from "lucide-react";
import { updateUserProfile, deleteUser, getTranscriptions } from '../../services/api';

const SUPPORTED_LANGUAGES = [
    { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
    { code: 'en-US', label: 'English', flag: '🇺🇸' },
    { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
    { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
    { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
    { code: 'zh-CN', label: 'Mandarin', flag: '🇨🇳' },
    { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
    { code: 'ar-SA', label: 'Arabic', flag: '🇸🇦' },
    { code: 'hi-IN', label: 'Hindi', flag: '🇮🇳' },
    { code: 'bn-BD', label: 'Bengali', flag: '🇧🇩' },
    { code: 'ur-PK', label: 'Urdu', flag: '🇵🇰' },
];

const TRANSLATIONS = {
    'fr-FR': {
        title: "Paramètres",
        subtitle: "Configurez votre expérience Auriance",
        logout: "Déconnexion",
        edit: "Modifier",
        premium: "Premium",
        voiceIntel: "Intelligence Vocale",
        voiceDesc: "Paramètres de reconnaissance",
        recogLang: "Langue de reconnaissance",
        micTest: "Test du microphone",
        micListening: "● En écoute",
        micInactive: "● Inactif",
        micInstruction: "Parlez pour tester le niveau d'entrée",
        micSens: "Sensibilité du micro",
        speechRate: "Vitesse de lecture",
        customDict: "Dictionnaire personnalisé",
        appearance: "Apparence",
        appearanceDesc: "Personnalisez l'interface",
        darkMode: "Mode sombre",
        darkModeDesc: "Réduit la fatigue oculaire",
        textSize: "Taille du texte",
        soundEffects: "Effets sonores",
        security: "Données & Sécurité",
        securityDesc: "Confidentialité et sauvegarde",
        autoSave: "Sauvegarde automatique",
        autoSaveDesc: "Enregistre automatiquement vos transcriptions",
        privateMode: "Mode privé",
        privateModeDesc: "Rien n'est sauvegardé dans l'historique",
        exportData: "Exporter mes données",
        deleteAccount: "Supprimer mon compte",
        profile: "Mon Profil",
        profileDesc: "Informations personnelles",
        lastName: "Nom",
        firstName: "Prénom",
        email: "Email",
        saveChanges: "Sauvegarder les modifications",
        saving: "Sauvegarde...",
        profileUpdated: "Profil mis à jour avec succès !",
        profileError: "Erreur sauvegarde profil",
        exportSuccess: "Export téléchargé avec succès !",
        exportError: "Erreur lors de l'export"
    },
    'en-US': {
        title: "Settings",
        subtitle: "Configure your Auriance experience",
        logout: "Logout",
        edit: "Edit",
        premium: "Premium",
        voiceIntel: "Voice Intelligence",
        voiceDesc: "Recognition settings",
        recogLang: "Recognition Language",
        micTest: "Microphone Test",
        micListening: "● Listening",
        micInactive: "● Inactive",
        micInstruction: "Speak to test input level",
        micSens: "Microphone Sensitivity",
        speechRate: "Reading Speed",
        customDict: "Custom Dictionary",
        appearance: "Appearance",
        appearanceDesc: "Customize the interface",
        darkMode: "Dark Mode",
        darkModeDesc: "Reduces eye strain",
        textSize: "Text Size",
        soundEffects: "Sound Effects",
        security: "Data & Security",
        securityDesc: "Privacy and backup",
        autoSave: "Auto Save",
        autoSaveDesc: "Automatically saves your transcriptions",
        privateMode: "Private Mode",
        privateModeDesc: "Nothing is saved in history",
        exportData: "Export My Data",
        deleteAccount: "Delete My Account",
        profile: "My Profile",
        profileDesc: "Personal information",
        lastName: "Last Name",
        firstName: "First Name",
        email: "Email",
        saveChanges: "Save Changes",
        saving: "Saving...",
        profileUpdated: "Profile updated successfully!",
        profileError: "Profile save error",
        exportSuccess: "Export downloaded successfully!",
        exportError: "Error during export"
    },
    'de-DE': {
        title: "Einstellungen",
        subtitle: "Konfigurieren Sie Ihr Auriance-Erlebnis",
        logout: "Abmelden",
        edit: "Bearbeiten",
        premium: "Premium",
        voiceIntel: "Sprachintelligenz",
        voiceDesc: "Erkennungseinstellungen",
        recogLang: "Erkennungssprache",
        micTest: "Mikrofontest",
        micListening: "● Hört zu",
        micInactive: "● Inaktiv",
        micInstruction: "Sprechen Sie, um den Eingangspegel zu testen",
        micSens: "Mikrofonempfindlichkeit",
        speechRate: "Lesegeschwindigkeit",
        customDict: "Benutzerdefiniertes Wörterbuch",
        appearance: "Aussehen",
        appearanceDesc: "Schnittstelle anpassen",
        darkMode: "Dunkelmodus",
        darkModeDesc: "Reduziert die Augenbelastung",
        textSize: "Textgröße",
        soundEffects: "Soundeffekte",
        security: "Daten & Sicherheit",
        securityDesc: "Datenschutz und Backup",
        autoSave: "Automatisches Speichern",
        autoSaveDesc: "Speichert Ihre Transkriptionen automatisch",
        privateMode: "Privater Modus",
        privateModeDesc: "Nichts wird im Verlauf gespeichert",
        exportData: "Meine Daten exportieren",
        deleteAccount: "Mein Konto löschen",
        profile: "Mein Profil",
        profileDesc: "Persönliche Informationen",
        lastName: "Nachname",
        firstName: "Vorname",
        email: "E-Mail",
        saveChanges: "Änderungen speichern",
        saving: "Speichern...",
        profileUpdated: "Profil erfolgreich aktualisiert!",
        profileError: "Fehler beim Speichern des Profils",
        exportSuccess: "Export erfolgreich heruntergeladen!",
        exportError: "Fehler beim Export"
    },
    'es-ES': {
        title: "Configuración",
        subtitle: "Configura tu experiencia Auriance",
        logout: "Cerrar sesión",
        edit: "Editar",
        premium: "Premium",
        voiceIntel: "Inteligencia de Voz",
        voiceDesc: "Configuración de reconocimiento",
        recogLang: "Idioma de reconocimiento",
        micTest: "Prueba de micrófono",
        micListening: "● Escuchando",
        micInactive: "● Inactivo",
        micInstruction: "Hable para probar el nivel de entrada",
        micSens: "Sensibilidad del micrófono",
        speechRate: "Velocidad de lectura",
        customDict: "Diccionario personalizado",
        appearance: "Apariencia",
        appearanceDesc: "Personalizar interfaz",
        darkMode: "Modo oscuro",
        darkModeDesc: "Reduce la fatiga visual",
        textSize: "Tamaño del texto",
        soundEffects: "Efectos de sonido",
        security: "Datos y Seguridad",
        securityDesc: "Privacidad y copia de seguridad",
        autoSave: "Guardado automático",
        autoSaveDesc: "Guarda automáticamente sus transcripciones",
        privateMode: "Modo privado",
        privateModeDesc: "No se guarda nada en el historial",
        exportData: "Exportar mis datos",
        deleteAccount: "Eliminar mi cuenta",
        profile: "Mi Perfil",
        profileDesc: "Información personal",
        lastName: "Apellido",
        firstName: "Nombre",
        email: "Correo electrónico",
        saveChanges: "Guardar cambios",
        saving: "Guardando...",
        profileUpdated: "¡Perfil actualizado con éxito!",
        profileError: "Error al guardar el perfil",
        exportSuccess: "¡Exportación descargada con éxito!",
        exportError: "Error durante la exportación"
    },
    'pt-PT': {
        title: "Configurações",
        subtitle: "Configure sua experiência Auriance",
        logout: "Sair",
        edit: "Editar",
        premium: "Premium",
        voiceIntel: "Inteligência de Voz",
        voiceDesc: "Configurações de reconhecimento",
        recogLang: "Idioma de reconhecimento",
        micTest: "Teste de microfone",
        micListening: "● Ouvindo",
        micInactive: "● Inativo",
        micInstruction: "Fale para testar o nível de entrada",
        micSens: "Sensibilidade do microfone",
        speechRate: "Velocidade de leitura",
        customDict: "Dicionário personalizado",
        appearance: "Aparência",
        appearanceDesc: "Personalizar interface",
        darkMode: "Modo escuro",
        darkModeDesc: "Reduz a fadiga ocular",
        textSize: "Tamanho do texto",
        soundEffects: "Efeitos sonoros",
        security: "Dados e Segurança",
        securityDesc: "Privacidade e backup",
        autoSave: "Salvamento automático",
        autoSaveDesc: "Salva automaticamente suas transcrições",
        privateMode: "Modo privado",
        privateModeDesc: "Nada é salvo no histórico",
        exportData: "Exportar meus dados",
        deleteAccount: "Excluir minha conta",
        profile: "Meu Perfil",
        profileDesc: "Informações pessoais",
        lastName: "Sobrenome",
        firstName: "Nome",
        email: "Email",
        saveChanges: "Salvar alterações",
        saving: "Salvando...",
        profileUpdated: "Perfil atualizado com sucesso!",
        profileError: "Erro ao salvar perfil",
        exportSuccess: "Exportação baixada com sucesso!",
        exportError: "Erro durante a exportação"
    },
    'it-IT': {
        title: "Impostazioni",
        subtitle: "Configura la tua esperienza Auriance",
        logout: "Disconnessione",
        edit: "Modifica",
        premium: "Premium",
        voiceIntel: "Intelligenza Vocale",
        voiceDesc: "Impostazioni di riconoscimento",
        recogLang: "Lingua di riconoscimento",
        micTest: "Test microfono",
        micListening: "● In ascolto",
        micInactive: "● Inattivo",
        micInstruction: "Parla per testare il livello di ingresso",
        micSens: "Sensibilità microfono",
        speechRate: "Velocità di lettura",
        customDict: "Dizionario personalizzato",
        appearance: "Aspetto",
        appearanceDesc: "Personalizza interfaccia",
        darkMode: "Modalità scura",
        darkModeDesc: "Riduce l'affaticamento degli occhi",
        textSize: "Dimensione testo",
        soundEffects: "Effetti sonori",
        security: "Dati e Sicurezza",
        securityDesc: "Privacy e backup",
        autoSave: "Salvataggio automatico",
        autoSaveDesc: "Salva automaticamente le tue trascrizioni",
        privateMode: "Modalità privata",
        privateModeDesc: "Nulla viene salvato nella cronologia",
        exportData: "Esporta i miei dati",
        deleteAccount: "Elimina il mio account",
        profile: "Il mio Profilo",
        profileDesc: "Informazioni personali",
        lastName: "Cognome",
        firstName: "Nome",
        email: "Email",
        saveChanges: "Salva modifiche",
        saving: "Salvataggio...",
        profileUpdated: "Profilo aggiornato con successo!",
        profileError: "Errore salvataggio profilo",
        exportSuccess: "Esportazione scaricata con successo!",
        exportError: "Errore durante l'esportazione"
    },
    'ru-RU': {
        title: "Настройки",
        subtitle: "Настройте свой опыт Auriance",
        logout: "Выйти",
        edit: "Изменить",
        premium: "Премиум",
        voiceIntel: "Голосовой интеллект",
        voiceDesc: "Настройки распознавания",
        recogLang: "Язык распознавания",
        micTest: "Тест микрофона",
        micListening: "● Слушаю",
        micInactive: "● Неактивен",
        micInstruction: "Говорите, чтобы проверить уровень входного сигнала",
        micSens: "Чувствительность микрофона",
        speechRate: "Скорость чтения",
        customDict: "Пользовательский словарь",
        appearance: "Внешний вид",
        appearanceDesc: "Настроить интерфейс",
        darkMode: "Темный режим",
        darkModeDesc: "Снижает нагрузку на глаза",
        textSize: "Размер текста",
        soundEffects: "Звуковые эффекты",
        security: "Данные и безопасность",
        securityDesc: "Конфиденциальность и резервное копирование",
        autoSave: "Автосохранение",
        autoSaveDesc: "Автоматически сохраняет ваши транскрипции",
        privateMode: "Частный режим",
        privateModeDesc: "Ничего не сохраняется в истории",
        exportData: "Экспортировать мои данные",
        deleteAccount: "Удалить мой аккаунт",
        profile: "Мой профиль",
        profileDesc: "Личная информация",
        lastName: "Фамилия",
        firstName: "Имя",
        email: "Email",
        saveChanges: "Сохранить изменения",
        saving: "Сохранение...",
        profileUpdated: "Профиль успешно обновлен!",
        profileError: "Ошибка сохранения профиля",
        exportSuccess: "Экспорт успешно загружен!",
        exportError: "Ошибка при экспорте"
    },
    'zh-CN': {
        title: "设置",
        subtitle: "配置您的 Auriance 体验",
        logout: "注销",
        edit: "编辑",
        premium: "高级版",
        voiceIntel: "语音智能",
        voiceDesc: "识别设置",
        recogLang: "识别语言",
        micTest: "麦克风测试",
        micListening: "● 正在收听",
        micInactive: "● 未激活",
        micInstruction: "说话以测试输入电平",
        micSens: "麦克风灵敏度",
        speechRate: "阅读速度",
        customDict: "自定义词典",
        appearance: "外观",
        appearanceDesc: "自定义界面",
        darkMode: "深色模式",
        darkModeDesc: "减少眼睛疲劳",
        textSize: "文字大小",
        soundEffects: "音效",
        security: "数据与安全",
        securityDesc: "隐私与备份",
        autoSave: "自动保存",
        autoSaveDesc: "自动保存您的转录",
        privateMode: "隐私模式",
        privateModeDesc: "历史记录中不保存任何内容",
        exportData: "导出我的数据",
        deleteAccount: "删除我的帐户",
        profile: "我的个人资料",
        profileDesc: "个人信息",
        lastName: "姓",
        firstName: "名",
        email: "电子邮件",
        saveChanges: "保存更改",
        saving: "正在保存...",
        profileUpdated: "个人资料更新成功！",
        profileError: "个人资料保存错误",
        exportSuccess: "导出下载成功！",
        exportError: "导出时出错"
    },
    'ja-JP': {
        title: "設定",
        subtitle: "Auriance体験を構成する",
        logout: "ログアウト",
        edit: "編集",
        premium: "プレミアム",
        voiceIntel: "音声インテリジェンス",
        voiceDesc: "認識設定",
        recogLang: "認識言語",
        micTest: "マイクテスト",
        micListening: "● 聞き取り中",
        micInactive: "● 非アクティブ",
        micInstruction: "話して入力レベルをテストしてください",
        micSens: "マイク感度",
        speechRate: "読み上げ速度",
        customDict: "カスタム辞書",
        appearance: "外観",
        appearanceDesc: "インターフェースをカスタマイズ",
        darkMode: "ダークモード",
        darkModeDesc: "目の疲れを軽減します",
        textSize: "文字サイズ",
        soundEffects: "効果音",
        security: "データとセキュリティ",
        securityDesc: "プライバシーとバックアップ",
        autoSave: "自動保存",
        autoSaveDesc: "書き起こしを自動的に保存します",
        privateMode: "プライベートモード",
        privateModeDesc: "履歴には何も保存されません",
        exportData: "データをエクスポート",
        deleteAccount: "アカウントを削除",
        profile: "マイプロフィール",
        profileDesc: "個人情報",
        lastName: "姓",
        firstName: "名",
        email: "メール",
        saveChanges: "変更を保存",
        saving: "保存中...",
        profileUpdated: "プロフィールが正常に更新されました！",
        profileError: "プロフィールの保存エラー",
        exportSuccess: "エクスポートが正常にダウンロードされました！",
        exportError: "エクスポート中のエラー"
    },
    'ar-SA': {
        title: "الإعدادات",
        subtitle: "قم بتكوين تجربة Auriance الخاصة بك",
        logout: "تسجيل الخروج",
        edit: "تعديل",
        premium: "متميز",
        voiceIntel: "الذكاء الصوتي",
        voiceDesc: "إعدادات التعرف",
        recogLang: "لغة التعرف",
        micTest: "اختبار الميكروفون",
        micListening: "● يستمع",
        micInactive: "● غير نشط",
        micInstruction: "تحدث لاختبار مستوى الإدخال",
        micSens: "حساسية الميكروفون",
        speechRate: "سرعة القراءة",
        customDict: "قاموس مخصص",
        appearance: "المظهر",
        appearanceDesc: "تخصيص الواجهة",
        darkMode: "الوضع الداكن",
        darkModeDesc: "يقلل من إجهاد العين",
        textSize: "حجم النص",
        soundEffects: "تأثيرات صوتية",
        security: "البيانات والأمان",
        securityDesc: "الخصوصية والنسخ الاحتياطي",
        autoSave: "حفظ تلقائي",
        autoSaveDesc: "يحفظ النصوص الخاصة بك تلقائيًا",
        privateMode: "الوضع الخاص",
        privateModeDesc: "لا يتم حفظ أي شيء في السجل",
        exportData: "تصدير بياناتي",
        deleteAccount: "حذف حسابي",
        profile: "ملفي الشخصي",
        profileDesc: "معلومات شخصية",
        lastName: "الاسم الأخير",
        firstName: "الاسم الأول",
        email: "البريد الإلكتروني",
        saveChanges: "حفظ التغييرات",
        saving: "جارٍ الحفظ...",
        profileUpdated: "تم تحديث الملف الشخصي بنجاح!",
        profileError: "خطأ في حفظ الملف الشخصي",
        exportSuccess: "تم تنزيل التصدير بنجاح!",
        exportError: "خطأ أثناء التصدير"
    },
    'hi-IN': {
        title: "सेटिंग्स",
        subtitle: "अपना Auriance अनुभव कॉन्फ़िगर करें",
        logout: "लॉग आउट",
        edit: "संपादित करें",
        premium: "प्रीमियम",
        voiceIntel: "वॉयस इंटेलिजेंस",
        voiceDesc: "पहचान सेटिंग्स",
        recogLang: "पहचान की भाषा",
        micTest: "माइक्रोफ़ोन टेस्ट",
        micListening: "● सुन रहा है",
        micInactive: "● निष्क्रिय",
        micInstruction: "इनपुट स्तर का परीक्षण करने के लिए बोलें",
        micSens: "माइक संवेदनशीलता",
        speechRate: "पढ़ने की गति",
        customDict: "कस्टम डिक्शनरी",
        appearance: "उपस्थिति",
        appearanceDesc: "इंटरफ़ेस अनुकूलित करें",
        darkMode: "डार्क मोड",
        darkModeDesc: "आंखों का तनाव कम करता है",
        textSize: "पाठ का आकार",
        soundEffects: "ध्वनि प्रभाव",
        security: "डेटा और सुरक्षा",
        securityDesc: "गोपनीयता और बैकअप",
        autoSave: "स्वतः सहेजें",
        autoSaveDesc: "आपके प्रतिलेखन को स्वचालित रूप से सहेजता है",
        privateMode: "निजी मोड",
        privateModeDesc: "इतिहास में कुछ भी सहेजा नहीं जाता है",
        exportData: "मेरा डेटा निर्यात करें",
        deleteAccount: "मेरा खाता हटाएं",
        profile: "मेरी प्रोफ़ाइल",
        profileDesc: "व्यक्तिगत जानकारी",
        lastName: "उपनाम",
        firstName: "नाम",
        email: "ईमेल",
        saveChanges: "परिवर्तन सहेजें",
        saving: "सहेजा जा रहा है...",
        profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
        profileError: "प्रोफ़ाइल सहेजने में त्रुटि",
        exportSuccess: "निर्यात सफलतापूर्वक डाउनलोड किया गया!",
        exportError: "निर्यात के दौरान त्रुटि"
    },
    'bn-BD': {
        title: "সেটিংস",
        subtitle: "আপনার Auriance অভিজ্ঞতা কনফিগার করুন",
        logout: "লগ আউট",
        edit: "সম্পাদনা",
        premium: "প্রিমিয়াম",
        voiceIntel: "ভয়েস ইন্টেলিজেন্স",
        voiceDesc: "স্বীকৃতি সেটিংস",
        recogLang: "স্বীকৃতির ভাষা",
        micTest: "মাইক্রোফোন পরীক্ষা",
        micListening: "● শুনছে",
        micInactive: "● নিষ্ক্রিয়",
        micInstruction: "ইনপুট স্তর পরীক্ষা করতে কথা বলুন",
        micSens: "মাইক সংবেদনশীলতা",
        speechRate: "পড়ার গতি",
        customDict: "কাস্টম ডিকশনারি",
        appearance: "চেহারা",
        appearanceDesc: "ইন্টারফেস কাস্টমাইজ করুন",
        darkMode: "ডার্ক মোড",
        darkModeDesc: "চোখের চাপ কমায়",
        textSize: "পাঠ্যের আকার",
        soundEffects: "সাউন্ড এফেক্টস",
        security: "ডেটা এবং সুরক্ষা",
        securityDesc: "গোপনীয়তা এবং ব্যাকআপ",
        autoSave: "স্বয়ংক্রিয় সংরক্ষণ",
        autoSaveDesc: "আপনার প্রতিলিপিগুলি স্বয়ংক্রিয়ভাবে সংরক্ষণ করে",
        privateMode: "ব্যক্তিগত মোড",
        privateModeDesc: "ইতিহাসে কিছুই সংরক্ষণ করা হয় না",
        exportData: "আমার ডেটা রফতানি করুন",
        deleteAccount: "আমার অ্যাকাউন্ট মুছুন",
        profile: "আমার প্রোফাইল",
        profileDesc: "ব্যক্তিগত তথ্য",
        lastName: "নামের শেষাংশ",
        firstName: "নামের প্রথমাংশ",
        email: "ইমেল",
        saveChanges: "পরিবর্তনগুলি সংরক্ষণ করুন",
        saving: "সংরক্ষণ করা হচ্ছে...",
        profileUpdated: "প্রোফাইল সফলভাবে আপডেট হয়েছে!",
        profileError: "প্রোফাইল সংরক্ষণ ত্রুটি",
        exportSuccess: "রফতানি সফলভাবে ডাউনলোড হয়েছে!",
        exportError: "রফতানির সময় ত্রুটি"
    },
    'ur-PK': {
        title: "ترتیبات",
        subtitle: "اپنا Auriance تجربہ ترتیب دیں",
        logout: "لاگ آؤٹ",
        edit: "ترمیم",
        premium: "پریمیم",
        voiceIntel: "آواز کی ذہانت",
        voiceDesc: "شناخت کی ترتیبات",
        recogLang: "شناخت کی زبان",
        micTest: "مائیکروفون ٹیسٹ",
        micListening: "● سن رہا ہے",
        micInactive: "● غیر فعال",
        micInstruction: "ان پٹ لیول ٹیسٹ کرنے کے لیے بولیں",
        micSens: "مائک کی حساسیت",
        speechRate: "پڑھنے کی رفتار",
        customDict: "حسب ضرورت لغت",
        appearance: "ظاہری شکل",
        appearanceDesc: "انٹرفیس کو اپنی مرضی کے مطابق بنائیں",
        darkMode: "ڈارک موڈ",
        darkModeDesc: "آنکھوں کا دباؤ کم کرتا ہے",
        textSize: "متن کا سائز",
        soundEffects: "صوتی اثرات",
        security: "ڈیٹا اور سیکیورٹی",
        securityDesc: "پرائیویسی اور بیک اپ",
        autoSave: "خودکار محفوظ",
        autoSaveDesc: "آپ کی نقلیں خود بخود محفوظ کرتا ہے",
        privateMode: "نجی موڈ",
        privateModeDesc: "تاریخ میں کچھ بھی محفوظ نہیں کیا گیا",
        exportData: "میرا ڈیٹا برآمد کریں",
        deleteAccount: "میرا اکاؤنٹ حذف کریں",
        profile: "میری پروفائل",
        profileDesc: "ذاتی معلومات",
        lastName: "آخری نام",
        firstName: "پہلا نام",
        email: "ای میل",
        saveChanges: "تبدیلیاں محفوظ کریں",
        saving: "محفوظ ہو رہا ہے...",
        profileUpdated: "پروفائل کامیابی کے ساتھ اپ ڈیٹ ہو گئی!",
        profileError: "پروفائل محفوظ کرنے میں غلطی",
        exportSuccess: "برآمد کامیابی کے ساتھ ڈاؤن لوڈ ہو گئی!",
        exportError: "برآمد کے دوران غلطی"
    }
};

// --- COMPOSANTS UI THEME "COSMIC" (Dark & Light) ---

function MicTester({ isDark, t }) {
    const [isTesting, setIsTesting] = useState(false);
    const [volume, setVolume] = useState(0);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);

    const startTest = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                analyserRef.current.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
                setVolume(Math.min(100, average * 3));
                animationRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
            setIsTesting(true);
        } catch (err) {
            console.error("Erreur micro:", err);
            alert("Impossible d'accéder au micro : " + err.message);
        }
    };

    const stopTest = () => {
        if (sourceRef.current) {
            sourceRef.current.disconnect();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsTesting(false);
        setVolume(0);
    };

    useEffect(() => {
        return () => {
            if (isTesting) stopTest();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <div className={`mt-4 p-4 rounded-xl border border-dashed transition-colors ${isDark
            ? 'border-indigo-500/30 bg-indigo-500/5'
            : 'border-indigo-200/50 bg-indigo-50/30'
            }`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? 'text-indigo-200' : 'text-indigo-900/70'}`}>{t.micTest}</span>
                <span className={`text-xs ${isTesting ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`}>
                    {isTesting ? t.micListening : t.micInactive}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={isTesting ? stopTest : startTest}
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isTesting
                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'
                        }`}
                >
                    {isTesting ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
                </button>

                <div className={`flex-1 h-2 rounded-full overflow-hidden relative ${isDark ? 'bg-slate-800' : 'bg-white border border-indigo-100'}`}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '4px 100%' }}></div>
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-400 to-violet-500"
                        animate={{ width: `${volume}%` }}
                        transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                    />
                </div>
            </div>
            {isTesting && (
                <p className={`text-xs mt-2 text-center ${isDark ? 'text-indigo-300/60' : 'text-indigo-900/40'}`}>
                    {t.micInstruction}
                </p>
            )}
        </div>
    );
}

function SettingCard({ title, description, icon: Icon, children, delay = 0, isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`
                rounded-2xl p-6 border transition-all duration-300
                ${isDark
                    ? 'bg-[#131420]/80 border-indigo-500/20 shadow-lg shadow-indigo-500/5 backdrop-blur-sm'
                    : 'bg-white/70 border-white/50 shadow-lg shadow-indigo-100/40 backdrop-blur-md'
                }
            `}
        >
            <div className="flex items-start gap-4 mb-6">
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                    ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50 text-indigo-600'}
                `}>
                    <Icon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                </div>
                <div>
                    <h3 className={`font-semibold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
                    <p className={`text-sm ${isDark ? 'text-indigo-200/60' : 'text-slate-500'}`}>{description}</p>
                </div>
            </div>
            {children}
        </motion.div>
    );
}

function ToggleSwitch({ enabled, onToggle, label, description, isDark }) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{label}</p>
                {description && <p className={`text-sm ${isDark ? 'text-indigo-200/50' : 'text-slate-400'}`}>{description}</p>}
            </div>
            <button
                onClick={onToggle}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${enabled
                    ? "bg-indigo-500"
                    : (isDark ? "bg-slate-700" : "bg-indigo-100")
                    }`}
            >
                <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                    animate={{ left: enabled ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </button>
        </div>
    );
}

function SliderControl({ value, onChange, label, min = 0, max = 100, icon: Icon, isDark }) {
    return (
        <div className="py-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-400'}`} />}
                    <span className={`font-medium ${isDark ? 'text-indigo-100' : 'text-slate-700'}`}>{label}</span>
                </div>
                <span className={`text-sm ${isDark ? 'text-indigo-200/60' : 'text-indigo-900/50'}`}>{value}%</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={`w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-500 ${isDark ? 'bg-slate-700' : 'bg-indigo-100'}`}
            />
        </div>
    );
}

// --- MAIN COMPONENT ---

export default function SettingsPage({ currentUser, onLogout }) {
    // 1. Préférences (localStorage)
    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('auriance_settings');
            return saved ? JSON.parse(saved) : {
                darkMode: true,
                autoSave: true,
                privateMode: false,
                soundEffects: true,
                language: "fr-FR",
                micSensitivity: 75,
                speechRate: 50,
                fontSize: "medium",
            };
        } catch (e) {
            return {
                darkMode: true,
                autoSave: true,
                privateMode: false,
                soundEffects: true,
                language: "fr-FR",
                micSensitivity: 75,
                speechRate: 50,
                fontSize: "medium",
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('auriance_settings', JSON.stringify(settings));
        const root = document.documentElement;
        if (settings.fontSize) {
            switch (settings.fontSize) {
                case 'small': root.style.fontSize = '14px'; break;
                case 'medium': root.style.fontSize = '16px'; break;
                case 'large': root.style.fontSize = '20px'; break;
                default: root.style.fontSize = '16px';
            }
        }
    }, [settings]);

    const isDark = settings.darkMode;
    const updateSetting = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const t = TRANSLATIONS[settings.language] || TRANSLATIONS['fr-FR'];

    // 2. Profil (API)
    const [formFirstName, setFormFirstName] = useState("");
    const [formLastName, setFormLastName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('user_avatar') || null);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    // Refs pour le scroll et focus
    const profileSectionRef = useRef(null);
    const firstNameInputRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("L'image est trop volumineuse (max 5MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setAvatarUrl(base64String);
                localStorage.setItem('user_avatar', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const scrollToProfile = () => {
        profileSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            firstNameInputRef.current?.focus();
        }, 500);
    };

    useEffect(() => {
        if (currentUser) {
            const fullName = currentUser.full_name || currentUser.username || "";
            const parts = fullName.split(' ');
            const distinctFirst = currentUser.first_name;
            const distinctLast = currentUser.last_name;

            setFormFirstName(distinctFirst || parts[0] || "");
            setFormLastName(distinctLast || (parts.length > 1 ? parts.slice(1).join(' ') : "") || "");
            setFormEmail(currentUser.email || "");
        }
    }, [currentUser]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setNotification(null);
        try {
            const token = localStorage.getItem('token');
            const fullName = `${formFirstName} ${formLastName}`.trim();

            await updateUserProfile({
                full_name: fullName,
                email: formEmail
            }, token);

            setNotification({ type: 'success', message: t.profileUpdated });

            setTimeout(() => {
                window.location.reload();
            }, 1200);

        } catch (error) {
            console.error("Erreur sauvegarde profil:", error);
            setNotification({ type: 'error', message: "Erreur : " + (error.message || t.profileError) });
        } finally {
            setIsSaving(false);
        }
    };

    // 3. Export & Delete Actions
    const handleExportData = async () => {
        try {
            setNotification(null);
            const transcriptionsData = await getTranscriptions(100);

            const userData = {
                user: currentUser,
                settings: settings,
                transcriptions: transcriptionsData,
                exportDate: new Date().toISOString(),
                version: "1.0"
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `auriance_data_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            setNotification({ type: 'success', message: t.exportSuccess });
        } catch (err) {
            console.error(err);
            setNotification({ type: 'error', message: t.exportError + " : " + err.message });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("ATTENTION : Cette action est irréversible.\n\nVoulez-vous vraiment supprimer définitivement votre compte et toutes vos données ?")) {
            if (window.confirm("Dernière confirmation : Êtes-vous ABSOLUMENT sûr ?")) {
                try {
                    const token = localStorage.getItem('token');
                    await deleteUser(token);
                    alert("Votre compte a été supprimé. Vous allez être déconnecté.");
                    onLogout();
                } catch (err) {
                    console.error("Delete user error:", err);
                    setNotification({ type: 'error', message: "Erreur suppression : " + err.message });
                }
            }
        }
    };


    const [customDictionary] = useState(["Doliprane", "Triptan", "IRM", "Scanner", "Electrocardiogramme"]);

    const initials = (formFirstName[0] || "") + (formLastName[0] || "");
    const displayName = `${formFirstName} ${formLastName}`.trim() || currentUser?.username || "Profil";

    return (
        <div
            className={`min-h-screen p-8 transition-colors duration-500 font-sans tracking-wide
            ${isDark
                    ? 'bg-[#0A0B14] text-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1B1E3B] via-[#0A0B14] to-[#0A0B14]'
                    : 'bg-[#FDFAFF] text-slate-900 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-white to-white'
                }`}
        >

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -50, x: "-50%" }}
                        className={`fixed top-6 left-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-medium backdrop-blur-md border ${notification.type === 'success'
                            ? 'bg-indigo-500/90 text-white border-indigo-400/50 shadow-indigo-500/20'
                            : 'bg-rose-500/90 text-white border-rose-400/50 shadow-rose-500/20'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-indigo-400/30' : 'bg-rose-400/30'}`}>
                            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <span className="text-lg">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-4xl font-light tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.title}</h1>
                        <p className={`mt-2 font-light ${isDark ? 'text-indigo-200/60' : 'text-slate-500'}`}>{t.subtitle}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className={`px-4 py-2 rounded-xl transition-colors text-sm font-medium border ${isDark
                            ? 'text-rose-400 border-rose-900/30 hover:bg-rose-900/20'
                            : 'text-rose-600 border-rose-100 hover:bg-rose-50'
                            }`}
                    >
                        {t.logout}
                    </button>
                </div>

                {/* Profile Card Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${isDark
                        ? 'bg-gradient-to-r from-indigo-900/40 to-[#131420] border border-indigo-500/20 shadow-xl shadow-indigo-500/5'
                        : 'bg-white/80 border border-white shadow-xl shadow-indigo-100/40 backdrop-blur-sm'
                        }`}
                >
                    {isDark
                        ? <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        : <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    }

                    <div className="flex items-center gap-8 relative z-10">
                        <div className="relative group">
                            <div className={`
                                w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-light text-white shadow-xl overflow-hidden
                                ${isDark ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/20' : 'bg-gradient-to-br from-indigo-400 to-violet-500 shadow-indigo-500/30'}
                            `}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    initials.toUpperCase() || <User />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                            >
                                <Camera className="w-6 h-6" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="flex-1">
                            <h2 className={`text-3xl font-light tracking-wide ${isDark ? 'text-white' : 'text-slate-800'}`}>{displayName}</h2>
                            <p className={`${isDark ? 'text-indigo-200/60' : 'text-slate-500'}`}>{formEmail}</p>
                            <div className="flex items-center gap-3 mt-4">
                                <span className={`text-xs px-3 py-1 rounded-full border ${isDark
                                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    }`}>
                                    {t.premium}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={scrollToProfile}
                            className={`px-5 py-2.5 rounded-xl transition-colors text-sm font-medium flex items-center gap-2 border ${isDark
                                ? 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                                }`}
                        >
                            {t.edit}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>

                {/* Settings Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Voice Settings */}
                    <SettingCard
                        title={t.voiceIntel}
                        description={t.voiceDesc}
                        icon={Mic}
                        delay={0.1}
                        isDark={isDark}
                    >
                        <div className="mb-4">
                            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-indigo-200' : 'text-slate-700'}`}>{t.recogLang}</p>
                            <div className="flex gap-2 flex-wrap">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => updateSetting("language", lang.code)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${settings.language === lang.code
                                            ? (isDark
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                                                : "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20")
                                            : (isDark
                                                ? "bg-[#1A1C2E] text-indigo-200 border-indigo-500/20 hover:border-indigo-500/40"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600")
                                            }`}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="text-sm font-medium">{lang.label}</span>
                                    </button>
                                ))}
                            </div>

                            <MicTester isDark={isDark} t={t} />
                        </div>

                        <SliderControl
                            value={settings.micSensitivity}
                            onChange={(v) => updateSetting("micSensitivity", v)}
                            label={t.micSens}
                            icon={Volume2}
                            isDark={isDark}
                        />

                        <SliderControl
                            value={settings.speechRate}
                            onChange={(v) => updateSetting("speechRate", v)}
                            label={t.speechRate}
                            icon={Globe}
                            isDark={isDark}
                        />

                        <div className={`pt-4 border-t mt-4 ${isDark ? 'border-indigo-500/10' : 'border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <BookOpen className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    <span className={`font-medium ${isDark ? 'text-indigo-100' : 'text-slate-700'}`}>{t.customDict}</span>
                                </div>
                                <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`}>
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {customDictionary.map((word, i) => (
                                    <span
                                        key={i}
                                        className={`text-xs px-3 py-1.5 rounded-full border ${isDark
                                            ? 'bg-indigo-500/10 text-indigo-200 border-indigo-500/20'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                            }`}
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </SettingCard>

                    {/* Appearance Settings */}
                    <SettingCard
                        title={t.appearance}
                        description={t.appearanceDesc}
                        icon={Palette}
                        delay={0.2}
                        isDark={isDark}
                    >
                        <ToggleSwitch
                            enabled={settings.darkMode}
                            onToggle={() => updateSetting("darkMode", !settings.darkMode)}
                            label={t.darkMode}
                            description={t.darkModeDesc}
                            isDark={isDark}
                        />

                        <div className="py-3">
                            <p className={`font-medium mb-3 ${isDark ? 'text-indigo-200' : 'text-slate-700'}`}>{t.textSize}</p>
                            <div className="flex gap-2">
                                {["small", "medium", "large"].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => updateSetting("fontSize", size)}
                                        className={`flex-1 py-3 rounded-xl border font-medium transition-all ${settings.fontSize === size
                                            ? (isDark
                                                ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25"
                                                : "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25")
                                            : (isDark
                                                ? "bg-[#1A1C2E] text-indigo-300 border-indigo-500/20 hover:border-indigo-500/40"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300")
                                            }`}
                                    >
                                        {size === "small" ? "A-" : size === "medium" ? "A" : "A+"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ToggleSwitch
                            enabled={settings.soundEffects}
                            onToggle={() => updateSetting("soundEffects", !settings.soundEffects)}
                            label={t.soundEffects}
                            isDark={isDark}
                        />
                    </SettingCard>

                    {/* Security Settings */}
                    <SettingCard
                        title={t.security}
                        description={t.securityDesc}
                        icon={Shield}
                        delay={0.3}
                        isDark={isDark}
                    >
                        <ToggleSwitch
                            enabled={settings.autoSave}
                            onToggle={() => updateSetting("autoSave", !settings.autoSave)}
                            label={t.autoSave}
                            description={t.autoSaveDesc}
                            isDark={isDark}
                        />

                        <ToggleSwitch
                            enabled={settings.privateMode}
                            onToggle={() => updateSetting("privateMode", !settings.privateMode)}
                            label={t.privateMode}
                            description={t.privateModeDesc}
                            isDark={isDark}
                        />

                        <div className={`pt-4 border-t mt-4 space-y-3 ${isDark ? 'border-indigo-500/10' : 'border-slate-100'}`}>
                            <button
                                onClick={handleExportData}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors group border ${isDark ? 'bg-[#1A1C2E] hover:bg-indigo-900/20 border-indigo-500/20 text-indigo-200' : 'bg-slate-50 hover:bg-indigo-50 border-slate-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Download className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-slate-600'}`} />
                                    <span className={`font-medium ${isDark ? 'text-indigo-100' : 'text-slate-700'}`}>{t.exportData}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={handleDeleteAccount}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-rose-500 border ${isDark ? 'bg-rose-950/10 hover:bg-rose-900/20 border-rose-900/20' : 'bg-rose-50 hover:bg-rose-100 border-rose-100'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 className="w-5 h-5" />
                                    <span className="font-medium">{t.deleteAccount}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </SettingCard>

                    {/* User Profile Quick Edit */}
                    <div ref={profileSectionRef}>
                        <SettingCard
                            title={t.profile}
                            description={t.profileDesc}
                            icon={User}
                            delay={0.4}
                            isDark={isDark}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className={`text-sm mb-1 block font-medium ${isDark ? 'text-indigo-200' : 'text-slate-500'}`}>{t.lastName}</label>
                                    <input
                                        ref={firstNameInputRef}
                                        type="text"
                                        value={formLastName}
                                        onChange={(e) => setFormLastName(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium ${isDark ? 'bg-[#1A1C2E] border-indigo-500/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`text-sm mb-1 block font-medium ${isDark ? 'text-indigo-200' : 'text-slate-500'}`}>{t.firstName}</label>
                                    <input
                                        type="text"
                                        value={formFirstName}
                                        onChange={(e) => setFormFirstName(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium ${isDark ? 'bg-[#1A1C2E] border-indigo-500/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`text-sm mb-1 block font-medium ${isDark ? 'text-indigo-200' : 'text-slate-500'}`}>{t.email}</label>
                                    <input
                                        type="email"
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium ${isDark ? 'bg-[#1A1C2E] border-indigo-500/20 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                                    />
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className={`w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isSaving ? t.saving : t.saveChanges}
                                </button>
                            </div>
                        </SettingCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
