// app/dashboard/settings/invoices/page.jsx

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";
import { getCurrentUser } from "@/lib/getCurrentUser";

export const dynamic = "force-dynamic";

function hasError(err) {
  return !!(err && typeof err === "object" && Object.keys(err).length > 0);
}

// Server action – išsaugoti / atnaujinti invoice_settings
async function saveInvoiceSettings(formData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();

  // admin check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (hasError(profileError)) {
    console.error("saveInvoiceSettings profile ERROR:", profileError);
    redirect("/dashboard/settings/invoices?error=1");
  }

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  const id = (formData.get("id") || "").toString().trim() || null;

  const companyName = (formData.get("companyName") || "")
    .toString()
    .trim();
  const companyCode = (formData.get("companyCode") || "")
    .toString()
    .trim();
  const vatCode = (formData.get("vatCode") || "")
    .toString()
    .trim();
  const address = (formData.get("address") || "")
    .toString()
    .trim();
  const bankName = (formData.get("bankName") || "")
    .toString()
    .trim();
  const bankAccount = (formData.get("bankAccount") || "")
    .toString()
    .trim();
  const email = (formData.get("email") || "")
    .toString()
    .trim();
  const phone = (formData.get("phone") || "")
    .toString()
    .trim();
  const paymentTermsRaw = (formData.get("paymentTermsDays") || "")
    .toString()
    .trim();

  const paymentTermsDays = Number(paymentTermsRaw);
  const safePaymentTerms =
    Number.isFinite(paymentTermsDays) && paymentTermsDays > 0
      ? paymentTermsDays
      : 14;

  if (!companyName || !companyCode) {
    console.error("saveInvoiceSettings: missing required fields");
    redirect("/dashboard/settings/invoices?error=1");
  }

  const payload = {
    company_name: companyName,
    company_code: companyCode,
    vat_code: vatCode || null,
    address: address || null,
    bank_name: bankName || null,
    bank_account: bankAccount || null,
    email: email || null,
    phone: phone || null,
    default_payment_terms_days: safePaymentTerms,
  };

  let upsertData = payload;

  if (id) {
    upsertData = { id, ...payload };
  }

  const { error: upsertError } = await supabase
    .from("invoice_settings")
    .upsert(upsertData, {
      onConflict: "id",
    });

  if (hasError(upsertError)) {
    console.error("saveInvoiceSettings UPSERT ERROR:", upsertError);
    redirect("/dashboard/settings/invoices?error=1");
  }

  revalidatePath("/dashboard/settings/invoices");
  redirect("/dashboard/settings/invoices?success=1");
}

export default async function InvoiceSettingsPage(props) {
  const searchParams = await props.searchParams;
  const success = searchParams?.success || null;
  const error = searchParams?.error || null;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await supabaseServer();

  // admin check
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (hasError(profileError)) {
    console.error("InvoiceSettings profile ERROR:", profileError);
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 py-10 text-center text-red-500">
          Neturi teisių matyti šio puslapio.
        </main>
      </div>
    );
  }

  // Pasiimam vieną settings įrašą – šita lentelė yra "singleton"
  const { data: settings, error: settingsError } = await supabase
    .from("invoice_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (hasError(settingsError)) {
    console.error("InvoiceSettings fetch ERROR:", settingsError);
  }

  const statusMessage =
    success === "1"
      ? "Nustatymai sėkmingai išsaugoti."
      : error === "1"
      ? "Nepavyko išsaugoti nustatymų. Patikrink formą arba serverio logus."
      : null;

  const statusType =
    success === "1" ? "success" : error === "1" ? "error" : null;

  const defaultPaymentTerms =
    typeof settings?.default_payment_terms_days === "number" &&
    settings.default_payment_terms_days > 0
      ? settings.default_payment_terms_days
      : 14;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Sąskaitų nustatymai (pardavėjas)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Čia suvedami tavo rekvizitai, kurie bus rodomi sąskaitose ir
              vėliau naudojami PDF generavimui.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <a
              href="/dashboard/invoices"
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              ← Grįžti į sąskaitas
            </a>
            <a
              href="/dashboard/ads?view=slots"
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Reklamos
            </a>
          </div>
        </header>

        {statusMessage && (
          <div
            className={
              "rounded-xl border px-4 py-2 text-sm " +
              (statusType === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-red-300 bg-red-50 text-red-800")
            }
          >
            {statusMessage}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-5">
          <form action={saveInvoiceSettings} className="space-y-5">
            {/* id – jei egzistuoja */}
            {settings?.id && (
              <input type="hidden" name="id" value={settings.id} />
            )}

            <div className="space-y-1">
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-800"
              >
                Įmonės pavadinimas
              </label>
              <input
                id="companyName"
                name="companyName"
                required
                defaultValue={settings?.company_name || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="companyCode"
                  className="block text-sm font-medium text-gray-800"
                >
                  Įmonės kodas
                </label>
                <input
                  id="companyCode"
                  name="companyCode"
                  required
                  defaultValue={settings?.company_code || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="vatCode"
                  className="block text-sm font-medium text-gray-800"
                >
                  PVM kodas (nebūtinas)
                </label>
                <input
                  id="vatCode"
                  name="vatCode"
                  defaultValue={settings?.vat_code || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
                <p className="text-[11px] text-gray-500">
                  Kadangi nesi PVM mokėtojas, PVM sąskaitose neminėsime –
                  šitas laukas daugiau ateičiai.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-800"
              >
                Adresas
              </label>
              <input
                id="address"
                name="address"
                defaultValue={settings?.address || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="bankName"
                  className="block text-sm font-medium text-gray-800"
                >
                  Bankas
                </label>
                <input
                  id="bankName"
                  name="bankName"
                  defaultValue={settings?.bank_name || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="bankAccount"
                  className="block text-sm font-medium text-gray-800"
                >
                  Sąskaitos numeris (IBAN)
                </label>
                <input
                  id="bankAccount"
                  name="bankAccount"
                  defaultValue={settings?.bank_account || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-800"
                >
                  El. paštas
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings?.email || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-800"
                >
                  Telefonas
                </label>
                <input
                  id="phone"
                  name="phone"
                  defaultValue={settings?.phone || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="paymentTermsDays"
                className="block text-sm font-medium text-gray-800"
              >
                Numatytoji apmokėjimo trukmė (dienomis)
              </label>
              <input
                id="paymentTermsDays"
                name="paymentTermsDays"
                type="number"
                min="1"
                defaultValue={defaultPaymentTerms}
                className="w-full max-w-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              />
              <p className="text-[11px] text-gray-500">
                Pvz. 14 arba 30 dienų – pagal tai bus automatiškai skaičiuojama
                apmokėjimo data, kai generuosime sąskaitą.
              </p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Išsaugoti nustatymus
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
