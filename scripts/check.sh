#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"
npm_cache="${repo_root}/tmp/npm-cache"
ran_something=false

run_step() {
  local label="$1"
  echo
  echo "==> ${label}"
  shift
  "$@"
}

if [[ -f package.json ]]; then
  ran_something=true
  if [[ -f pnpm-workspace.yaml ]]; then
    if command -v pnpm >/dev/null 2>&1; then
      run_step "pnpm lint" pnpm run lint --if-present
      run_step "pnpm test" pnpm test --if-present
      run_step "pnpm build" pnpm run build --if-present
      run_step "pnpm typecheck" pnpm run typecheck --if-present
    elif command -v npm >/dev/null 2>&1; then
      run_step "pnpm lint" env npm_config_cache="${npm_cache}" npm exec --yes -- pnpm run lint --if-present
      run_step "pnpm test" env npm_config_cache="${npm_cache}" npm exec --yes -- pnpm test --if-present
      run_step "pnpm build" env npm_config_cache="${npm_cache}" npm exec --yes -- pnpm run build --if-present
      run_step "pnpm typecheck" env npm_config_cache="${npm_cache}" npm exec --yes -- pnpm run typecheck --if-present
    else
      echo "Warning: neither pnpm nor npm is installed. Skipping pnpm workspace checks."
    fi
  elif command -v npm >/dev/null 2>&1; then
    run_step "Node.js checks" npm run lint --if-present
    run_step "Node.js tests" npm test --if-present
    run_step "Node.js build" npm run build --if-present
  else
    echo "Warning: no supported Node.js package manager is installed. Skipping Node.js checks."
  fi
fi

if [[ -f pyproject.toml ]]; then
  ran_something=true
  if command -v python >/dev/null 2>&1; then
    run_step "Python checks" python -m pytest
  else
    echo "Warning: python is not installed. Skipping Python checks."
  fi
fi

if [[ -f Cargo.toml ]]; then
  ran_something=true
  if command -v cargo >/dev/null 2>&1; then
    run_step "Rust tests" cargo test
    run_step "Rust formatting" cargo fmt --check
  else
    echo "Warning: cargo is not installed. Skipping Rust checks."
  fi
fi

if [[ -f go.mod ]]; then
  ran_something=true
  if command -v go >/dev/null 2>&1; then
    run_step "Go checks" go test ./...
  else
    echo "Warning: go is not installed. Skipping Go checks."
  fi
fi

if [[ "${ran_something}" == false ]]; then
  echo "Warning: no supported project manifest was found."
  echo "Add your app stack first, then update this script with project-specific checks."
  exit 0
fi

echo
echo "Checks completed."
