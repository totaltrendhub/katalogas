// app/components/HeaderClient.jsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/lib/authActions";

export default function HeaderClient({
  vipCategory,
  categories,
  userEmail,
  hasUser,
}) {
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen((v) => !v);
  }

  function close() {
    setOpen(false);
  }

  return (
    <>
      {/* Burger mygtukas */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Atidaryti meniu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <span className="sr-only">Meniu</span>
        <span className="flex flex-col gap-[3px]">
          <span className="h-[2px] w-4 rounded bg-gray-800" />
          <span className="h-[2px] w-4 rounded bg-gray-800" />
          <span className="h-[2px] w-4 rounded bg-gray-800" />
        </span>
      </button>

      {/* Išskleistas meniu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30">
          <div className="absolute right-0 top-0 h-full w-64 max-w-[80%] bg-white shadow-xl flex flex-col">
            {/* Viršus – antraštė + uždarymo mygtukas */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-900">
                Meniu
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Uždaryti meniu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                ✕
              </button>
            </div>

            {/* Turinys */}
            <div className="flex-1 overflow-y-auto px-4 py-3 text-sm">
              {/* Kategorijos */}
              <div className="space-y-1 mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Kategorijos
                </p>

                {vipCategory && (
                  <Link
                    href="/"
                    onClick={close}
                    className="mt-1 flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100"
                  >
                    <span>VIP zona</span>
                    <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-[1px] text-[10px] font-bold text-white">
                      VIP
                    </span>
                  </Link>
                )}

                {(categories || []).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    onClick={close}
                    className="block rounded-lg px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {/* Atskyrimo linija */}
              <hr className="my-3 border-gray-200" />

              {/* Puslapiai */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Puslapiai
                </p>
                <Link
                  href="/kainos"
                  onClick={close}
                  className="block rounded-lg px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                >
                  Kainos
                </Link>
                <Link
                  href="/kontaktai"
                  onClick={close}
                  className="block rounded-lg px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                >
                  Kontaktai
                </Link>
                <Link
                  href="/apie-kataloga"
                  onClick={close}
                  className="block rounded-lg px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-50"
                >
                  Apie katalogą
                </Link>
              </div>

              {/* Admin blokas apačioje, jei prisijungęs */}
              {hasUser && (
                <>
                  <hr className="my-3 border-gray-200" />
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Admin
                    </p>
                    {userEmail && (
                      <p className="text-[11px] text-gray-600 break-all">
                        Prisijungęs kaip{" "}
                        <span className="font-semibold text-gray-800">
                          {userEmail}
                        </span>
                      </p>
                    )}
                    <Link
                      href="/dashboard"
                      onClick={close}
                      className="mt-1 inline-flex w-full items-center justify-center rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      Admin skydelis
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
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
