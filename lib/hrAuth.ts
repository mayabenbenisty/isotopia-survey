import crypto from "crypto";

export type HrScope = "full" | "us" | "modiin";

// Hashing the password into a hex digest keeps the cookie value ASCII-safe
// regardless of what characters end up in the env var, and lets the results
// route recover which password was used (i.e. which scope to apply) just by
// comparing the cookie against each known hash — no separate scope cookie needed.
function hash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function passwordForScope(scope: HrScope): string | undefined {
  switch (scope) {
    case "full":
      return process.env.HR_PASSWORD;
    case "us":
      return process.env.HR_PASSWORD_US;
    case "modiin":
      return process.env.HR_PASSWORD_MODIIN;
  }
}

export function hrSessionToken(scope: HrScope): string {
  return hash(passwordForScope(scope) ?? "");
}

// Given a session cookie value, figure out which scope (if any) it grants.
export function resolveHrScope(sessionCookie: string | undefined): HrScope | null {
  if (!sessionCookie) return null;
  for (const scope of ["full", "us", "modiin"] as const) {
    const password = passwordForScope(scope);
    if (password && sessionCookie === hash(password)) return scope;
  }
  return null;
}
