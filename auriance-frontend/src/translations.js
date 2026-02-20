export const TRANSLATIONS = {
    FR: {
        locale: 'fr-FR',
        nav: { features: "Fonctionnalités", demo: "Démo", pricing: "Tarifs", docs: "Documentation", contact: "Contact", login: "Connexion", dashboard: "Tableau de Bord", logout: "Déconnexion", faq: "FAQ" },
        dashboard: {
            liveTranscription: {
                back: "RETOUR", statusActive: "ENREGISTREMENT ACTIF", statusReady: "SYSTÈME PRÊT",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● Capture Audio en cours...",
                waitingCommand: "En attente de commande vocale", orbInit: "Initialiser", terminalLabel: "live_transcript.txt",
                charsLabel: "caractères", systemReadyToTranscribe: "Système prêt. Appuyez pour commencer...",
                btnSave: "SAUVEGARDER", btnExport: "EXPORT PDF", btnClear: "EFFACER",
                modalClearTitle: "Tout effacer ?", modalClearMessage: "Cette action est irréversible. Voulez-vous continuer ?",
                modalCancel: "Annuler", modalConfirm: "Confirmer", modalSuccessTitle: "PDF Exporté",
                modalSuccessMessage: "Le fichier a été téléchargé.", modalErrorTitle: "Erreur Export",
                modalErrorMessage: "Impossible de générer le PDF.", modalSaveSuccess: "Sauvegardé",
                modalSaveSuccessMsg: "La transcription a été enregistrée dans votre historique.",
                modalClearSuccess: "Effacé", modalClearSuccessMsg: "La transcription a été réinitialisée.",
                modalNoTranscript: "Transcription vide", modalNoTranscriptMsg: "Aucune transcription à sauvegarder.",
                modalMicroErrorTitle: "Erreur Micro", modalMicroErrorMessage: "Impossible d'accéder au microphone. Vérifiez vos permissions.",
                modalMicroUnavailable: "Micro indisponible."
            },
            autoForm: {
                back: "RETOUR", statusActive: "ENREGISTREMENT ACTIF", statusReady: "SYSTÈME PRÊT",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● Capture Audio en cours...",
                waitingCommand: "En attente de commande vocale", orbInit: "Initialiser", currentDomain: "Domaine actuel",
                rawTranscript: "Transcription brute", quickTemplates: "Modèles Rapides", demoButton: "REMPLIR AVEC DONNÉES DÉMO",
                generatedReport: "Rapport Généré", autoExtraction: "Extraction automatique des entités", waitingData: "En attente de données...",
                btnValidate: "VALIDER", btnExport: "EXPORT PDF", btnClear: "EFFACER",
                modalClearTitle: "Tout effacer ?", modalClearMessage: "Cette action réinitialisera le formulaire et la transcription. Continuer ?",
                modalSaveSuccess: "Sauvegarde Réussie", modalSaveSuccessMessage: "La fiche a été enregistrée avec succès.",
                modalErrorSTT: "Votre navigateur ne supporte pas la reconnaissance vocale.",
                config: {
                    medical: { label: "Santé", fields: ["Nom du patient", "Âge", "Symptômes", "Médicament prescrit", "Diagnostic", "Recommandations"] },
                    biodiversity: { label: "Biodiversité", fields: ["Espèce", "Nombre", "Lieu", "Comportement", "Météo"] },
                    construction: { label: "Chantier", fields: ["Projet", "Avancement", "Problème", "Prochaine étape", "Date"] }
                }
            },
            toolsMenu: {
                back: "Retour",
                subtitle: "Intelligent Engine Pro",
                connected: "Connecté",
                logout: "Quitter",
                ecosystemTag: "Auriance Deep Tech Ecosystem",
                chooseTitle: "Choisissez votre", chooseTitleSuffix: "Outil",
                chooseSubtitle: "Accédez aux modules d'IA spécialisés pour transformer votre flux de travail clinique.",
                transcription: { name: "Transcription Live", desc: "Transcription IA haute fidélité en temps réel avec Auriance Whisper." },
                autoform: { name: "Auto Form", desc: "Extraction intelligente vers formulaires structurés via NLP avancé." },
                history: { name: "Historique", desc: "Consultez et gérez vos sessions passées et données extraites." },
                generatedQueries: { name: "Requêtes Générées", desc: "Générez des requêtes SQL et Cypher complexes par simple commande vocale." },
                settings: { name: "Paramètres", desc: "Configurez votre environnement, profil et préférences système." },
                assistantMedical: { name: "Assistant Médical", desc: "Interrogez vos données médicales en langage naturel grâce à l'IA Gemini." },
                optimizedAI: "Optimisé IA",
                proPlus: "Auriance Pro+",
                comingSoon: "Bientôt disponible",
                footerPrivacy: "Confidentialité", footerTerms: "Conditions", footerApiStatus: "API Status",
                footerRights: "Tous droits réservés."
            }
        },
        home: {
            hero: {
                title: "L'Intelligence Vocale pour", titleSuffix: "les Professionnels", subtitle: "Transformez vos réunions et consultations en actions concrètes grâce à notre IA de pointe.", cta_demo: "Essayer la Démo", cta_login: "Se Connecter",
                newFeatureBadge: "Nouveau : Rapports Automatisés IA",
                watchDemo: "Voir la démo",
                statPrecision: "Précision IA", statTimeFreed: "Temps libéré", statUsers: "Utilisateurs",
                adoptedBy: "Adopté par des centaines d'experts",
                voiceAnalysis: "Analyse vocale en cours...", readyToTranscribe: "Prêt à transcrire",
                realtimeTranscription: "Transcription temps réel",
                badgeSecure: "Données Sécurisées", badgeAI: "Synthèse IA", badgeRealtime: "Temps réel"
            },
            features: {
                title: "Pourquoi choisir Auriance ?",
                f1_title: "Transcription Temps Réel", f1_desc: "Capturez chaque mot avec une précision chirurgicale (99%).",
                f2_title: "Extraction Intelligente", f2_desc: "Transformez le dialogue en données structurées (JSON/SQL).",
                f3_title: "Sécurité Maximale", f3_desc: "Vos données sont cryptées et stockées en France.",
                f4_title: "Rapports Automatisés", f4_desc: "Vos comptes-rendus sont générés et formatés automatiquement. Fini la mise en page manuelle fastidieuse.",
                f5_title: "Export Multi-Formats", f5_desc: "Générez des documents PDF, Word ou JSON en un clic, prêts à être archivés ou partagés avec vos équipes.",
                f6_title: "Historique Illimité", f6_desc: "Retrouvez toutes vos sessions passées, recherchez par mots-clés et réécoutez vos enregistrements originaux.",
                sectionTitle: "Fonctionnalités",
                mainTitle: "Tout ce dont vous avez besoin,", mainTitleSuffix: "rien de superflu",
                mainSubtitle: "Une suite complète d'outils pensée pour les experts, conçue pour maximiser votre efficacité au quotidien.",
                howItWorksTag: "Comment ça marche", howItWorksTitle: "Simple comme", howItWorksTitleSuffix: "1, 2, 3",
                step1Title: "Enregistrez", step1Desc: "Lancez la capture audio lors de vos réunions ou dictez vos notes",
                step2Title: "IA Analyse", step2Desc: "L'IA transcrit, résume et structure le contenu instantanément",
                step3Title: "Exploitez", step3Desc: "Exportez le rapport final ou connectez-le à vos outils (CRM, etc.)",
                statLatency: "Latence", statLanguages: "Langues", statEncrypted: "Chiffré", statHistory: "Historique"
            },
            demo: {
                tag: "Demo interactive",
                title: "Essayez par vous-même",
                subtitle: "Découvrez la puissance de notre reconnaissance vocale en temps réel.",
                listening: "Écoute en cours...", readyToListen: "Prêt à écouter",
                language: "Français",
                clickToStart: "Cliquez sur le microphone pour commencer la démo"
            }
        },
        pricing: {
            title: "Un prix adapté à", titleSuffix: "chaque ambition", subtitle: "Commencez gratuitement, évoluez quand vous êtes prêt. Pas de surprise, pas de frais cachés.",
            monthly: "Mensuel", yearly: "Annuel", popular: "Plus populaire", free_price: "Gratuit", month: "mois", year: "an",
            footer: "Tous les prix sont HT. Annulez à tout moment. Satisfait ou remboursé 30 jours.",
            free: { name: "Free", desc: "Pour découvrir Auriance", cta: "Commencer gratuitement", features: ["10 transcriptions / mois", "Export PDF basique", "Historique 7 jours", "Support email"] },
            pro: { name: "Pro", desc: "Pour les experts et indépendants", cta: "Essayer 14 jours gratuit", features: ["Transcriptions illimitées", "Rapports Automatisés IA", "Export PDF personnalisé", "Historique illimité", "API Access", "Support prioritaire"] },
            enterprise: { name: "Entreprise", desc: "Pour les équipes et organisations", cta: "Contacter les ventes", features: ["Tout Pro inclus", "Multi-utilisateurs", "Dashboard admin", "SSO & SAML", "Intégration CRM/ERP", "Account manager dédié", "SLA 99.9%"] }
        },
        security: {
            badge: "Sécurité & Conformité", title: "Vos données sont", titleSuffix: "notre priorité", subtitle: "Auriance a été conçu dès le départ avec la sécurité au cœur de son architecture.",
            f1: { title: "Chiffrement AES-256", desc: "Données chiffrées au repos et en transit." },
            f2: { title: "Hébergement Souverain", desc: "Données en France/Europe (SecNumCloud)." },
            f3: { title: "Conforme RGPD", desc: "Respect total de la protection des données." },
            f4: { title: "Confidentialité Totale", desc: "Zéro accès à vos contenus en clair." },
            f5: { title: "Backup temps réel", desc: "Sauvegardes chiffrées et géoredondantes." },
            f6: { title: "Audit de sécurité", desc: "Audits réguliers par experts indépendants." },
            certs: { iso: "Sécurité de l'information", secnum: "Cloud Souverain", rgpd: "Protection des données", soc2: "Contrôles de sécurité" },
            cta: { title: "Besoin d'une attestation ?", text: "Documents disponibles pour vos audits.", btn: "Demander les documents" }
        },
        faq: {
            title: "Questions", titleSuffix: "fréquentes", subtitle: "Tout ce que vous devez savoir sur Auriance.", more_questions: "Vous avez d'autres questions ?", contact_team: "Contactez notre équipe",
            q1: { question: "Précision de la transcription ?", answer: "92-97% grâce à une IA multi-sectorielle." },
            q2: { question: "Sécurité des données ?", answer: "Chiffrement AES-256, ISO 27001, serveurs en Europe." },
            q3: { question: "Utilisation hors ligne ?", answer: "Oui, via l'application mobile avec synchro." },
            q4: { question: "Formats d'export ?", answer: "PDF, Word, JSON, API vers vos outils." },
            q5: { question: "Engagement ?", answer: "Aucun. Annulable à tout moment." },
            q6: { question: "Essai gratuit ?", answer: "14 jours complets, sans CB." },
            q7: { question: "Intégrations ?", answer: "Oui : Salesforce, Notion, API REST..." },
            q8: { question: "Langues supportées ?", answer: "30+ langues dont FR, EN, ES, DE, CN..." }
        },
        cta: {
            badge: "14 jours d'essai gratuit, sans carte bancaire", title: "Prêt à transformer vos", titleSuffix: "processus métier",
            subtitle: "Rejoignez 2,000+ experts. Démarrez en 2 minutes.", btn_start: "Commencer gratuitement",
            feature1: "Aucune carte requise", feature2: "Config en 2 min", feature3: "Annulez à tout moment"
        },
        footer: {
            rights: "Tous droits réservés.", description: "La voix devient votre assistant intelligent.",
            product: "Produit", company: "Entreprise", legal: "Légal", support: "Support",
            about: "À propos", blog: "Blog", careers: "Carrières", press: "Presse",
            legal_mentions: "Mentions légales", terms: "CGU", privacy: "Confidentialité", help_center: "Centre d'aide", community: "Communauté"
        }
    },
    EN: {
        locale: 'en-US',
        nav: { features: "Features", demo: "Demo", pricing: "Pricing", docs: "Documentation", contact: "Contact", login: "Login", dashboard: "Dashboard", logout: "Logout", faq: "FAQ" },
        dashboard: {
            liveTranscription: {
                back: "BACK", statusActive: "RECORDING ACTIVE", statusReady: "SYSTEM READY",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● Audio capture in progress...",
                waitingCommand: "Waiting for voice command", orbInit: "Initialize", terminalLabel: "live_transcript.txt",
                charsLabel: "characters", systemReadyToTranscribe: "System ready. Press to start...",
                btnSave: "SAVE", btnExport: "EXPORT PDF", btnClear: "CLEAR",
                modalClearTitle: "Clear everything?", modalClearMessage: "This action is irreversible. Do you want to continue?",
                modalCancel: "Cancel", modalConfirm: "Confirm", modalSuccessTitle: "PDF Exported",
                modalSuccessMessage: "The file has been downloaded.", modalErrorTitle: "Export Error",
                modalErrorMessage: "Unable to generate PDF.", modalSaveSuccess: "Saved",
                modalSaveSuccessMsg: "The transcription has been saved to your history.",
                modalClearSuccess: "Cleared", modalClearSuccessMsg: "The transcription has been reset.",
                modalNoTranscript: "Empty transcription", modalNoTranscriptMsg: "No transcription to save.",
                modalMicroErrorTitle: "Microphone Error", modalMicroErrorMessage: "Unable to access microphone. Check your permissions.",
                modalMicroUnavailable: "Microphone unavailable."
            },
            autoForm: {
                back: "BACK", statusActive: "RECORDING ACTIVE", statusReady: "SYSTEM READY",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● Audio capture in progress...",
                waitingCommand: "Waiting for voice command", orbInit: "Initialize", currentDomain: "Current domain",
                rawTranscript: "Raw transcript", quickTemplates: "Quick Templates", demoButton: "FILL WITH DEMO DATA",
                generatedReport: "Generated Report", autoExtraction: "Automatic entity extraction", waitingData: "Waiting for data...",
                btnValidate: "VALIDATE", btnExport: "EXPORT PDF", btnClear: "CLEAR",
                modalClearTitle: "Clear everything?", modalClearMessage: "This action will reset the form and transcription. Continue?",
                modalSaveSuccess: "Save Successful", modalSaveSuccessMessage: "The form has been saved successfully.",
                modalErrorSTT: "Your browser does not support speech recognition.",
                config: {
                    medical: { label: "Healthcare", fields: ["Patient Name", "Age", "Symptoms", "Prescribed Medication", "Diagnosis", "Recommendations"] },
                    biodiversity: { label: "Biodiversity", fields: ["Species", "Count", "Location", "Behavior", "Weather"] },
                    construction: { label: "Construction", fields: ["Project", "Progress", "Issue", "Next Step", "Date"] }
                }
            },
            toolsMenu: {
                back: "Back",
                subtitle: "Intelligent Engine Pro",
                connected: "Connected",
                logout: "Logout",
                ecosystemTag: "Auriance Deep Tech Ecosystem",
                chooseTitle: "Choose your", chooseTitleSuffix: "Tool",
                chooseSubtitle: "Access specialized AI modules to transform your clinical workflow.",
                transcription: { name: "Live Transcription", desc: "High-fidelity AI transcription in real-time with Auriance Whisper." },
                autoform: { name: "Auto Form", desc: "Intelligent extraction to structured forms via advanced NLP." },
                history: { name: "History", desc: "View and manage your past sessions and extracted data." },
                generatedQueries: { name: "Generated Queries", desc: "Generate complex SQL and Cypher queries by simple voice command." },
                settings: { name: "Settings", desc: "Configure your environment, profile, and system preferences." },
                assistantMedical: { name: "Medical Assistant", desc: "Query your medical data in natural language powered by Gemini AI." },
                optimizedAI: "AI Optimized",
                proPlus: "Auriance Pro+",
                comingSoon: "Coming soon",
                footerPrivacy: "Privacy", footerTerms: "Terms", footerApiStatus: "API Status",
                footerRights: "All rights reserved."
            }
        },
        home: {
            hero: {
                title: "Voice Intelligence for", titleSuffix: "Professionals", subtitle: "Turn your meetings and consultations into concrete actions with our state-of-the-art AI.", cta_demo: "Try Demo", cta_login: "Login",
                newFeatureBadge: "New: AI Automated Reports",
                watchDemo: "Watch Demo",
                statPrecision: "AI Precision", statTimeFreed: "Time Freed", statUsers: "Users",
                adoptedBy: "Adopted by hundreds of experts",
                voiceAnalysis: "Voice analysis in progress...", readyToTranscribe: "Ready to transcribe",
                realtimeTranscription: "Real-time transcription",
                badgeSecure: "Secure Data", badgeAI: "AI Summary", badgeRealtime: "Real-time"
            },
            features: {
                title: "Why choose Auriance?",
                f1_title: "Real-Time Transcription", f1_desc: "Capture every word with surgical precision (99%).",
                f2_title: "Smart Extraction", f2_desc: "Transform dialogue into structured data (JSON/SQL).",
                f3_title: "Maximum Security", f3_desc: "Your data is encrypted and stored in France.",
                f4_title: "Automated Reports", f4_desc: "Your reports are generated and formatted automatically. No more tedious manual formatting.",
                f5_title: "Multi-Format Export", f5_desc: "Generate PDF, Word, or JSON documents in one click, ready to be archived or shared with your teams.",
                f6_title: "Unlimited History", f6_desc: "Find all your past sessions, search by keywords, and replay your original recordings.",
                sectionTitle: "Features",
                mainTitle: "Everything you need,", mainTitleSuffix: "nothing superfluous",
                mainSubtitle: "A complete suite of tools designed for experts, built to maximize your daily efficiency.",
                howItWorksTag: "How it works", howItWorksTitle: "As easy as", howItWorksTitleSuffix: "1, 2, 3",
                step1Title: "Record", step1Desc: "Start audio capture during your meetings or dictate your notes",
                step2Title: "AI Analyzes", step2Desc: "AI transcribes, summarizes, and structures content instantly",
                step3Title: "Use", step3Desc: "Export the final report or connect it to your tools (CRM, etc.)",
                statLatency: "Latency", statLanguages: "Languages", statEncrypted: "Encrypted", statHistory: "History"
            },
            demo: {
                tag: "Interactive Demo",
                title: "Try it yourself",
                subtitle: "Discover the power of our real-time voice recognition.",
                listening: "Listening...", readyToListen: "Ready to listen",
                language: "English",
                clickToStart: "Click the microphone to start the demo"
            }
        },
        pricing: {
            title: "Pricing adapted to", titleSuffix: "every ambition", subtitle: "Start for free, scale when ready. No surprises, no hidden fees.",
            monthly: "Monthly", yearly: "Yearly", popular: "Most Popular", free_price: "Free", month: "mo", year: "yr",
            footer: "All prices excl. VAT. Cancel anytime. 30-day money-back guarantee.",
            free: { name: "Free", desc: "To discover Auriance", cta: "Start for free", features: ["10 transcriptions / mo", "Basic PDF export", "7-day history", "Email support"] },
            pro: { name: "Pro", desc: "For experts and freelancers", cta: "Try 14 days free", features: ["Unlimited transcriptions", "AI Automated Reports", "Custom PDF export", "Unlimited history", "API Access", "Priority support"] },
            enterprise: { name: "Enterprise", desc: "For teams and organizations", cta: "Contact Sales", features: ["All Pro features", "Multi-user", "Admin dashboard", "SSO & SAML", "CRM/ERP Integration", "Dedicated account manager", "99.9% SLA"] }
        },
        security: {
            badge: "Security & Compliance", title: "Your data is", titleSuffix: "our priority", subtitle: "Auriance was built with security at its core.",
            f1: { title: "AES-256 Encryption", desc: "Data encrypted at rest and in transit." },
            f2: { title: "Sovereign Hosting", desc: "Data in France/Europe (SecNumCloud)." },
            f3: { title: "GDPR Compliant", desc: "Full respect of data protection regulations." },
            f4: { title: "Total Privacy", desc: "Zero access to your clear content." },
            f5: { title: "Real-time Backup", desc: "Encrypted and geo-redundant backups." },
            f6: { title: "Security Audit", desc: "Regular audits by independent experts." },
            certs: { iso: "Information Security", secnum: "Sovereign Cloud", rgpd: "Data Protection", soc2: "Security Controls" },
            cta: { title: "Need compliance proof?", text: "Documents available for your audits.", btn: "Request documents" }
        },
        faq: {
            title: "Frequent", titleSuffix: "questions", subtitle: "Everything you need to know about Auriance.", more_questions: "Have other questions?", contact_team: "Contact our team",
            q1: { question: "Transcription accuracy?", answer: "92-97% thanks to multi-sector AI." },
            q2: { question: "Data security?", answer: "AES-256, ISO 27001, EU servers." },
            q3: { question: "Offline use?", answer: "Yes, via mobile app with sync." },
            q4: { question: "Export formats?", answer: "PDF, Word, JSON, API to your tools." },
            q5: { question: "Commitment?", answer: "None. Cancel anytime." },
            q6: { question: "Free trial?", answer: "14 full days, no credit card." },
            q7: { question: "Integrations?", answer: "Yes: Salesforce, Notion, REST API..." },
            q8: { question: "Supported languages?", answer: "30+ including EN, FR, ES, DE, CN..." }
        },
        cta: {
            badge: "14-day free trial, no credit card", title: "Ready to transform your", titleSuffix: "workflows",
            subtitle: "Join 2,000+ experts. Start in 2 minutes.", btn_start: "Start for free",
            feature1: "No card required", feature2: "2-min setup", feature3: "Cancel anytime"
        },
        footer: {
            rights: "All rights reserved.", description: "Voice becomes your intelligent assistant.",
            product: "Product", company: "Company", legal: "Legal", support: "Support",
            about: "About", blog: "Blog", careers: "Careers", press: "Press",
            legal_mentions: "Legal Mentions", terms: "Terms", privacy: "Privacy", help_center: "Help Center", community: "Community"
        }
    },
    ES: {
        locale: 'es-ES',
        nav: { features: "Funcionalidades", demo: "Demo", pricing: "Precios", docs: "Documentación", contact: "Contacto", login: "Conexión", dashboard: "Panel", logout: "Desconectar", faq: "FAQ" },
        dashboard: {
            liveTranscription: {
                back: "VOLVER", statusActive: "GRABACIÓN ACTIVA", statusReady: "SISTEMA LISTO",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● Captura de audio en curso...",
                waitingCommand: "Esperando comando de voz", orbInit: "Inicializar", terminalLabel: "live_transcript.txt",
                charsLabel: "caracteres", systemReadyToTranscribe: "Sistema listo. Pulse para comenzar...",
                btnSave: "GUARDAR", btnExport: "EXPORTAR PDF", btnClear: "BORRAR",
                modalClearTitle: "¿Borrar todo?", modalClearMessage: "Esta acción es irreversible. ¿Desea continuar?",
                modalCancel: "Cancelar", modalConfirm: "Confirmar", modalSuccessTitle: "PDF Exportado",
                modalSuccessMessage: "El archivo ha sido descargado.", modalErrorTitle: "Error de Exportación",
                modalErrorMessage: "No se puede generar el PDF.", modalSaveSuccess: "Guardado",
                modalSaveSuccessMsg: "La transcripción ha sido guardada en su historial.",
                modalClearSuccess: "Borrado", modalClearSuccessMsg: "La transcripción ha sido reiniciada.",
                modalNoTranscript: "Transcripción vacía", modalNoTranscriptMsg: "No hay transcripción que guardar.",
                modalMicroErrorTitle: "Error de Micrófono", modalMicroErrorMessage: "No se puede acceder al micrófono. Verifique sus permisos.",
                modalMicroUnavailable: "Micrófono no disponible."
            },
            autoForm: {
                back: "VOLVER", statusActive: "GRABACIÓN ACTIVA", statusReady: "SISTEMA LISTO",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● Captura de audio en curso...",
                waitingCommand: "Esperando comando de voz", orbInit: "Inicializar", currentDomain: "Dominio actual",
                rawTranscript: "Transcripción bruta", quickTemplates: "Plantillas Rápidas", demoButton: "RELLENAR CON DATOS DEMO",
                generatedReport: "Informe Generado", autoExtraction: "Extracción automática de entidades", waitingData: "Esperando datos...",
                btnValidate: "VALIDAR", btnExport: "EXPORTAR PDF", btnClear: "BORRAR",
                modalClearTitle: "¿Borrar todo?", modalClearMessage: "Esta acción reiniciará el formulario y la transcripción. ¿Continuar?",
                modalSaveSuccess: "Guardado Exitoso", modalSaveSuccessMessage: "El formulario ha sido guardado con éxito.",
                modalErrorSTT: "Su navegador no soporta reconocimiento de voz.",
                config: {
                    medical: { label: "Salud", fields: ["Nombre del paciente", "Edad", "Síntomas", "Medicamento prescrito", "Diagnóstico", "Recomendaciones"] },
                    biodiversity: { label: "Biodiversidad", fields: ["Especie", "Cantidad", "Ubicación", "Comportamiento", "Clima"] },
                    construction: { label: "Construcción", fields: ["Proyecto", "Avance", "Problema", "Próximo paso", "Fecha"] }
                }
            }
        },
        home: {
            hero: { title: "Inteligencia de Voz para", titleSuffix: "Profesionales", subtitle: "Transforme sus reuniones y consultas en acciones concretas con nuestra IA de vanguardia.", cta_demo: "Prueba la Demo", cta_login: "Conectarse" },
            features: { title: "¿Por qué elegir Auriance?", f1_title: "Transcripción en Tiempo Real", f1_desc: "Capture cada palabra con precisión quirúrgica (99%).", f2_title: "Extracción Inteligente", f2_desc: "Transforme el diálogo en datos estructurados (JSON/SQL).", f3_title: "Seguridad Máxima", f3_desc: "Sus datos están encriptados y almacenados en Francia." }
        },
        pricing: {
            title: "Un precio adaptado a", titleSuffix: "cada ambición", subtitle: "Empiece gratis. Sin sorpresas.",
            monthly: "Mensual", yearly: "Anual", popular: "Más popular", free_price: "Gratis", month: "mes", year: "año",
            footer: "Precios sin IVA. Cancele cuando quiera.",
            free: { name: "Free", desc: "Para descubrir Auriance", cta: "Empezar gratis", features: ["10 transcripciones / mes", "Exportación PDF básica", "Historial 7 días", "Soporte por email"] },
            pro: { name: "Pro", desc: "Para expertos", cta: "Prueba 14 días gratis", features: ["Transcripciones ilimitadas", "Informes IA automatizados", "Exportación PDF personalizada", "Historial ilimitado", "Acceso API", "Soporte prioritario"] },
            enterprise: { name: "Empresa", desc: "Para equipos", cta: "Contactar ventas", features: ["Todo Pro incluido", "Multiusuario", "Panel de administración", "SSO & SAML", "Integración CRM/ERP", "Gestor de cuenta dedicado", "SLA 99.9%"] }
        },
        security: {
            badge: "Seguridad y Cumplimiento", title: "Sus datos son", titleSuffix: "nuestra prioridad", subtitle: "Diseñado con la seguridad en el núcleo.",
            f1: { title: "Cifrado AES-256", desc: "Datos cifrados en reposo y tránsito." },
            f2: { title: "Alojamiento Soberano", desc: "Datos en Francia/Europa." },
            f3: { title: "Conforme RGPD", desc: "Protección de datos total." },
            f4: { title: "Privacidad Total", desc: "Cero acceso a sus contenidos." },
            f5: { title: "Backup real", desc: "Copias cifradas." },
            f6: { title: "Auditoría", desc: "Auditorías regulares." },
            certs: { iso: "Seguridad Info", secnum: "Nube Soberana", rgpd: "Protección Datos", soc2: "Controles" },
            cta: { title: "¿Necesita certificados?", text: "Documentos disponibles.", btn: "Pedir documentos" }
        },
        faq: {
            title: "Preguntas", titleSuffix: "frecuentes", subtitle: "Todo lo que necesita saber.", more_questions: "¿Otras preguntas?", contact_team: "Contacte al equipo",
            q1: { question: "¿Precisión?", answer: "92-97% gracias a IA." },
            q2: { question: "¿Seguridad?", answer: "AES-256, ISO 27001." },
            q3: { question: "¿Offline?", answer: "Sí, con app móvil." },
            q4: { question: "¿Formatos?", answer: "PDF, Word, JSON, API." },
            q5: { question: "¿Compromiso?", answer: "Ninguno." },
            q6: { question: "¿Prueba gratis?", answer: "14 días, sin tarjeta." },
            q7: { question: "¿Integraciones?", answer: "Salesforce, Notion, API..." },
            q8: { question: "¿Idiomas?", answer: "30+ incluyendo ES, EN, FR..." }
        },
        cta: {
            badge: "14 días gratis, sin tarjeta", title: "Listo para transformar sus", titleSuffix: "procesos",
            subtitle: "Únase a 2,000 expertos.", btn_start: "Empezar gratis",
            feature1: "Sin tarjeta", feature2: "Config 2 min", feature3: "Cancele cuando quiera"
        },
        footer: {
            rights: "Todos los derechos reservados.", description: "La voz se convierte en su asistente inteligente.",
            product: "Producto", company: "Empresa", legal: "Legal", support: "Soporte",
            about: "Sobre nosotros", blog: "Blog", careers: "Carreras", press: "Prensa",
            legal_mentions: "Menciones legales", terms: "Términos", privacy: "Privacidad", help_center: "Centro de ayuda", community: "Comunidad"
        }
    },
    DE: {
        locale: 'de-DE',
        nav: { features: "Funktionen", demo: "Demo", pricing: "Preise", docs: "Dokumentation", contact: "Kontakt", login: "Anmeln", dashboard: "Dashboard", logout: "Abmelden", faq: "FAQ" },
        dashboard: {
            liveTranscription: {
                back: "ZURÜCK", statusActive: "AUFNAHME AKTIV", statusReady: "SYSTEM BEREIT",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● Audioaufnahme läuft...",
                waitingCommand: "Warten auf Sprachbefehl", orbInit: "Initialisieren", terminalLabel: "live_transcript.txt",
                charsLabel: "Zeichen", systemReadyToTranscribe: "System bereit. Drücken Sie zum Starten...",
                btnSave: "SPEICHERN", btnExport: "PDF EXPORTIEREN", btnClear: "LÖSCHEN",
                modalClearTitle: "Alles löschen?", modalClearMessage: "Diese Aktion ist unwiderruflich. Möchten Sie fortfahren?",
                modalCancel: "Abbrechen", modalConfirm: "Bestätigen", modalSuccessTitle: "PDF Exportiert",
                modalSuccessMessage: "Die Datei wurde heruntergeladen.", modalErrorTitle: "Export Fehler",
                modalErrorMessage: "PDF konnte nicht generiert werden.", modalSaveSuccess: "Gespeichert",
                modalSaveSuccessMsg: "Die Transkription wurde in Ihrem Verlauf gespeichert.",
                modalClearSuccess: "Gelöscht", modalClearSuccessMsg: "Die Transkription wurde zurückgesetzt.",
                modalNoTranscript: "Leere Transkription", modalNoTranscriptMsg: "Keine Transkription zum Speichern.",
                modalMicroErrorTitle: "Mikrofon Fehler", modalMicroErrorMessage: "Kein Zugriff auf das Mikrofon. Überprüfen Sie Ihre Berechtigungen.",
                modalMicroUnavailable: "Mikrofon nicht verfügbar."
            },
            autoForm: {
                back: "ZURÜCK", statusActive: "AUFNAHME AKTIV", statusReady: "SYSTEM BEREIT",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● Audioaufnahme läuft...",
                waitingCommand: "Warten auf Sprachbefehl", orbInit: "Initialisieren", currentDomain: "Aktueller Bereich",
                rawTranscript: "Rohtranskription", quickTemplates: "Schnellvorlagen", demoButton: "MIT DEMO-DATEN FÜLLEN",
                generatedReport: "Generierter Bericht", autoExtraction: "Automatische Entitätsextraktion", waitingData: "Warten auf Daten...",
                btnValidate: "VALIDIEREN", btnExport: "PDF EXPORTIEREN", btnClear: "LÖSCHEN",
                modalClearTitle: "Alles löschen?", modalClearMessage: "Diese Aktion setzt das Formular und die Transkription zurück. Fortfahren?",
                modalSaveSuccess: "Speichern Erfolgreich", modalSaveSuccessMessage: "Das Formular wurde erfolgreich gespeichert.",
                modalErrorSTT: "Ihr Browser unterstützt keine Spracherkennung.",
                config: {
                    medical: { label: "Gesundheit", fields: ["Patientenname", "Alter", "Symptome", "Verschriebenes Medikament", "Diagnose", "Empfehlungen"] },
                    biodiversity: { label: "Biodiversität", fields: ["Art", "Anzahl", "Ort", "Verhalten", "Wetter"] },
                    construction: { label: "Baustelle", fields: ["Projekt", "Fortschritt", "Problem", "Nächster Schritt", "Datum"] }
                }
            }
        },
        home: {
            hero: { title: "Sprachintelligenz für", titleSuffix: "Profis", subtitle: "Verwandeln Sie Ihre Sitzungen und Beratungen mit unserer hochmodernen KI in konkrete Maßnahmen.", cta_demo: "Demo ausprobieren", cta_login: "Einloggen" },
            features: { title: "Warum Auriance wählen?", f1_title: "Echtzeit-Transkription", f1_desc: "Erfassen Sie jedes Wort mit chirurgischer Präzision (99%).", f2_title: "Intelligente Extraktion", f2_desc: "Verwandeln Sie Dialog in strukturierte Daten (JSON/SQL).", f3_title: "Maximale Sicherheit", f3_desc: "Ihre Daten werden verschlüsselt und in Frankreich gespeichert." }
        },
        pricing: {
            title: "Ein Preis für", titleSuffix: "jede Ambition", subtitle: "Kostenlos starten. Keine Überraschungen.",
            monthly: "Monatlich", yearly: "Jährlich", popular: "Beliebt", free_price: "Gratis", month: "Monat", year: "Jahr",
            footer: "Preise zzgl. MwSt. Jederzeit kündbar.",
            free: { name: "Free", desc: "Auriance entdecken", cta: "Gratis starten", features: ["10 Transkriptionen / Monat", "Basis PDF-Export", "7 Tage Verlauf", "E-Mail-Support"] },
            pro: { name: "Pro", desc: "Für Experten", cta: "14 Tage testen", features: ["Unbegrenzte Transkriptionen", "KI-Automatisierte Berichte", "Benutzerdefinierter PDF-Export", "Unbegrenzter Verlauf", "API-Zugriff", "Priorisierter Support"] },
            enterprise: { name: "Enterprise", desc: "Für Teams", cta: "Vertrieb kontaktieren", features: ["Alles aus Pro", "Mehrbenutzer", "Admin-Dashboard", "SSO & SAML", "CRM/ERP-Integration", "Dedizierter Account Manager", "SLA 99.9%"] }
        },
        security: {
            badge: "Sicherheit & Compliance", title: "Ihre Daten sind", titleSuffix: "unsere Priorität", subtitle: "Sicherheit im Kern der Architektur.",
            f1: { title: "AES-256 Verschlüsselung", desc: "Daten verschlüsselt." },
            f2: { title: "Souveränes Hosting", desc: "Daten in Frankreich/Europa." },
            f3: { title: "DSGVO Konform", desc: "Voller Datenschutz." },
            f4: { title: "Totale Privatsphäre", desc: "Kein Zugriff auf Inhalte." },
            f5: { title: "Echtzeit-Backup", desc: "Verschlüsselte Backups." },
            f6: { title: "Sicherheitsaudit", desc: "Regelmäßige Audits." },
            certs: { iso: "Info-Sicherheit", secnum: "Souveräne Cloud", rgpd: "Datenschutz", soc2: "Sicherheitskontrollen" },
            cta: { title: "Konformitätsnachweis?", text: "Dokumente verfügbar.", btn: "Dokumente anfordern" }
        },
        faq: {
            title: "Häufige", titleSuffix: "Fragen", subtitle: "Alles was Sie wissen müssen.", more_questions: "Weitere Fragen?", contact_team: "Team kontaktieren",
            q1: { question: "Genauigkeit?", answer: "92-97% dank KI." },
            q2: { question: "Sicherheit?", answer: "AES-256, ISO 27001." },
            q3: { question: "Offline?", answer: "Ja, per Mobile App." },
            q4: { question: "Formate?", answer: "PDF, Word, JSON, API." },
            q5: { question: "Bindung?", answer: "Keine." },
            q6: { question: "Kostenlos testen?", answer: "14 Tage ohne Karte." },
            q7: { question: "Integrationen?", answer: "Salesforce, Notion, API..." },
            q8: { question: "Sprachen?", answer: "30+ inkl. DE, EN, FR..." }
        },
        cta: {
            badge: "14 Tage kostenlos, keine Karte", title: "Bereit Ihre", titleSuffix: "Prozesse zu wandeln",
            subtitle: "Schließen Sie sich 2.000 Experten an.", btn_start: "Gratis starten",
            feature1: "Keine Karte", feature2: "Setup 2 Min", feature3: "Jederzeit kündbar"
        },
        footer: {
            rights: "Alle Rechte vorbehalten.", description: "Stimme wird zur Intelligenz.",
            product: "Produkt", company: "Firma", legal: "Rechtliches", support: "Support",
            about: "Über uns", blog: "Blog", careers: "Karriere", press: "Presse",
            legal_mentions: "Impressum", terms: "AGB", privacy: "Datenschutz", help_center: "Hilfe", community: "Community"
        }
    },
    IT: {
        locale: 'it-IT',
        nav: { features: "Funzionalità", demo: "Demo", pricing: "Prezzi", docs: "Documentazione", contact: "Contatto", login: "Login", dashboard: "Cruscotto", logout: "Esci", faq: "FAQ" },
        dashboard: {
            liveTranscription: {
                back: "INDIETRO", statusActive: "REGISTRAZIONE ATTIVA", statusReady: "SISTEMA PRONTO",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● Cattura audio in corso...",
                waitingCommand: "In attesa del comando vocale", orbInit: "Inizializzare", terminalLabel: "live_transcript.txt",
                charsLabel: "caratteri", systemReadyToTranscribe: "Sistema pronto. Premi per iniziare...",
                btnSave: "SALVA", btnExport: "ESPORTA PDF", btnClear: "CANCELLA",
                modalClearTitle: "Cancellare tutto?", modalClearMessage: "Questa azione è irreversibile. Vuoi continuare?",
                modalCancel: "Annulla", modalConfirm: "Conferma", modalSuccessTitle: "PDF Esportato",
                modalSuccessMessage: "Il file è stato scaricato.", modalErrorTitle: "Errore Esportazione",
                modalErrorMessage: "Impossibile generare il PDF.", modalSaveSuccess: "Salvato",
                modalSaveSuccessMsg: "La trascrizione è stata salvata nella tua cronologia.",
                modalClearSuccess: "Cancellato", modalClearSuccessMsg: "La trascrizione è stata reimpostata.",
                modalNoTranscript: "Trascrizione vuota", modalNoTranscriptMsg: "Nessuna trascrizione da salvare.",
                modalMicroErrorTitle: "Errore Microfono", modalMicroErrorMessage: "Impossibile accedere al microfono. Controlla i permessi.",
                modalMicroUnavailable: "Microfono non disponibile."
            },
            autoForm: {
                back: "INDIETRO", statusActive: "REGISTRAZIONE ATTIVA", statusReady: "SISTEMA PRONTO",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● Cattura audio in corso...",
                waitingCommand: "In attesa del comando vocale", orbInit: "Inizializzare", currentDomain: "Dominio attuale",
                rawTranscript: "Trascrizione grezza", quickTemplates: "Modelli Rapidi", demoButton: "COMPILA CON DATI DEMO",
                generatedReport: "Report Generato", autoExtraction: "Estrazione automatica delle entità", waitingData: "In attesa di dati...",
                btnValidate: "VALIDA", btnExport: "ESPORTA PDF", btnClear: "CANCELLA",
                modalClearTitle: "Cancellare tutto?", modalClearMessage: "Questa azione reimpostare il modulo e la trascrizione. Continuare?",
                modalSaveSuccess: "Salvataggio Riuscito", modalSaveSuccessMessage: "Il modulo è stato salvato con successo.",
                modalErrorSTT: "Il tuo browser non supporta il riconoscimento vocale.",
                config: {
                    medical: { label: "Sanità", fields: ["Nome del paziente", "Età", "Sintomi", "Farmaco prescritto", "Diagnosi", "Raccomandazioni"] },
                    biodiversity: { label: "Biodiversità", fields: ["Specie", "Numero", "Luogo", "Comportamento", "Meteo"] },
                    construction: { label: "Cantiere", fields: ["Progetto", "Avanzamento", "Problema", "Prossimo passo", "Data"] }
                }
            }
        },
        home: {
            hero: { title: "Intelligenza Vocale per", titleSuffix: "Professionisti", subtitle: "Trasforma le tue riunioni e consultazioni in azioni concrete grazie alla nostra IA all'avanguardia.", cta_demo: "Prova la Demo", cta_login: "Accedi" },
            features: { title: "Perché scegliere Auriance?", f1_title: "Trascrizione in Tempo Reale", f1_desc: "Cattura ogni parola con precisione chirurgica (99%).", f2_title: "Estrazione Intelligente", f2_desc: "Trasforma il dialogo in dati strutturati (JSON/SQL).", f3_title: "Sicurezza Massima", f3_desc: "I tuoi dati sono criptati e archiviati in Francia." }
        },
        pricing: {
            title: "Un prezzo adatto a", titleSuffix: "ogni ambizione", subtitle: "Inizia gratuitamente, cresci quando sei pronto. Niente sorprese.",
            monthly: "Mensile", yearly: "Annuale", popular: "Più popolare", free_price: "Gratis", month: "mese", year: "anno",
            footer: "Tutti i prezzi IVA esclusa. Annulla in qualsiasi momento. 30 giorni soddisfatti o rimborsati.",
            free: { name: "Free", desc: "Per scoprire Auriance", cta: "Inizia gratis", features: ["10 trascrizioni / mese", "Export PDF base", "Cronologia 7 giorni", "Supporto email"] },
            pro: { name: "Pro", desc: "Per esperti e freelance", cta: "Prova 14 giorni gratis", features: ["Trascrizioni illimitate", "Report IA automatici", "Export PDF personalizzato", "Cronologia illimitata", "Accesso API", "Supporto prioritario"] },
            enterprise: { name: "Enterprise", desc: "Per team e organizzazioni", cta: "Contatta le vendite", features: ["Tutto Pro incluso", "Multi-utente", "Dashboard admin", "SSO & SAML", "Integrazione CRM/ERP", "Account manager dedicato", "SLA 99.9%"] }
        },
        security: {
            badge: "Sicurezza e Conformità", title: "I tuoi dati sono", titleSuffix: "la nostra priorità", subtitle: "Auriance è stato progettato con la sicurezza al centro della sua architettura.",
            f1: { title: "Crittografia AES-256", desc: "Dati crittografati a riposo e in transito." },
            f2: { title: "Hosting Sovrano", desc: "Dati in Francia/Europa (SecNumCloud)." },
            f3: { title: "Conforme GDPR", desc: "Rispetto totale della protezione dei dati." },
            f4: { title: "Privacy Totale", desc: "Nessun accesso ai tuoi contenuti in chiaro." },
            f5: { title: "Backup in tempo reale", desc: "Backup crittografati e georidondanti." },
            f6: { title: "Audit di sicurezza", desc: "Audit regolari da esperti indipendenti." },
            certs: { iso: "Sicurezza delle informazioni", secnum: "Cloud Sovrano", rgpd: "Protezione dati", soc2: "Controlli di sicurezza" },
            cta: { title: "Hai bisogno di un certificato?", text: "Documenti disponibili per i tuoi audit.", btn: "Richiedi documenti" }
        },
        faq: {
            title: "Domande", titleSuffix: "frequenti", subtitle: "Tutto quello che devi sapere su Auriance.", more_questions: "Altre domande?", contact_team: "Contatta il team",
            q1: { question: "Precisione della trascrizione?", answer: "92-97% grazie all'IA multisettoriale." },
            q2: { question: "Sicurezza dei dati?", answer: "AES-256, ISO 27001, server in Europa." },
            q3: { question: "Uso offline?", answer: "Sì, tramite app mobile con sincronizzazione." },
            q4: { question: "Formati di esportazione?", answer: "PDF, Word, JSON, API verso i tuoi strumenti." },
            q5: { question: "Impegno?", answer: "Nessuno. Annulla quando vuoi." },
            q6: { question: "Prova gratuita?", answer: "14 giorni completi, senza carta." },
            q7: { question: "Integrazioni?", answer: "Sì: Salesforce, Notion, API REST..." },
            q8: { question: "Lingue supportate?", answer: "30+ lingue tra cui IT, EN, FR, ES..." }
        },
        cta: {
            badge: "14 giorni di prova gratuita, senza carta", title: "Pronto a trasformare i", titleSuffix: "tuoi processi",
            subtitle: "Unisciti a oltre 2.000 esperti. Inizia in 2 minuti.", btn_start: "Inizia gratuitamente",
            feature1: "Nessuna carta richiesta", feature2: "Config. in 2 min", feature3: "Annulla in qualsiasi momento"
        },
        footer: {
            rights: "Tutti i diritti riservati.", description: "La voce diventa il tuo assistente intelligente.",
            product: "Prodotto", company: "Azienda", legal: "Legale", support: "Supporto",
            about: "Chi siamo", blog: "Blog", careers: "Carriere", press: "Stampa",
            legal_mentions: "Note legali", terms: "Termini", privacy: "Privacy", help_center: "Centro assistenza", community: "Comunità"
        }
    },
    PT: {
        locale: 'pt-PT',
        nav: { features: "Funcionalidades", demo: "Demo", pricing: "Preços", docs: "Documentação", contact: "Contato", login: "Login", dashboard: "Painel", logout: "Sair", faq: "FAQ" },
        dashboard: {
            liveTranscription: {
                back: "VOLTAR", statusActive: "GRAVAÇÃO ATIVA", statusReady: "SISTEMA PRONTO",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● Captura de áudio em andamento...",
                waitingCommand: "Aguardando comando de voz", orbInit: "Inicializar", terminalLabel: "live_transcript.txt",
                charsLabel: "caracteres", systemReadyToTranscribe: "Sistema pronto. Pressione para começar...",
                btnSave: "SALVAR", btnExport: "EXPORTAR PDF", btnClear: "LIMPAR",
                modalClearTitle: "Limpar tudo?", modalClearMessage: "Esta ação é irreversível. Deseja continuar?",
                modalCancel: "Cancelar", modalConfirm: "Confirmar", modalSuccessTitle: "PDF Exportado",
                modalSuccessMessage: "O arquivo foi baixado.", modalErrorTitle: "Erro de Exportação",
                modalErrorMessage: "Não foi possível gerar o PDF.", modalSaveSuccess: "Salvo",
                modalSaveSuccessMsg: "A transcrição foi salva no seu histórico.",
                modalClearSuccess: "Limpo", modalClearSuccessMsg: "A transcrição foi redefinida.",
                modalNoTranscript: "Transcrição vazia", modalNoTranscriptMsg: "Nenhuma transcrição para salvar.",
                modalMicroErrorTitle: "Erro de Microfone", modalMicroErrorMessage: "Não foi possível acessar o microfone. Verifique suas permissões.",
                modalMicroUnavailable: "Microfone indisponível."
            },
            autoForm: {
                back: "VOLTAR", statusActive: "GRAVAÇÃO ATIVA", statusReady: "SISTEMA PRONTO",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● Captura de áudio em andamento...",
                waitingCommand: "Aguardando comando de voz", orbInit: "Inicializar", currentDomain: "Domínio atual",
                rawTranscript: "Transcrição bruta", quickTemplates: "Modelos Rápidos", demoButton: "PREENCHER COM DADOS DEMO",
                generatedReport: "Relatório Gerado", autoExtraction: "Extração automática de entidades", waitingData: "Aguardando dados...",
                btnValidate: "VALIDAR", btnExport: "EXPORTAR PDF", btnClear: "LIMPAR",
                modalClearTitle: "Limpar tudo?", modalClearMessage: "Esta ação redefinirá o formulário e a transcrição. Continuar?",
                modalSaveSuccess: "Salvo com Sucesso", modalSaveSuccessMessage: "O formulário foi salvo com sucesso.",
                modalErrorSTT: "Seu navegador não suporta reconhecimento de voz.",
                config: {
                    medical: { label: "Saúde", fields: ["Nome do paciente", "Idade", "Sintomas", "Medicamento prescrito", "Diagnóstico", "Recomendações"] },
                    biodiversity: { label: "Biodiversidade", fields: ["Espécie", "Quantidade", "Local", "Comportamento", "Clima"] },
                    construction: { label: "Construção", fields: ["Projeto", "Progresso", "Problema", "Próxima etapa", "Data"] }
                }
            }
        },
        home: {
            hero: { title: "Inteligência de Voz para", titleSuffix: "Profissionais", subtitle: "Transforme suas reuniões e consultas em ações concretas com nossa IA de ponta.", cta_demo: "Testar Demo", cta_login: "Entrar" },
            features: { title: "Por que escolher Auriance?", f1_title: "Transcrição em Tempo Real", f1_desc: "Capture cada palavra com precisão cirúrgica (99%).", f2_title: "Extração Inteligente", f2_desc: "Transforme o diálogo em dados estruturados (JSON/SQL).", f3_title: "Segurança Máxima", f3_desc: "Seus dados são criptografados e armazenados na França." }
        },
        pricing: {
            title: "Um preço adaptado a", titleSuffix: "cada ambição", subtitle: "Comece grátis, cresça quando estiver pronto. Sem surpresas.",
            monthly: "Mensal", yearly: "Anual", popular: "Mais popular", free_price: "Grátis", month: "mês", year: "ano",
            footer: "Preços sem IVA. Cancele a qualquer momento. 30 dias de garantia.",
            free: { name: "Free", desc: "Para descobrir Auriance", cta: "Começar grátis", features: ["10 transcrições / mês", "Exportação PDF básica", "Histórico 7 dias", "Suporte por e-mail"] },
            pro: { name: "Pro", desc: "Para especialistas", cta: "Teste 14 dias grátis", features: ["Transcrições ilimitadas", "Relatórios IA automatizados", "Exportação PDF personalizada", "Histórico ilimitado", "Acesso API", "Suporte prioritário"] },
            enterprise: { name: "Enterprise", desc: "Para equipes e organizações", cta: "Contatar vendas", features: ["Tudo do Pro", "Multiusuário", "Painel administrativo", "SSO & SAML", "Integração CRM/ERP", "Gerente de conta dedicado", "SLA 99.9%"] }
        },
        security: {
            badge: "Segurança e Conformidade", title: "Seus dados são", titleSuffix: "nossa prioridade", subtitle: "Auriance foi projetado com segurança no núcleo.",
            f1: { title: "Criptografia AES-256", desc: "Dados criptografados em repouso e em trânsito." },
            f2: { title: "Hospedagem Soberana", desc: "Dados na França/Europa (SecNumCloud)." },
            f3: { title: "Conformidade RGPD", desc: "Respeito total à proteção de dados." },
            f4: { title: "Privacidade Total", desc: "Zero acesso ao seu conteúdo." },
            f5: { title: "Backup em tempo real", desc: "Backups criptografados e georredundantes." },
            f6: { title: "Auditoria de segurança", desc: "Auditorias regulares por especialistas." },
            certs: { iso: "Segurança da Info", secnum: "Nuvem Soberana", rgpd: "Proteção de Dados", soc2: "Controles de Seg." },
            cta: { title: "Precisa de atestado?", text: "Documentos disponíveis para auditorias.", btn: "Solicitar documentos" }
        },
        faq: {
            title: "Perguntas", titleSuffix: "frequentes", subtitle: "Tudo o que você precisa saber.", more_questions: "Outras perguntas?", contact_team: "Contate a equipe",
            q1: { question: "Precisão da transcrição?", answer: "92-97% graças à IA multisetorial." },
            q2: { question: "Segurança dos dados?", answer: "AES-256, ISO 27001, servidores na Europa." },
            q3: { question: "Uso offline?", answer: "Sim, via app móvel com sincronização." },
            q4: { question: "Formatos de exportação?", answer: "PDF, Word, JSON, API para suas ferramentas." },
            q5: { question: "Fidelidade?", answer: "Nenhuma. Cancele quando quiser." },
            q6: { question: "Teste grátis?", answer: "14 dias completos, sem cartão." },
            q7: { question: "Integrações?", answer: "Sim: Salesforce, Notion, API REST..." },
            q8: { question: "Idiomas suportados?", answer: "30+ incluindo PT, EN, FR, ES..." }
        },
        cta: {
            badge: "14 dias de teste grátis, sem cartão", title: "Pronto para transformar", titleSuffix: "seus processos",
            subtitle: "Junte-se a 2.000 especialistas. Comece em 2 minutos.", btn_start: "Começar gratuitamente",
            feature1: "Sem cartão necessário", feature2: "Config em 2 min", feature3: "Cancele a qualquer momento"
        },
        footer: {
            rights: "Todos os direitos reservados.", description: "A voz se torna seu assistente inteligente.",
            product: "Produto", company: "Empresa", legal: "Legal", support: "Suporte",
            about: "Sobre", blog: "Blog", careers: "Carreiras", press: "Imprensa",
            legal_mentions: "Menções legais", terms: "Termos", privacy: "Privacidade", help_center: "Central de Ajuda", community: "Comunidade"
        }
    },
    ZH: {
        locale: 'zh-CN',
        nav: { features: "功能", demo: "演示", pricing: "价格", docs: "文档", contact: "联系", login: "登录", dashboard: "仪表板", logout: "登出", faq: "常问问题" },
        dashboard: {
            liveTranscription: {
                back: "返回", statusActive: "录制中", statusReady: "系统就绪",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● 音频采集中...",
                waitingCommand: "等待语音指令", orbInit: "初始化", terminalLabel: "live_transcript.txt",
                charsLabel: "字符", systemReadyToTranscribe: "系统就绪。按下开始...",
                btnSave: "保存", btnExport: "导出PDF", btnClear: "清除",
                modalClearTitle: "清除全部？", modalClearMessage: "此操作不可撤销。是否继续？",
                modalCancel: "取消", modalConfirm: "确认", modalSuccessTitle: "PDF已导出",
                modalSuccessMessage: "文件已下载。", modalErrorTitle: "导出错误",
                modalErrorMessage: "无法生成PDF。", modalSaveSuccess: "已保存",
                modalSaveSuccessMsg: "转录已保存到您的历史记录。",
                modalClearSuccess: "已清除", modalClearSuccessMsg: "转录已重置。",
                modalNoTranscript: "转录为空", modalNoTranscriptMsg: "没有转录内容可保存。",
                modalMicroErrorTitle: "麦克风错误", modalMicroErrorMessage: "无法访问麦克风。请检查权限。",
                modalMicroUnavailable: "麦克风不可用。"
            },
            autoForm: {
                back: "返回", statusActive: "录制中", statusReady: "系统就绪",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● 音频采集中...",
                waitingCommand: "等待语音指令", orbInit: "初始化", currentDomain: "当前领域",
                rawTranscript: "原始转录", quickTemplates: "快速模板", demoButton: "填充演示数据",
                generatedReport: "生成的报告", autoExtraction: "自动实体提取", waitingData: "等待数据...",
                btnValidate: "验证", btnExport: "导出PDF", btnClear: "清除",
                modalClearTitle: "清除全部？", modalClearMessage: "此操作将重置表单和转录。继续？",
                modalSaveSuccess: "保存成功", modalSaveSuccessMessage: "表单已成功保存。",
                modalErrorSTT: "您的浏览器不支持语音识别。",
                config: {
                    medical: { label: "医疗", fields: ["患者姓名", "年龄", "症状", "处方药物", "诊断", "建议"] },
                    biodiversity: { label: "生物多样性", fields: ["物种", "数量", "地点", "行为", "天气"] },
                    construction: { label: "建筑", fields: ["项目", "进度", "问题", "下一步", "日期"] }
                }
            }
        },
        home: {
            hero: { title: "专为专业人士打造的", titleSuffix: "语音智能", subtitle: "利用我们最先进的 AI 将您的会议和咨询转化为具体行动。", cta_demo: "试用演示", cta_login: "登录" },
            features: { title: "为什么选择 Auriance？", f1_title: "实时转录", f1_desc: "以极高的准确率（99%）捕捉每一个字。", f2_title: "智能提取", f2_desc: "将对话转化为结构化数据 (JSON/SQL)。", f3_title: "最高安全性", f3_desc: "您的数据在法国加密并存储。" }
        },
        pricing: {
            title: "适合", titleSuffix: "每个雄心的价格", subtitle: "免费开始，随时扩展。无隐形费用。",
            monthly: "月付", yearly: "年付", popular: "最受欢迎", free_price: "免费", month: "月", year: "年",
            footer: "价格不含增值税。随时取消。30天退款保证。",
            free: { name: "免费版", desc: "探索 Auriance", cta: "免费开始", features: ["每月10次转录", "基本PDF导出", "7天历史记录", "邮件支持"] },
            pro: { name: "专业版", desc: "专为专家和自由职业者", cta: "免费试用14天", features: ["无限转录", "AI自动报告", "自定义PDF导出", "无限历史记录", "API访问", "优先支持"] },
            enterprise: { name: "企业版", desc: "专为团队和组织", cta: "联系销售", features: ["包含所有专业版功能", "多用户", "管理仪表板", "SSO & SAML", "CRM/ERP集成", "专属客户经理", "99.9% SLA"] }
        },
        security: {
            badge: "安全与合规", title: "您的数据是", titleSuffix: "我们的首要任务", subtitle: "Auriance 的架构核心就是安全。",
            f1: { title: "AES-256 加密", desc: "静态和传输中的数据均已加密。" },
            f2: { title: "主权托管", desc: "数据位于法国/欧洲 (SecNumCloud)。" },
            f3: { title: "符合 GDPR", desc: "完全遵守数据保护法规。" },
            f4: { title: "完全隐私", desc: "零访问您的明文内容。" },
            f5: { title: "实时备份", desc: "加密和地理冗余备份。" },
            f6: { title: "安全审计", desc: "由独立专家定期审计。" },
            certs: { iso: "信息安全", secnum: "主权云", rgpd: "数据保护", soc2: "安全控制" },
            cta: { title: "需要合规证明？", text: "可为您的审计提供文件。", btn: "索取文件" }
        },
        faq: {
            title: "常见", titleSuffix: "问题", subtitle: "您需要了解的一切。", more_questions: "还有问题？", contact_team: "联系团队",
            q1: { question: "转录准确性？", answer: "得益于多领域 AI，准确率达 92-97%。" },
            q2: { question: "数据安全？", answer: "AES-256, ISO 27001, 欧洲服务器。" },
            q3: { question: "可以离线使用？", answer: "可以，通过移动应用同步。" },
            q4: { question: "导出格式？", answer: "PDF, Word, JSON, API。" },
            q5: { question: "有最低承诺吗？", answer: "没有。随时取消。" },
            q6: { question: "免费试用？", answer: "14天完整功能，无需信用卡。" },
            q7: { question: "集成？", answer: "是的：Salesforce, Notion, REST API..." },
            q8: { question: "支持语言？", answer: "30多种，包括中文、英语、法语..." }
        },
        cta: {
            badge: "14天免费试用，无需信用卡", title: "准备好转变您的", titleSuffix: "业务流程了吗",
            subtitle: "加入 2,000 多名专家的行列。2分钟内开始。", btn_start: "免费开始",
            feature1: "无需用卡", feature2: "2分钟设置", feature3: "随时取消"
        },
        footer: {
            rights: "版权所有。", description: "语音成为您的智能助手。",
            product: "产品", company: "公司", legal: "法律", support: "支持",
            about: "关于我们", blog: "博客", careers: "招聘", press: "新闻",
            legal_mentions: "法律声明", terms: "条款", privacy: "隐私", help_center: "帮助中心", community: "社区"
        }
    },
    AR: {
        locale: 'ar-SA',
        nav: { features: "الميزات", demo: "عرض", pricing: "الأسعار", docs: "توثيق", contact: "اتصل بنا", login: "تسجيل الدخول", dashboard: "لوحة القيادة", logout: "خروج", faq: "الأسئلة الشائعة" },
        dashboard: {
            liveTranscription: {
                back: "رجوع", statusActive: "التسجيل نشط", statusReady: "النظام جاهز",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● جاري التقاط الصوت...",
                waitingCommand: "في انتظار الأمر الصوتي", orbInit: "تهيئة", terminalLabel: "live_transcript.txt",
                charsLabel: "حرف", systemReadyToTranscribe: "النظام جاهز. اضغط للبدء...",
                btnSave: "حفظ", btnExport: "تصدير PDF", btnClear: "مسح",
                modalClearTitle: "مسح الكل؟", modalClearMessage: "هذا الإجراء لا يمكن التراجع عنه. هل تريد المتابعة؟",
                modalCancel: "إلغاء", modalConfirm: "تأكيد", modalSuccessTitle: "تم تصدير PDF",
                modalSuccessMessage: "تم تنزيل الملف.", modalErrorTitle: "خطأ في التصدير",
                modalErrorMessage: "غير قادر على إنشاء PDF.", modalSaveSuccess: "تم الحفظ",
                modalSaveSuccessMsg: "تم حفظ النص في سجلك.",
                modalClearSuccess: "تم المسح", modalClearSuccessMsg: "تم إعادة تعيين النص.",
                modalNoTranscript: "النص فارغ", modalNoTranscriptMsg: "لا يوجد نص للحفظ.",
                modalMicroErrorTitle: "خطأ في الميكروفون", modalMicroErrorMessage: "غير قادر على الوصول إلى الميكروفون. تحقق من الأذونات.",
                modalMicroUnavailable: "الميكروفون غير متاح."
            },
            autoForm: {
                back: "رجوع", statusActive: "التسجيل نشط", statusReady: "النظام جاهز",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● جاري التقاط الصوت...",
                waitingCommand: "في انتظار الأمر الصوتي", orbInit: "تهيئة", currentDomain: "المجال الحالي",
                rawTranscript: "النص الخام", quickTemplates: "قوالب سريعة", demoButton: "ملء ببيانات تجريبية",
                generatedReport: "التقرير المُنشأ", autoExtraction: "استخراج الكيانات تلقائياً", waitingData: "في انتظار البيانات...",
                btnValidate: "تحقق", btnExport: "تصدير PDF", btnClear: "مسح",
                modalClearTitle: "مسح الكل؟", modalClearMessage: "سيؤدي هذا إلى إعادة تعيين النموذج والنص. متابعة؟",
                modalSaveSuccess: "تم الحفظ بنجاح", modalSaveSuccessMessage: "تم حفظ النموذج بنجاح.",
                modalErrorSTT: "متصفحك لا يدعم التعرف على الصوت.",
                config: {
                    medical: { label: "الصحة", fields: ["اسم المريض", "العمر", "الأعراض", "الدواء الموصوف", "التشخيص", "التوصيات"] },
                    biodiversity: { label: "التنوع البيولوجي", fields: ["النوع", "العدد", "الموقع", "السلوك", "الطقس"] },
                    construction: { label: "البناء", fields: ["المشروع", "التقدم", "المشكلة", "الخطوة التالية", "التاريخ"] }
                }
            }
        },
        home: {
            hero: { title: "الذكاء الصوتي ل", titleSuffix: "المحترفين", subtitle: "حول اجتماعاتك واستشاراتك إلى إجراءات ملموسة بفضل ذكائنا الاصطناعي المتقدم.", cta_demo: "جرب العرض", cta_login: "دخول" },
            features: { title: "لماذا تختار Auriance؟", f1_title: "النسخ في الوقت الفعلي", f1_desc: "التقط كل كلمة بدقة جراحية (99%).", f2_title: "استخراج ذكي", f2_desc: "حول الحوار إلى بيانات منظمة (JSON/SQL).", f3_title: "أقصى درجات الأمان", f3_desc: "بياناتك مشفرة ومخزنة في فرنسا." }
        },
        pricing: {
            title: "سعر مناسب ل", titleSuffix: "كل طموح", subtitle: "ابدأ مجانًا، وتوسع عندما تكون مستعدًا.",
            monthly: "شهري", yearly: "سنوي", popular: "الأكثر شعبية", free_price: "مجاني", month: "شهر", year: "سنة",
            footer: "الأسعار غير شاملة الضريبة. إلغاء في أي وقت.",
            free: { name: "مجاني", desc: "لاكتشاف Auriance", cta: "ابدأ مجانًا", features: ["10 نصوص / شهر", "تصدير PDF أساسي", "سجل 7 أيام", "دعم عبر البريد الإلكتروني"] },
            pro: { name: "برو", desc: "للخبراء والمستقلين", cta: "جرب 14 يومًا مجانًا", features: ["نصوص غير محدودة", "تقارير آلية بالذكاء الاصطناعي", "تصدير PDF مخصص", "سجل غير محدود", "وصول API", "دعم ذو أولوية"] },
            enterprise: { name: "مؤسسة", desc: "للفرق والمنظمات", cta: "اتصل بالمبيعات", features: ["شامل ميزات برو", "متعدد المستخدمين", "لوحة تحكم للمسؤول", "تسجيل الدخول الأحادي (SSO/SAML)", "تكامل CRM/ERP", "مدير حساب مخصص", "ضمان تشغيل 99.9%"] }
        },
        security: {
            badge: "الأمان والامتثال", title: "بياناتك هي", titleSuffix: "أولويتنا", subtitle: "تم تصميم Auriance مع الأمان في جوهر بنيته.",
            f1: { title: "تشفير AES-256", desc: "بيانات مشفرة أثناء الراحة والنقل." },
            f2: { title: "استضافة سيادية", desc: "البيانات في فرنسا/أوروبا." },
            f3: { title: "متوافق مع RGPD", desc: "احترام كامل لحماية البيانات." },
            f4: { title: "خصوصية تامة", desc: "لا وصول إلى محتواك الصريح." },
            f5: { title: "نسخ احتياطي فوري", desc: "نسخ مشفرة ومتكررة جغرافياً." },
            f6: { title: "تدقيق الأمان", desc: "تدقيق منتظم من خبراء مستقلين." },
            certs: { iso: "أمن المعلومات", secnum: "سحابة سيادية", rgpd: "حماية البيانات", soc2: "ضوابط الأمان" },
            cta: { title: "تحتاج شهادة امتثال؟", text: "وثائق متاحة لتدقيقك.", btn: "طلب الوثائق" }
        },
        faq: {
            title: "أسئلة", titleSuffix: "شائعة", subtitle: "كل ما تحتاج لمعرفته.", more_questions: "لديك أسئلة أخرى؟", contact_team: "اتصل بالفريق",
            q1: { question: "دقة النسخ؟", answer: "92-97% بفضل الذكاء الاصطناعي." },
            q2: { question: "أمان البيانات؟", answer: "AES-256, ISO 27001, خوادم في أوروبا." },
            q3: { question: "الاستخدام دون اتصال؟", answer: "نعم، عبر التطبيق المحمول." },
            q4: { question: "تنسيقات التصدير؟", answer: "PDF, Word, JSON, API." },
            q5: { question: "التزام؟", answer: "لا يوجد. إلغاء في أي وقت." },
            q6: { question: "تجربة مجانية؟", answer: "14 يوماً كاملاً بدون بطاقة." },
            q7: { question: "تكاملات؟", answer: "نعم: Salesforce, Notion, API..." },
            q8: { question: "اللغات المدعومة؟", answer: "30+ لغة بما في ذلك العربية." }
        },
        cta: {
            badge: "تجربة 14 يومًا مجانًا", title: "مستعد لتحويل", titleSuffix: "عملياتك",
            subtitle: "انضم إلى 2000 خبير. ابدأ في دقيقتين.", btn_start: "ابدأ مجانًا",
            feature1: "لا بطاقة مطلوبة", feature2: "إعداد في دقيقتين", feature3: "إلغاء في أي وقت"
        },
        footer: {
            rights: "جميع الحقوق محفوظة.", description: "يصبح الصوت مساعدك الذكي.",
            product: "المنتج", company: "الشركة", legal: "القانوني", support: "الدعم",
            about: "عنا", blog: "المدونة", careers: "وظائف", press: "صحافة",
            legal_mentions: "إشعارات قانونية", terms: "شروط", privacy: "خصوصية", help_center: "مركز المساعدة", community: "مجتمع"
        }
    },
    JA: {
        locale: 'ja-JP',
        nav: { features: "機能", demo: "デモ", pricing: "料金", docs: "ドキュメント", contact: "お問い合わせ", login: "ログイン", dashboard: "ダッシュボード", logout: "ログアウト", faq: "よくある質問" },
        dashboard: {
            liveTranscription: {
                back: "戻る", statusActive: "録音中", statusReady: "システム準備完了",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● 音声キャプチャ中...",
                waitingCommand: "音声コマンド待機中", orbInit: "初期化", terminalLabel: "live_transcript.txt",
                charsLabel: "文字", systemReadyToTranscribe: "システム準備完了。押して開始...",
                btnSave: "保存", btnExport: "PDF出力", btnClear: "クリア",
                modalClearTitle: "すべて消去しますか？", modalClearMessage: "この操作は取り消せません。続行しますか？",
                modalCancel: "キャンセル", modalConfirm: "確認", modalSuccessTitle: "PDFエクスポート完了",
                modalSuccessMessage: "ファイルがダウンロードされました。", modalErrorTitle: "エクスポートエラー",
                modalErrorMessage: "PDFを生成できません。", modalSaveSuccess: "保存完了",
                modalSaveSuccessMsg: "文字起こしが履歴に保存されました。",
                modalClearSuccess: "クリア完了", modalClearSuccessMsg: "文字起こしがリセットされました。",
                modalNoTranscript: "文字起こしが空です", modalNoTranscriptMsg: "保存する文字起こしがありません。",
                modalMicroErrorTitle: "マイクエラー", modalMicroErrorMessage: "マイクにアクセスできません。権限を確認してください。",
                modalMicroUnavailable: "マイクが利用できません。"
            },
            autoForm: {
                back: "戻る", statusActive: "録音中", statusReady: "システム準備完了",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● 音声キャプチャ中...",
                waitingCommand: "音声コマンド待機中", orbInit: "初期化", currentDomain: "現在のドメイン",
                rawTranscript: "生の文字起こし", quickTemplates: "クイックテンプレート", demoButton: "デモデータで入力",
                generatedReport: "生成されたレポート", autoExtraction: "自動エンティティ抽出", waitingData: "データ待機中...",
                btnValidate: "検証", btnExport: "PDF出力", btnClear: "クリア",
                modalClearTitle: "すべて消去しますか？", modalClearMessage: "フォームと文字起こしがリセットされます。続行しますか？",
                modalSaveSuccess: "保存成功", modalSaveSuccessMessage: "フォームが正常に保存されました。",
                modalErrorSTT: "お使いのブラウザは音声認識に対応していません。",
                config: {
                    medical: { label: "医療", fields: ["患者名", "年齢", "症状", "処方薬", "診断", "推奨事項"] },
                    biodiversity: { label: "生物多様性", fields: ["種", "数", "場所", "行動", "天気"] },
                    construction: { label: "建設", fields: ["プロジェクト", "進捗", "問題", "次のステップ", "日付"] }
                }
            }
        },
        home: {
            hero: { title: "プロフェッショナルのための", titleSuffix: "音声インテリジェンス", subtitle: "最先端の AI を使用して、会議や相談を具体的なアクションに変えます。", cta_demo: "デモを試す", cta_login: "ログイン" },
            features: { title: "なぜ Auriance を選ぶのか？", f1_title: "リアルタイム文字起こし", f1_desc: "99% の精度で一言一句をキャプチャします。", f2_title: "スマート抽出", f2_desc: "対話を構造化データ (JSON/SQL) に変換します。", f3_title: "最高レベルのセキュリティ", f3_desc: "データは暗号化され、フランスで保管されます。" }
        },
        pricing: {
            title: "あらゆる野心に", titleSuffix: "適した価格", subtitle: "無料で始められ、準備ができたら拡張できます。",
            monthly: "月払い", yearly: "年払い", popular: "一番人気", free_price: "無料", month: "月", year: "年",
            footer: "価格は税抜きです。いつでもキャンセル可能。",
            free: { name: "Free", desc: "Aurianceを体験", cta: "無料で開始", features: ["月10件の文字起こし", "基本PDFエクスポート", "7日間の履歴", "メールサポート"] },
            pro: { name: "Pro", desc: "専門家とフリーランス向け", cta: "14日間無料体験", features: ["無制限の文字起こし", "AI自動レポート", "カスタムPDFエクスポート", "無制限の履歴", "APIアクセス", "優先サポート"] },
            enterprise: { name: "Enterprise", desc: "チームと組織向け", cta: "営業に連絡", features: ["Proの全機能", "マルチユーザー", "管理ダッシュボード", "SSO & SAML", "CRM/ERP統合", "専任アカウントマネージャー", "SLA 99.9%"] }
        },
        security: {
            badge: "セキュリティとコンプライアンス", title: "あなたのデータは", titleSuffix: "私たちの優先事項", subtitle: "Aurianceはセキュリティを核心として設計されています。",
            f1: { title: "AES-256 暗号化", desc: "保存時および転送時のデータを暗号化。" },
            f2: { title: "主権ホスティング", desc: "データはフランス/欧州に保管 (SecNumCloud)。" },
            f3: { title: "GDPR 準拠", desc: "データ保護規制を完全に遵守。" },
            f4: { title: "完全なプライバシー", desc: "あなたのコンテンツへのアクセスはゼロ。" },
            f5: { title: "リアルタイムバックアップ", desc: "暗号化された地理的冗長バックアップ。" },
            f6: { title: "セキュリティ監査", desc: "独立した専門家による定期的な監査。" },
            certs: { iso: "情報セキュリティ", secnum: "主権クラウド", rgpd: "データ保護", soc2: "セキュリティ管理" },
            cta: { title: "証明書が必要ですか？", text: "監査用ドキュメントを利用可能。", btn: "ドキュメントを請求" }
        },
        faq: {
            title: "よくある", titleSuffix: "質問", subtitle: "Aurianceについて知っておくべきことすべて。", more_questions: "他の質問がありますか？", contact_team: "チームに連絡",
            q1: { question: "文字起こしの精度は？", answer: "AIのおかげで92-97%の精度を実現。" },
            q2: { question: "データセキュリティは？", answer: "AES-256、ISO 27001、欧州サーバー。" },
            q3: { question: "オフライン利用？", answer: "はい、モバイルアプリで同期可能。" },
            q4: { question: "エクスポート形式？", answer: "PDF, Word, JSON, API。" },
            q5: { question: "契約期間は？", answer: "なし。いつでもキャンセル可能。" },
            q6: { question: "無料トライアル？", answer: "カード不要で14日間完全無料。" },
            q7: { question: "連携機能？", answer: "はい：Salesforce, Notion, API..." },
            q8: { question: "対応言語？", answer: "日本語、英語、仏語など30言語以上。" }
        },
        cta: {
            badge: "14日間無料体験、カード不要", title: "ビジネスプロセスを", titleSuffix: "変革する準備はOK?",
            subtitle: "2,000人以上の専門家に参加しましょう。2分で開始。", btn_start: "無料で開始",
            feature1: "カード不要", feature2: "2分で設定", feature3: "いつでもキャンセル"
        },
        footer: {
            rights: "全著作権所有。", description: "音声があなたのインテリジェントなアシスタントに。",
            product: "製品", company: "会社", legal: "法務", support: "サポート",
            about: "私たちについて", blog: "ブログ", careers: "採用情報", press: "プレス",
            legal_mentions: "法的記載", terms: "利用規約", privacy: "プライバシー", help_center: "ヘルプセンター", community: "コミュニティ"
        }
    },
    RU: {
        locale: 'ru-RU',
        nav: { features: "Функции", demo: "Демо", pricing: "Цены", docs: "Документация", contact: "Контакты", login: "Войти", dashboard: "Панель", logout: "Выйти", faq: "FAQ" },
        dashboard: {
            liveTranscription: {
                back: "НАЗАД", statusActive: "ЗАПИСЬ АКТИВНА", statusReady: "СИСТЕМА ГОТОВА",
                titlePrefix: "AURIANCE", titleSuffix: "VOICE", recordingInCourse: "● Захват аудио...",
                waitingCommand: "Ожидание голосовой команды", orbInit: "Инициализировать", terminalLabel: "live_transcript.txt",
                charsLabel: "символов", systemReadyToTranscribe: "Система готова. Нажмите для начала...",
                btnSave: "СОХРАНИТЬ", btnExport: "ЭКСПОРТ PDF", btnClear: "ОЧИСТИТЬ",
                modalClearTitle: "Очистить всё?", modalClearMessage: "Это действие необратимо. Продолжить?",
                modalCancel: "Отмена", modalConfirm: "Подтвердить", modalSuccessTitle: "PDF Экспортирован",
                modalSuccessMessage: "Файл загружен.", modalErrorTitle: "Ошибка Экспорта",
                modalErrorMessage: "Не удалось создать PDF.", modalSaveSuccess: "Сохранено",
                modalSaveSuccessMsg: "Транскрипция сохранена в вашей истории.",
                modalClearSuccess: "Очищено", modalClearSuccessMsg: "Транскрипция сброшена.",
                modalNoTranscript: "Пустая транскрипция", modalNoTranscriptMsg: "Нет транскрипции для сохранения.",
                modalMicroErrorTitle: "Ошибка Микрофона", modalMicroErrorMessage: "Нет доступа к микрофону. Проверьте разрешения.",
                modalMicroUnavailable: "Микрофон недоступен."
            },
            autoForm: {
                back: "НАЗАД", statusActive: "ЗАПИСЬ АКТИВНА", statusReady: "СИСТЕМА ГОТОВА",
                titlePrefix: "AURIANCE", titleSuffix: "FORM", recordingInCourse: "● Захват аудио...",
                waitingCommand: "Ожидание голосовой команды", orbInit: "Инициализировать", currentDomain: "Текущий домен",
                rawTranscript: "Исходная транскрипция", quickTemplates: "Быстрые Шаблоны", demoButton: "ЗАПОЛНИТЬ ДЕМО-ДАННЫМИ",
                generatedReport: "Сгенерированный Отчёт", autoExtraction: "Автоматическое извлечение сущностей", waitingData: "Ожидание данных...",
                btnValidate: "ПРОВЕРИТЬ", btnExport: "ЭКСПОРТ PDF", btnClear: "ОЧИСТИТЬ",
                modalClearTitle: "Очистить всё?", modalClearMessage: "Форма и транскрипция будут сброшены. Продолжить?",
                modalSaveSuccess: "Успешно Сохранено", modalSaveSuccessMessage: "Форма успешно сохранена.",
                modalErrorSTT: "Ваш браузер не поддерживает распознавание речи.",
                config: {
                    medical: { label: "Здоровье", fields: ["Имя пациента", "Возраст", "Симптомы", "Назначенное лекарство", "Диагноз", "Рекомендации"] },
                    biodiversity: { label: "Биоразнообразие", fields: ["Вид", "Количество", "Местоположение", "Поведение", "Погода"] },
                    construction: { label: "Строительство", fields: ["Проект", "Прогресс", "Проблема", "Следующий шаг", "Дата"] }
                }
            }
        },
        home: {
            hero: { title: "Голосовой Интеллект для", titleSuffix: "Профессионалов", subtitle: "Превратите свои встречи и консультации в конкретные действия с помощью нашего передового ИИ.", cta_demo: "Попробовать демо", cta_login: "Войти" },
            features: { title: "Почему выбирают Auriance?", f1_title: "Транскрипция в реальном времени", f1_desc: "Захватывайте каждое слово с хирургической точностью (99%).", f2_title: "Умное извлечение", f2_desc: "Преобразуйте диалог в структурированные данные (JSON/SQL).", f3_title: "Максимальная безопасность", f3_desc: "Ваши данные зашифрованы и хранятся во Франции." }
        },
        pricing: {
            title: "Цена, адаптированная к", titleSuffix: "любым амбициям", subtitle: "Начните бесплатно. Никаких сюрпризов.",
            monthly: "Ежемесячно", yearly: "Ежегодно", popular: "Популярный", free_price: "Бесплатно", month: "мес", year: "год",
            footer: "Цены без НДС. Отмена в любое время.",
            free: { name: "Free", desc: "Открыть Auriance", cta: "Начать бесплатно", features: ["10 транскрипций / мес", "Базовый экспорт в PDF", "История 7 дней", "Email поддержка"] },
            pro: { name: "Pro", desc: "Для экспертов", cta: "Пробовать 14 дней", features: ["Безлимитные транскрипции", "AI Автоотчеты", "Кастомный экспорт PDF", "Безлимитная история", "Доступ к API", "Приоритетная поддержка"] },
            enterprise: { name: "Enterprise", desc: "Для команд", cta: "Связаться с отделом", features: ["Всë из Pro", "Многопользовательский", "Панель администратора", "SSO & SAML", "Интеграция CRM/ERP", "Выделенный менеджер", "SLA 99.9%"] }
        },
        security: {
            badge: "Безопасность и Соответствие", title: "Ваши данные -", titleSuffix: "наш приоритет", subtitle: "Auriance создан с учетом безопасности.",
            f1: { title: "Шифрование AES-256", desc: "Данные зашифрованы." },
            f2: { title: "Суверенный хостинг", desc: "Данные во Франции/Европе." },
            f3: { title: "Соответствие RGPD", desc: "Полная защита данных." },
            f4: { title: "Полная конфиденциальность", desc: "Нет доступа к контенту." },
            f5: { title: "Бэкап в реальном времени", desc: "Зашифрованные копии." },
            f6: { title: "Аудит безопасности", desc: "Регулярные проверки." },
            certs: { iso: "Инфо. безопасность", secnum: "Суверенное облако", rgpd: "Защита данных", soc2: "Контроль безопасности" },
            cta: { title: "Нужен сертификат?", text: "Документы доступны для аудита.", btn: "Запросить документы" }
        },
        faq: {
            title: "Частые", titleSuffix: "вопросы", subtitle: "Все, что нужно знать.", more_questions: "Есть вопросы?", contact_team: "Связаться с командой",
            q1: { question: "Точность?", answer: "92-97% благодаря ИИ." },
            q2: { question: "Безопасность?", answer: "AES-256, ISO 27001." },
            q3: { question: "Оффлайн?", answer: "Да, через приложение." },
            q4: { question: "Форматы?", answer: "PDF, Word, JSON, API." },
            q5: { question: "Обязательства?", answer: "Нет. Отмена в любое время." },
            q6: { question: "Бесплатно?", answer: "14 дней без карты." },
            q7: { question: "Интеграции?", answer: "Salesforce, Notion, API..." },
            q8: { question: "Языки?", answer: "30+ включая RU, EN, FR..." }
        },
        cta: {
            badge: "14 дней бесплатно, без карты", title: "Готовы изменить", titleSuffix: "свои процессы?",
            subtitle: "Присоединяйтесь к 2000 экспертам. Старт за 2 мин.", btn_start: "Начать бесплатно",
            feature1: "Без карты", feature2: "Настройка 2 мин", feature3: "Отмена в любое время"
        },
        footer: {
            rights: "Все права защищены.", description: "Голос становится вашим помощником.",
            product: "Продукт", company: "Компания", legal: "Право", support: "Поддержка",
            about: "О нас", blog: "Блог", careers: "Карьера", press: "Пресса",
            legal_mentions: "Юр. инфо", terms: "Условия", privacy: "Конфиденциальность", help_center: "Центр помощи", community: "Сообщество"
        }
    }
};
