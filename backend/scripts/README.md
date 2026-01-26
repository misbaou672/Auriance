# Guide de Peuplement des Bases de Données Auriance

## 🎯 Objectif

Peupler les 3 bases de données avec des données médicales réalistes :
- **5000 patients** synthétiques (Synthea)
- **~35 000 consultations**
- **~1000 conditions médicales** uniques

---

## 📋 Prérequis

### Logiciels Requis

1. **Java 11+** (pour Synthea)
   ```bash
   # Vérifier l'installation
   java -version
   ```
   Si non installé : https://adoptium.net/

2. **Git** (pour cloner Synthea)
   ```bash
   git --version
   ```

3. **Python 3.9+** avec les packages :
   ```bash
   pip install pandas sqlalchemy neo4j qdrant-client sentence-transformers
   ```

4. **Bases de données démarrées** :
   - PostgreSQL (port 5432) OU SQLite (par défaut)
   - Neo4j (port 7687)
   - Qdrant (port 6333)

---

## 🚀 Installation et Génération

### Étape 1 : Installer Synthea

```bash
cd c:\Users\marec\Documents\auriance\backend
python scripts/install_synthea.py
```

**Durée** : 2-5 minutes  
**Résultat** : Synthea est cloné et compilé dans `backend/synthea/`

---

### Étape 2 : Générer 5000 Patients

```bash
python scripts/generate_patients.py -p 5000
```

**Options** :
- `-p 5000` : Nombre de patients (vous pouvez changer)
- `-s France` : Localisation (par défaut)

**Durée** : ~10-15 minutes  
**Résultat** : Fichiers CSV dans `backend/synthea/output/csv/`

**Fichiers générés** :
- `patients.csv` (~5000 lignes, ~2 MB)
- `encounters.csv` (~35 000 lignes, ~10 MB)
- `conditions.csv` (~25 000 lignes, ~8 MB)
- `medications.csv` (~15 000 lignes, ~5 MB)
- `observations.csv` (~175 000 lignes, ~50 MB)

---

### Étape 3 : Peupler les Bases de Données

```bash
python scripts/populate_databases.py
```

**Ce que ça fait** :
1. ✅ **PostgreSQL** : Insère patients, consultations, diagnostics
2. ✅ **Neo4j** : Crée le graphe Patient-[HAS_CONDITION]->Condition
3. ✅ **Qdrant** : Embedde 1000 conditions médicales

**Durée** : ~5-10 minutes  
**Résultat** : Vos 3 bases sont peuplées !

---

## 📊 Résultat Final

### PostgreSQL

| Table | Lignes |
|-------|--------|
| `patients` | **5000** |
| `consultations` | **~35 000** |
| `conditions_diagnoses` | **~25 000** |

### Neo4j

| Type | Quantité |
|------|----------|
| Nœuds `Patient` | **5000** |
| Nœuds `Condition` | **~1000** |
| Relations `HAS_CONDITION` | **~5000** |

### Qdrant

| Collection | Vecteurs |
|------------|----------|
| `medical_conditions` | **1000** conditions embedées |

---

## 🧪 Tester que ça marche

### Test PostgreSQL

```bash
# Connexion à la base
sqlite3 data/auriance.db

# Compter les patients
SELECT COUNT(*) FROM patients;
-- Résultat attendu: 5000

# Exemple de patient
SELECT * FROM patients LIMIT 1;
```

### Test Neo4j

Allez sur http://localhost:7474 et exécutez :

```cypher
// Compter les patients
MATCH (p:Patient) RETURN COUNT(p)

// Exemple de relation
MATCH (p:Patient)-[r:HAS_CONDITION]->(c:Condition)
RETURN p.id, c.description
LIMIT 5
```

### Test Qdrant

```python
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)

# Recherche sémantique
results = client.search(
    collection_name="medical_conditions",
    query_vector=[...],  # Votre vecteur
    limit=5
)
```

---

## 🔄 Regénérer les Données

Si vous voulez **recommencer** :

```bash
# Supprimer les anciennes données
rm -rf backend/synthea/output/

# Regénérer
python scripts/generate_patients.py -p 5000

# Re-peupler
python scripts/populate_databases.py
```

---

## ⚙️ Configuration

### Changer la connexion PostgreSQL

Éditez `populate_databases.py` ligne 68 :

```python
# SQLite (par défaut)
db_url = "sqlite:///./data/auriance.db"

# PostgreSQL
db_url = "postgresql://user:password@localhost:5432/auriance"
```

### Changer Neo4j credentials

Éditez `populate_databases.py` ligne 123-125 :

```python
uri = "bolt://localhost:7687"
user = "neo4j"
password = "votre_mot_de_passe"
```

---

## 🐛 Problèmes Courants

### Java non trouvé
```
❌ Java n'est pas installé
```
**Solution** : Installez Java 11+ depuis https://adoptium.net/

### Git non trouvé
```
❌ Erreur lors du clonage de Synthea
```
**Solution** : Installez Git depuis https://git-scm.com/

### Neo4j connection failed
```
❌ Erreur Neo4j: ...
```
**Solution** : 
1. Démarrez Neo4j : `neo4j start`
2. Vérifiez le mot de passe dans le script

### Qdrant connection failed
```
❌ Erreur Qdrant: ...
```
**Solution** :
1. Démarrez Qdrant : `docker run -p 6333:6333 qdrant/qdrant`

---

## 📈 Augmenter les Données

Pour **plus de patients** :

```bash
# 10 000 patients
python scripts/generate_patients.py -p 10000

# 50 000 patients (production)
python scripts/generate_patients.py -p 50000
```

**Temps de génération** :
- 5000 patients : ~10 min
- 10 000 patients : ~20 min
- 50 000 patients : ~2 heures

---

## ✅ Checklist Finale

- [ ] Java 11+ installé
- [ ] Git installé
- [ ] Packages Python installés
- [ ] Synthea installé (`install_synthea.py`)
- [ ] 5000 patients générés (`generate_patients.py`)
- [ ] Bases de données peuplées (`populate_databases.py`)
- [ ] Tests passés (PostgreSQL, Neo4j, Qdrant)
- [ ] App mobile teste les recherches

**Une fois tout coché, vos données sont prêtes !** 🎉
