#!/usr/bin/env node

const { scan, scanGitChanged } = require('../lib/scanner');
const { report } = require('../lib/reporter');

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));
const targetDir = positional[0] || '.';

const verbose = flags.has('--verbose');
const json = flags.has('--json');
const all = flags.has('--all');

console.log('\n  🏈 vibe-check\n');

const start = Date.now();
const { findings, filesScanned, mode } = all
  ? scan(targetDir)
  : scanGitChanged(targetDir);
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log(`  ${filesScanned} files · ${elapsed}s · ${mode}\n`);

if (json) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  report(findings, verbose);
}

const critical = findings.filter(f => f.severity === 'critical');
process.exit(critical.length > 0 ? 1 : 0);
