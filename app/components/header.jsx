// app/components/Header.jsx

import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { logoutAction } from "@/lib/authActions";
import { supabaseServer } from "@/lib/supabaseServer";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const user = await getCurrentUser();

  // Kategorijos mobile meniu
  let vipCategory = null;
  let otherCategories = [];

  try {
    const supabase = await supabaseServer();
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error("Header categories ERROR:", categoriesError);
    }

    const allCategories = categoriesData || [];
    vipCategory = allCategories.find((c) => c.slug === "vip-zona") || null;
    otherCategories = allCategories
      .filter((c) => c.slug !== "vip-zona")
      .sort((a, b) => a.name.localeCompare(b.name, "lt-LT"));
  } catch (err) {
    console.error("Header categories FATAL:", err);
  }

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Kairė – logotipas / nuoroda į pradžią */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/elektroninesvizijos-logo.png"
              alt="ELEKTRONINESVIZIJOS.LT logotipas"
              width={220}
              height={40}
              priority
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Dešinė – desktop navigacija + admin zona */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {/* Vieša navigacija (be prisijungimo, be straipsnių) */}
          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full px-3 py-1 text-xs sm:text-sm hover:bg-gray-100"
            >
              VIP zona
            </Link>
            <Link
              href="/kainos"
              className="rounded-full px-3 py-1 text-xs sm:text-sm hover:bg-gray-100"
            >
              Kainos
            </Link>
            <Link
              href="/kontaktai"
              className="rounded-full px-3 py-1 text-xs sm:text-sm hover:bg-gray-100"
            >
              Kontaktai
            </Link>
            <Link
              href="/apie-kataloga"
              className="rounded-full px-3 py-1 text-xs sm:text-sm hover:bg-gray-100"
            >
              Apie katalogą
            </Link>
          </nav>

          {/* Admin zona – rodoma tik jei yra prisijungęs vartotojas */}
          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-gray-500">
                {user.email}
              </span>

              <Link
                href="/dashboard"
                className="rounded-full bg-gray-900 px-3 py-1 text-xs sm:text-sm font-semibold text-white hover:bg-black transition-colors"
              >
                Admin
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full bg-red-500 px-3 py-1 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-colors"
                >
                  Atsijungti
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile – burger meniu */}
        <div className="md:hidden">
          <HeaderClient
            vipCategory={vipCategory}
            categories={otherCategories}
            userEmail={user?.email || null}
            hasUser={!!user}
          />
        </div>
      </div>
    </header>
  );
}
