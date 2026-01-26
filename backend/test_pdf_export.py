import requests
import json
import os

# URL de l'API (assurez-vous que le port est correct, 8000 par défaut)
API_URL = "http://localhost:8000/api/auriance/export-transcription-pdf"

# Données de test
test_data = {
    "text": "Ceci est un test de génération de PDF pour la transcription vocale. Nous vérifions si le fichier est correctement généré.",
    "title": "Test PDF Export",
    "language": "fr"
}

try:
    print(f"Envoi de la requête à {API_URL}...")
    response = requests.post(API_URL, json=test_data)
    
    if response.status_code == 200:
        print("✅ Réponse reçue avec succès !")
        # Sauvegarder le fichier pour vérifier
        filename = "test_export_result.pdf"
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"✅ Fichier PDF sauvegardé sous : {os.path.abspath(filename)}")
        print(f"   Taille du fichier : {len(response.content)} octets")
    else:
        print(f"❌ Erreur lors de la requête : {response.status_code}")
        print(f"   Détail : {response.text}")

except Exception as e:
    print(f"❌ Exception lors du test : {str(e)}")
