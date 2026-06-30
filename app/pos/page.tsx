export default function PosPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Adisyon Paneli</h1>
        <span className="text-blue-200 text-sm">Bahçe Cafe Hisarüstü</span>
      </div>

      {/* Placeholder */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          <p className="text-lg font-medium">POS / Adisyon Ekranı</p>
          <p className="text-sm mt-4 text-gray-300">
            M5 milestoneunda masa listesi ve adisyon ekranı burada açılacak.
          </p>
        </div>

        {/* Masa kartı placeholder'ları */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-green-100 border-2 border-green-300 rounded-2xl p-6 text-center"
            >
              <p className="text-green-800 font-bold text-lg">Masa {n}</p>
              <p className="text-green-600 text-sm mt-1">Boş</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
