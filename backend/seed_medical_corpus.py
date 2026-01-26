"""
Seed a broader, safe medical corpus into Qdrant for demo search.
Run:
  python seed_medical_corpus.py
Requires Qdrant running and the embedding model available.
"""
from __future__ import annotations
import os
import sys
from typing import List, Dict

# Ensure the backend app package is on sys.path
ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.append(ROOT)

from app.services.qdrant_service import ensure_collection, upsert_points  # noqa: E402
from app.services.embedding_service import get_embedding  # noqa: E402


CORPUS: List[Dict[str, str]] = [
    {"condition": "grippe saisonniere", "text": "La grippe saisonniere provoque fievre, toux, fatigue et courbatures avec debut brutal."},
    {"condition": "covid19", "text": "La COVID-19 peut donner fievre, toux seche, anosmie, ageusie et dyspnee dans les formes evoluees."},
    {"condition": "angine streptococcique", "text": "L'angine streptococcique associe mal de gorge, fievre et exsudat amygdalien sans toux."},
    {"condition": "sinusite", "text": "La sinusite aigüe entraine douleur faciale, congestion nasale et ecoulement epais souvent apres un rhume."},
    {"condition": "otite moyenne", "text": "L'otite moyenne cause douleur auriculaire, baisse de l'audition et parfois fievre chez l'enfant."},
    {"condition": "pneumonie", "text": "La pneumonie bacterienne provoque toux productive, fievre, douleurs thoraciques et essoufflement."},
    {"condition": "asthme", "text": "L'asthme se manifeste par dyspnee sifflante, toux nocturne et oppression thoracique, souvent declenchee a l'effort."},
    {"condition": "bpco", "text": "La BPCO donne toux chronique, expectorations et dyspnee d'effort evolutive chez les fumeurs."},
    {"condition": "infarctus", "text": "L'infarctus du myocarde associe douleur thoracique constrictive prolongee, sueurs et nausees, urgence vitale."},
    {"condition": "angor", "text": "L'angor stable provoque douleur thoracique a l'effort qui cede au repos ou a la trinitrine."},
    {"condition": "insuffisance cardiaque", "text": "L'insuffisance cardiaque entraine dyspnee d'effort, oedemes des membres inferieurs et orthopnee."},
    {"condition": "hta", "text": "L'hypertension arterielle est souvent asymptomatique mais peut donner cephalees et phosphene."},
    {"condition": "diabete", "text": "Le diabete desequilibre se manifeste par polyurie, polydipsie, amaigrissement et hyperglycemie."},
    {"condition": "hypoglycemie", "text": "L'hypoglycemie provoque sueurs, tremblements, faim intense, confusion ou malaise."},
    {"condition": "avc", "text": "L'AVC cause deficit brutal: faiblesse d'un cote, trouble de la parole, deviation de la bouche, urgence."},
    {"condition": "migraine", "text": "La migraine associe cephalees pulsatiles, photophobie, nausees et parfois aura visuelle."},
    {"condition": "meningite", "text": "La meningite se traduit par fievre, raideur de nuque, photophobie et cephalee intense."},
    {"condition": "epilepsie", "text": "La crise epileptique generalisee provoque perte de connaissance brutale, mouvements tonico-cloniques et phase post-critique."},
    {"condition": "paludisme", "text": "Le paludisme entraine fievre intermittente, frissons, sueurs et parfois anemie apres un voyage en zone endemique."},
    {"condition": "tuberculose", "text": "La tuberculose pulmonaire donne toux chronique, sueurs nocturnes, fievre vespérale et amaigrissement."},
    {"condition": "gastroenterite", "text": "La gastro-enterite aiguë cause diarrhee, vomissements, crampes abdominales et parfois fievre."},
    {"condition": "appendicite", "text": "L'appendicite commence par douleur peri-ombilicale migrant en fosse iliaque droite avec nausees et fievre moderee."},
    {"condition": "ulcere gastrique", "text": "L'ulcere gastrique donne douleur epigastrique post-prandiale, parfois nausees et perte d'appetit."},
    {"condition": "lithiase vesiculaire", "text": "La colique hepatique provoque douleur epigastrique ou hypochondre droit post-prandiale, irradiee dos, avec nausees."},
    {"condition": "colique nephretique", "text": "La colique nephretique entraine douleur lombaire violente irradiee vers l'aine avec nausees et hematurie."},
    {"condition": "infection urinaire", "text": "La cystite provoque brulures mictionnelles, pollakiurie et envies pressantes, parfois hematurie."},
    {"condition": "pyelonephrite", "text": "La pyelonephrite associe fievre, douleur lombaire, nausees et signes urinaires."},
    {"condition": "grossesse extra uterine", "text": "La grossesse extra-uterine donne douleurs pelviennes, metrorragies et test de grossesse positif, urgence."},
    {"condition": "anemie", "text": "L'anemie cause fatigue, paleur, essoufflement a l'effort et palpitations."},
    {"condition": "allergie", "text": "La reaction allergique provoque urticaire, demangeaisons, oedeme; l'anaphylaxie associe detresse respiratoire et choc."},
    {"condition": "dermite atopique", "text": "La dermatite atopique donne lesions eczematiformes prurigineuses recidivantes, souvent chez l'enfant atopique."},
    {"condition": "zona", "text": "Le zona se manifeste par douleurs ou brulures localisees puis eruption vésiculeuse unilaterale en bande."},
    {"condition": "rougeole", "text": "La rougeole associe fievre elevee, toux, conjonctivite puis eruption maculo-papuleuse diffuse."},
    {"condition": "varicelle", "text": "La varicelle provoque eruption vésiculeuse prurigineuse diffuse en poussées avec fievre moderee."},
    {"condition": "bronchiolite", "text": "La bronchiolite du nourrisson donne polypnee, tirage, sibilants et difficulte a s'alimenter."},
    {"condition": "depression", "text": "La depression se traduit par tristesse persistante, perte d'interet, troubles du sommeil et idees noires."},
    {"condition": "burnout", "text": "Le burnout associe epuisement professionnel, cynisme et sentiment d'inefficacite avec troubles du sommeil."},
    {"condition": "trouble anxieux", "text": "Le trouble anxieux genere inquietude excessive, palpitations, tensions musculaires et ruminations."},
    {"condition": "insomnie", "text": "L'insomnie chronique associe difficulte d'endormissement ou reveils nocturnes avec fatigue diurne."},
]


def main() -> None:
    # Recreate ensures the collection matches the 384-dim multilingual model
    ensure_collection(name="documents", vector_size=384, distance="Cosine", recreate=True)
    texts = [item["text"] for item in CORPUS]
    vectors = [get_embedding(t) for t in texts]
    ids = list(range(1, len(CORPUS) + 1))
    payloads = [
        {
            "text": item["text"],
            "condition": item["condition"],
            "source": "seed_medical_corpus_v1",
        }
        for item in CORPUS
    ]
    upsert_points(collection="documents", ids=ids, vectors=vectors, payloads=payloads)
    print(f"Inserted {len(CORPUS)} seed medical documents into Qdrant.")


if __name__ == "__main__":
    main()
