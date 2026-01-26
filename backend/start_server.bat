@echo off
REM Démarrer le serveur et le laisser actif

cd /d "C:\Users\marec\Documents\auriance\backend"
echo Démarrage du serveur AURIANCE...
py run_server.py

REM Attendre un peu avant de fermer la fenêtre
pause
