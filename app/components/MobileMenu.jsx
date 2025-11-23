// app/components/MobileMenu.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/authActions";

// Statinis kategorijų sąrašas mobile meniu (tokie pat slugai kaip DB)
const MOBILE_CATEGORIES = [
  { slug: "informacija", name: "Informacija" },
  { slug: "iniciatyvos", name: "Iniciatyvos" },
  { slug: "kultura-menas", name: "Kultūra ir menas" },
  { slug: "nekilnojamas-turtas", name: "Nekilnojamas turtas" },
  { slug: "parduotuves", name: "Parduotuvės" },
  { slug: "paslaugos", name: "Paslaugos" },
  { slug: "pramogos", name: "Pramogos" },
  { slug: "sportas-pomegiai", name: "Sportas ir pomėgiai" },
  { slug: "sveikata-grozis", name: "Sveikata ir Grožis" },
  { slug: "seima-vaikai", name: "Šeima ir vaikai" },
  { slug: "technologijos", name: "Technologijos" },
  { slug: "transportas", name: "Transportas" },
  { slug: "turizmas-keliones", name: "Turizmas ir kelionės" },
  { slug: "verslas-finansai", name: "Verslas ir finansai" },
  { slug: "ziniasklaida", name: "Žiniasklaida" },
];

export default function MobileMenu({ user }) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      {/* Burger mygtukas – tik mobile */}
      <button
        type="button"
        className="sm:hidden inline-flex items-center justify-center rounded-full border border-gray-300 p-2 text-gray-700"
        aria-label="Atidaryti meniu"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">Meniu</span>
        <div className="space-y-0.5">
          <span className="block h-[2px] w-5 bg-gray-800" />
          <span className="block h-[2px] w-5 bg-gray-800" />
          <span className="block h-[2px] w-5 bg-gray-800" />
        </div>
      </button>

      {/* Overlay + šoninis meniu */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Foninis juodas sluoksnis */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Uždaryti meniu"
            onClick={close}
          />

          {/* Šoninis panelis */}
          <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col">
            {/* Viršus */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold">Meniu</p>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700"
                onClick={close}
                aria-label="Uždaryti meniu"
              >
                ✕
              </button>
            </div>

            {/* Scrollinamas turinys */}
            <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
              {/* Kategorijos */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Kategorijos
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={close}
                    className="block rounded-lg px-2 py-1.5 font-semibold text-blue-700 hover:bg-gray-50"
                  >
                    VIP zona
                  </Link>
                  {MOBILE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/${cat.slug}`}
                      onClick={close}
                      className="block rounded-lg px-2 py-1.5 text-gray-800 hover:bg-gray-50"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <hr className="my-3 border-gray-200" />

              {/* Puslapiai */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Puslapiai
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/kainos"
                    onClick={close}
                    className="block rounded-lg px-2 py-1.5 text-gray-800 hover:bg-gray-50"
                  >
                    Kainos
                  </Link>
                  <Link
                    href="/kontaktai"
                    onClick={close}
                    className="block rounded-lg px-2 py-1.5 text-gray-800 hover:bg-gray-50"
                  >
                    Kontaktai
                  </Link>
                  <Link
                    href="/apie-kataloga"
                    onClick={close}
                    className="block rounded-lg px-2 py-1.5 text-gray-800 hover:bg-gray-50"
                  >
                    Apie katalogą
                  </Link>
                </nav>
              </div>

              {/* Admin blokas, jei prisijungęs */}
              {user && (
                <>
                  <hr className="my-3 border-gray-200" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Administravimas
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Prisijungęs: <span className="font-semibold">{user.email}</span>
                    </p>
                    <Link
                      href="/dashboard"
                      onClick={close}
                      className="inline-flex mt-2 items-center justify-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                    >
                      Admin
                    </Link>
                    <form action={logoutAction} className="mt-2">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                        onClick={close}
                      >
                        Atsijungti
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
