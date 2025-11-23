// app/not-found.jsx

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          404 • Puslapis nerastas
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          Ups! Šito puslapio neradome.
        </h1>
        <p className="text-sm text-gray-600">
          Galbūt pasikeitė adresas arba tokios kategorijos tiesiog nėra.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Grįžti į pradžią
          </Link>
        </div>
      </div>
    </div>
  );
}
