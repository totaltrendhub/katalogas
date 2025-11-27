// app/components/header.jsx

import Link from "next/link";
import Image from "next/image";
import MobileMenuClient from "./MobileMenuClient";

export default function Header() {
  // Nebetampom DB ir auth – header'is statinis
  const categories = []; // MobileMenuClient gali gauti tuščią masyvą

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

        {/* Desktop navigacija – be jokio admin/login */}
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
        </nav>

        {/* Mobile meniu mygtukas */}
        <div className="sm:hidden">
          <MobileMenuClient
            categories={categories}
            hasUser={false}
            userEmail={null}
          />
        </div>
      </div>
    </header>
  );
}
