$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'android-env.ps1')
$taskNodeVersion = & node --version
if ($LASTEXITCODE -ne 0 -or [version]$taskNodeVersion.TrimStart('v') -lt [version]'22.12.0') { throw 'Node.js >= 22.12.0 is required.' }
Write-Host "Node.js: $taskNodeVersion"
& java -version
if ($LASTEXITCODE -ne 0) { throw 'Java check failed.' }
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "GRADLE_USER_HOME: $env:GRADLE_USER_HOME"
foreach ($taskRequiredFile in @('platforms/android-36/android.jar', 'build-tools/35.0.0/aapt2.exe', 'build-tools/36.0.0/aapt2.exe', 'platform-tools/adb.exe')) {
    if (-not (Test-Path -LiteralPath (Join-Path $env:ANDROID_HOME $taskRequiredFile))) { throw "SDK component missing: $taskRequiredFile" }
    Write-Host "OK: $taskRequiredFile"
}
Push-Location -LiteralPath $taskProjectRoot
try {
    & npx.cmd --no-install cap doctor android
    if ($LASTEXITCODE -ne 0) { throw 'Capacitor doctor failed.' }
} finally { Pop-Location }
