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

---

## 2026-07-01 — M5: Garson POS / Adisyon Paneli

### Yapılanlar
- `app/pos/layout.tsx` oluşturuldu: auth + rol kontrolü, sticky header, logout butonu.
- `app/pos/page.tsx` yeniden yazıldı: alanlar başlık, masalar grid (boş=gri, dolu=kırmızı).
- `app/pos/table/[tableId]/page.tsx` oluşturuldu:
  - Masada açık adisyon yoksa "Adisyon Aç" butonu.
  - Açık adisyon varsa: kalem listesi (ürün adı, adet, fiyat, × kaldır), toplam.
  - Ödeme yöntemi seçimi (Nakit/Kart/Diğer) + "Adisyonu Kapat" butonu.
  - Ürün picker: kategori sekmeleri + ürün kartları (dokunca ekler).
- `app/pos/table/[tableId]/actions.ts` oluşturuldu:
  - `openBill`: bills tablosuna yeni kayıt.
  - `addItem`: product snapshot (isim + fiyat) ile bill_items'a ekler.
  - `removeItem`: kalem siler (RLS açık adisyon kontrolü yapar).
  - `closeBill`: bill'i closed yapar, payments tablosuna kayıt, /pos'a yönlendirir.

### Teknik Notlar
- `.maybeSingle()` ile açık adisyon kontrolü (single() hata fırlatır, maybeSingle() null döner).
- Tüm Server Actions M3 pattern'ı izliyor: `as never` cast, `revalidatePath` + opsiyonel redirect.
- RLS güvenliği: `business_id` her sorguda filtre olarak kullanılıyor; client'tan gelen form verisi sadece `table_id`, `bill_id`, `item_id` gibi ID'ler.
- Build başarılı: `/pos` ve `/pos/table/[tableId]` ƒ dynamic route olarak oluştu.

---

## 2026-07-01 — M6: Gün Sonu Raporu

### Yapılanlar
- `app/admin/layout.tsx`: nav'a "Raporlar" linki eklendi.
- `app/admin/reports/page.tsx` oluşturuldu:
  - Tarih filtresi (GET form, `?date=YYYY-MM-DD`, varsayılan bugün).
  - Özet kartları: toplam ciro, kapanan adisyon sayısı, nakit/kart/diğer dağılımı.
  - Seçili tarihte kapanan adisyonların tablosu: masa adı, kapanış saati, ödeme yöntemi, tutar.

### Teknik Notlar
- Rol koruması ayrıca yazılmadı — `/admin/reports`, `app/admin/layout.tsx`'in mevcut owner/admin kontrolü altında (staff zaten reddediliyor).
- Ciro hesaplaması `payments` tablosundan yapılıyor (bills değil) — gerçekte tahsil edilen tutarın kaynağı bu.
- Tarih filtresi native HTML GET form ile yapılıyor; Server Component searchParams'ı okuyor, ekstra client JS gerekmiyor.
- Build başarılı: `/admin/reports` ƒ dynamic route olarak oluştu.

---

## 2026-07-01 — KRİTİK DÜZELTME: Eksik Tablo Erişim İzinleri (GRANT)

### Sorun
Kullanıcı "linkler açılmıyor" diye bildirdi. Tarayıcı ile canlı test edilince
`/menu/bahce-cafe-hisarustu` 404 döndü — halbuki doğru slug ile veri vardı.

### Kök Neden
İlk migration'da (M2) RLS policy'leri doğru tanımlanmıştı ama Postgres'in
temel tablo erişim izinleri (`GRANT`) hiç verilmemişti. RLS, GRANT olmadan
devreye girmiyor; `anon` ve `authenticated` rolleri her sorguda
"permission denied for table X" alıyordu (sessizce `null` dönüyordu,
sayfa kodu da bunu 404/boş olarak yorumluyordu).

### Düzeltme
- `supabase/migrations/20260701000000_fix_table_grants.sql` eklendi:
  - `anon` → `businesses`, `categories`, `products` üzerinde `SELECT`.
  - `authenticated` → her tabloda RLS policy'lerinin izin verdiği komutlarla
    birebir eşleşen `GRANT` (`areas`, `tables`, `categories`, `products`:
    tam CRUD; `bills`: select/insert/update; `bill_items`: select/insert/delete;
    `payments`: select/insert; `businesses`: select/update; `business_users`:
    select/insert/update).
  - Kullanıcıdan özel onay alındıktan sonra `supabase db push --linked` ile
    canlı veritabanına uygulandı.
- Node ile anon key kullanan tek seferlik bir tanı scripti (`diag.mjs`)
  hatayı doğrulamak için kullanıldı, sonra silindi.

### Doğrulama (Claude tarafından tarayıcıda bizzat test edildi)
- `/menu/bahce-cafe-hisarustu` → gerçek kategoriler ve ürünlerle render oluyor.
- `/menu/olmayan-slug` → doğru şekilde 404.
- `/admin`, `/admin/categories`, `/admin/reports` → oturumlu kullanıcıyla
  gerçek veri gösteriyor.
- `/pos` → masa grid'i doğru (Boş/Dolu renk kodlaması).
- Tam POS akışı: masaya adisyon aç → ürün ekle → kapat (Kart, ₺60) →
  masa "Boş"a döndü → `/admin/reports`'ta doğru şekilde listelendi
  (K1, 04:10, Kart, ₺60).
- Test verisi olarak oluşan 1 adet kapalı adisyon (K1, ₺60), kullanıcı
  onayıyla `supabase db query --linked` ile canlı veritabanından silindi
  (`bill_items` ve `payments` `ON DELETE CASCADE` ile otomatik temizlendi).
  Rapor sayfasında ₺0 / "kapalı adisyon yok" olarak doğrulandı.

### Ders
Ham SQL migration ile tablo oluşturulduğunda Supabase Dashboard'un
otomatik uyguladığı varsayılan GRANT'ler uygulanmıyor. Bundan sonraki
migration'larda RLS policy'leriyle birlikte GRANT ifadeleri de yazılacak.

---

## 2026-07-01 — Toparlama: Test Verisi Temizliği + Dev Cache Sorunu

### Yapılanlar
- K1 masasındaki test adisyonu (₺60) kullanıcı onayıyla canlı veritabanından
  silindi (`DELETE FROM bills WHERE table_id = ... AND status = 'closed'`,
  CASCADE ile `bill_items`/`payments` da temizlendi).
- `/admin/reports` sayfası yeniden kontrol edildi: ₺0, "Bu tarihte kapalı
  adisyon yok" — temizlik doğrulandı.
- Test sırasında dev server'ın `.next` cache'i bozuldu (Windows'ta sık
  görülen bir Next.js dev-mode sorunu: "Cannot find module './833.js'" gibi
  hatalar, sadece dev server'ı etkiliyor, üretim build'ini etkilemiyor).
  `.next` klasörü silinip dev server temiz yeniden başlatıldı, sorun düzeldi.
- `npm run build` tekrar çalıştırıldı: 0 hata, 10 route başarıyla derlendi.

### Sonuç
Kod tarafında herhangi bir hata bulunmadı; yapılan tek düzeltme dev-only
cache temizliğiydi. Uygulama kodu değişmedi.

## Sonraki Milestone
**M7:** Instagram/Maps/Wi-Fi ayarları (`/admin/settings`) + müşteri menüsünde mini oyunlar.

---

## 2026-07-01 — Release Checkpoint: M0–M6 Canlıya Alma Hazırlığı

### Durum Özeti
M0–M6 aşamalarının tamamı tamamlandı, Claude tarafından canlı tarayıcıda
uçtan uca test edildi ve son commit (`adfcf7e`) GitHub `main` branch'ine
push edildi. Kod tabanı Vercel'e deploy edilmeye hazır.

### Tamamlanan Rotalar
| Rota | Açıklama | Durum |
|---|---|---|
| `/login` | Supabase Auth girişi | ✅ |
| `/admin` | Owner/admin korumalı panel | ✅ |
| `/admin/categories` | Kategori CRUD | ✅ |
| `/admin/products` | Ürün CRUD | ✅ |
| `/admin/reports` | Gün sonu raporu | ✅ |
| `/menu/[slug]` | Anonim QR menüsü | ✅ |
| `/pos` | Masa grid (boş/dolu) | ✅ |
| `/pos/table/[tableId]` | Adisyon aç/ürün ekle/kapat | ✅ |

### Veritabanı Durumu
- Supabase projesi: `wlwaiyejdxchgqklketz`
- 2 migration uygulandı (M2 schema+seed + M0-M6 GRANT düzeltmesi)
- 9 tablo, 30 RLS policy, tüm GRANT'ler aktif
- Canlı veri: Bahçe Cafe Hisarüstü işletmesi, 5 alan, 17 masa, 4 kategori, 18 ürün
- Test verisi temizlendi, veritabanı gerçek kullanıma hazır

### Build Sonucu (son kontrol)
```
npm run build → 0 TypeScript hatası, 10 route, tüm sayfalar ƒ dynamic
```

### Güvenlik Kontrolü
- `.env.local` git'e commit edilmedi ✅ (.gitignore'da)
- Sadece `NEXT_PUBLIC_*` prefixli anahtarlar kullanılıyor (secret/service_role yok) ✅
- `.env.example` placeholder değerlerle GitHub'da (gerçek key yok) ✅

### Vercel İçin Gereken Environment Variables
Vercel dashboard → Project → Settings → Environment Variables'a girilecek:
```
NEXT_PUBLIC_SUPABASE_URL          = https://wlwaiyejdxchgqklketz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = <.env.local dosyasındaki değer>
```
Bu iki değer `NEXT_PUBLIC_` prefixlidir; tarayıcıya açıktır, secret değildir.
Vercel'e girmek güvenlidir.

### Vercel Canlıya Alma Adımları
1. vercel.com → "Add New Project"
2. GitHub repo `bahce-cafe-hisarustu` seçilir
3. Framework: Next.js (otomatik algılanır)
4. Environment Variables'a iki key girilir (yukarıdaki tablo)
5. "Deploy" tıklanır — Vercel `npm run build` çalıştırır
6. Deploy sonrası `/menu/bahce-cafe-hisarustu` canlı URL'den kontrol edilir
7. Supabase dashboard → Authentication → URL Configuration →
   "Redirect URLs"a Vercel domain eklenir (örn. `https://bahce-cafe.vercel.app/**`)
8. Özel domain bağlamak istersen Vercel → Domains → ekle

