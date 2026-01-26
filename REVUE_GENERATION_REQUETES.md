# Rapport d'Implémentation : Génération de Requêtes Multi-Domaines

## 1. Objectif
Permettre à l'assistant vocal Auriance de générer des requêtes de base de données (SQL) et de graphes (Cypher) pour n'importe quel domaine d'activité (Santé, Éducation, Administratif, etc.), et pas seulement le médical.

## 2. Architecture Mise en Place

### A. Backend (`QueryGenerationService`)
Le service de génération de requêtes a été amélioré pour supporter trois niveaux d'intelligence :

1.  **Mapping Explique (Statique)**
    Un dictionnaire associe des mots-clés utilisateurs à des tables réelles en base de données.
    *   *Exemple :* "étudiant" -> `etudiants`, "facture" -> `factures`.

2.  **Détection Dynamique (Heuristique)**
    Si le mot n'est pas connu, le système analyse la structure de la phrase (Sujet après Verbe) pour deviner la table.
    *   *Exemple :* "Trouver les **voitures**" -> Le système tente de requêter la table `voitures`.

3.  **Extraction de Filtres Contextuelle**
    Le système extrait intelligemment les conditions après des mots clés comme "avec", "ayant", "qui ont".
    *   *Exemple :* "...avec de la fièvre" -> `WHERE symptomes LIKE '%fièvre%'`

### B. Données (Injection)
Pour rendre la démonstration fonctionnelle, nous avons injecté des données réalistes dans 3 domaines clés via `seed_domains.py` :

*   **Santé** : Patients, Consultations (Table `patients` existante).
*   **Éducation** :
    *   Table `etudiants` (Champs: nom, moyenne, absences...)
    *   Table `cours` (Champs: matiere, enseignant...)
*   **Administratif** :
    *   Table `factures` (Champs: montant, statut, client...)
    *   Table `employes` (Champs: poste, salaire, departement...)

### C. Frontend (`GeneratedQueriesTool.jsx`)
Une nouvelle interface "Requêtes Générées" a été intégrée dans le menu principal.
*   Elle enregistre la voix de l'utilisateur.
*   Elle envoie la requête aux endpoints mobiles `/api/auriance/generate-sql-query` et `/api/auriance/generate-cypher-query`.
*   Elle affiche le SQL et le Cypher générés en temps réel.

## 3. Exemple de Requêtes Supportées

| Domaine | Commande Vocale | Résultat SQL Généré |
| :--- | :--- | :--- |
| **Santé** | "Trouve les patients avec de la fièvre" | `SELECT * FROM patients WHERE symptomes LIKE '%fièvre%'` |
| **Éducation** | "Affiche les étudiants" | `SELECT * FROM etudiants LIMIT 100` |
| **Admin** | "Cherche les factures en attente" | `SELECT * FROM factures WHERE content LIKE '%en attente%'` |
| **Inconnu** | "Trouve les licornes" | `SELECT * FROM licornes LIMIT 100` (Détection dynamique) |

## 4. Prochaines Étapes Possibles
*   Connecter le SQL généré à l'exécution réelle pour afficher les tableaux de résultats directement dans l'interface.
*   Améliorer la détection des filtres numériques (ex: "moyenne supérieure à 15" -> `moyenne > 15`).
