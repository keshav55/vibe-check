const fs = require('fs');
const path = require('path');
const { rules } = require('./rules');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'coverage',
  '__pycache__', '.venv', 'venv', 'vendor', '.bundle',
  '.terraform', '.serverless', 'target'
]);

const IGNORE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2',
  '.ttf', '.eot', '.mp3', '.mp4', '.zip', '.tar', '.gz', '.lock',
  '.map'
]);

const TEXT_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.php', '.java', '.go',
  '.rs', '.c', '.cpp', '.h', '.cs', '.swift', '.kt', '.scala',
  '.html', '.css', '.scss', '.less', '.vue', '.svelte',
  '.json', '.yaml', '.yml', '.toml', '.xml', '.ini', '.cfg',
  '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat',
  '.sql', '.graphql', '.prisma',
  '.md', '.txt', '.dockerfile', '.tf', '.hcl', '.env'
]);

const MAX_FILE_SIZE = 512 * 1024;

function getFiles(dir) {
  const results = [];

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;
      if (name.startsWith('.') && !name.startsWith('.env')) continue;
      if (IGNORE_DIRS.has(name)) continue;

      const fullPath = path.join(currentDir, name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(name).toLowerCase();
        if (IGNORE_EXTENSIONS.has(ext)) continue;

        try {
          const stat = fs.statSync(fullPath);
          if (stat.size > MAX_FILE_SIZE) continue;
        } catch {
          continue;
        }

        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

function scan(targetDir) {
  const absDir = path.resolve(targetDir);
  const files = getFiles(absDir);
  const findings = [];

  for (const filePath of files) {
    const relPath = path.relative(absDir, filePath);
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Check file-pattern rules (like .env detection)
    for (const rule of rules) {
      if (rule.filePattern && rule.filePattern.test(fileName)) {
        findings.push({
          rule: rule.id,
          name: rule.name,
          severity: rule.severity,
          file: relPath,
          line: 0,
          description: rule.description,
          match: fileName
        });
      }
    }

    // Check content rules
    if (!TEXT_EXTENSIONS.has(ext) && ext !== '') continue;

    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split('\n');

    for (const rule of rules) {
      if (!rule.pattern) continue;
      if (rule.fileTypes && !rule.fileTypes.includes(ext)) continue;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip comments for non-secret rules
        const trimmed = line.trim();
        if (!rule.id.startsWith('SECRET')) {
          if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) continue;
        }

        // Reduce noise: skip test files for warnings
        if (rule.severity !== 'critical') {
          if (relPath.includes('test') || relPath.includes('spec') || relPath.includes('__mock')) continue;
        }

        if (rule.pattern.test(line)) {
          findings.push({
            rule: rule.id,
            name: rule.name,
            severity: rule.severity,
            file: relPath,
            line: i + 1,
            description: rule.description,
            match: trimmed.substring(0, 120)
          });
          break; // One finding per rule per file
        }
      }
    }
  }

  return findings;
}

module.exports = { scan };
