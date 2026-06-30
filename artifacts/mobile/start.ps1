$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
$env:EXPO_NO_DOCTOR = "1"
$env:EXPO_NO_TELEMETRY = "1"
Write-Host "Using IP: $ip"
pnpm exec expo start --port 8081 --offline