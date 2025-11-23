// app/dashboard/layout.jsx

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admino valdymo skydelis</h1>
            <p className="text-xs text-gray-500">
              Prisijungęs: {profile?.email || user.email}
            </p>
          </div>

          <nav className="flex gap-2 text-xs">
            <a
              href="/dashboard"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
            >
              Pagrindinis
            </a>
            <a
              href="/dashboard/ads"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
            >
              Reklamos
            </a>
            <a
              href="/dashboard/articles"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-100"
            >
              Straipsniai
            </a>
          </nav>
        </header>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          {children}
        </div>
      </main>
    </div>
  );
}
