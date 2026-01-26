"""
Script pour générer 5000 patients synthétiques avec Synthea
"""
import subprocess
import sys
from pathlib import Path
import time

def generate_patients(count=5000, state="France"):
    """
    Génère des patients synthétiques
    
    Args:
        count: Nombre de patients à générer (défaut: 5000)
        state: Localisation (défaut: "France")
    """
    synthea_dir = Path("synthea")
    
    if not synthea_dir.exists():
        print("❌ Synthea n'est pas installé")
        print("Exécutez d'abord: python scripts/install_synthea.py")
        return False
    
    print("=" * 60)
    print(f"GÉNÉRATION DE {count} PATIENTS SYNTHÉTIQUES")
    print("=" * 60)
    print(f"\n📍 Localisation: {state}")
    print(f"👥 Nombre de patients: {count}")
    print(f"\n⏳ Temps estimé: ~{count // 50} minutes")
    print("\nDémarrage de la génération...")
    print("-" * 60)
    
    start_time = time.time()
    
    try:
        # Commande pour Windows
        if sys.platform == 'win32':
            cmd = [
                'cmd', '/c',
                f'run_synthea.bat -p {count} "{state}"'
            ]
        else:
            cmd = ['./run_synthea', '-p', str(count), state]
        
        # Exécuter Synthea
        process = subprocess.Popen(
            cmd,
            cwd=synthea_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        
        # Afficher la progression
        patient_count = 0
        for line in process.stdout:
            if 'records' in line.lower() or 'generating' in line.lower():
                print(f"  {line.strip()}")
                patient_count += 1
                if patient_count % 100 == 0:
                    elapsed = time.time() - start_time
                    rate = patient_count / elapsed
                    remaining = (count - patient_count) / rate if rate > 0 else 0
                    print(f"\n📊 Progression: {patient_count}/{count} patients ({patient_count*100//count}%)")
                    print(f"⏱️  Temps restant: ~{int(remaining/60)} minutes\n")
        
        process.wait()
        
        if process.returncode == 0:
            elapsed_time = time.time() - start_time
            print("\n" + "=" * 60)
            print("✅ GÉNÉRATION TERMINÉE")
            print("=" * 60)
            print(f"\n⏱️  Temps total: {int(elapsed_time/60)} minutes {int(elapsed_time%60)} secondes")
            print(f"👥 Patients générés: {count}")
            print(f"\n📂 Fichiers de sortie:")
            print(f"   CSV: synthea/output/csv/")
            print(f"   FHIR: synthea/output/fhir/")
            
            # Vérifier les fichiers générés
            csv_dir = synthea_dir / "output" / "csv"
            if csv_dir.exists():
                files = list(csv_dir.glob("*.csv"))
                print(f"\n📊 Fichiers CSV générés: {len(files)}")
                for f in files[:5]:  # Afficher les 5 premiers
                    size_mb = f.stat().st_size / (1024 * 1024)
                    print(f"   - {f.name} ({size_mb:.1f} MB)")
                if len(files) > 5:
                    print(f"   ... et {len(files) - 5} autres fichiers")
            
            print("\n📌 Prochaine étape:")
            print("   python scripts/populate_databases.py")
            
            return True
        else:
            print(f"\n❌ Erreur lors de la génération (code: {process.returncode})")
            return False
            
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        return False

def main():
    """Point d'entrée principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Génère des patients synthétiques avec Synthea')
    parser.add_argument('-p', '--patients', type=int, default=5000,
                        help='Nombre de patients à générer (défaut: 5000)')
    parser.add_argument('-s', '--state', type=str, default='France',
                        help='Localisation (défaut: France)')
    
    args = parser.parse_args()
    
    success = generate_patients(count=args.patients, state=args.state)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
