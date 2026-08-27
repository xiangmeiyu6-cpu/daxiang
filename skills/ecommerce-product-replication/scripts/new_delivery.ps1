param(
    [Parameter(Mandatory = $true)]
    [string]$ProductName,
    [string]$Root = (Get-Location).Path
)

$safeName = $ProductName -replace '[\\/:*?"<>|]', '-'
$delivery = Join-Path $Root $safeName
$folders = @(
    '01-analysis',
    '02-strategy',
    '03-main-images',
    '04-detail-page',
    '05-evidence'
)

New-Item -ItemType Directory -Path $delivery -Force | Out-Null
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path (Join-Path $delivery $folder) -Force | Out-Null
}

$manifest = @"
# $ProductName delivery

- Reference URL:
- User product:
- Target platform:
- Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Evidence status

- Page facts:
- User facts:
- External facts:
- Inferences:
- Unknowns:
"@

Set-Content -LiteralPath (Join-Path $delivery 'delivery-manifest.md') -Value $manifest -Encoding UTF8
Write-Output $delivery
