# vibe-check

Security scanner for agentic engineering.

You code fast. This watches your back. Zero dependencies, runs in seconds, only flags what actually matters — leaked secrets, SQL injection, XSS, missing auth, broken SSL.

## Install

```bash
npx @atrislabs/vibe-check
```

Or install globally:

```bash
npm install -g @atrislabs/vibe-check
```

## Usage

```bash
# Scan changed files (git-aware, default)
vibe-check

# Scan entire codebase
vibe-check --all

# Scan a specific directory
vibe-check ./src

# Show matching code
vibe-check --verbose

# JSON output for CI
vibe-check --json
```

## Example

```
  🏈 vibe-check

  3 files · 0.1s · changed files only

  🚨 2 CRITICAL

  app.js:83
    Bearer Token: Hardcoded bearer token.

  config/db.js:12
    Database Connection String: Database URL with credentials.

  ⚠️  3 WARNING

  routes/admin.js:14
    Unprotected route pattern: Sensitive route may be missing auth middleware.

  utils/render.js:8
    innerHTML assignment: Direct innerHTML assignment. XSS risk.

  server.js:3
    Debug mode enabled: Debug flag enabled. Make sure this is off in production.

  ─────────────────────────────────
  2 critical · 3 warnings
  ❌ Fix critical issues before shipping.
```

Exits with code 1 on critical findings. Drop it in CI and it blocks the deploy.

## How it works

By default, vibe-check only scans files you've changed — staged, unstaged, and untracked. You care about what you just wrote, not last week's code. Use `--all` to scan everything.

Skips `node_modules`, `.git`, minified files, binaries, and anything over 512KB. Runs 22 rules against every line. One finding per rule per file to keep output clean.

## What it checks

**Secrets** (critical) — AWS keys, GitHub tokens, Stripe keys, Twilio creds, database URLs, bearer tokens, private keys, API keys, `.env` files

**Dangerous patterns** — `eval()`, `innerHTML`, SQL concatenation, shell execution, CORS wildcards, unprotected sensitive routes

**Misconfig** — debug mode, disabled SSL, weak crypto (MD5/SHA1), security-related TODOs

## CI / GitHub Action

```yaml
- name: vibe-check
  run: npx @atrislabs/vibe-check --all
```

## License

MIT
