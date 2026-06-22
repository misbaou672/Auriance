-- ============================================================================
-- AURIANCE - Export Schema PostgreSQL
-- Projet : Auriance (Plateforme Medicale IA)
-- Date d'export : 2026-03-01
-- Base de donnees : PostgreSQL
-- Description : Schema complet de la base relationnelle Auriance,
--               incluant les tables utilisateurs, patients, consultations,
--               transcriptions, extractions, requetes, rapports et recherches.
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- NETTOYAGE (suppression des tables existantes dans l'ordre des dependances)
-- ============================================================================
DROP TABLE IF EXISTS auriance_init CASCADE;
DROP TABLE IF EXISTS rag_queries CASCADE;
DROP TABLE IF EXISTS generated_queries CASCADE;
DROP TABLE IF EXISTS medical_searches CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS cypher_queries CASCADE;
DROP TABLE IF EXISTS sql_queries CASCADE;
DROP TABLE IF EXISTS extractions CASCADE;
DROP TABLE IF EXISTS transcriptions CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- TABLE : users
-- Description : Table principale des utilisateurs de la plateforme Auriance.
--               Contient les comptes administrateurs, medecins et patients.
--               Gere l'authentification (email/mot de passe) et les roles.
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    username VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'patient',
    language VARCHAR(10) DEFAULT 'fr',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- TABLE : patients
-- Description : Table des patients enregistres dans le systeme.
--               Chaque patient est rattache a un utilisateur (user_id).
--               Stocke les informations demographiques de base.
-- ============================================================================
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255),
    age INTEGER,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_patients_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE : consultations
-- Description : Table des consultations medicales.
--               Lie un patient a un medecin avec la transcription de la
--               consultation, les symptomes detectes, le diagnostic et
--               le traitement prescrit. Inclut des snapshots du patient
--               au moment de la consultation pour historisation.
-- ============================================================================
CREATE TABLE consultations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER,
    medecin_id INTEGER,
    date TIMESTAMP DEFAULT NOW(),
    transcription TEXT,
    symptomes TEXT,
    diagnostic TEXT,
    traitement TEXT,
    nom_snapshot VARCHAR(255),
    prenom_snapshot VARCHAR(255),
    age_snapshot INTEGER,
    genre_snapshot VARCHAR(50),
    CONSTRAINT fk_consultations_patient
        FOREIGN KEY (patient_id) REFERENCES patients(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_consultations_medecin
        FOREIGN KEY (medecin_id) REFERENCES users(id)
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE : transcriptions
-- Description : Table des transcriptions audio vers texte.
--               Stocke le resultat de la transcription automatique des
--               consultations medicales. Inclut l'analyse IA (resume,
--               points cles, entites detectees) et les metadonnees audio
--               (duree, score de confiance, langue).
-- ============================================================================
CREATE TABLE transcriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    audio_file_path VARCHAR(500),
    text TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'fr',
    duration_seconds FLOAT,
    confidence_score FLOAT,
    type VARCHAR(50),
    patient_id INTEGER,
    resume_ia TEXT,
    points_cles JSON,
    entites_detectees JSON,
    type_session VARCHAR(50),
    priorite VARCHAR(20),
    analysee BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_transcriptions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transcriptions_patient
        FOREIGN KEY (patient_id) REFERENCES patients(id)
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE : extractions
-- Description : Table des extractions de donnees structurees.
--               A partir d'une transcription, extrait automatiquement les
--               informations du patient (nom, email, telephone, adresse,
--               date de naissance) et des champs supplementaires au format
--               JSON. Permet la generation de formulaires et requetes.
-- ============================================================================
CREATE TABLE extractions (
    id SERIAL PRIMARY KEY,
    transcription_id INTEGER,
    user_id INTEGER NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth VARCHAR(20),
    address TEXT,
    age INTEGER,
    extra_fields JSON,
    form_type VARCHAR(50),
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_extractions_transcription
        FOREIGN KEY (transcription_id) REFERENCES transcriptions(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_extractions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================================================
-- TABLE : sql_queries
-- Description : Table des requetes SQL generees par l'IA.
--               Stocke les requetes SQL produites a partir des extractions
--               pour insertion ou mise a jour dans la base. Permet le suivi
--               de l'execution (statut, resultat) pour audit et traçabilite.
-- ============================================================================
CREATE TABLE sql_queries (
    id SERIAL PRIMARY KEY,
    extraction_id INTEGER NOT NULL,
    query TEXT NOT NULL,
    action_type VARCHAR(50),
    table_name VARCHAR(100),
    is_executed BOOLEAN DEFAULT FALSE,
    execution_result JSON,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_sql_queries_extraction
        FOREIGN KEY (extraction_id) REFERENCES extractions(id)
        ON DELETE CASCADE
);

-- ============================================================================
-- TABLE : cypher_queries
-- Description : Table des requetes Cypher (Neo4j) generees par l'IA.
--               Stocke les requetes graph generees a partir des extractions
--               pour alimenter la base de donnees Neo4j. Permet de creer
--               des noeuds et relations dans le graphe medical.
-- ============================================================================
CREATE TABLE cypher_queries (
    id SERIAL PRIMARY KEY,
    extraction_id INTEGER NOT NULL,
    query TEXT NOT NULL,
    action_type VARCHAR(50),
    is_executed BOOLEAN DEFAULT FALSE,
    execution_result JSON,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_cypher_queries_extraction
        FOREIGN KEY (extraction_id) REFERENCES extractions(id)
        ON DELETE CASCADE
);

-- ============================================================================
-- TABLE : reports
-- Description : Table des rapports medicaux generes.
--               Stocke les rapports produits a partir des transcriptions
--               (comptes-rendus, syntheses, ordonnances). Supporte plusieurs
--               formats (JSON, PDF, texte) avec chemin de fichier optionnel.
-- ============================================================================
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    transcription_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    format VARCHAR(20) DEFAULT 'json',
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_reports_transcription
        FOREIGN KEY (transcription_id) REFERENCES transcriptions(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================================================
-- TABLE : medical_searches
-- Description : Table des recherches medicales effectuees par les utilisateurs.
--               Stocke les requetes de recherche, les resultats obtenus et
--               les conseils medicaux generes par l'IA. Permet l'historisation
--               des recherches pour analyse et amelioration continue.
-- ============================================================================
CREATE TABLE medical_searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    query TEXT NOT NULL,
    results JSON,
    advice JSON,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_medical_searches_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE : generated_queries
-- Description : Table des requetes generees par l'IA (SQL ou Cypher).
--               Historise toutes les requetes generees automatiquement a
--               partir du langage naturel. Supporte plusieurs types (sql,
--               cypher) et langues. Stocke le contexte de generation.
-- ============================================================================
CREATE TABLE generated_queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) DEFAULT 'sql',
    context TEXT,
    type VARCHAR(50),
    language VARCHAR(10) DEFAULT 'fr-FR',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_generated_queries_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- ============================================================================
-- TABLE : rag_queries
-- Description : Table des requetes RAG (Retrieval-Augmented Generation).
--               Stocke les questions posees par les utilisateurs, les
--               reponses generees par l'IA, les sources utilisees et le
--               modele employe. Permet l'amelioration du systeme de
--               questions-reponses medical.
-- ============================================================================
CREATE TABLE rag_queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    question TEXT NOT NULL,
    answer TEXT,
    sources JSON,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_rag_queries_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE : auriance_init
-- Description : Table d'initialisation du systeme Auriance.
--               Utilisee pour verifier que la base de donnees est correctement
--               configuree et pour stocker des notes de maintenance ou de
--               deploiement.
-- ============================================================================
CREATE TABLE auriance_init (
    id SERIAL PRIMARY KEY,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEX
-- Description : Index sur les colonnes frequemment utilisees pour optimiser
--               les performances des requetes de recherche et de filtrage.
-- ============================================================================

-- Index sur la table users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Index sur la table patients
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_nom ON patients(nom);

-- Index sur la table consultations
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_medecin_id ON consultations(medecin_id);
CREATE INDEX idx_consultations_date ON consultations(date);

-- Index sur la table transcriptions
CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX idx_transcriptions_patient_id ON transcriptions(patient_id);
CREATE INDEX idx_transcriptions_language ON transcriptions(language);
CREATE INDEX idx_transcriptions_type_session ON transcriptions(type_session);
CREATE INDEX idx_transcriptions_created_at ON transcriptions(created_at);

-- Index sur la table extractions
CREATE INDEX idx_extractions_transcription_id ON extractions(transcription_id);
CREATE INDEX idx_extractions_user_id ON extractions(user_id);
CREATE INDEX idx_extractions_email ON extractions(email);
CREATE INDEX idx_extractions_form_type ON extractions(form_type);

-- Index sur la table sql_queries
CREATE INDEX idx_sql_queries_extraction_id ON sql_queries(extraction_id);
CREATE INDEX idx_sql_queries_is_executed ON sql_queries(is_executed);

-- Index sur la table cypher_queries
CREATE INDEX idx_cypher_queries_extraction_id ON cypher_queries(extraction_id);
CREATE INDEX idx_cypher_queries_is_executed ON cypher_queries(is_executed);

-- Index sur la table reports
CREATE INDEX idx_reports_transcription_id ON reports(transcription_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_report_type ON reports(report_type);

-- Index sur la table medical_searches
CREATE INDEX idx_medical_searches_user_id ON medical_searches(user_id);
CREATE INDEX idx_medical_searches_created_at ON medical_searches(created_at);

-- Index sur la table generated_queries
CREATE INDEX idx_generated_queries_user_id ON generated_queries(user_id);
CREATE INDEX idx_generated_queries_query_type ON generated_queries(query_type);

-- Index sur la table rag_queries
CREATE INDEX idx_rag_queries_user_id ON rag_queries(user_id);
CREATE INDEX idx_rag_queries_model ON rag_queries(model);

-- ============================================================================
-- DONNEES DE DEMONSTRATION
-- Description : Insertion de donnees de test pour valider le schema et
--               permettre le developpement. Inclut des utilisateurs, patients,
--               une consultation et une transcription de demonstration.
-- ============================================================================

-- Insertion des utilisateurs de demonstration
-- Mot de passe hashe avec bcrypt pour 'admin123' et 'emma123'
INSERT INTO users (email, hashed_password, full_name, username, role, language, is_active, created_at)
VALUES
    (
        'admin@auriance.fr',
        '$2b$12$LJ3m4ys3GZ4ybKHXO1iFruRKjqGE5.bNSYxMbpGEoFBMXnEMfN5cG',
        'Administrateur Auriance',
        'admin',
        'admin',
        'fr',
        TRUE,
        '2026-03-01 08:00:00'
    ),
    (
        'emma.martin@auriance.fr',
        '$2b$12$vQpWz7R8dXKf3NcYsFHPx.ZwA5gXhE2kVm9Lo0RKbFjU8q4eWyT6i',
        'Dr. Emma Martin',
        'emma.martin',
        'medecin',
        'fr',
        TRUE,
        '2026-03-01 08:30:00'
    );

-- Insertion des patients de demonstration
INSERT INTO patients (nom, age, user_id, created_at)
VALUES
    (
        'Dupont Jean',
        45,
        (SELECT id FROM users WHERE username = 'emma.martin'),
        '2026-03-01 09:00:00'
    ),
    (
        'Martin Sophie',
        32,
        (SELECT id FROM users WHERE username = 'emma.martin'),
        '2026-03-01 09:15:00'
    );

-- Insertion d'une consultation de demonstration
INSERT INTO consultations (patient_id, medecin_id, date, transcription, symptomes, diagnostic, traitement, nom_snapshot, prenom_snapshot, age_snapshot, genre_snapshot)
VALUES
    (
        (SELECT id FROM patients WHERE nom = 'Dupont Jean'),
        (SELECT id FROM users WHERE username = 'emma.martin'),
        '2026-03-01 10:00:00',
        'Le patient se presente pour des douleurs thoraciques recurrentes depuis une semaine. '
        'Il decrit une douleur oppressante au niveau du sternum, survenant principalement a l effort. '
        'Pas de dyspnee au repos. Antecedents d hypertension arterielle traitee. '
        'Examen clinique : tension arterielle 145/90 mmHg, frequence cardiaque 78 bpm, '
        'auscultation cardiaque normale, pas de souffle. '
        'ECG realise : rythme sinusal, pas d anomalie significative.',
        'Douleurs thoraciques a l effort, hypertension arterielle',
        'Angor d effort stable - Bilan cardiologique a completer',
        'Poursuite du traitement antihypertenseur. '
        'Ajout de Bisoprolol 2.5mg 1x/jour. '
        'Prescription d une epreuve d effort et d un echocardiogramme. '
        'Controle dans 15 jours avec les resultats.',
        'Dupont',
        'Jean',
        45,
        'Masculin'
    );

-- Insertion d'une transcription de demonstration
INSERT INTO transcriptions (user_id, audio_file_path, text, language, duration_seconds, confidence_score, type, patient_id, resume_ia, points_cles, entites_detectees, type_session, priorite, analysee, created_at, updated_at)
VALUES
    (
        (SELECT id FROM users WHERE username = 'emma.martin'),
        '/uploads/audio/consultation_2026-03-01_dupont.wav',
        'Le patient se presente pour des douleurs thoraciques recurrentes depuis une semaine. '
        'Il decrit une douleur oppressante au niveau du sternum, survenant principalement a l effort. '
        'Pas de dyspnee au repos. Antecedents d hypertension arterielle traitee.',
        'fr',
        342.5,
        0.94,
        'consultation',
        (SELECT id FROM patients WHERE nom = 'Dupont Jean'),
        'Patient de 45 ans presentant des douleurs thoraciques a l effort depuis une semaine. '
        'Contexte d hypertension arterielle traitee. Examen clinique et ECG rassurants. '
        'Suspicion d angor stable, bilan cardiologique prescrit.',
        '["Douleurs thoraciques a l effort depuis 1 semaine", "Antecedent d hypertension arterielle", "ECG normal", "Suspicion d angor stable", "Bilan cardiologique prescrit"]',
        '{"pathologies": ["Hypertension arterielle", "Angor d effort"], "medicaments": ["Bisoprolol 2.5mg"], "examens": ["ECG", "Epreuve d effort", "Echocardiogramme"], "organes": ["Coeur", "Sternum"]}',
        'consultation',
        'moyenne',
        TRUE,
        '2026-03-01 10:00:00',
        '2026-03-01 10:06:00'
    );

-- Insertion d'une note d'initialisation
INSERT INTO auriance_init (note, created_at)
VALUES
    (
        'Base de donnees Auriance initialisee avec succes - Schema PostgreSQL v1.0 - Export du 2026-03-01',
        '2026-03-01 08:00:00'
    );

-- ============================================================================
-- FIN DE L'EXPORT
-- ============================================================================
-- Nombre total de tables : 12
-- Tables : users, patients, consultations, transcriptions, extractions,
--          sql_queries, cypher_queries, reports, medical_searches,
--          generated_queries, rag_queries, auriance_init
-- ============================================================================
