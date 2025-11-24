// app/components/MobileMenuClient.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { logoutAction } from "@/lib/authActions";

const CATEGORY_LINKS = [
  { href: "/informacija", label: "Informacija" },
  { href: "/iniciatyvos", label: "Iniciatyvos" },
  { href: "/kultura-menas", label: "Kultūra ir menas" },
  { href: "/nekilnojamas-turtas", label: "Nekilnojamas turtas" },
  { href: "/parduotuves", label: "Parduotuvės" },
  { href: "/paslaugos", label: "Paslaugos" },
  { href: "/pramogos", label: "Pramogos" },
  { href: "/sportas-pomegiai", label: "Sportas ir pomėgiai" },
  { href: "/sveikata-grozis", label: "Sveikata ir Grožis" },
  { href: "/seima-vaikai", label: "Šeima ir vaikai" },
  { href: "/technologijos", label: "Technologijos" },
  { href: "/transportas", label: "Transportas" },
  { href: "/turizmas-keliones", label: "Turizmas ir kelionės" },
  { href: "/verslas-finansai", label: "Verslas ir finansai" },
  { href: "/ziniasklaida", label: "Žiniasklaida" },
];

const PAGE_LINKS = [
  { href: "/", label: "VIP zona" },
  { href: "/kainos", label: "Kainos" },
  { href: "/kontaktai", label: "Kontaktai" },
  { href: "/apie-kataloga", label: "Apie katalogą" },
];

function MobileMenuOverlay({ user, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto">
      {/* Viršutinė juosta */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-900">Meniu</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700"
          aria-label="Uždaryti meniu"
        >
          ✕
        </button>
      </div>

      {/* Turinys */}
      <div className="max-w-6xl mx-auto px-4 py-4 pb-8">
        {/* Kategorijos */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Kategorijos
          </p>

          {/* VIP pirmas */}
          <nav className="space-y-0.5 mb-2">
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-blue-50"
            >
              <span>VIP zona</span>
              <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-[2px] text-[11px] font-bold text-white">
                VIP
              </span>
            </Link>
          </nav>

          <nav className="space-y-0.5">
            {CATEGORY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <hr className="my-4" />

        {/* Puslapiai */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Puslapiai
          </p>
          <nav className="space-y-0.5">
            {PAGE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Admin, jei prisijungęs */}
        {user && (
          <>
            <hr className="my-4" />
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Administravimas
              </p>
              <nav className="space-y-0.5">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                >
                  Admin
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    onClick={onClose}
                    className="mt-1 inline-flex w-auto rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                  >
                    Atsijungti
                  </button>
                </form>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MobileMenuClient({ user }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // kad portalas veiktų tik naršyklėje
  useEffect(() => {
    setMounted(true);
  }, []);

  // užlockinam body scroll, kai meniu atidarytas
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Burger mygtukas – matomas tik mobile */}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:hidden"
        onClick={() => setOpen(true)}
      >
        <span className="mr-2 block h-[1px] w-3 bg-gray-700 relative">
          <span className="absolute -top-1 block h-[1px] w-3 bg-gray-700" />
          <span className="absolute top-1 block h-[1px] w-3 bg-gray-700" />
        </span>
        Meniu
      </button>

      {mounted &&
        open &&
        createPortal(
          <MobileMenuOverlay user={user} onClose={() => setOpen(false)} />,
          document.body
        )}
    </>
  );
}
