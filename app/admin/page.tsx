import Link from "next/link";

const adminLinks = [
  { href: "/admin/categories", label: "Kategoriler", color: "bg-blue-50 text-blue-700" },
  { href: "/admin/products", label: "Ürünler & Fiyatlar", color: "bg-green-50 text-green-700" },
  { href: "/admin/tables", label: "Masalar & Alanlar", color: "bg-yellow-50 text-yellow-700" },
  { href: "/admin/settings", label: "İşletme Ayarları", color: "bg-purple-50 text-purple-700" },
  { href: "/admin/reports", label: "Raporlar", color: "bg-red-50 text-red-700" },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Paneli</h1>
        <span className="text-gray-400 text-sm">Bahçe Cafe Hisarüstü</span>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <p className="text-gray-500 text-sm">
          M3 milestoneunda bu ekranlar aktif olacak.
        </p>

        <div className="grid gap-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block p-4 rounded-xl font-medium ${link.color} hover:opacity-80 transition`}
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
