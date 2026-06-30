interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-green-800 text-white p-6 text-center">
        <h1 className="text-2xl font-bold">Bahçe Cafe Hisarüstü</h1>
        <p className="text-green-200 text-sm mt-1">Nargile Cafe &amp; Menü</p>
      </div>

      {/* Placeholder içerik */}
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
          <p className="text-lg font-medium">Müşteri QR Menüsü</p>
          <p className="text-sm mt-2">
            Slug: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
          </p>
          <p className="text-sm mt-4 text-gray-300">
            M4 milestoneunda ürünler ve kategoriler burada görünecek.
          </p>
        </div>

        {/* Sosyal buton placeholder'ları */}
        <div className="grid grid-cols-3 gap-3">
          <button className="p-4 bg-pink-100 rounded-xl text-pink-700 text-sm font-medium">
            Instagram
          </button>
          <button className="p-4 bg-blue-100 rounded-xl text-blue-700 text-sm font-medium">
            Konum
          </button>
          <button className="p-4 bg-purple-100 rounded-xl text-purple-700 text-sm font-medium">
            Wi-Fi
          </button>
        </div>
      </div>
    </main>
  );
}
