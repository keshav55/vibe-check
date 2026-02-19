const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

const SKIP_PATTERNS = ['.min.js', '.min.css', '.bundle.js'];

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

function shouldSkip(name) {
  return SKIP_PATTERNS.some(p => name.endsWith(p));
}

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
        if (shouldSkip(name)) continue;
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

function getGitChangedFiles(dir) {
  const absDir = path.resolve(dir);
  try {
    // Staged + unstaged + untracked files
    const staged = execSync('git diff --cached --name-only', { cwd: absDir, encoding: 'utf-8' }).trim();
    const unstaged = execSync('git diff --name-only', { cwd: absDir, encoding: 'utf-8' }).trim();
    const untracked = execSync('git ls-files --others --exclude-standard', { cwd: absDir, encoding: 'utf-8' }).trim();

    const all = [staged, unstaged, untracked]
      .filter(Boolean)
      .join('\n')
      .split('\n')
      .filter(Boolean);

    // Deduplicate
    const unique = [...new Set(all)];

    // Resolve to absolute paths + filter to existing files
    return unique
      .map(f => path.join(absDir, f))
      .filter(f => {
        try {
          return fs.statSync(f).isFile();
        } catch {
          return false;
        }
      });
  } catch {
    return null; // Not a git repo
  }
}

function runRules(files, absDir) {
  const findings = [];

  for (const filePath of files) {
    const relPath = path.relative(absDir, filePath);
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();

    if (shouldSkip(fileName)) continue;
    if (IGNORE_EXTENSIONS.has(ext)) continue;

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

    // Skip files over size limit
    if (content.length > MAX_FILE_SIZE) continue;

    const lines = content.split('\n');

    for (const rule of rules) {
      if (!rule.pattern) continue;
      if (rule.fileTypes && !rule.fileTypes.includes(ext)) continue;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip comments for non-secret rules
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

function scan(targetDir) {
  const absDir = path.resolve(targetDir);
  const files = getFiles(absDir);
  const findings = runRules(files, absDir);
  return { findings, filesScanned: files.length, mode: 'full scan' };
}

function scanGitChanged(targetDir) {
  const absDir = path.resolve(targetDir);
  const changedFiles = getGitChangedFiles(absDir);

  // Fall back to full scan if not a git repo
  if (changedFiles === null) {
    return scan(targetDir);
  }

  // Fall back to full scan if no changes (clean working tree)
  if (changedFiles.length === 0) {
    const result = scan(targetDir);
    result.mode = 'full scan (clean working tree)';
    return result;
  }

  const findings = runRules(changedFiles, absDir);
  return { findings, filesScanned: changedFiles.length, mode: 'changed files only' };
}

module.exports = { scan, scanGitChanged };
