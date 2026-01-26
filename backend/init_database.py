# init_database.py
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def init_database():
    print("🚀 Initialisation de la base de données...")
    
    try:
        # Approche ultra-simple
        from sqlalchemy import create_engine
        from app.db.base import Base
        # Engine
        engine = create_engine("postgresql://postgres:110603@localhost:5432/postgres")
        
        # Import des modèles
        print("📥 Import des modèles...")
        
        # Test avec juste User d'abord
        from app.models.user import User
        print("✅ Modèle User importé")
        
        # Puis ajoute les autres modèles un par un
        try:
            from app.models.habitude import Habitude
            print("✅ Modèle Habitude importé")
        except Exception as e:
            print(f"⚠️  Habitude: {e}")
            
        try:
            from app.models.patient import Patient
            print("✅ Modèle Patient importé")
        except Exception as e:
            print(f"⚠️  Patient: {e}")
            
        try:
            from app.models.planning import Planning
            print("✅ Modèle Planning importé")
        except Exception as e:
            print(f"⚠️  Planning: {e}")
        
        # Création des tables
        print("🏗️  Création des tables...")
        Base.metadata.create_all(bind=engine)
        print("🎉 Base de données initialisée avec succès!")
        
    except Exception as e:
        print(f"💥 Erreur critique: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_database()