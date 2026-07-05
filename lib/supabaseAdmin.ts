import { createClient } from "@supabase/supabase-js";

// Strips stray non-ASCII characters (e.g. a smart-quote or bullet picked up while
// copy-pasting a secret into a dashboard) that would otherwise crash header
// construction with "Cannot convert argument to a ByteString".
function cleanEnvValue(value: string): string {
  return value.replace(/[^\x20-\x7E]/g, "").trim();
}

// Server-only client using the service role key. NEVER import this from a "use client" file.
export function getSupabaseAdmin() {
  const url = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const serviceKey = cleanEnvValue(process.env.SUPABASE_SERVICE_KEY ?? "");
  return createClient(url, serviceKey);
}
