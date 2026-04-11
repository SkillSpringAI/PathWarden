$policyPath = ".\config\access-policy.json"

if (-not (Test-Path $policyPath)) {
  Write-Host "Missing access policy file"
  exit 1
}

try {
  $policy = Get-Content $policyPath -Raw | ConvertFrom-Json
} catch {
  Write-Host "Invalid JSON in access policy"
  exit 1
}

Write-Host "version:" $policy.version
Write-Host "defaultMode:" $policy.defaultMode
Write-Host "allowedPaths count:" $policy.allowedPaths.Count
Write-Host "blockedPaths count:" $policy.blockedPaths.Count

if ($policy.defaultMode -notin @("allow", "deny")) {
  Write-Host "Invalid defaultMode"
  exit 1
}

if (-not $policy.allowedPaths) {
  Write-Host "Warning: allowedPaths is empty"
}

if (-not $policy.blockedPaths) {
  Write-Host "Warning: blockedPaths is empty"
}

Write-Host "Access policy structure looks valid"
