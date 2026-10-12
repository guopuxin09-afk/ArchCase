param([switch]$Offline)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'android-env.ps1')
$taskOutputRoot = Join-Path $taskProjectRoot 'output'
New-Item -ItemType Directory -Force -Path $taskOutputRoot | Out-Null
Push-Location -LiteralPath $taskProjectRoot
try {
    & npm.cmd run sync:android
    if ($LASTEXITCODE -ne 0) { throw 'Web build or Capacitor sync failed.' }
    $taskGradleArguments = @('assembleDebug', '--no-daemon', '--console=plain', '--stacktrace', ('-Duser.home=' + (Join-Path $taskToolsRoot 'java-user')))
    if ($Offline) { $taskGradleArguments += '--offline' }
    Push-Location -LiteralPath (Join-Path $taskProjectRoot 'android')
    try {
        $ErrorActionPreference = 'Continue'
        try {
            & .\gradlew.bat @taskGradleArguments 2>&1 | ForEach-Object { $_.ToString() } | Tee-Object -FilePath (Join-Path $taskOutputRoot 'build-debug.log')
            $taskBuildExitCode = $LASTEXITCODE
        } finally { $ErrorActionPreference = 'Stop' }
        if ($taskBuildExitCode -ne 0) { throw 'Gradle build failed. See output/build-debug.log.' }
    } finally { Pop-Location }
    $taskApkSource = Join-Path $taskProjectRoot 'android/app/build/outputs/apk/debug/app-debug.apk'
    if (-not (Test-Path -LiteralPath $taskApkSource)) { throw 'Gradle completed without producing the expected APK.' }
    $taskApkDirectory = Join-Path $taskProjectRoot 'apk'
    New-Item -ItemType Directory -Force -Path $taskApkDirectory | Out-Null
    $taskApkOutput = Join-Path $taskApkDirectory 'archcase-debug.apk'
    Copy-Item -LiteralPath $taskApkSource -Destination $taskApkOutput -Force
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $taskApkZip = [IO.Compression.ZipFile]::OpenRead($taskApkOutput)
    try {
        $taskEmbeddedIndex = $taskApkZip.GetEntry('assets/public/index.html')
        if (-not $taskEmbeddedIndex) { throw 'APK does not contain the local HTML entrypoint.' }
        $taskWebRoot = Join-Path $taskProjectRoot 'www'
        $taskWebFiles = @(Get-ChildItem -LiteralPath $taskWebRoot -File -Recurse)
        foreach ($taskWebFile in $taskWebFiles) {
            $taskAssetPath = 'assets/public/' + $taskWebFile.FullName.Substring($taskWebRoot.Length + 1).Replace('\', '/')
            $taskAssetEntry = $taskApkZip.GetEntry($taskAssetPath)
            if (-not $taskAssetEntry) { throw "APK resource missing: $taskAssetPath" }
            $taskAssetStream = $taskAssetEntry.Open()
            $taskHasher = [Security.Cryptography.SHA256]::Create()
            try {
                $taskEmbeddedHash = [BitConverter]::ToString($taskHasher.ComputeHash($taskAssetStream)).Replace('-', '')
            } finally { $taskAssetStream.Dispose(); $taskHasher.Dispose() }
            if ($taskEmbeddedHash -ne (Get-ProjectFileSha256 -LiteralPath $taskWebFile.FullName)) {
                throw "APK resource content mismatch: $taskAssetPath"
            }
        }
        Write-Host "Verified $($taskWebFiles.Count) bundled web resource(s) against their build outputs."
    } finally { $taskApkZip.Dispose() }
    & (Join-Path $env:ANDROID_HOME 'build-tools/36.0.0/apksigner.bat') verify --verbose $taskApkOutput
    if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
    $taskApkMetadata = @(& (Join-Path $env:ANDROID_HOME 'build-tools/36.0.0/aapt.exe') dump badging $taskApkOutput)
    if ($LASTEXITCODE -ne 0) { throw 'APK metadata verification failed.' }
    [IO.File]::WriteAllLines((Join-Path $taskOutputRoot 'apk-metadata.txt'), [string[]]$taskApkMetadata, [Text.UTF8Encoding]::new($false))
    $taskApkMetadata | Where-Object { $_ -match '^(package:|sdkVersion:|targetSdkVersion:|application:|application-debuggable|launchable-activity:)' } | ForEach-Object { Write-Host $_ }
    $taskApkHash = (Get-ProjectFileSha256 -LiteralPath $taskApkOutput).ToLowerInvariant()
    [IO.File]::WriteAllText((Join-Path $taskApkDirectory 'archcase-debug.apk.sha256'), "$taskApkHash  archcase-debug.apk`n", [Text.UTF8Encoding]::new($false))
    Write-Host "APK ready: $taskApkOutput"
} finally { Pop-Location }
