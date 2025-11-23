// app/components/MobileMenu.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/authActions";

export default function MobileMenu({ user, categories }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger mygtukas, rodomas tik mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:hidden"
        aria-label="Atidaryti meniu"
      >
        <span className="mr-2">Meniu</span>
        <span className="flex flex-col gap-[3px]">
          <span className="h-[2px] w-4 bg-gray-700 rounded-full" />
          <span className="h-[2px] w-4 bg-gray-700 rounded-full" />
          <span className="h-[2px] w-4 bg-gray-700 rounded-full" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Pusiau permatomas fonas */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Pats meniu panelis */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl">
            {/* Viršutinė juosta */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-semibold text-gray-900">
                Meniu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                aria-label="Uždaryti meniu"
              >
                ×
              </button>
            </div>

            {/* Turinys */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 text-sm">
              {/* Kategorijos */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Kategorijos
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50 text-gray-900"
                  >
                    <span>VIP zona</span>
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-[2px] text-[11px] font-bold text-white">
                      VIP
                    </span>
                  </Link>

                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-2 py-1.5 hover:bg-gray-50 text-gray-800"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Puslapiai */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Puslapiai
                </p>
                <nav className="space-y-1">
                  <Link
                    href="/kainos"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-1.5 hover:bg-gray-50"
                  >
                    Kainos
                  </Link>
                  <Link
                    href="/apie-kataloga"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-1.5 hover:bg-gray-50"
                  >
                    Apie katalogą
                  </Link>
                  <Link
                    href="/kontaktai"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-1.5 hover:bg-gray-50"
                  >
                    Kontaktai
                  </Link>
                </nav>
              </div>

              {/* Admin dalis, jei prisijungęs */}
              {user && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Admin zona
                  </p>
                  <p className="text-[11px] text-gray-500 break-all">
                    {user.email}
                  </p>
                  <nav className="space-y-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white text-center hover:bg-black"
                    >
                      Admin
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="mt-1 w-full rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                      >
                        Atsijungti
                      </button>
                    </form>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
