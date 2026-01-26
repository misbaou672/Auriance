param(
  [switch]$Reload
)

$ErrorActionPreference = 'Stop'

# Always run from the backend folder so the Python package `app.*` resolves.
Set-Location $PSScriptRoot

$python = "py"
$pythonArgs = @("-3.11", "-m", "uvicorn", "app.main_auriance:app", "--host", "0.0.0.0", "--port", "8000")
if ($Reload) {
  $pythonArgs += "--reload"
}

Write-Host "Starting backend: $python $($pythonArgs -join ' ')" -ForegroundColor Cyan
& $python @pythonArgs
