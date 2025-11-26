// lib/supabaseAdmin.js

import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase klientas su SERVICE ROLE key.
 * Šitas apeina RLS, todėl naudoti TIK backend logikai
 * (PDF upload, cron job'ai ir pan.), niekada ne klientui.
 */
let adminClient = null;

export function supabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Truksta NEXT_PUBLIC_SUPABASE_URL arba SUPABASE_SERVICE_ROLE_KEY env kintamuju."
    );
  }

  adminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
    },
  });

  return adminClient;
}
