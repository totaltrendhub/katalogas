// lib/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

let browserClient = null;

/**
 * Klientinis (browser) Supabase klientas.
 *
 * Naudojamas TIK "use client" komponentuose:
 *   const supabase = getSupabaseBrowserClient();
 */
export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}

export default getSupabaseBrowserClient;
