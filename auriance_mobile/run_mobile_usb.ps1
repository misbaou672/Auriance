param(
  [int]$Port = 8000,
  [string]$DeviceId = "",
  [switch]$Clean
)

$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

# Resolve adb path
$adb = $env:ADB
if (-not $adb -or -not (Test-Path $adb)) {
  $sdk = $env:ANDROID_SDK_ROOT
  if (-not $sdk) { $sdk = $env:ANDROID_HOME }
  if (-not $sdk) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\sdk"
    if (Test-Path $defaultSdk) { $sdk = $defaultSdk }
  }
  if ($sdk) {
    $candidate = Join-Path $sdk "platform-tools\adb.exe"
    if (Test-Path $candidate) { $adb = $candidate }
  }
}

if (-not $adb -or -not (Test-Path $adb)) {
  throw "adb.exe introuvable. Définis ANDROID_SDK_ROOT ou ADB (chemin complet)."
}

Write-Host "Using adb: $adb" -ForegroundColor Cyan

# Ensure device is connected
$devices = & $adb devices | Select-String -Pattern "\tdevice$" | ForEach-Object { ($_ -split "\s+")[0] }
if (-not $devices -or $devices.Count -eq 0) {
  Write-Host "Aucun device détecté par adb. Vérifie: câble USB, débogage USB, autorisation." -ForegroundColor Yellow
  & $adb devices
  exit 2
}

if ($DeviceId -and ($devices -notcontains $DeviceId)) {
  Write-Host "DeviceId '$DeviceId' introuvable. Devices: $($devices -join ', ')" -ForegroundColor Yellow
  exit 3
}

if (-not $DeviceId) {
  $DeviceId = $devices | Select-Object -First 1
}

Write-Host "Using device: $DeviceId" -ForegroundColor Cyan

# Set reverse tunnel
Write-Host "Enabling adb reverse tcp:$Port -> tcp:$Port" -ForegroundColor Cyan
& $adb -s $DeviceId reverse tcp:$Port tcp:$Port
& $adb -s $DeviceId reverse --list

if ($Clean) {
  flutter clean
}

flutter pub get
flutter run -d $DeviceId
