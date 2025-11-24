// app/components/MobileMenuClient.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/authActions";

export default function MobileMenuClient({ categories, hasUser, userEmail }) {
  const [open, setOpen] = useState(false);

  const vipCategory =
    categories.find((c) => c.slug === "vip-zona") || null;
  const otherCategories = categories
    .filter((c) => c.slug !== "vip-zona")
    .sort((a, b) => a.name.localeCompare(b.name, "lt-LT"));

  return (
    <>
      {/* Mygtukas header’yje */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        aria-label="Atidaryti meniu"
      >
        <span className="mr-2">Meniu</span>
        <span className="flex flex-col justify-between h-3">
          <span className="block h-[2px] w-3 bg-gray-700 rounded" />
          <span className="block h-[2px] w-3 bg-gray-700 rounded" />
          <span className="block h-[2px] w-3 bg-gray-700 rounded" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
          {/* Viršutinė juosta */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-base font-semibold text-gray-900">
              Meniu
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700"
              aria-label="Uždaryti meniu"
            >
              ✕
            </button>
          </div>

          {/* Turinys */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-6">
            {/* Kategorijos */}
            <section>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Kategorijos
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50"
                >
                  <span>VIP zona</span>
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-[1px] text-[10px] font-semibold text-white">
                    VIP
                  </span>
                </Link>

                {otherCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-1.5 hover:bg-gray-50"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* Puslapiai */}
            <section className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Puslapiai
              </p>
              <div className="mt-3 space-y-1 text-sm">
                <Link
                  href="/kainos"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-1.5 hover:bg-gray-50"
                >
                  Kainos
                </Link>
                <Link
                  href="/kontaktai"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-1.5 hover:bg-gray-50"
                >
                  Kontaktai
                </Link>
                <Link
                  href="/apie-kataloga"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-1.5 hover:bg-gray-50"
                >
                  Apie katalogą
                </Link>
              </div>
            </section>

            {/* Admin blokas – jei prisijungęs */}
            {hasUser && (
              <section className="border-t border-gray-100 pt-4 space-y-2">
                {userEmail && (
                  <p className="text-[11px] text-gray-500">
                    Prisijungęs:{" "}
                    <span className="font-medium text-gray-800">
                      {userEmail}
                    </span>
                  </p>
                )}

                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-black"
                >
                  Admin
                </Link>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                  >
                    Atsijungti
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
