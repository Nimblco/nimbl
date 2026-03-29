$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Label,
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "==> $Label"
  & $Action
}

function Invoke-IfExists {
  param(
    [string]$Path,
    [string]$Label,
    [scriptblock]$Action
  )

  if (Test-Path -LiteralPath $Path) {
    Invoke-Step -Label $Label -Action $Action
    return $true
  }

  return $false
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$npmCache = Join-Path $repoRoot "tmp\npm-cache"
$ranSomething = $false

if (Invoke-IfExists -Path "package.json" -Label "Node.js checks" -Action {
  if (Test-Path -LiteralPath "pnpm-workspace.yaml") {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
      pnpm run lint --if-present
      pnpm test --if-present
      pnpm run build --if-present
      pnpm run typecheck --if-present
    } elseif (Get-Command npm.cmd -ErrorAction SilentlyContinue) {
      $originalNpmCache = $env:npm_config_cache
      $env:npm_config_cache = $npmCache

      try {
        & npm.cmd exec --yes -- pnpm run lint --if-present
        & npm.cmd exec --yes -- pnpm test --if-present
        & npm.cmd exec --yes -- pnpm run build --if-present
        & npm.cmd exec --yes -- pnpm run typecheck --if-present
      } finally {
        if ($null -ne $originalNpmCache -and $originalNpmCache -ne "") {
          $env:npm_config_cache = $originalNpmCache
        } else {
          Remove-Item Env:npm_config_cache -ErrorAction SilentlyContinue
        }
      }
    } else {
      Write-Warning "Neither pnpm nor npm.cmd is available. Skipping pnpm workspace checks."
    }
  } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    npm run lint --if-present
    npm test --if-present
    npm run build --if-present
  } else {
    Write-Warning "No supported Node.js package manager is installed. Skipping Node.js checks."
  }
}) {
  $ranSomething = $true
}

if (Invoke-IfExists -Path "pyproject.toml" -Label "Python checks" -Action {
  if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m pytest
  } else {
    Write-Warning "python is not installed. Skipping Python checks."
  }
}) {
  $ranSomething = $true
}

if (Invoke-IfExists -Path "Cargo.toml" -Label "Rust checks" -Action {
  if (Get-Command cargo -ErrorAction SilentlyContinue) {
    cargo test
    cargo fmt --check
  } else {
    Write-Warning "cargo is not installed. Skipping Rust checks."
  }
}) {
  $ranSomething = $true
}

if (Invoke-IfExists -Path "go.mod" -Label "Go checks" -Action {
  if (Get-Command go -ErrorAction SilentlyContinue) {
    go test ./...
  } else {
    Write-Warning "go is not installed. Skipping Go checks."
  }
}) {
  $ranSomething = $true
}

if (-not $ranSomething) {
  Write-Warning "No supported project manifest was found."
  Write-Host "Add your app stack first, then update this script with any project-specific checks you want."
  exit 0
}

Write-Host ""
Write-Host "Checks completed."
