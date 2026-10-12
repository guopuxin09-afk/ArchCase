param([switch]$SkipNpm, [switch]$ToolchainOnly)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'file-hash.ps1')
$taskProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskToolsRoot = Join-Path $taskProjectRoot '.tools'
$taskDownloads = Join-Path $taskToolsRoot 'downloads'
$taskSdkRoot = Join-Path $taskToolsRoot 'android-sdk'
$taskJdkRoot = Join-Path $taskToolsRoot 'jdk-21'
New-Item -ItemType Directory -Force -Path $taskDownloads, $taskSdkRoot | Out-Null

function Get-VerifiedArchive {
    param([string]$Url, [string]$Destination, [string]$Sha256)
    if (-not (Test-Path -LiteralPath $Destination) -or (Get-ProjectFileSha256 -LiteralPath $Destination) -ne $Sha256) {
        Write-Host "Downloading $([IO.Path]::GetFileName($Destination))"
        & curl.exe --fail --location --silent --show-error --retry 3 --connect-timeout 30 --max-time 900 --output $Destination $Url
        if ($LASTEXITCODE -ne 0) { throw "Download failed: $Url" }
    }
    if ((Get-ProjectFileSha256 -LiteralPath $Destination) -ne $Sha256) {
        throw "SHA-256 verification failed: $Destination"
    }
}

function Move-WithinTools {
    param([string]$Source, [string]$Destination)
    $taskToolsPrefix = [IO.Path]::GetFullPath($taskToolsRoot) + [IO.Path]::DirectorySeparatorChar
    foreach ($taskCheckedPath in @($Source, $Destination)) {
        if (-not [IO.Path]::GetFullPath($taskCheckedPath).StartsWith($taskToolsPrefix, [StringComparison]::OrdinalIgnoreCase)) {
            throw "Path is outside the project tool directory: $taskCheckedPath"
        }
    }
    Move-Item -LiteralPath $Source -Destination $Destination
}

if (-not (Test-Path -LiteralPath (Join-Path $taskJdkRoot 'bin/java.exe'))) {
    Write-Host 'Resolving official Eclipse Temurin JDK 21 metadata...'
    $taskJdkMetadataPath = Join-Path $taskDownloads 'temurin-21.json'
    & curl.exe --fail --location --silent --show-error --retry 3 --connect-timeout 30 --max-time 120 --output $taskJdkMetadataPath 'https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&image_type=jdk&os=windows&vendor=eclipse'
    if ($LASTEXITCODE -ne 0) { throw 'Could not retrieve JDK metadata.' }
    $taskJdkMetadata = @(Get-Content -Raw -LiteralPath $taskJdkMetadataPath | ConvertFrom-Json)[0]
    $taskJdkPackage = $taskJdkMetadata.binary.package
    $taskJdkArchive = Join-Path $taskDownloads $taskJdkPackage.name
    Get-VerifiedArchive -Url $taskJdkPackage.link -Destination $taskJdkArchive -Sha256 $taskJdkPackage.checksum
    $taskJdkExtract = Join-Path $taskToolsRoot 'jdk-extract'
    Expand-Archive -LiteralPath $taskJdkArchive -DestinationPath $taskJdkExtract -Force
    $taskExtractedJdk = Get-ChildItem -LiteralPath $taskJdkExtract -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'bin/java.exe') } | Select-Object -First 1
    if (-not $taskExtractedJdk) { throw 'JDK archive does not contain bin/java.exe.' }
    Move-WithinTools -Source $taskExtractedJdk.FullName -Destination $taskJdkRoot
}

$taskSdkManager = Join-Path $taskSdkRoot 'cmdline-tools/latest/bin/sdkmanager.bat'
if (-not (Test-Path -LiteralPath $taskSdkManager)) {
    $taskCmdlineArchive = Join-Path $taskDownloads 'commandlinetools-win-15859902_latest.zip'
    Get-VerifiedArchive -Url 'https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip' -Destination $taskCmdlineArchive -Sha256 '90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a'
    $taskCmdlineExtract = Join-Path $taskToolsRoot 'cmdline-extract'
    Expand-Archive -LiteralPath $taskCmdlineArchive -DestinationPath $taskCmdlineExtract -Force
    New-Item -ItemType Directory -Force -Path (Join-Path $taskSdkRoot 'cmdline-tools') | Out-Null
    Move-WithinTools -Source (Join-Path $taskCmdlineExtract 'cmdline-tools') -Destination (Join-Path $taskSdkRoot 'cmdline-tools/latest')
}

. (Join-Path $PSScriptRoot 'android-env.ps1')
Write-Host 'Installing Android SDK packages and their required licenses...'
# The 2026 command-line tools delegate sdkmanager to Android CLI. Call the
# supported CLI directly so its installer handles licenses correctly on Windows.
& (Join-Path $taskSdkRoot 'cmdline-tools/latest/bin/android.exe') --no-metrics "--sdk=$taskSdkRoot" sdk install 'platform-tools' 'platforms;android-36' 'build-tools;35.0.0' 'build-tools;36.0.0'
if ($LASTEXITCODE -ne 0) { throw 'Android SDK package installation failed.' }
foreach ($taskRequiredFile in @('platform-tools/adb.exe', 'platforms/android-36/android.jar', 'build-tools/35.0.0/aapt2.exe', 'build-tools/36.0.0/aapt2.exe')) {
    if (-not (Test-Path -LiteralPath (Join-Path $taskSdkRoot $taskRequiredFile))) {
        throw "SDK component missing after installation: $taskRequiredFile."
    }
    Write-Host "Installed: $taskRequiredFile"
}

Push-Location -LiteralPath $taskProjectRoot
try {
    if (-not $SkipNpm -and -not $ToolchainOnly) {
        & npm.cmd ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'npm dependency installation failed.' }
    }
    if (-not $ToolchainOnly -and (Test-Path -LiteralPath (Join-Path $taskProjectRoot 'node_modules/@capacitor/cli'))) {
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw 'Web build failed.' }
        & npm.cmd run check:offline
        if ($LASTEXITCODE -ne 0) { throw 'Offline resource check failed.' }
        if (-not (Test-Path -LiteralPath (Join-Path $taskProjectRoot 'android'))) {
            & npx.cmd --no-install cap add android
            if ($LASTEXITCODE -ne 0) { throw 'Capacitor Android project creation failed.' }
        }
        & npx.cmd --no-install cap sync android
        if ($LASTEXITCODE -ne 0) { throw 'Capacitor Android synchronization failed.' }
        . (Join-Path $PSScriptRoot 'android-env.ps1')
    }
} finally { Pop-Location }
Write-Host 'Android toolchain is ready. Run npm run doctor, then npm run apk:debug.'
