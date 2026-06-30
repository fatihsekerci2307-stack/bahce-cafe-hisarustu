import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Bahçe Cafe Hisarüstü
        </h1>
        <p className="text-gray-500">Sistem Giriş Noktası</p>

        <div className="grid gap-3 mt-8">
          <Link
            href="/menu/bahce-cafe-hisarustu"
            className="block p-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            Müşteri Menüsü →
          </Link>
          <Link
            href="/pos"
            className="block p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Adisyon Paneli (POS) →
          </Link>
          <Link
            href="/admin"
            className="block p-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition"
          >
            Admin Paneli →
          </Link>
        </div>
      </div>
    </main>
  );
}
