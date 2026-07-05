import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key. NEVER import this from a "use client" file.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, serviceKey);
}
