import crypto from "crypto";

export type HrScope = "full" | "us";

// Hashing the password into a hex digest keeps the cookie value ASCII-safe
// regardless of what characters end up in the env var, and lets the results
// route recover which password was used (i.e. which scope to apply) just by
// comparing the cookie against each known hash — no separate scope cookie needed.
function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function hrSessionToken(scope: HrScope): string {
  const password = scope === "us" ? process.env.HR_PASSWORD_US : process.env.HR_PASSWORD;
  return hash(password ?? "");
}

// Given a session cookie value, figure out which scope (if any) it grants.
export function resolveHrScope(sessionCookie: string | undefined): HrScope | null {
  if (!sessionCookie) return null;
  if (process.env.HR_PASSWORD && sessionCookie === hash(process.env.HR_PASSWORD)) return "full";
  if (process.env.HR_PASSWORD_US && sessionCookie === hash(process.env.HR_PASSWORD_US)) return "us";
  return null;
}
