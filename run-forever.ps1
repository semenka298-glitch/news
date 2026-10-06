# Запускает сервер новостей и перезапускает его, если он упал.
Set-Location $PSScriptRoot
$log = Join-Path $PSScriptRoot 'server.log'
while ($true) {
  if ((Test-Path $log) -and (Get-Item $log).Length -gt 5MB) { Move-Item $log "$log.old" -Force }
  & node server.js *>> $log
  Start-Sleep -Seconds 5
}
