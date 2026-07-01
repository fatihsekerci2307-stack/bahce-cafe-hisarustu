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

---

## 2026-06-30 — M2 Uygulama: Supabase CLI + Migration

### Yapılanlar
- `supabase init` ile proje CLI yapılandırması oluşturuldu.
- `supabase/migrations/20260630000000_m2_schema_seed.sql` oluşturuldu (ADIM 1–6, BOM'suz UTF-8).
- `supabase link --project-ref wlwaiyejdxchgqklketz` ile remote bağlantı kuruldu.
- `supabase db push --linked` ile migration uygulandı.
  - 9 tablo oluşturuldu.
  - 11 index (partial unique index dahil) eklendi.
  - Tüm tablolarda RLS aktifleştirildi.
  - `auth_user_role_for_business()` fonksiyonu (SET search_path = public) oluşturuldu.
  - 30 RLS policy eklendi.
  - Seed: 5 alan, 17 masa, 4 kategori, 18 ürün eklendi (Business ID: 6493d332-...).
- Owner kullanıcı (fatihsekerci2307@hotmail.com) `business_users` tablosuna eklendi.
  - role = owner, is_active = true, isletme = Bahçe Cafe Hisarüstü ✅

### Teknik Notlar
- Browser/CLI auth sorunu: `supabase login --no-browser` non-TTY ortamda output üretmiyor.
  Çözüm: Kullanıcı kendi terminalinde `npx supabase login` çalıştırdı.
- BOM hatası: PowerShell 5.1 `Set-Content -Encoding UTF8` ile BOM ekliyor.
  Çözüm: `[System.IO.File]::WriteAllText()` ile `UTF8Encoding($false)` kullanıldı.
- ADIM 7 kasıtlı olarak migration dışında bırakıldı; doğrudan SQL query ile uygulandı.

---

## 2026-06-30 — M3: Admin Panel (Kategori + Ürün Yönetimi)

### Yapılanlar
- `middleware.ts` oluşturuldu: `/admin` ve `/pos` rotaları oturum yoksa `/login`'e yönlendirir.
- `app/login/page.tsx`: Fonksiyonel Supabase Auth giriş formu (email + şifre).
- `app/admin/layout.tsx`: Server Component. Oturum + rol kontrolü (`owner`/`admin` gerekli, `staff` reddedilir). Navigasyon ve çıkış butonu.
- `components/admin/LogoutButton.tsx`: Client Component, `supabase.auth.signOut()` çağrısı.
- `app/admin/categories/page.tsx`: Kategori listesi, ekleme formu, düzenleme formu, aktif/pasif toggle.
- `app/admin/categories/actions.ts`: Server Actions — `addCategory`, `updateCategory`, `toggleCategory`. Türkçe karakter slug dönüşümü dahil.
- `app/admin/products/page.tsx`: Ürün listesi, kategori filtresi, ekleme/düzenleme formu, aktif/pasif toggle.
- `app/admin/products/actions.ts`: Server Actions — `addProduct`, `updateProduct`, `toggleProduct`.
- `types/database.generated.ts`: `supabase gen types typescript --linked` ile üretildi. Supabase v2.110.0 ile uyumlu resmi tip yapısı.
- `types/index.ts`: `Database` tipi artık üretilen dosyadan re-export ediliyor.

### Teknik Notlar
- `@supabase/supabase-js` v2.110.0: Manuel `Database` tipi generic inference'ı `never` olarak döndürüyor.
  Çözüm: `createServerClient/createBrowserClient`'tan `<Database>` generic'i kaldırıldı; query sonuçları explicit tip cast ile (`as Category[]`, `as { business_id: string } | null`) yazıldı.
- Supabase JS v2.110.0 ile doğru tip üretimi için: `npx supabase gen types typescript --linked > types/database.generated.ts`
- Build başarılı: 9 static/dynamic rota, middleware 90.2 kB.

---

## 2026-07-01 — M4: Müşteri QR Menü Sayfası

### Yapılanlar
- `app/menu/[slug]/page.tsx` tam olarak geliştirildi.
  - Anonim Supabase erişimi (auth gerektirmiyor).
  - `businesses` tablosundan slug ile işletme çekiliyor; bulunamazsa Next.js `notFound()`.
  - Aktif kategoriler ve aktif ürünler paralel sorguyla çekiliyor.
  - Ürünler kategoriye göre Map ile gruplandırılıyor.
  - Sadece ürünü olan kategoriler gösteriliyor.
- Arayüz: yeşil header, sosyal linkler (Instagram/Konum/Wi-Fi), sticky kategori sekmeleri, ürün kartları (isim + açıklama + fiyat).

### Teknik Notlar
- `as { data: Business | null; error: unknown }` cast pattern M3'ten tutarlı şekilde uygulandı.
- `notFound()` ile Next.js 404 sayfası tetikleniyor (slug bulunamazsa).
- Build başarılı: `/menu/[slug]` ƒ dynamic route olarak oluştu.

## Sonraki Milestone
**M5:** Garson POS/Adisyon paneli (`/pos`).
