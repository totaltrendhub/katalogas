// lib/getCurrentUser.js

import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Saugiai grąžina prisijungusį userį arba null.
 * NIEKADA nemeta klaidos net jei nėra sesijos.
 */
export async function getCurrentUser() {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase.auth.getUser();

    // Situacija, kai nėra sesijos – labai dažna ir neturi būti laikoma klaida.
    if (error) {
      const msg = String(error.message || "");

      const isMissingSession =
        error.name === "AuthSessionMissingError" ||
        msg.includes("Auth session missing");

      if (isMissingSession) {
        // Tiesiog nėra prisijungusio vartotojo
        return null;
      }

      console.error("getCurrentUser auth ERROR (ne sesija):", error);
      return null;
    }

    return data?.user ?? null;
  } catch (err) {
    const msg = String(err?.message || "");

    const isMissingSession =
      err?.name === "AuthSessionMissingError" ||
      msg.includes("Auth session missing");

    if (isMissingSession) {
      // Vėl: tiesiog nėra userio
      return null;
    }

    console.error("getCurrentUser FATAL:", err);
    return null;
  }
}
