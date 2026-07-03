import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/types";
import { updateSettings } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const { error, success } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bizUser } = await supabase
    .from("business_users")
    .select("business_id, role")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .single() as { data: { business_id: string; role: string } | null; error: unknown };

  if (!bizUser) {
    return <p className="text-center text-red-500 py-16">İşletme bulunamadı.</p>;
  }

  if (bizUser.role !== "owner") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        Bu sayfaya sadece işletme sahibi (owner) erişebilir.
      </div>
    );
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", bizUser.business_id)
    .single() as { data: Business | null; error: unknown };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-500 text-sm mt-1">
          Instagram, Google Maps, Wi-Fi, telefon, adres ve çalışma saatleri — müşteri menüsünde gösterilir
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          {error === "forbidden"
            ? "Bu işlem için işletme sahibi (owner) yetkisi gerekiyor."
            : "Kaydetme başarısız oldu. Lütfen tekrar deneyin."}
        </p>
      )}
      {success && (
        <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
          Ayarlar kaydedildi.
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <form action={updateSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram Linki
            </label>
            <input
              name="instagram_url"
              type="url"
              defaultValue={business?.instagram_url ?? ""}
              placeholder="https://instagram.com/..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Maps Linki
            </label>
            <input
              name="google_maps_url"
              type="url"
              defaultValue={business?.google_maps_url ?? ""}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wi-Fi Ağ Adı
            </label>
            <input
              name="wifi_name"
              defaultValue={business?.wifi_name ?? ""}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wi-Fi Şifresi
            </label>
            <input
              name="wifi_password"
              defaultValue={business?.wifi_password ?? ""}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <input
              name="phone"
              defaultValue={business?.phone ?? ""}
              placeholder="0532 760 52 88"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adres
            </label>
            <input
              name="address"
              defaultValue={business?.address ?? ""}
              placeholder="Rumeli Hisarı, Nispetiye Cd No:99/C, Sarıyer/İstanbul"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Çalışma Saatleri
            </label>
            <input
              name="hours_text"
              defaultValue={business?.hours_text ?? ""}
              placeholder="Her gün 07:00 – 04:00"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
            />
          </div>
          <button
            type="submit"
            className="bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition"
          >
            Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}
