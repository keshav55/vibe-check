function report(findings, verbose) {
  if (findings.length === 0) {
    console.log('  ✅ Clean pocket. No issues found.\n');
    return;
  }

  const critical = findings.filter(f => f.severity === 'critical');
  const warnings = findings.filter(f => f.severity === 'warning');

  if (critical.length > 0) {
    console.log(`  🚨 ${critical.length} CRITICAL\n`);
    for (const f of critical) {
      console.log(`  ${f.file}${f.line ? ':' + f.line : ''}`);
      console.log(`    ${f.name}: ${f.description}`);
      if (verbose && f.match) {
        console.log(`    → ${f.match}`);
      }
      console.log('');
    }
  }

  if (warnings.length > 0) {
    console.log(`  ⚠️  ${warnings.length} WARNING\n`);
    for (const f of warnings) {
      console.log(`  ${f.file}${f.line ? ':' + f.line : ''}`);
      console.log(`    ${f.name}: ${f.description}`);
      if (verbose && f.match) {
        console.log(`    → ${f.match}`);
      }
      console.log('');
    }
  }

  console.log('  ─────────────────────────────────');
  console.log(`  ${critical.length} critical · ${warnings.length} warnings`);

  if (critical.length > 0) {
    console.log('  ❌ Fix critical issues before shipping.\n');
  } else {
    console.log('  ⚠️  Warnings noted, but clear to ship.\n');
  }
}

module.exports = { report };
