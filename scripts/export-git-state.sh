#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="git-state-$STAMP"
OUT_TAR="$OUT_DIR.tar.gz"

mkdir -p "$OUT_DIR"

echo "Exporting git state from: $ROOT"
echo "Output folder: $OUT_DIR"

# Basic repository info
{
  echo "# Git State Export"
  echo
  echo "Generated at: $(date -Is)"
  echo "Repository: $(basename "$ROOT")"
  echo
  echo "## Branch"
  git branch --show-current || true
  echo
  echo "## HEAD"
  git log -1 --oneline || true
  echo
  echo "## Recent commits"
  git log --oneline --decorate -20 || true
  echo
  echo "## Status"
  git status --short
  echo
  echo "## Full status"
  git status
} > "$OUT_DIR/summary.md"

# File lists
git status --short > "$OUT_DIR/status-short.txt"
git diff --name-only > "$OUT_DIR/modified-files.txt"
git diff --cached --name-only > "$OUT_DIR/staged-files.txt"
git ls-files --others --exclude-standard > "$OUT_DIR/untracked-files.txt"

# Diffs
git diff --binary > "$OUT_DIR/unstaged.patch"
git diff --cached --binary > "$OUT_DIR/staged.patch"

# Useful stats
{
  echo "# Diff stats"
  echo
  echo "## Staged"
  git diff --cached --stat || true
  echo
  echo "## Unstaged"
  git diff --stat || true
} > "$OUT_DIR/diff-stats.md"

# Export untracked files, preserving paths
if [ -s "$OUT_DIR/untracked-files.txt" ]; then
  tar -czf "$OUT_DIR/untracked-files.tar.gz" -T "$OUT_DIR/untracked-files.txt"
else
  echo "No untracked files." > "$OUT_DIR/no-untracked-files.txt"
fi

# Extra useful project files if present
for file in \
  package.json \
  package-lock.json \
  tsconfig.json \
  tsconfig.app.json \
  tsconfig.node.json \
  tsconfig.build.json \
  vite.config.ts \
  README.md
do
  if [ -f "$file" ]; then
    mkdir -p "$OUT_DIR/project-files/$(dirname "$file")"
    cp "$file" "$OUT_DIR/project-files/$file"
  fi
done

# Include current tracked file tree, without contents
git ls-files > "$OUT_DIR/tracked-files.txt"

# Final archive
tar -czf "$OUT_TAR" "$OUT_DIR"

echo
echo "Done."
echo "Created:"
echo "  $OUT_TAR"
echo
echo "Send me this file so I can review the changes and propose the commits:"
echo "  $OUT_TAR"
