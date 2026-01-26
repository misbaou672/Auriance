# Noto Fonts for Multilingual PDF Support

This directory contains Unicode-capable fonts for rendering multilingual PDFs in the Auriance app.

## Required Fonts

### Base Fonts (Essential)
- **NotoSans-Regular.ttf** - Latin, Cyrillic, Greek
- **NotoSans-Bold.ttf** - Bold variant
- **NotoSans-Italic.ttf** - Italic variant

### CJK (Chinese/Japanese/Korean)
- **NotoSansKR-Regular.ttf** - Korean (한국어)
- **NotoSansJP-Regular.ttf** - Japanese (日本語)
- **NotoSansSC-Regular.ttf** - Simplified Chinese (简体中文)

### South Asian Scripts
- **NotoSansTamil-Regular.ttf** - Tamil (தமிழ்)
- **NotoSansDevanagari-Regular.ttf** - Hindi, Sanskrit, Marathi (हिन्दी)
- **NotoSansBengali-Regular.ttf** - Bengali (বাংলা)

### Middle Eastern Scripts
- **NotoSansArabic-Regular.ttf** - Arabic (العربية)
- **NotoSansHebrew-Regular.ttf** - Hebrew (עברית)

### Southeast Asian Scripts
- **NotoSansThai-Regular.ttf** - Thai (ไทย)

## Quick Download Links

### Option 1: Google Fonts (Recommended)
Visit https://fonts.google.com/noto and download:
- Noto Sans (Regular, Bold, Italic)
- Noto Sans KR (Regular)
- Noto Sans JP (Regular)
- Noto Sans SC (Regular)

### Option 2: PowerShell (Windows) - Individual Downloads
```powershell
# Base fonts (Essential)
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Regular.ttf" -OutFile "NotoSans-Regular.ttf"
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Bold.ttf" -OutFile "NotoSans-Bold.ttf"
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Italic.ttf" -OutFile "NotoSans-Italic.ttf"

# CJK
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR-Regular.ttf" -OutFile "NotoSansKR-Regular.ttf"
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP-Regular.ttf" -OutFile "NotoSansJP-Regular.ttf"
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC-Regular.ttf" -OutFile "NotoSansSC-Regular.ttf"

# South Asian
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosanstamil/NotoSansTamil-Regular.ttf" -OutFile "NotoSansTamil-Regular.ttf"
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/NotoSansDevanagari-Regular.ttf" -OutFile "NotoSansDevanagari-Regular.ttf"
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosansbengali/NotoSansBengali-Regular.ttf" -OutFile "NotoSansBengali-Regular.ttf"

# Middle Eastern
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosansarabic/NotoSansArabic-Regular.ttf" -OutFile "NotoSansArabic-Regular.ttf"
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosanshebrew/NotoSansHebrew-Regular.ttf" -OutFile "NotoSansHebrew-Regular.ttf"

# Southeast Asian
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosansthai/NotoSansThai-Regular.ttf" -OutFile "NotoSansThai-Regular.ttf"
```

## License
All Noto fonts are licensed under the SIL Open Font License (OFL).
See: https://scripts.sil.org/OFL
