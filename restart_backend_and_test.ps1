$ErrorActionPreference = 'Stop'

$backendDir = 'C:\Users\marec\Documents\auriance\backend'
$py = Join-Path $backendDir 'aurian_env\Scripts\python.exe'
$testScript = 'C:\Users\marec\Documents\auriance\test_multi_db_rag.py'

# Stop current listener (if any)
$backendPid = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($backendPid) {
  Stop-Process -Id $backendPid -Force
  Write-Host "Stopped backend PID=$backendPid"
} else {
  Write-Host "No backend listening on 8000"
}

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$out = Join-Path $backendDir ("backend_stdout_$stamp.log")
$err = Join-Path $backendDir ("backend_stderr_$stamp.log")

$p = Start-Process -FilePath $py -ArgumentList @('-m','uvicorn','app.main_auriance:app','--host','0.0.0.0','--port','8000') -WorkingDirectory $backendDir -RedirectStandardOutput $out -RedirectStandardError $err -PassThru
Write-Host "Started backend PID=$($p.Id)"
Write-Host "Logs: $out | $err"

for ($i = 0; $i -lt 30; $i++) {
  if (Test-NetConnection -ComputerName 127.0.0.1 -Port 8000 | Select-Object -ExpandProperty TcpTestSucceeded) {
    break
  }
  Start-Sleep -Seconds 1
}

& $py $testScript --base http://127.0.0.1:8000 --timeout 300 --question "Montre-moi les patients avec de la fièvre"
