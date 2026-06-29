$ErrorActionPreference = "Stop"

$ROOT = git rev-parse --show-toplevel
Set-Location $ROOT

$STAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$OUT_DIR = "git-state-$STAMP"
$OUT_TAR = "$OUT_DIR.tar.gz"

New-Item -ItemType Directory -Path $OUT_DIR -Force | Out-Null

Write-Host "Exporting git state from: $ROOT"
Write-Host "Output folder: $OUT_DIR"

@"
# Git State Export

Generated at: $(Get-Date -Format "o")
Repository: $(Split-Path $ROOT -Leaf)

## Branch
$(git branch --show-current 2>$null)

## HEAD
$(git log -1 --oneline 2>$null)

## Recent commits
$(git log --oneline --decorate -20 2>$null)

## Status
$(git status --short)

## Full status
$(git status)
"@ | Set-Content "$OUT_DIR/summary.md" -Encoding UTF8

git status --short | Set-Content "$OUT_DIR/status-short.txt" -Encoding UTF8
git diff --name-only | Set-Content "$OUT_DIR/modified-files.txt" -Encoding UTF8
git diff --cached --name-only | Set-Content "$OUT_DIR/staged-files.txt" -Encoding UTF8
git ls-files --others --exclude-standard | Set-Content "$OUT_DIR/untracked-files.txt" -Encoding UTF8

git diff --binary | Set-Content "$OUT_DIR/unstaged.patch" -Encoding UTF8
git diff --cached --binary | Set-Content "$OUT_DIR/staged.patch" -Encoding UTF8

@"
# Diff stats

## Staged
$(git diff --cached --stat 2>$null)

## Unstaged
$(git diff --stat 2>$null)
"@ | Set-Content "$OUT_DIR/diff-stats.md" -Encoding UTF8

$untracked = Get-Content "$OUT_DIR/untracked-files.txt" -ErrorAction SilentlyContinue

if ($untracked -and $untracked.Count -gt 0) {
    tar -czf "$OUT_DIR/untracked-files.tar.gz" -T "$OUT_DIR/untracked-files.txt"
} else {
    "No untracked files." | Set-Content "$OUT_DIR/no-untracked-files.txt" -Encoding UTF8
}

$projectFiles = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tsconfig.build.json",
    "vite.config.ts",
    "README.md"
)

foreach ($file in $projectFiles) {
    if (Test-Path $file -PathType Leaf) {
        $target = Join-Path "$OUT_DIR/project-files" $file
        $targetDir = Split-Path $target -Parent

        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        Copy-Item $file $target -Force
    }
}

git ls-files | Set-Content "$OUT_DIR/tracked-files.txt" -Encoding UTF8

tar -czf "$OUT_TAR" "$OUT_DIR"

Write-Host ""
Write-Host "Done."
Write-Host "Created:"
Write-Host "  $OUT_TAR"
Write-Host ""
Write-Host "Send me this file so I can review the changes and propose the commits:"
Write-Host "  $OUT_TAR"
