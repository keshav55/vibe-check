#!/usr/bin/env node

const { scan } = require('../lib/scanner');
const { report } = require('../lib/reporter');

const args = process.argv.slice(2);
const targetDir = args[0] || '.';
const flags = new Set(args.filter(a => a.startsWith('--')));

const verbose = flags.has('--verbose');
const json = flags.has('--json');

console.log('\n  🏈 vibe-check\n  DC for your codebase.\n');

const findings = scan(targetDir);

if (json) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  report(findings, verbose);
}

const critical = findings.filter(f => f.severity === 'critical');
process.exit(critical.length > 0 ? 1 : 0);
