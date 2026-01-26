# Auriance Translation Setup Guide

To make your project original and wonderful, enable seamless translation for 25 languages using either Google Translate (for best quality) or LibreTranslate (open source, privacy-friendly). Follow these steps:

## Option 1: Google Translate (Recommended)

1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create a new project (e.g., "Auriance Translation").

2. **Enable Cloud Translation API**
   - In the Cloud Console, go to "APIs & Services > Library".
   - Search for "Cloud Translation API" and enable it.

3. **Create Service Account Credentials**
   - Go to "APIs & Services > Credentials".
   - Click "Create Credentials" > "Service Account".
   - Grant it the "Project > Editor" role (or minimum required for Translation API).
   - After creation, click the service account, go to "Keys", and add a new key (JSON). Download the file.

4. **Add Credentials to Your Project**
   - Place the downloaded JSON file in your backend folder (e.g., `backend/google-credentials.json`).
   - Add this line to your `backend/.env` file:
     
     ```
     GOOGLE_APPLICATION_CREDENTIALS=c:/Users/marec/Documents/auriance/backend/google-credentials.json
     TRANSLATION_ENABLED=true
     ```

5. **Restart Your Backend Server**

---

## Option 2: LibreTranslate (Open Source)

1. **Use a Public Instance**
   - Add this to your `backend/.env` file:
     
     ```
     LIBRETRANSLATE_URL=https://libretranslate.com
     TRANSLATION_ENABLED=true
     ```

2. **Or Run Locally**
   - Follow instructions at https://libretranslate.com/docs/ to run your own instance.
   - Set `LIBRETRANSLATE_URL` to your local server URL.

3. **Restart Your Backend Server**

---

## Make It Even More Wonderful
- You can customize supported languages in `backend/app/services/translation_service.py`.
- Add fun UI features: language flags, auto-detect, translation history, or voice translation.
- All translation is private: no text is stored, and you control the provider.

---

**Auriance now supports instant translation for 25 languages. Enjoy your original and wonderful project!**
