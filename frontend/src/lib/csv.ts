const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailsFromCsv(text: string): string[] {
  const tokens = text.split(/[\s,;\n\r\t]+/).map((t) => t.trim()).filter(Boolean);
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const token of tokens) {
    if (EMAIL_RE.test(token) && !seen.has(token)) {
      seen.add(token);
      emails.push(token);
    }
  }
  return emails;
}
