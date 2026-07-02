#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-ading-lili-website}"
VISIBILITY="${2:-public}"

case "$VISIBILITY" in
  public|private)
    VISIBILITY_FLAG="--${VISIBILITY}"
    ;;
  *)
    echo "Usage: scripts/publish-github-pages.sh [repo-name] [public|private]"
    exit 1
    ;;
esac

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI is missing. Install it with: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login"
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Run this script from inside the project Git repository."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  git branch -M main
  CURRENT_BRANCH="main"
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree has uncommitted changes. Commit them before publishing."
  git status --short
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin "$CURRENT_BRANCH"
else
  gh repo create "$REPO_NAME" "$VISIBILITY_FLAG" --source=. --remote=origin --push
fi

REPO_FULL_NAME="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

if gh api "repos/${REPO_FULL_NAME}/pages" >/dev/null 2>&1; then
  gh api -X PUT "repos/${REPO_FULL_NAME}/pages" -f build_type=workflow >/dev/null || true
else
  gh api -X POST "repos/${REPO_FULL_NAME}/pages" -f build_type=workflow >/dev/null || true
fi

gh workflow run deploy-pages.yml --repo "$REPO_FULL_NAME" >/dev/null || true

echo "Repository: https://github.com/${REPO_FULL_NAME}"
echo "Pages URL:  https://$(echo "$REPO_FULL_NAME" | cut -d/ -f1).github.io/$(echo "$REPO_FULL_NAME" | cut -d/ -f2)/"
