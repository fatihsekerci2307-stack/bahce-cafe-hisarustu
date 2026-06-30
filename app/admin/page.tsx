import Link from "next/link";

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

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
        <p className="text-gray-500 text-sm mt-1">Bahçe Cafe Hisarüstü</p>
      </div>
      <div className="grid gap-3 max-w-lg">
        {adminLinks.map((link) => (
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
