$ErrorActionPreference = 'Stop'

try {
    $credential = Get-Credential -UserName 'MiniMax' -Message 'Paste the MiniMax API Key into the Password field.'
    if ($null -eq $credential) {
        throw 'Credential entry was cancelled.'
    }
    $plain = $credential.GetNetworkCredential().Password
    if ([string]::IsNullOrWhiteSpace($plain)) {
        throw 'API Key cannot be empty.'
    }
    [Environment]::SetEnvironmentVariable('MINIMAX_API_KEY', $plain, 'User')
    Write-Host 'Saved successfully. Restart Codex before generating a video.' -ForegroundColor Green
}
catch {
    Write-Host "Save failed: $($_.Exception.Message)" -ForegroundColor Red
}
$plain = $null
$credential = $null
Read-Host 'Press Enter to close'
