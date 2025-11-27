// lib/supabasePublic.js
// Viešas Supabase klientas be auth/cookies.
// Naudojamas tik skaitymui (SELECT) public duomenims.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Trūksta NEXT_PUBLIC_SUPABASE_URL arba NEXT_PUBLIC_SUPABASE_ANON_KEY env kintamųjų."
  );
}

export const supabasePublic = createClient(url, anonKey, {
  auth: {
    persistSession: false,
  },
});
