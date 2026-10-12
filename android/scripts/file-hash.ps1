function Get-ProjectFileSha256 {
    param([Parameter(Mandatory = $true)][string]$LiteralPath)
    $taskHashStream = [IO.File]::OpenRead($LiteralPath)
    $taskFileHasher = [Security.Cryptography.SHA256]::Create()
    try {
        return [BitConverter]::ToString($taskFileHasher.ComputeHash($taskHashStream)).Replace('-', '')
    } finally { $taskHashStream.Dispose(); $taskFileHasher.Dispose() }
}
