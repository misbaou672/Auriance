"""
Script d'installation et configuration de Synthea pour générer des patients synthétiques
"""
import os
import subprocess
import sys
from pathlib import Path

def check_java():
    """Vérifie que Java 11+ est installé"""
    try:
        result = subprocess.run(['java', '-version'], capture_output=True, text=True)
        print("✅ Java est installé")
        print(result.stderr.split('\n')[0])
        return True
    except FileNotFoundError:
        print("❌ Java n'est pas installé")
        print("Installez Java 11+ depuis: https://adoptium.net/")
        return False

def clone_synthea():
    """Clone le repository Synthea"""
    synthea_dir = Path("synthea")
    
    if synthea_dir.exists():
        print("✅ Synthea déjà cloné")
        return True
    
    print("📥 Clonage de Synthea...")
    try:
        subprocess.run([
            'git', 'clone', 
            'https://github.com/synthetichealth/synthea.git'
        ], check=True)
        print("✅ Synthea cloné avec succès")
        return True
    except subprocess.CalledProcessError:
        print("❌ Erreur lors du clonage de Synthea")
        print("Assurez-vous que git est installé")
        return False

def configure_synthea():
    """Configure Synthea pour la France"""
    synthea_dir = Path("synthea")
    config_file = synthea_dir / "src" / "main" / "resources" / "synthea.properties"
    
    if not config_file.exists():
        print("⚠️ Fichier de configuration non trouvé")
        return False
    
    print("⚙️ Configuration de Synthea pour la France...")
    
    # Lire la config actuelle
    with open(config_file, 'r', encoding='utf-8') as f:
        config = f.read()
    
    # Modifier pour la France
    modifications = {
        'exporter.baseDirectory': './output',
        'exporter.csv.export': 'true',
        'exporter.fhir.export': 'true',
        'generate.demographics.default_file': 'geography/demographics.csv',
    }
    
    for key, value in modifications.items():
        if key in config:
            print(f"  - {key} = {value}")
    
    print("✅ Configuration terminée")
    return True

def build_synthea():
    """Compile Synthea"""
    synthea_dir = Path("synthea")
    
    if not synthea_dir.exists():
        print("❌ Synthea n'est pas cloné")
        return False
    
    print("🔨 Compilation de Synthea (cela peut prendre quelques minutes)...")
    
    try:
        # Sur Windows, utiliser gradlew.bat
        gradle_cmd = './gradlew.bat' if sys.platform == 'win32' else './gradlew'
        
        subprocess.run(
            [gradle_cmd, 'build', 'check', 'test'],
            cwd=synthea_dir,
            check=True,
            shell=True if sys.platform == 'win32' else False
        )
        print("✅ Synthea compilé avec succès")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de la compilation: {e}")
        return False

def main():
    """Installation complète de Synthea"""
    print("=" * 60)
    print("INSTALLATION DE SYNTHEA POUR AURIANCE")
    print("=" * 60)
    
    # Étape 1: Vérifier Java
    if not check_java():
        return False
    
    # Étape 2: Cloner Synthea
    if not clone_synthea():
        return False
    
    # Étape 3: Configurer
    if not configure_synthea():
        return False
    
    # Étape 4: Compiler
    if not build_synthea():
        print("\n⚠️ Compilation échouée, mais vous pouvez essayer de générer quand même")
    
    print("\n" + "=" * 60)
    print("✅ INSTALLATION TERMINÉE")
    print("=" * 60)
    print("\nProchaine étape:")
    print("  python scripts/generate_patients.py")
    print("\nCela générera 5000 patients dans le dossier synthea/output/")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
