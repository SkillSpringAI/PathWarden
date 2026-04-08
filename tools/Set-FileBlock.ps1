param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$BlockName,
    [Parameter(Mandatory=$true)][string]$NewContent
)

if (-not (Test-Path $Path)) {
    throw "File not found: $Path"
}

$startMarker = "/* PATHWARDEN:$BlockName:START */"
$endMarker   = "/* PATHWARDEN:$BlockName:END */"

$text = Get-Content -Path $Path -Raw

$startIndex = $text.IndexOf($startMarker)
$endIndex = $text.IndexOf($endMarker)

if ($startIndex -lt 0 -or $endIndex -lt 0 -or $endIndex -lt $startIndex) {
    throw "Block markers not found correctly for block '$BlockName' in file: $Path"
}

$before = $text.Substring(0, $startIndex + $startMarker.Length)
$after = $text.Substring($endIndex)

$replacement = "`r`n$NewContent`r`n"

$newText = $before + $replacement + $after
Set-Content -Path $Path -Value $newText
