$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'file-hash.ps1')
$taskProjectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskToolsRoot = if ($env:ARCHCASE_TOOLS_ROOT) { [IO.Path]::GetFullPath($env:ARCHCASE_TOOLS_ROOT) } else { Join-Path $taskProjectRoot '.tools' }
$taskSdkRoot = if ($env:ANDROID_HOME -and (Test-Path -LiteralPath (Join-Path $env:ANDROID_HOME 'platforms'))) { $env:ANDROID_HOME } else { Join-Path $taskToolsRoot 'android-sdk' }
$taskLocalJava = Join-Path $taskToolsRoot 'jdk-21'

if (Test-Path -LiteralPath (Join-Path $taskLocalJava 'bin/java.exe')) {
    $env:JAVA_HOME = $taskLocalJava
} elseif (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin/java.exe'))) {
    throw 'JDK is missing. Run npm run setup:android first.'
}

if (-not (Test-Path -LiteralPath (Join-Path $taskSdkRoot 'cmdline-tools/latest/bin/sdkmanager.bat'))) {
    throw 'Android SDK is missing. Run npm run setup:android first.'
}

$env:ANDROID_HOME = $taskSdkRoot
$env:ANDROID_SDK_ROOT = $taskSdkRoot
$env:ANDROID_USER_HOME = Join-Path $taskToolsRoot 'android-user'
if (-not $env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME = Join-Path $taskToolsRoot 'gradle-cache' }
$env:PATH = "$env:JAVA_HOME\bin;$taskSdkRoot\platform-tools;$taskSdkRoot\cmdline-tools\latest\bin;$env:PATH"
New-Item -ItemType Directory -Force -Path $env:ANDROID_USER_HOME, $env:GRADLE_USER_HOME | Out-Null

if (Test-Path -LiteralPath (Join-Path $taskProjectRoot 'android')) {
    $taskSdkProperty = $taskSdkRoot.Replace('\', '/')
    [IO.File]::WriteAllText((Join-Path $taskProjectRoot 'android/local.properties'), "sdk.dir=$taskSdkProperty`n", [Text.UTF8Encoding]::new($false))
}
