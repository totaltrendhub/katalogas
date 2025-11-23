// lib/authActions.js

"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

/* REGISTER */
export async function registerAction(formData) {
  const email = (formData.get("email") || "").toString().trim();
  const password = (formData.get("password") || "").toString();

  if (!email || !password) {
    return { error: "Įvesk el. paštą ir slaptažodį." };
  }

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
    },
  });

  if (error) {
    console.error("registerAction ERROR:", error);
    return { error: error.message };
  }

  redirect("/auth/login");
}

/* LOGIN */
export async function loginAction(formData) {
  const email = (formData.get("email") || "").toString().trim();
  const password = (formData.get("password") || "").toString();

  if (!email || !password) {
    return { error: "Įvesk el. paštą ir slaptažodį." };
  }

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("loginAction ERROR:", error);
    return { error: error.message || "Nepavyko prisijungti." };
  }

  redirect("/dashboard");
}

/* LOGOUT */
export async function logoutAction() {
  const supabase = await supabaseServer();

  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("logoutAction ERROR:", err);
  }

  redirect("/auth/login");
}

/* SESSION */
export async function getUserSession() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("getUserSession ERROR:", error);
    return null;
  }

  return data?.user || null;
}

/* RESET PASSWORD */
export async function resetPasswordAction(formData) {
  const email = (formData.get("email") || "").toString().trim();
  if (!email) return { error: "Įvesk el. paštą." };

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/new-password`,
  });

  if (error) {
    console.error("resetPasswordAction ERROR:", error);
    return { error: error.message };
  }

  return { success: true };
}

/* UPDATE PASSWORD */
export async function updatePasswordAction(formData) {
  const newPassword = (formData.get("password") || "").toString();

  if (!newPassword) {
    return { error: "Įvesk naują slaptažodį." };
  }

  const supabase = await supabaseServer();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("updatePasswordAction ERROR:", error);
    return { error: error.message };
  }

  redirect("/dashboard");
}
