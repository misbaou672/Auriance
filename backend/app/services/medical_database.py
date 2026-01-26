"""Base de données médicale locale - Symptômes, Maladies, Médicaments."""

MEDICAL_DATABASE = {
    "symptoms": {
        # Symptômes généraux
        "fièvre": ["fièvre", "fievre", "temperature", "température", "fever", "has fever", "37°", "38°", "39°", "40°"],
        "toux": ["toux", "tousser", "cough", "quinte de toux"],
        "toux sèche": ["toux sèche", "toux seche", "dry cough"],
        "toux grasse": ["toux grasse", "productive cough", "toux humide"],
        "douleur": ["douleur", "mal", "ache", "pain", "douloureux", "douloureux"],
        "douleur thoracique": ["douleur thoracique", "douleur au coeur", "chest pain"],
        "douleur abdominale": ["douleur abdominale", "douleur au ventre", "mal au ventre", "stomach pain"],
        "mal de tête": ["mal de tête", "mal de tete", "headache"],
        "nausée": ["nausée", "nausee", "nausea", "naupathie", "envies de vomir"],
        "vomissement": ["vomissement", "vomit", "vomir", "vomi"],
        "diarrhée": ["diarrhée", "diarrhee", "diarrhea", "diarrhée"],
        "constipation": ["constipation", "constipé"],
        "fatigue": ["fatigue", "fatigué", "fatigué", "tired", "épuisement"],
        "migraine": ["migraine", "migraine", "céphalée"],
        "vertige": ["vertige", "dizziness", "vertigo", "étourdissement"],
        "rhume": ["rhume", "cold", "rhinite", "coryza"],
        "éruption cutanée": ["éruption", "eruption", "rash", "bouton"],
        "démangeaison": ["démangeaison", "demangeaison", "itching", "itch", "prurit"],
        "palpitations": ["palpitation", "palpitations", "heart palpitations"],
        "essoufflement": ["essoufflement", "dyspnée", "dyspnee", "shortness of breath", "difficultés respiratoires"],
        "congestion": ["congestion", "nez bouché", "nez bouche", "congestion nasale"],
        "frisson": ["frisson", "shivering", "frissons"],
        "sueur": ["sueur", "transpiration", "sweating", "sueurs nocturnes"],
        "insomnie": ["insomnie", "insomnia", "trouble du sommeil"],
        "perte d'appétit": ["perte d'appétit", "perte de appetit", "anorexia"],
        "ganglions gonflés": ["ganglion", "ganglions", "lymph node"],
    },
    "diseases": {
        # Maladies infectieuses
        "grippe": ["grippe", "influenza", "flu", "virus respiratoire"],
        "rhume": ["rhume", "cold", "rhinite"],
        "bronchite": ["bronchite", "bronchitis", "inflammation des bronches"],
        "pneumonie": ["pneumonie", "pneumonia", "infection pulmonaire"],
        "covid": ["covid", "covid-19", "coronavirus"],
        "angine": ["angine", "tonsillitis", "mal de gorge"],
        "otite": ["otite", "ear infection", "mal d'oreille"],
        "sinusite": ["sinusite", "sinusitis", "inflammation des sinus"],
        "pharyngite": ["pharyngite", "pharyngitis"],
        "gastro": ["gastro", "gastro-entérite", "gastroenteritis", "virus digestif"],
        "gastrite": ["gastrite", "gastritis"],
        # Maladies chroniques
        "diabète": ["diabète", "diabete", "diabetic", "diabetes"],
        "hypertension": ["hypertension", "hypertensive", "pression artérielle élevée"],
        "asthme": ["asthme", "asthma", "crise d'asthme"],
        "allergie": ["allergie", "allergy", "allergic"],
        # Maladies rhumatismales
        "arthrose": ["arthrose", "osteoarthritis", "usure articulaire"],
        "arthrite": ["arthrite", "arthritis", "inflammation articulaire"],
        "rhumatisme": ["rhumatisme", "rheumatism"],
        "tendinite": ["tendinite", "tendonitis"],
        "lombalgie": ["lombalgie", "lower back pain"],
        "sciatique": ["sciatique", "sciatic pain"],
        # Maladies dermatologiques
        "eczéma": ["eczéma", "eczema", "atopic dermatitis"],
        "psoriasis": ["psoriasis", "psoriasis"],
        "urticaire": ["urticaire", "hives", "urticaria"],
        # Autres maladies courantes
        "hernie": ["hernie", "hernia", "hernie discale"],
        "migraine": ["migraine", "migraine"],
        "céphalée": ["céphalée", "cephalee", "headache disorder"],
        "entorse": ["entorse", "sprain"],
        "fracture": ["fracture", "broken bone"],
        "anémie": ["anémie", "anemia"],
        "thrombose": ["thrombose", "thrombosis"],
        "infarctus": ["infarctus", "infarction", "crise cardiaque"],
        "accident vasculaire": ["accident vasculaire", "stroke", "avc"],
        "thyroïdite": ["thyroïdite", "thyroiditis"],
        "appendicite": ["appendicite", "appendicitis"],
        "colite": ["colite", "colitis"],
    },
    "medications": {
        # Antalgiques / Anti-inflammatoires
        "paracétamol": ["paracétamol", "paracetamol", "acetaminophen", "doliprane", "efferalgan", "dafalgan"],
        "ibuprofène": ["ibuprofène", "ibuprofen", "advil", "nurofen", "ibupirac"],
        "naproxène": ["naproxène", "naproxene", "naprosyn"],
        "aspirine": ["aspirine", "aspirin", "kardegic", "aspégic"],
        "diclofénac": ["diclofénac", "diclofenac", "voltarene"],
        # Antibiotiques
        "amoxicilline": ["amoxicilline", "amoxicillin", "clamoxyl", "augmentin"],
        "azithromycine": ["azithromycine", "azithromycin", "zithromax"],
        "doxycycline": ["doxycycline", "doxycycline"],
        "métronidazole": ["métronidazole", "metronidazole", "flagyl"],
        "ciprofloxacine": ["ciprofloxacine", "ciprofloxacin", "ciflox"],
        "amoxicilline-acide clavulanique": ["augmentin", "claventin"],
        # Anti-asthmatiques
        "salbutamol": ["salbutamol", "ventoline", "albuterol", "bronchodilatateur"],
        "béclométhasone": ["béclométhasone", "beclomethasone"],
        # Antidépresseurs / Anxiolytiques
        "sertraline": ["sertraline", "zoloft"],
        "fluoxétine": ["fluoxétine", "fluoxetine", "prozac"],
        "escitalopram": ["escitalopram", "seroplex"],
        "alprazolam": ["alprazolam", "xanax"],
        "lorazépam": ["lorazépam", "lorazepam", "temesta"],
        "diazépam": ["diazépam", "diazepam", "valium"],
        # Antihistaminiques
        "loratadine": ["loratadine", "claritin"],
        "cétirizine": ["cétirizine", "cetirizine", "zyrtec"],
        "desloratadine": ["desloratadine", "aerius"],
        # Pour le diabète
        "metformine": ["metformine", "glucophage"],
        "insuline": ["insuline", "insulin", "lantus", "novorapid"],
        "gliclazide": ["gliclazide", "diamicron"],
        # Pour l'hypertension
        "amlodipine": ["amlodipine", "amlodipine"],
        "enalapril": ["enalapril", "renitec"],
        "lisinopril": ["lisinopril", "zestril"],
        "losartan": ["losartan", "cozaar"],
        # Anti-acides / Gastro
        "oméprazole": ["oméprazole", "omeprazole", "mopral"],
        "pantoprazole": ["pantoprazole", "pantoprazole"],
        "lansoprazole": ["lansoprazole", "lansoprazole"],
        "ranitidine": ["ranitidine", "ranitidine"],
        # Anti-douleurs
        "tramadol": ["tramadol", "tramadol"],
        "morphine": ["morphine", "morphine"],
        "codéine": ["codéine", "codeine"],
        # Stéroïdes
        "cortisone": ["cortisone", "cortisone"],
        "prednisolone": ["prednisolone", "prednisolone"],
        "dexaméthasone": ["dexaméthasone", "dexamethasone"],
        # Statines (cholestérol)
        "simvastatine": ["simvastatine", "simvastatin", "zocor"],
        "atorvastatine": ["atorvastatine", "atorvastatin", "tahor"],
        # Anticoagulants
        "warfarine": ["warfarine", "warfarin", "coumadine"],
        "aspirine": ["aspirine", "aspirin"],
        # Antiviraux
        "acyclovir": ["acyclovir", "acyclovir", "zovirax"],
        "oseltamivir": ["oseltamivir", "tamiflu"],
    }
}

def search_in_database(term: str, category: str) -> list:
    """Cherche un terme dans la base de données médicale."""
    if category not in MEDICAL_DATABASE:
        return []
    
    term_lower = term.lower().strip()
    
    for main_term, variations in MEDICAL_DATABASE[category].items():
        if term_lower in [v.lower() for v in variations]:
            return [main_term]  # Retourner le terme principal
    
    return []
