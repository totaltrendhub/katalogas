// app/components/MobileMenu.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * categories: [{ id, name, slug }]
 */
export default function MobileMenu({ categories }) {
  const [open, setOpen] = useState(false);

  // Uždrausti body scroll, kai meniu atidarytas
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  return (
    <>
      {/* Burger mygtukas */}
      <button
        type="button"
        aria-label="Atidaryti meniu"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
      >
        <span className="sr-only">Meniu</span>
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {/* FULL-SCREEN OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-white">
          {/* Viršutinė juosta */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm font-semibold">Meniu</span>
            <button
              type="button"
              aria-label="Uždaryti meniu"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Scrollinamas turinys */}
          <div className="h-[calc(100vh-56px)] overflow-y-auto px-4 py-4 space-y-6 text-sm">
            {/* Kategorijos */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Kategorijos
              </p>
              <div className="mt-2 flex flex-col space-y-1">
                {/* VIP visada pirmas */}
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-50"
                >
                  <span>VIP zona</span>
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-[2px] text-[11px] font-bold text-white">
                    VIP
                  </span>
                </Link>

                {/* Kitos kategorijos */}
                {categories
                  .filter((c) => c.slug !== "vip-zona")
                  .sort((a, b) =>
                    a.name.localeCompare(b.name, "lt-LT")
                  )
                  .map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-2 py-2 hover:bg-gray-50"
                    >
                      {cat.name}
                    </Link>
                  ))}
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Puslapiai */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Puslapiai
              </p>
              <div className="mt-2 flex flex-col space-y-1">
                <Link
                  href="/kainos"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-gray-50"
                >
                  Kainos
                </Link>
                <Link
                  href="/kontaktai"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-gray-50"
                >
                  Kontaktai
                </Link>
                <Link
                  href="/apie-kataloga"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 hover:bg-gray-50"
                >
                  Apie katalogą
                </Link>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
