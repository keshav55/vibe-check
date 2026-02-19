---
name: vibe-check
description: Security scanner for agentic engineering. Run before shipping to catch leaked secrets, injection vectors, and misconfig. Use when done coding, before commit, or before deploy.
version: 1.0.0
allowed-tools: Bash, Read, Glob, Grep
tags:
  - security
  - scanner
  - secrets
  - pre-ship
---

# vibe-check

DC for your codebase. Run this before you ship anything.

## When to activate

- Before committing code
- Before deploying
- After a fast vibe-coding session
- When you've touched auth, payments, or user data
- When onboarding a new codebase

## Usage

```bash
# Scan current project
npx vibe-check

# Scan specific directory
npx vibe-check ./src

# Verbose — show matching lines
npx vibe-check --verbose

# JSON output for CI
npx vibe-check --json
```

## What it catches

**Critical (blocks ship):**
- Hardcoded secrets (AWS, GitHub, Stripe, Twilio, database URLs, bearer tokens, private keys)
- SQL injection via string concatenation
- `.env` files committed to repo
- SSL verification disabled

**Warnings (heads up):**
- `eval()` and shell execution
- `innerHTML` assignment (XSS)
- CORS wildcard origins
- Unprotected sensitive routes
- Debug mode enabled
- Weak crypto (MD5/SHA1)
- Security-related TODOs left in code

## CI integration

```yaml
- name: vibe-check
  run: npx vibe-check
```

Exits with code 1 on critical findings. Drop it in CI and it blocks the deploy.

## Philosophy

Check what can ruin your day. Nothing else. Not style, not formatting, not opinions. Just the stuff that ends seasons.
