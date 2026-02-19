// Each rule: { id, name, severity, pattern, filePattern, description }
// severity: 'critical' (exits non-zero) or 'warning'

const rules = [
  // === SECRETS ===
  {
    id: 'SECRET_AWS_KEY',
    name: 'AWS Access Key',
    severity: 'critical',
    pattern: /AKIA[0-9A-Z]{16}/,
    description: 'Hardcoded AWS access key ID.'
  },
  {
    id: 'SECRET_AWS_SECRET',
    name: 'AWS Secret Key',
    severity: 'critical',
    pattern: /(?:aws_secret_access_key|AWS_SECRET)\s*[=:]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/i,
    description: 'AWS secret access key.'
  },
  {
    id: 'SECRET_GITHUB_TOKEN',
    name: 'GitHub Token',
    severity: 'critical',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/,
    description: 'GitHub personal access token.'
  },
  {
    id: 'SECRET_GENERIC_API_KEY',
    name: 'Hardcoded API Key',
    severity: 'critical',
    pattern: /(?:api_key|apikey|api_secret|access_token|auth_token|secret_key)\s*[=:]\s*['"][A-Za-z0-9_\-]{20,}['"]/i,
    description: 'Generic API key or secret in source code.'
  },
  {
    id: 'SECRET_PRIVATE_KEY',
    name: 'Private Key',
    severity: 'critical',
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    description: 'Private key embedded in source.'
  },
  {
    id: 'SECRET_BEARER_TOKEN',
    name: 'Bearer Token',
    severity: 'critical',
    pattern: /['"]Bearer\s+[A-Za-z0-9_\-\.]{20,}['"]/,
    description: 'Hardcoded bearer token.'
  },
  {
    id: 'SECRET_STRIPE',
    name: 'Stripe Secret Key',
    severity: 'critical',
    pattern: /sk_live_[0-9a-zA-Z]{24,}/,
    description: 'Stripe live secret key.'
  },
  {
    id: 'SECRET_TWILIO',
    name: 'Twilio Credentials',
    severity: 'critical',
    pattern: /(?:twilio|TWILIO).*(?:AC[a-f0-9]{32}|SK[a-f0-9]{32})/,
    description: 'Twilio account SID or API key.'
  },
  {
    id: 'SECRET_DATABASE_URL',
    name: 'Database Connection String',
    severity: 'critical',
    pattern: /(?:postgres|mysql|mongodb|redis):\/\/[^:]+:[^@]+@[^\s'"]+/,
    description: 'Database URL with credentials.'
  },
  {
    id: 'SECRET_ENV_FILE',
    name: '.env file committed',
    severity: 'critical',
    pattern: null,
    filePattern: /^\.env(?:\.local|\.production|\.staging)?$/,
    description: '.env file in repository.'
  },

  // === DANGEROUS PATTERNS ===
  {
    id: 'DANGER_EVAL',
    name: 'eval() usage',
    severity: 'warning',
    pattern: /\beval\s*\(/,
    description: 'eval() can execute arbitrary code. Potential injection vector.',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx', '.py']
  },
  {
    id: 'DANGER_INNER_HTML',
    name: 'innerHTML assignment',
    severity: 'warning',
    pattern: /\.innerHTML\s*=/,
    description: 'Direct innerHTML assignment. XSS risk.',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx', '.html']
  },
  {
    id: 'DANGER_SQL_CONCAT',
    name: 'SQL string concatenation',
    severity: 'critical',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*(?:\+\s*(?:req\.|params\.|query\.|body\.)|`\$\{|'\s*\+\s*\w+\s*\+\s*')/i,
    description: 'SQL query built with string concatenation. SQL injection risk.',
    fileTypes: ['.js', '.ts', '.py', '.rb', '.php', '.java', '.go']
  },
  {
    id: 'DANGER_EXEC',
    name: 'Shell command execution',
    severity: 'warning',
    pattern: /(?:child_process|execSync|\.exec|\.system|popen|subprocess\.call|os\.system)\s*\(/,
    description: 'Shell execution with potential for command injection.',
    fileTypes: ['.js', '.ts', '.py', '.rb', '.php']
  },
  {
    id: 'DANGER_CORS_WILDCARD',
    name: 'CORS wildcard origin',
    severity: 'warning',
    pattern: /(?:Access-Control-Allow-Origin|cors\()\s*[:(]\s*['"]?\*/,
    description: 'CORS allows all origins. Consider restricting.'
  },
  {
    id: 'DANGER_NO_AUTH_ROUTE',
    name: 'Unprotected route pattern',
    severity: 'warning',
    pattern: /app\.(?:post|put|delete|patch)\s*\(\s*['"][^'"]*(?:admin|user|account|payment|delete|settings)[^'"]*['"]\s*,\s*(?:async\s+)?\(?(?:req|ctx)/i,
    description: 'Sensitive route may be missing auth middleware.',
    fileTypes: ['.js', '.ts']
  },

  // === MISCONFIG ===
  {
    id: 'CONFIG_DEBUG_PROD',
    name: 'Debug mode enabled',
    severity: 'warning',
    pattern: /(?:DEBUG|debug)\s*[=:]\s*(?:true|True|1|['"]true['"])/,
    description: 'Debug flag enabled. Make sure this is off in production.'
  },
  {
    id: 'CONFIG_TODO_SECURITY',
    name: 'Security TODO',
    severity: 'warning',
    pattern: /(?:TODO|FIXME|HACK|XXX).*(?:auth|secur|password|token|payment|crypt)/i,
    description: 'Unresolved TODO in security-critical code.'
  },
  {
    id: 'CONFIG_DISABLE_SSL',
    name: 'SSL verification disabled',
    severity: 'critical',
    pattern: /(?:rejectUnauthorized|verify_ssl|VERIFY_SSL|verify_certs)\s*[=:]\s*(?:false|False|0)/i,
    description: 'SSL verification disabled. Man-in-the-middle risk.'
  },
  {
    id: 'CONFIG_WEAK_CRYPTO',
    name: 'Weak crypto algorithm',
    severity: 'warning',
    pattern: /(?:createHash|hashlib\.)\s*\(\s*['"](?:md5|sha1)['"]\s*\)/i,
    description: 'MD5/SHA1 used for hashing. Use SHA-256+ instead.'
  }
];

module.exports = { rules };
