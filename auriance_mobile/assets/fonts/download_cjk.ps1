[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$cjkFonts = @(
    @{ Name = "NotoSansSC-Regular.otf"; Url = "https://github.com/googlefonts/noto-fonts/releases/download/v2024.01.28/NotoSansSC-Regular.ttf" }
    @{ Name = "NotoSansJP-Regular.otf"; Url = "https://github.com/googlefonts/noto-fonts/releases/download/v2024.01.28/NotoSansJP-Regular.ttf" }
    @{ Name = "NotoSansKR-Regular.otf"; Url = "https://github.com/googlefonts/noto-fonts/releases/download/v2024.01.28/NotoSansKR-Regular.ttf" }
)

foreach ($font in $cjkFonts) {
    Write-Host "Downloading $($font.Name)..."
    try {
        Invoke-WebRequest -Uri $font.Url -OutFile $font.Name -UseBasicParsing -ErrorAction Stop
        Write-Host "OK $($font.Name)"
    }
    catch {
        Write-Host "FAIL $($font.Name): $($_.Exception.Message)"
    }
}

Write-Host "Done"
