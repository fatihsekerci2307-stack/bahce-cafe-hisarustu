import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const adminLinks = [
  {
    href: "/admin/categories",
    label: "Kategoriler",
    desc: "Kategori listele, ekle, düzenle",
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    href: "/admin/products",
    label: "Ürünler & Fiyatlar",
    desc: "Ürün listele, ekle, fiyat güncelle",
    color: "bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    href: "/admin/tables",
    label: "Masalar & Alanlar",
    desc: "Masa ve alan yönetimi — yakında",
    color: "bg-yellow-50 text-yellow-600 opacity-60",
  },
];

const ownerLinks = [
  {
    href: "/admin/settings",
    label: "Ayarlar",
    desc: "Instagram, Google Maps, Wi-Fi bilgileri",
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  },
];

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bizUser } = await supabase
    .from("business_users")
    .select("role")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .single() as { data: { role: string } | null; error: unknown };

  const links = bizUser?.role === "owner" ? [...adminLinks, ...ownerLinks] : adminLinks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
        <p className="text-gray-500 text-sm mt-1">Bahçe Cafe Hisarüstü</p>
      </div>
      <div className="grid gap-3 max-w-lg">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block p-4 rounded-xl transition ${link.color}`}
          >
            <div className="font-semibold">{link.label} →</div>
            <div className="text-xs mt-0.5 opacity-75">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
