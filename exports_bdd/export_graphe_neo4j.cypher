// =============================================
// AURIANCE - Export Base de Donnees Graphe (Neo4j)
// Date: 2026-03-01
// Base: Neo4j 5
// Langage: Cypher
// Connexion: bolt://localhost:7687
// Auth: neo4j / neo4jpass123
// =============================================

// =============================================
// 1. SCHEMA - CONTRAINTES D'UNICITE
// =============================================
// Chaque noeud Patient possede un identifiant unique
CREATE CONSTRAINT IF NOT EXISTS FOR (p:Patient) REQUIRE p.id IS UNIQUE;

// Chaque noeud Medecin possede un email unique
CREATE CONSTRAINT IF NOT EXISTS FOR (m:Medecin) REQUIRE m.email IS UNIQUE;

// =============================================
// 2. SCHEMA - INDEX DE PERFORMANCE
// =============================================
// Index sur les noms de symptomes pour recherche rapide
CREATE INDEX IF NOT EXISTS FOR (s:Symptome) ON (s.name);

// Index sur les codes diagnostics (CIM-10)
CREATE INDEX IF NOT EXISTS FOR (d:Diagnostic) ON (d.code);

// Index sur les noms de traitements
CREATE INDEX IF NOT EXISTS FOR (t:Traitement) ON (t.name);

// =============================================
// 3. TYPES DE NOEUDS (Labels)
// =============================================
//
// :Patient       - Patients medicaux
//   Proprietes: id (Integer, unique), nom (String), prenom (String),
//               age (Integer), genre (String)
//
// :Medecin       - Medecins / Praticiens
//   Proprietes: email (String, unique), nom (String),
//               specialite (String), service (String)
//
// :Symptome      - Symptomes medicaux
//   Proprietes: name (String, indexed), gravite (String),
//               localisation (String)
//
// :Diagnostic    - Diagnostics medicaux (codes CIM-10)
//   Proprietes: code (String, indexed), label (String),
//               categorie (String)
//
// :Traitement    - Traitements / Medicaments
//   Proprietes: name (String, indexed), posologie (String),
//               duree (String), type (String)
//
// :Consultation  - Sessions de consultation
//   Proprietes: date (DateTime), notes (String),
//               symptomes (String), diagnostic (String),
//               traitement (String)
//
// :Project       - Projets (biodiversite, construction)
//   Proprietes: name (String), type (String),
//               status (String)

// =============================================
// 4. TYPES DE RELATIONS
// =============================================
//
// (:Symptome)-[:INDIQUE]->(:Diagnostic)
//   Un symptome indique (pointe vers) un diagnostic possible
//
// (:Diagnostic)-[:PROPOSE]->(:Traitement)
//   Un diagnostic propose un traitement
//
// (:Patient)-[:A_CONSULTE]->(:Consultation)
//   Un patient a effectue une consultation
//
// (:Medecin)-[:REALISE]->(:Consultation)
//   Un medecin a realise une consultation
//
// (:Patient)-[:PRESENTE]->(:Symptome)
//   Un patient presente un symptome
//
// (:Consultation)-[:DIAGNOSTIQUE]->(:Diagnostic)
//   Une consultation mene a un diagnostic
//
// (:Consultation)-[:PRESCRIT]->(:Traitement)
//   Une consultation prescrit un traitement
//
// (:Project)-[:RELATED_TO]->(:Node)
//   Relation generique entre entites

// =============================================
// 5. DONNEES DE DEMONSTRATION
// =============================================

// --- Medecins ---
MERGE (m1:Medecin {email: "emma.martin@auriance.fr"})
SET m1.nom = "Dr. Emma Martin",
    m1.specialite = "Medecine Generale",
    m1.service = "Consultations";

MERGE (m2:Medecin {email: "pierre.durand@auriance.fr"})
SET m2.nom = "Dr. Pierre Durand",
    m2.specialite = "Cardiologie",
    m2.service = "Urgences";

// --- Patients ---
MERGE (p1:Patient {id: 1})
SET p1.nom = "Dupont",
    p1.prenom = "Jean",
    p1.age = 45,
    p1.genre = "M";

MERGE (p2:Patient {id: 2})
SET p2.nom = "Martin",
    p2.prenom = "Sophie",
    p2.age = 32,
    p2.genre = "F";

MERGE (p3:Patient {id: 3})
SET p3.nom = "Bernard",
    p3.prenom = "Luc",
    p3.age = 58,
    p3.genre = "M";

// --- Symptomes ---
MERGE (s1:Symptome {name: "fievre"})
SET s1.gravite = "moderee",
    s1.localisation = "general";

MERGE (s2:Symptome {name: "douleurs abdominales"})
SET s2.gravite = "moderee",
    s2.localisation = "abdomen";

MERGE (s3:Symptome {name: "toux seche"})
SET s3.gravite = "legere",
    s3.localisation = "thorax";

MERGE (s4:Symptome {name: "cephalees"})
SET s4.gravite = "moderee",
    s4.localisation = "tete";

MERGE (s5:Symptome {name: "douleur thoracique"})
SET s5.gravite = "elevee",
    s5.localisation = "thorax";

MERGE (s6:Symptome {name: "fatigue chronique"})
SET s6.gravite = "legere",
    s6.localisation = "general";

// --- Diagnostics (codes CIM-10) ---
MERGE (d1:Diagnostic {code: "A00"})
SET d1.label = "Infection gastro-intestinale",
    d1.categorie = "Infectiologie";

MERGE (d2:Diagnostic {code: "J06"})
SET d2.label = "Infection aigue des voies respiratoires superieures",
    d2.categorie = "Pneumologie";

MERGE (d3:Diagnostic {code: "R51"})
SET d3.label = "Cephalee",
    d3.categorie = "Neurologie";

MERGE (d4:Diagnostic {code: "I20"})
SET d4.label = "Angine de poitrine",
    d4.categorie = "Cardiologie";

MERGE (d5:Diagnostic {code: "K29"})
SET d5.label = "Gastrite aigue",
    d5.categorie = "Gastro-enterologie";

// --- Traitements ---
MERGE (t1:Traitement {name: "paracetamol"})
SET t1.posologie = "1g x3/jour",
    t1.duree = "5 jours",
    t1.type = "analgesique";

MERGE (t2:Traitement {name: "amoxicilline"})
SET t2.posologie = "500mg x3/jour",
    t2.duree = "7 jours",
    t2.type = "antibiotique";

MERGE (t3:Traitement {name: "omeprazole"})
SET t3.posologie = "20mg x1/jour",
    t3.duree = "14 jours",
    t3.type = "IPP";

MERGE (t4:Traitement {name: "aspirine"})
SET t4.posologie = "100mg x1/jour",
    t4.duree = "continu",
    t4.type = "antiaggregant";

// --- Consultations ---
MERGE (c1:Consultation {id: 1})
SET c1.date = datetime("2026-01-15T10:30:00"),
    c1.notes = "Patient se plaint de douleurs abdominales depuis 3 jours avec fievre legere",
    c1.symptomes = "douleurs abdominales, fievre",
    c1.diagnostic = "Gastrite aigue",
    c1.traitement = "paracetamol, omeprazole";

MERGE (c2:Consultation {id: 2})
SET c2.date = datetime("2026-01-20T14:00:00"),
    c2.notes = "Toux seche persistante depuis une semaine, pas de fievre",
    c2.symptomes = "toux seche",
    c2.diagnostic = "Infection voies respiratoires",
    c2.traitement = "amoxicilline";

MERGE (c3:Consultation {id: 3})
SET c3.date = datetime("2026-02-05T09:00:00"),
    c3.notes = "Douleur thoracique a l'effort, essoufflement",
    c3.symptomes = "douleur thoracique, fatigue",
    c3.diagnostic = "Angine de poitrine",
    c3.traitement = "aspirine";

// =============================================
// 6. RELATIONS - Symptome -> Diagnostic -> Traitement
// =============================================

// Fievre + Douleurs abdominales -> Gastrite -> Paracetamol + Omeprazole
MATCH (s1:Symptome {name: "fievre"}), (d5:Diagnostic {code: "K29"})
MERGE (s1)-[:INDIQUE]->(d5);

MATCH (s2:Symptome {name: "douleurs abdominales"}), (d5:Diagnostic {code: "K29"})
MERGE (s2)-[:INDIQUE]->(d5);

MATCH (d5:Diagnostic {code: "K29"}), (t1:Traitement {name: "paracetamol"})
MERGE (d5)-[:PROPOSE]->(t1);

MATCH (d5:Diagnostic {code: "K29"}), (t3:Traitement {name: "omeprazole"})
MERGE (d5)-[:PROPOSE]->(t3);

// Fievre -> Infection gastro-intestinale -> Paracetamol (demo initiale)
MATCH (s1:Symptome {name: "fievre"}), (d1:Diagnostic {code: "A00"})
MERGE (s1)-[:INDIQUE]->(d1);

MATCH (d1:Diagnostic {code: "A00"}), (t1:Traitement {name: "paracetamol"})
MERGE (d1)-[:PROPOSE]->(t1);

// Toux seche -> Infection respiratoire -> Amoxicilline
MATCH (s3:Symptome {name: "toux seche"}), (d2:Diagnostic {code: "J06"})
MERGE (s3)-[:INDIQUE]->(d2);

MATCH (d2:Diagnostic {code: "J06"}), (t2:Traitement {name: "amoxicilline"})
MERGE (d2)-[:PROPOSE]->(t2);

// Cephalees -> Cephalee -> Paracetamol
MATCH (s4:Symptome {name: "cephalees"}), (d3:Diagnostic {code: "R51"})
MERGE (s4)-[:INDIQUE]->(d3);

MATCH (d3:Diagnostic {code: "R51"}), (t1:Traitement {name: "paracetamol"})
MERGE (d3)-[:PROPOSE]->(t1);

// Douleur thoracique -> Angine de poitrine -> Aspirine
MATCH (s5:Symptome {name: "douleur thoracique"}), (d4:Diagnostic {code: "I20"})
MERGE (s5)-[:INDIQUE]->(d4);

MATCH (d4:Diagnostic {code: "I20"}), (t4:Traitement {name: "aspirine"})
MERGE (d4)-[:PROPOSE]->(t4);

// =============================================
// 7. RELATIONS - Patient -> Consultation -> Medecin
// =============================================

// Dupont Jean consulte pour gastrite avec Dr. Emma
MATCH (p1:Patient {id: 1}), (c1:Consultation {id: 1})
MERGE (p1)-[:A_CONSULTE]->(c1);

MATCH (m1:Medecin {email: "emma.martin@auriance.fr"}), (c1:Consultation {id: 1})
MERGE (m1)-[:REALISE]->(c1);

// Martin Sophie consulte pour infection respiratoire avec Dr. Emma
MATCH (p2:Patient {id: 2}), (c2:Consultation {id: 2})
MERGE (p2)-[:A_CONSULTE]->(c2);

MATCH (m1:Medecin {email: "emma.martin@auriance.fr"}), (c2:Consultation {id: 2})
MERGE (m1)-[:REALISE]->(c2);

// Bernard Luc consulte pour angine de poitrine avec Dr. Durand
MATCH (p3:Patient {id: 3}), (c3:Consultation {id: 3})
MERGE (p3)-[:A_CONSULTE]->(c3);

MATCH (m2:Medecin {email: "pierre.durand@auriance.fr"}), (c3:Consultation {id: 3})
MERGE (m2)-[:REALISE]->(c3);

// =============================================
// 8. RELATIONS - Patient -> Symptome
// =============================================

MATCH (p1:Patient {id: 1}), (s1:Symptome {name: "fievre"})
MERGE (p1)-[:PRESENTE]->(s1);

MATCH (p1:Patient {id: 1}), (s2:Symptome {name: "douleurs abdominales"})
MERGE (p1)-[:PRESENTE]->(s2);

MATCH (p2:Patient {id: 2}), (s3:Symptome {name: "toux seche"})
MERGE (p2)-[:PRESENTE]->(s3);

MATCH (p3:Patient {id: 3}), (s5:Symptome {name: "douleur thoracique"})
MERGE (p3)-[:PRESENTE]->(s5);

MATCH (p3:Patient {id: 3}), (s6:Symptome {name: "fatigue chronique"})
MERGE (p3)-[:PRESENTE]->(s6);

// =============================================
// 9. RELATIONS - Consultation -> Diagnostic -> Traitement
// =============================================

MATCH (c1:Consultation {id: 1}), (d5:Diagnostic {code: "K29"})
MERGE (c1)-[:DIAGNOSTIQUE]->(d5);

MATCH (c1:Consultation {id: 1}), (t1:Traitement {name: "paracetamol"})
MERGE (c1)-[:PRESCRIT]->(t1);

MATCH (c1:Consultation {id: 1}), (t3:Traitement {name: "omeprazole"})
MERGE (c1)-[:PRESCRIT]->(t3);

MATCH (c2:Consultation {id: 2}), (d2:Diagnostic {code: "J06"})
MERGE (c2)-[:DIAGNOSTIQUE]->(d2);

MATCH (c2:Consultation {id: 2}), (t2:Traitement {name: "amoxicilline"})
MERGE (c2)-[:PRESCRIT]->(t2);

MATCH (c3:Consultation {id: 3}), (d4:Diagnostic {code: "I20"})
MERGE (c3)-[:DIAGNOSTIQUE]->(d4);

MATCH (c3:Consultation {id: 3}), (t4:Traitement {name: "aspirine"})
MERGE (c3)-[:PRESCRIT]->(t4);

// =============================================
// 10. REQUETES DE VERIFICATION
// =============================================

// Voir tous les noeuds et relations
// MATCH (n) RETURN n LIMIT 50;

// Trouver le chemin Symptome -> Diagnostic -> Traitement
// MATCH path = (s:Symptome)-[:INDIQUE]->(d:Diagnostic)-[:PROPOSE]->(t:Traitement)
// RETURN s.name AS symptome, d.label AS diagnostic, t.name AS traitement;

// Trouver les consultations d'un patient
// MATCH (p:Patient {nom: "Dupont"})-[:A_CONSULTE]->(c:Consultation)
// RETURN p.nom, p.prenom, c.date, c.symptomes, c.diagnostic;

// Trouver tous les patients avec un symptome specifique
// MATCH (p:Patient)-[:PRESENTE]->(s:Symptome {name: "fievre"})
// RETURN p.nom, p.prenom, p.age;

// Chemin complet: Patient -> Consultation -> Diagnostic -> Traitement
// MATCH path = (p:Patient)-[:A_CONSULTE]->(c:Consultation)-[:DIAGNOSTIQUE]->(d:Diagnostic)-[:PROPOSE]->(t:Traitement)
// RETURN p.nom, p.prenom, d.label, t.name;

// =============================================
// RESUME DU GRAPHE
// =============================================
// Noeuds: 3 Patient, 2 Medecin, 6 Symptome, 5 Diagnostic, 4 Traitement, 3 Consultation = 23 noeuds
// Relations: 5 INDIQUE, 6 PROPOSE, 3 A_CONSULTE, 3 REALISE, 5 PRESENTE, 3 DIAGNOSTIQUE, 4 PRESCRIT = 29 relations
// =============================================
