// lib/getCurrentUser.js

import { supabaseServer } from "@/lib/supabaseServer";

export async function getCurrentUser() {
  // SVARBU: čia turi būti await
  const supabase = await supabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("getCurrentUser ERROR:", error);
    return null;
  }

  return user;
}
