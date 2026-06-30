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
- Node.js v24.18.0 kuruldu, PATH'e eklendi.
- `npm install` çalıştırıldı — 359 paket yüklendi.
- Next.js 15.5.19 (güvenli sürüm) kullanılıyor.
- `npm run dev` ile proje `localhost:3000`'de çalıştırıldı, tüm sayfalar doğrulandı.
- `.env.local` oluşturuldu (Supabase public key'leri içeriyor, GitHub'a gitmez).
- Supabase tabloları henüz oluşturulmadı — M2'de yapılacak.

---

## 2026-06-30 — M2 Hazırlık: Veritabanı Planı

### Yapılanlar
- `docs/M2_DATABASE_PLAN.md` ve `docs/M2_DATABASE_PLAN.sql` oluşturuldu.
- 9 tablo, index'ler, RLS enable, yardımcı fonksiyon ve tüm policy'ler taslaklandı.
- Seed verisi (Bahçe Cafe areas, tables, categories, products) taslaklandı.
- İlk owner kullanıcısı bağlama adımları belgelendi.

### Düzeltmeler ve Güvenlik İyileştirmeleri
- `bills`: aynı masada birden fazla açık adisyonu önleyen partial unique index eklendi.
- `bills INSERT policy`: `table_id`'nin aynı işletmeye ait aktif masaya ait olduğu doğrulanıyor.
- `bill_items INSERT policy`: `bill_id`'nin aynı `business_id`'ye ait ve açık adisyon olduğu doğrulanıyor.
- `bill_items DELETE policy`: sadece açık adisyon kalemlerinin silinebileceği kısıtlandı.
- `payments INSERT policy`: `bill_id`'nin aynı `business_id`'ye ait olduğu doğrulanıyor.
- `DECISIONS.md`'e KARAR-006 eklendi: public QR policy kapsamı ve ileride view/RPC planı.

### Sonraki Adım
**M2 uygulaması:** Plan onaylandıktan sonra Supabase SQL Editor'da çalıştırılacak.

---

## Sonraki Milestone
**M2:** Supabase veritabanı tabloları, RLS politikaları ve örnek Bahçe Cafe verileri.
