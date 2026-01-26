# Download Noto fonts for Auriance multilingual PDF support
# Run from PowerShell: .\download_fonts.ps1

Write-Host "Downloading Noto fonts for multilingual PDF support..." -ForegroundColor Green

# Ensure TLS 1.2 for GitHub downloads
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$fonts = @(
    # Base fonts (Latin, Greek, Cyrillic)
    @{ Name = "NotoSans-Regular.ttf";       Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf" }
    @{ Name = "NotoSans-Bold.ttf";          Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf" }
    @{ Name = "NotoSans-Italic.ttf";        Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Italic.ttf" }
    # CJK fonts (OTF) - use Source Han Sans as mirror (Adobe/GF) to avoid 404
    @{ Name = "NotoSansCJKkr-Regular.otf";  Url = "https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/OTC/SourceHanSansKR-Regular.otf" }
    @{ Name = "NotoSansCJKjp-Regular.otf";  Url = "https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/OTC/SourceHanSansJP-Regular.otf" }
    @{ Name = "NotoSansCJKsc-Regular.otf";  Url = "https://raw.githubusercontent.com/adobe-fonts/source-han-sans/release/OTC/SourceHanSansCN-Regular.otf" }
    # South Asian fonts
    @{ Name = "NotoSansTamil-Regular.ttf";      Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf" }
    @{ Name = "NotoSansDevanagari-Regular.ttf"; Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf" }
    @{ Name = "NotoSansBengali-Regular.ttf";    Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf" }
    # Middle Eastern fonts
    @{ Name = "NotoSansArabic-Regular.ttf";     Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf" }
    @{ Name = "NotoSansHebrew-Regular.ttf";     Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf" }
    # Southeast Asian fonts
    @{ Name = "NotoSansThai-Regular.ttf";       Url = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansThai/NotoSansThai-Regular.ttf" }
)

foreach ($font in $fonts) {
    Write-Host "Downloading $($font.Name)..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $font.Url -OutFile $font.Name -UseBasicParsing -ErrorAction Stop
        Write-Host "OK $($font.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "FAIL $($font.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone. Check this directory for downloaded fonts." -ForegroundColor Green
Write-Host "After fonts are downloaded, run: flutter pub get" -ForegroundColor Yellow
