const REDACTED = "[REDACTED]";
const SECRET_NAME = /KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL/i;
const MIN_SECRET_LENGTH = 8;

export function secretsFromEnv(env) {
  return Object.entries(env)
    .filter(([name, value]) => SECRET_NAME.test(name) && typeof value === "string" && value.length >= MIN_SECRET_LENGTH)
    .map(([, value]) => value);
}

const PATTERNS = [
  [/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, REDACTED],
  [/\beyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/g, REDACTED],
  [/\b([a-z][a-z0-9+.-]*:\/\/[^\s:@/]*):[^\s@/]+@/gi, `$1:${REDACTED}@`],
  [
    /\b([A-Za-z0-9_]*(?:SECRET|PASSWORD|PASSWD|TOKEN|_KEY|API_KEY|AUTH)[A-Za-z0-9_]*)(\s*[=:]\s*["']?)(?![$\[{<])([^\s"';,]{4,})/gi,
    `$1$2${REDACTED}`,
  ],
  [/\b[A-Fa-f0-9]{48,}\b/g, REDACTED],
  [/(?<![\w+/-])(?=[A-Za-z0-9+_]*\d)(?=[A-Za-z0-9+_]*[A-Za-z])[A-Za-z0-9+_]{48,}={0,2}(?![\w+/-])/g, REDACTED],
];

export function redact(text, secrets = []) {
  let result = text;
  for (const secret of [...secrets].sort((a, b) => b.length - a.length)) {
    if (secret.length >= MIN_SECRET_LENGTH) result = result.replaceAll(secret, REDACTED);
  }
  for (const [pattern, replacement] of PATTERNS) result = result.replace(pattern, replacement);
  return result;
}

export function redactDeep(value, secrets = []) {
  if (typeof value === "string") return redact(value, secrets);
  if (Array.isArray(value)) return value.map((item) => redactDeep(item, secrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactDeep(item, secrets)]));
  }
  return value;
}
