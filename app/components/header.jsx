// app/components/Header.jsx

import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabaseServer } from "@/lib/supabaseServer";
import MobileMenuClient from "./MobileMenuClient";
import { logoutAction } from "@/lib/authActions";

export default async function Header() {
  const user = await getCurrentUser();

  const supabase = await supabaseServer();
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const categories = categoriesData || [];

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
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

        {/* Desktop navigacija */}
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
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
          </div>

          {/* Admin zona – tik desktop */}
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
        </nav>

        {/* Mobile meniu mygtukas + overlay */}
        <div className="sm:hidden">
          <MobileMenuClient
            categories={categories}
            hasUser={!!user}
            userEmail={user?.email || null}
          />
        </div>
      </div>
    </header>
  );
}
