# MAP — vibe-check

## Entry Points
- `bin/vibe-check.js:1` — CLI entry, parses args, runs scan, exits
- `lib/scanner.js:1` — file walker + rule runner
- `lib/rules.js:1` — 22 regex rules (secrets, dangerous patterns, misconfig)
- `lib/reporter.js:1` — formats findings for terminal

## Flow
```
bin/vibe-check.js
    → scanner.scanGitChanged() or scanner.scan()
        → getGitChangedFiles() — git diff/ls-files
        → getFiles() — recursive walk (fallback)
        → runRules() — match each line against rules
    → reporter.report() — print findings
    → process.exit(1) if critical
```

## Key Files
| File | Purpose |
|------|---------|
| `bin/vibe-check.js` | CLI entry point |
| `lib/scanner.js` | Git-aware file discovery + rule matching |
| `lib/rules.js` | All 22 detection rules |
| `lib/reporter.js` | Terminal output formatting |
| `SKILL.md` | Atris skill definition |
| `package.json` | npm config, published as @atrislabs/vibe-check |
