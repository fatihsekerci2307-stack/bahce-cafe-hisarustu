export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Giriş Yap</h1>
          <p className="text-gray-500 text-sm mt-1">Bahçe Cafe Hisarüstü</p>
        </div>

        {/* Form placeholder — M2'de Supabase Auth bağlanacak */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <input
              type="email"
              disabled
              placeholder="ornek@mail.com"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-400 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              disabled
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-400 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <button
            disabled
            className="w-full bg-gray-800 text-white rounded-lg p-3 font-medium opacity-50 cursor-not-allowed"
          >
            Giriş — M2'de aktif olacak
          </button>
        </div>
      </div>
    </main>
  );
}
