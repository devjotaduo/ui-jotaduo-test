#!/usr/bin/env bash
# Fast local checks for what the current branch changed compared to a base branch.
#
#   scripts/check-changed.sh                 # compare with main
#   scripts/check-changed.sh --base origin/main
#   scripts/check-changed.sh --skip-typecheck --workers 6
#
# Steps:
#   1. lint (oxlint) + format check (oxfmt) on changed files only, per package
#   2. typecheck every project affected by the change (Nx, cached, in parallel)
#   3. jest on tests related to changed files (--changedSince), per package
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BASE="main"
CORES="$(nproc 2>/dev/null || echo 4)"
PARALLEL="$(( CORES / 2 > 1 ? CORES / 2 : 1 ))"
WORKERS="$(( CORES > 2 ? CORES - 2 : 1 ))"
# Server jest workers take ~3 GB each: never start more than free memory allows
AVAILABLE_GB="$(awk '/MemAvailable/ { printf "%d", $2 / 1024 / 1024 }' /proc/meminfo 2>/dev/null || echo 8)"
MEMORY_WORKERS="$(( AVAILABLE_GB / 3 > 1 ? AVAILABLE_GB / 3 : 1 ))"
RUN_LINT=1
RUN_TYPECHECK=1
RUN_TESTS=1

while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE="$2"; shift 2 ;;
    --parallel) PARALLEL="$2"; shift 2 ;;
    --workers) WORKERS="$2"; shift 2 ;;
    --skip-lint) RUN_LINT=0; shift ;;
    --skip-typecheck) RUN_TYPECHECK=0; shift ;;
    --skip-tests) RUN_TESTS=0; shift ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
done

# Applied after --workers so the option is a ceiling, never a way past the memory limit
WORKERS="$(( WORKERS < MEMORY_WORKERS ? WORKERS : MEMORY_WORKERS ))"

# The repo requires Node 26; use the nvm install when the shell has an older default
NVM_NODE_BIN="$(ls -d "$HOME"/.nvm/versions/node/v26.*/bin 2>/dev/null | sort -V | tail -1)"
if [ -n "$NVM_NODE_BIN" ]; then
  export PATH="$NVM_NODE_BIN:$PATH"
fi

if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
  echo "Base branch '$BASE' not found" >&2
  exit 2
fi

# Committed, staged, unstaged and untracked changes since the merge base
MERGE_BASE="$(git merge-base "$BASE" HEAD)"
CHANGED_FILES="$(
  {
    git diff --name-only --diff-filter=ACMR "$MERGE_BASE"
    git ls-files --others --exclude-standard
  } | sort -u | grep -E '^packages/[^/]+/.+\.(ts|tsx|js|jsx|mjs)$' || true
)"

if [ -z "$CHANGED_FILES" ]; then
  echo "No changed source files since $BASE."
  exit 0
fi

CHANGED_PACKAGES="$(echo "$CHANGED_FILES" | cut -d/ -f2 | sort -u)"

for port in 3000 3001 3002; do
  if ss -ltn 2>/dev/null | grep -q ":$port "; then
    echo "Note: something listens on port $port (dev stack?). Stopping it frees CPU and RAM for the checks."
    break
  fi
done

echo "Base: $BASE ($(git rev-parse --short "$MERGE_BASE"))  Nx parallel: $PARALLEL  Jest workers: $WORKERS"
echo "Changed packages: $(echo $CHANGED_PACKAGES)"

FAILED=()
START_ALL=$SECONDS

step() {
  local name="$1"
  shift
  local start=$SECONDS
  echo
  echo "=== $name"
  if "$@"; then
    echo "--- $name: ok ($(( SECONDS - start ))s)"
  else
    echo "--- $name: FAILED ($(( SECONDS - start ))s)"
    FAILED+=("$name")
  fi
}

package_files() {
  echo "$CHANGED_FILES" | grep "^packages/$1/" | sed "s#^packages/$1/##"
}

lint_package() {
  local package="$1"
  local files
  files="$(package_files "$package")"
  [ -f "packages/$package/.oxlintrc.json" ] || { echo "no .oxlintrc.json, skipped"; return 0; }
  (
    cd "packages/$package" || exit 1
    npx oxlint --type-aware -c .oxlintrc.json --deny-warnings $files || exit 1
    # Generated files are ignored by oxfmt; a package with only those has nothing to format
    format_output="$(npx oxfmt --check $files 2>&1)"
    format_status=$?
    echo "$format_output"
    if [ $format_status -ne 0 ] &&
      ! echo "$format_output" | grep -q "Expected at least one target file"; then
      exit 1
    fi
  )
}

test_package() {
  local package="$1"
  [ -f "packages/$package/jest.config.mjs" ] || { echo "no jest.config.mjs, skipped"; return 0; }
  (
    cd "packages/$package" &&
      npx jest --config ./jest.config.mjs --changedSince="$MERGE_BASE" \
        --maxWorkers="$WORKERS" --passWithNoTests
  )
}

if [ "$RUN_LINT" = 1 ]; then
  # .oxlintrc.json loads Twenty's own rules from this build; a fresh checkout has none
  step "build oxlint rules" npx nx build twenty-oxlint-rules --output-style=static
  for package in $CHANGED_PACKAGES; do
    step "lint $package" lint_package "$package"
  done
fi

if [ "$RUN_TYPECHECK" = 1 ]; then
  # Affected includes dependents: a twenty-shared type change can break twenty-sdk
  step "typecheck affected" npx nx affected -t typecheck --base="$MERGE_BASE" \
    --parallel="$PARALLEL" --output-style=static
fi

if [ "$RUN_TESTS" = 1 ]; then
  for package in $CHANGED_PACKAGES; do
    step "test $package" test_package "$package"
  done
fi

echo
echo "Total: $(( SECONDS - START_ALL ))s"
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Failed: ${FAILED[*]}"
  exit 1
fi
echo "All checks passed."
