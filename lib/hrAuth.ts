import crypto from "crypto";

// Hashing the password into a hex digest keeps the cookie value ASCII-safe
// regardless of what characters end up in the HR_PASSWORD env var.
export function hrSessionToken(): string {
  return crypto.createHash("sha256").update(process.env.HR_PASSWORD ?? "").digest("hex");
}
