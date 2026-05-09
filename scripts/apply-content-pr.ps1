<#
apply-content-pr.ps1

Branches from latest main, copies content files to target paths, commits,
pushes, and opens a draft PR via gh CLI. Reusable across Sort & Match
worked examples.

Usage example (Six Vs):
    .\apply-content-pr.ps1 `
        -Slug "six-vs" `
        -Title "Six Vs and Data Quality" `
        -ScenariosSrc "C:\Users\morri\Downloads\scenarios.json" `
        -LogSrc "C:\Users\morri\Downloads\six-vs.md"

Prerequisites:
    - gh CLI installed and authenticated (run: gh auth status)
    - ScenariosSrc is the COMPLETE current state of scenarios.json
      (when adding Hospital later, that file must contain both
      Six Vs and Hospital records; the script overwrites)
    - Working tree clean before invocation

Memory references:
    - PS 5.1 ASCII-only script discipline applies. This script body
      contains only plain ASCII.
    - Sync-with-main rule for CI workflows does NOT apply here. This
      is a local script. "git pull --ff-only" before branching is
      ordinary local hygiene, unrelated to that rule.
#>

param(
    [Parameter(Mandatory=$true)] [string]$Slug,
    [Parameter(Mandatory=$true)] [string]$Title,
    [Parameter(Mandatory=$true)] [string]$ScenariosSrc,
    [Parameter(Mandatory=$true)] [string]$LogSrc,
    [string]$RepoRoot = "C:\Users\morri\signal-cleanup\Signal"
)

$ErrorActionPreference = "Stop"

# --- Pre-flight ---

if (-not (Test-Path $RepoRoot))     { throw "Repo root not found: $RepoRoot" }
Set-Location $RepoRoot
if (-not (Test-Path ".git"))        { throw "Not a git repo: $RepoRoot" }
if (-not (Test-Path $ScenariosSrc)) { throw "Source scenarios.json not found: $ScenariosSrc" }
if (-not (Test-Path $LogSrc))       { throw "Source log file not found: $LogSrc" }

& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "gh CLI not authenticated. Run: gh auth login" }

$status = git status --porcelain
if ($status) { throw "Working tree has uncommitted changes. Commit or stash first." }

# --- Branch from latest main ---

$branch = "content/sort-and-match-$Slug-phrases"

git fetch origin main
git checkout main
git pull --ff-only origin main

git rev-parse --verify --quiet $branch 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { throw "Branch already exists locally: $branch" }

git ls-remote --exit-code --heads origin $branch 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { throw "Branch already exists on origin: $branch" }

git checkout -b $branch

# --- Copy files to target paths ---

$jsonDestRel = "src/data/sort-and-match/scenarios.json"
$logDestRel  = "docs/sort-and-match-content-review/$Slug.md"

$jsonDestAbs = Join-Path $RepoRoot $jsonDestRel
$logDestAbs  = Join-Path $RepoRoot $logDestRel

New-Item -ItemType Directory -Force -Path (Split-Path $jsonDestAbs) | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path $logDestAbs)  | Out-Null

# Read sources as UTF-8 (PS 5.1 default is Windows-1252) and write
# without BOM (memory entry on firestore-rules BOM trap).
$jsonContent = Get-Content -Path $ScenariosSrc -Encoding UTF8 -Raw
$logContent  = Get-Content -Path $LogSrc       -Encoding UTF8 -Raw

[System.IO.File]::WriteAllText($jsonDestAbs, $jsonContent, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($logDestAbs,  $logContent,  [System.Text.UTF8Encoding]::new($false))

# --- Commit and push ---

git add $jsonDestRel $logDestRel
git commit -m "content: Sort and Match $Title phrase set plus review log"
git push -u origin $branch

# --- Open draft PR ---

$prTitle = "content: Sort and Match $Title phrase set plus review log"
$prBody = @"
Content review: Sort and Match $Title.

Phrases and review log shipped per spec Section 11 protocol.

## Files
- src/data/sort-and-match/scenarios.json
- docs/sort-and-match-content-review/$Slug.md

## Reviewer note
This PR ships content. The review log is the audit trail.
Stays as draft until reviewer (Chris) replaces this template body
with the example-specific summary and marks ready for review.

## TODO before marking ready
- Replace this body with the example-specific summary including
  phrase count distribution (e.g. 5 phrases, 1N/2E/2I) and any
  decisions called out from the review log.
- Confirm any open questions in the log are flagged here.
"@

$prBodyTmp = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($prBodyTmp, $prBody, [System.Text.UTF8Encoding]::new($false))

gh pr create --draft --base main --head $branch --title $prTitle --body-file $prBodyTmp

Remove-Item $prBodyTmp

Write-Host ""
Write-Host "Draft PR opened on branch: $branch"
Write-Host "Edit the PR body in GitHub before marking ready for review."
