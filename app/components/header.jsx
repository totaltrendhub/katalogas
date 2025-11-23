// app/components/Header.jsx

import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabaseServer } from "@/lib/supabaseServer";
import { logoutAction } from "@/lib/authActions";
import MobileMenu from "./MobileMenu";

export default async function Header() {
  const user = await getCurrentUser();

  // Kategorijos meniu (VIP įskaičiuosim atskirai)
  const supabase = await supabaseServer();
  const { data: categoriesData, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Header categories ERROR:", error);
  }

  const categories =
    (categoriesData || []).filter((c) => c.slug !== "vip-zona") ?? [];

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Kairė – logotipas */}
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

        {/* Dešinė dalis */}
        <div className="flex items-center gap-3">
          {/* Desktop navigacija */}
          <nav className="hidden sm:flex items-center gap-3 text-sm">
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

          {/* Admin zona desktopui */}
          {user && (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs text-gray-500">{user.email}</span>

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

          {/* Mobile meniu – VISADA, tik sm ir mažiau rodomas (MobileMenu viduje tvarko overlay) */}
          <div className="sm:hidden">
            <MobileMenu user={user} categories={categories} />
          </div>
        </div>
      </div>
    </header>
  );
}
