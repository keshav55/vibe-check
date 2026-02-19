# vibe-check

DC for your codebase. Catches the bugs that end seasons.

You vibe code fast. This watches your back. Zero dependencies, runs in seconds, only flags the stuff that actually matters — leaked secrets, SQL injection, XSS, missing auth, broken SSL.

## Install

```bash
npx vibe-check
```

Or install globally:

```bash
npm install -g vibe-check
```

## Usage

```bash
# Check current directory
vibe-check

# Check a specific project
vibe-check ./my-app

# Verbose mode (shows matching code)
vibe-check --verbose

# JSON output (for CI)
vibe-check --json
```

## Example

```
  🏈 vibe-check
  DC for your codebase.

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

Exits with code 1 on critical findings — drop it in CI and it blocks the deploy.

## What it checks

**Secrets** (critical) — AWS keys, GitHub tokens, Stripe keys, Twilio creds, database URLs, bearer tokens, private keys, API keys, `.env` files

**Dangerous patterns** — `eval()`, `innerHTML`, SQL concatenation, shell execution, CORS wildcards, unprotected sensitive routes

**Misconfig** — debug mode, disabled SSL, weak crypto (MD5/SHA1), security-related TODOs

## CI / GitHub Action

```yaml
- name: vibe-check
  run: npx vibe-check
```

## Philosophy

Most linters check everything. vibe-check only checks what can ruin your day. It's not trying to enforce style or catch typos. It's the defensive coordinator — it only speaks up before the backbreaking play.

## License

MIT
