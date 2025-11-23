// app/auth/login/page.jsx

import { loginAction } from "@/lib/authActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin prisijungimas – Reklamų katalogas",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-6">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Admin zona
          </p>
          <h1 className="text-xl font-bold text-gray-900">Prisijungimas</h1>
          <p className="text-xs text-gray-500">
            Šis puslapis skirtas tik administratoriui.
          </p>
        </header>

        <form action={loginAction} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-700"
            >
              El. paštas
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-700"
            >
              Slaptažodis
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Prisijungti
          </button>
        </form>
      </div>
    </div>
  );
}
