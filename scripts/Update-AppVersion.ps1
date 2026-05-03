param(
  [switch]$NoStage
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$indexPath = Join-Path $repoRoot 'index.html'

$now = Get-Date
$year = $now.ToString('yy')
$dayOfYear = $now.DayOfYear.ToString('000')
$datePart = "$year$dayOfYear"
$versionPrefix = "1.$datePart."

$sameDayVersions = @()
$commits = git -C $repoRoot log --format=%H -- index.html

if ($LASTEXITCODE -ne 0) {
  throw 'Unable to read Git history for app version.'
}

foreach ($commit in $commits) {
  $committedHtml = git -C $repoRoot show "$commit`:index.html" 2>$null
  if ($LASTEXITCODE -ne 0) {
    continue
  }

  $match = [regex]::Match(($committedHtml -join "`n"), "const APP_VERSION = '1\.$datePart\.(\d+)';")
  if ($match.Success) {
    $sameDayVersions += [int]$match.Groups[1].Value
  }
}

$nextVersionNumber = 1
if ($sameDayVersions.Count -gt 0) {
  $nextVersionNumber = ($sameDayVersions | Measure-Object -Maximum).Maximum + 1
}

$version = "$versionPrefix$nextVersionNumber"

$html = Get-Content -LiteralPath $indexPath -Raw
$versionPattern = "const APP_VERSION = '[^']+';"

if (-not [regex]::IsMatch($html, $versionPattern)) {
  throw 'Could not find APP_VERSION in index.html.'
}

$updated = $html -replace $versionPattern, "const APP_VERSION = '$version';"
Set-Content -LiteralPath $indexPath -Value $updated -NoNewline

if (-not $NoStage) {
  git -C $repoRoot add index.html
}

Write-Host "Stamped app version $version"
