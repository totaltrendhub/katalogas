"use client";

import { useState } from "react";
import getSupabaseBrowserClient from "@/lib/supabaseClient";

export default function LogoUpload({
  name = "imageUrl",
  bucket = "ad-logos",
  initialUrl = "",
}) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(initialUrl || "");
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error("LogoUpload upload error:", uploadError);
        setError("Nepavyko įkelti logotipo.");
        setUploading(false);
        return;
      }

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      const publicUrl = publicData?.publicUrl || "";
      setUrl(publicUrl);
    } catch (err) {
      console.error("LogoUpload fatal error:", err);
      setError("Nepavyko įkelti logotipo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* hidden input – šitą paims server action kaip imageUrl */}
      <input type="hidden" name={name} value={url} />

      <label className="block text-sm font-medium text-gray-800">
        Logotipo įkėlimas
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-black"
      />

      {uploading && (
        <p className="text-xs text-gray-500">Keliama... prašome palaukti.</p>
      )}

      {url && !uploading && !error && (
        <div className="flex items-center gap-3">
          <p className="text-xs text-green-600">
            Logotipas įkeltas. Šis URL bus išsaugotas kartu su reklama.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Logo preview"
            className="h-8 w-8 object-contain rounded border border-gray-200 bg-white"
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
