param(
  [switch]$NoStage
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$versionPath = Join-Path $repoRoot 'js/version.js'

$now = Get-Date
$year = $now.ToString('yy')
$dayOfYear = $now.DayOfYear.ToString('000')
$datePart = "$year$dayOfYear"
$versionPrefix = "1.$datePart."

$sameDayVersions = @()
$commits = git -C $repoRoot log --format=%H -- js/version.js

if ($LASTEXITCODE -ne 0) {
  throw 'Unable to read Git history for app version.'
}

foreach ($commit in $commits) {
  $committedVersionFile = git -C $repoRoot show "$commit`:js/version.js" 2>$null
  if ($LASTEXITCODE -ne 0) {
    continue
  }

  $match = [regex]::Match(($committedVersionFile -join "`n"), "APP_VERSION = '1\.$datePart\.(\d+)';")
  if ($match.Success) {
    $sameDayVersions += [int]$match.Groups[1].Value
  }
}

$nextVersionNumber = 1
if ($sameDayVersions.Count -gt 0) {
  $nextVersionNumber = ($sameDayVersions | Measure-Object -Maximum).Maximum + 1
}

$version = "$versionPrefix$nextVersionNumber"

$versionFile = Get-Content -LiteralPath $versionPath -Raw
$versionPattern = "const APP_VERSION = '[^']+';"

if (-not [regex]::IsMatch($versionFile, $versionPattern)) {
  throw 'Could not find APP_VERSION in js/version.js.'
}

$updated = $versionFile -replace $versionPattern, "const APP_VERSION = '$version';"
Set-Content -LiteralPath $versionPath -Value $updated -NoNewline

if (-not $NoStage) {
  git -C $repoRoot add js/version.js
}

Write-Host "Stamped app version $version"
