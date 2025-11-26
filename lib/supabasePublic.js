// lib/supabasePublic.js
// Supabase klientas viešiems, anoniminiams užklausoms (be auth, be cookies)

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Trūksta NEXT_PUBLIC_SUPABASE_URL arba NEXT_PUBLIC_SUPABASE_ANON_KEY env kintamųjų."
  );
}

// Singleton klientas – dalinamės tarp visų užklausų
export const supabasePublic = createClient(url, anonKey, {
  auth: {
    persistSession: false,
  },
});
