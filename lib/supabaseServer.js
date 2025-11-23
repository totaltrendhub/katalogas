// lib/supabaseServer.js

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase klientas (Next.js 15)
 * Visur naudok:
 *   const supabase = await supabaseServer();
 */
export async function supabaseServer() {
  const cookieStore = await cookies(); // <- await, kad Next 15 nelotų

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          try {
            return cookieStore.get(name)?.value ?? null;
          } catch (err) {
            console.error("COOKIE GET ERROR:", err);
            return null;
          }
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (err) {
            console.error("COOKIE SET ERROR:", err);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (err) {
            console.error("COOKIE REMOVE ERROR:", err);
          }
        },
      },
    }
  );
}
