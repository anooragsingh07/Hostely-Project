/**
 * Allow-list check for college email domains.
 * The list itself is injected at call-site so it can be env-driven
 * on the server and surfaced as UX on the client without duplication.
 */
export const isCollegeEmail = (email: string, allowedDomains: readonly string[]): boolean => {
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return false;
  return allowedDomains.some((d) => {
    const allowed = d.toLowerCase().trim();
    return allowed.length > 0 && (domain === allowed || domain.endsWith(`.${allowed}`));
  });
};

/** Parse a comma-separated env value into a normalized domain list. */
export const parseEmailDomains = (raw: string | undefined | null): string[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
};
