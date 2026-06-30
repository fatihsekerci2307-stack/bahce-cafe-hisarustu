# Geliştirme Günlüğü — Bahçe Cafe Hisarüstü

---

## 2026-06-30 — M0+M1: Proje Kurulumu

### Yapılanlar
- Proje hafıza dosyaları oluşturuldu (CLAUDE.md, docs/)
- Next.js 15 App Router proje yapısı kuruldu (package.json, tsconfig.json, next.config.ts)
- Tailwind CSS 3 yapılandırması tamamlandı (tailwind.config.ts, postcss.config.mjs)
- Supabase istemcileri yazıldı (lib/supabase/client.ts, lib/supabase/server.ts)
- Tüm TypeScript tipleri tanımlandı (types/index.ts)
- Boş iskelet sayfalar oluşturuldu:
  - `/` — ana sayfa (linklere yönlendirme)
  - `/menu/bahce-cafe-hisarustu` — müşteri menüsü iskeleti
  - `/pos` — adisyon paneli iskeleti
  - `/admin` — admin paneli iskeleti
  - `/login` — giriş sayfası iskeleti
- `.gitignore` ve `.env.example` dosyaları oluşturuldu
- GitHub repo'ya push yapıldı

### Önemli Kararlar
- RLS mantığı netleştirildi: `auth.uid() ≠ business_id`, `business_users` ara tablosu kullanılacak.
- Masa durumu `status` kolonu yerine açık bill varlığından hesaplanacak.
- `payments` ayrı tablo olacak (parçalı ödeme ve raporlama için).
- `bill_items` içinde fiyat ve ürün adı snapshot olarak saklanacak.

### Teknik Notlar
- Node.js henüz kurulmadı — `npm install` kullanıcı tarafından yapılacak.
- Supabase tabloları henüz oluşturulmadı — M2'de yapılacak.
- `.env.local` kullanıcı tarafından oluşturulacak.

---

## Sonraki Milestone
**M2:** Supabase veritabanı tabloları, RLS politikaları ve örnek Bahçe Cafe verileri.
