// lib/slotActions.js
"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";

function toNumber(v, fallback = null) {
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Sukurti naują slotą pasirinktoje kategorijoje
export async function createSlotAction(formData) {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const supabase = await supabaseServer();

    // admin check
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("createSlotAction profile ERROR:", profileError);
      return;
    }

    if (!profile?.is_admin) {
      console.error("createSlotAction: user is not admin");
      return;
    }

    const categoryId = formData.get("categoryId");
    const rowNumber = toNumber(formData.get("rowNumber"), 1);
    const slotNumber = toNumber(formData.get("slotNumber"), 1);
    const price = toNumber(formData.get("price"), 0);
    const durationMonths = toNumber(formData.get("durationMonths"), 12);
    const isAnimated = formData.get("isAnimated") === "on";

    if (!categoryId) {
      console.error("createSlotAction: missing categoryId");
      return;
    }

    const { error: insertError } = await supabase.from("slots").insert({
      category_id: categoryId,
      row_number: rowNumber,
      slot_number: slotNumber,
      price,
      duration_months: durationMonths,
      is_animated: isAnimated,
    });

    if (insertError) {
      console.error("createSlotAction insert ERROR:", insertError);
      return;
    }

    // perpiešiam dashboard
    revalidatePath("/dashboard/ads");
  } catch (err) {
    console.error("createSlotAction FATAL:", err);
  }
}
