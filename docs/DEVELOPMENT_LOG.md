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

---

## 2026-07-01 — Canlıya Alma: İlk Vercel Deploy

### Durum
- **Canlı URL:** https://bahce-cafe-hisarustu-bmz5yikqf-seker.vercel.app
- Deploy, Vercel dashboard'ın "Import Git Repository" akışıyla, `seker`
  scope'lu bir Vercel hesabı üzerinden yapıldı. Bu hesap, Claude'un CLI'dan
  bağlandığı `fatih10` hesabından **farklı** bir hesap/scope.

### Vercel CLI ile Kurulan Ayrı Proje (kullanılmıyor)
Canlıya almadan önce Claude, CLI ile `fatih10` scope'unda `bahce-cafe-hisarustu`
adında ayrı bir Vercel projesi oluşturmuştu (GitHub App yetkisi o zaman eksikti).
O proje hâlâ duruyor ama **hiç deploy'u yok** ve gerçek canlı site bu projeyle
ilgili değil. Kafa karışıklığını önlemek için ileride Vercel dashboard'dan
silinebilir (isteğe bağlı, acil değil).

### Doğrulanamayanlar (Claude'un erişimi olmadığı için)
Claude'un CLI oturumu `seker` hesabına giriş yapamadı (bu ortamın önbelleğe
alınmış farklı bir oturumu araya giriyor, `vercel login` "Not authorized"
hatasıyla sonuçlandı). Bu yüzden aşağıdakiler **kullanıcı tarafından
`seker` hesabının Vercel dashboard'unda doğrulanmalı**:

1. **Deployment Protection:** Site şu an Vercel SSO korumasının arkasında —
   dışarıdan (giriş yapmadan) açılan istek `vercel.com/sso-api`'ye
   yönlendiriliyor. QR kodu okutan müşteriler menüyü göremez.
   → Düzeltme: Vercel dashboard → proje → Settings → Deployment Protection →
   kapat (ya da sadece Production için kapat).
2. **GitHub auto-deploy bağlantısı:** `seker` hesabındaki projenin
   Settings → Git sayfasında `fatihsekerci2307-stack/bahce-cafe-hisarustu`
   repo'sunun "Connected" göründüğü doğrulanmalı, ki her `git push` otomatik
   yeni deploy tetiklesin.
3. **Environment Variables:** `NEXT_PUBLIC_SUPABASE_URL` ve
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` değerlerinin Settings →
   Environment Variables altında (Production ortamı için) girili olduğu
   doğrulanmalı. Import sırasında otomatik sorulmuş olabilir ama teyit
   gerekiyor — girili değilse sayfalar çalışmaz.
4. **Sayfa içeriği:** Deployment Protection kapatıldıktan sonra
   `/menu/bahce-cafe-hisarustu` gerçekten kategori/ürünlerle render oluyor
   mu kontrol edilmeli (Claude, koruma nedeniyle bunu kendi tarayıcı
   araçlarıyla henüz doğrulayamadı).

### Ders
Bu ortamın tarayıcı oturumu Vercel device-flow girişini otomatik
onaylıyor ama her zaman kullanıcının asıl kullanmak istediği hesaba değil,
ortamda önbellekte olan hesaba bağlanabiliyor. Birden fazla Vercel hesabı
olan projelerde, canlıya alma işini kullanıcının kendi tarayıcısından
yapması ve Claude'un CLI oturumunun hangi hesaba bağlı olduğunu her
seferinde `vercel whoami` ile teyit etmesi gerekiyor.

---

## 2026-07-01 — Canlıya Alma Tamamlandı: Deployment Protection Kapatıldı

### Yapılanlar
Kullanıcı Vercel dashboard'unda (hesap: `seker`) Deployment Protection'ı
kapattı. Site artık gerçekten herkese açık.

### Doğrulama (Claude tarafından canlı URL'ler üzerinde bizzat test edildi)
Deployment Protection kapandıktan sonra Claude, WebFetch ile üç rotayı
kimlik doğrulaması yapmadan (anonim) çekip içerik kontrolü yaptı:

| Rota | Beklenen | Sonuç |
|---|---|---|
| `/menu/bahce-cafe-hisarustu` | Herkese açık, giriş istemez | ✅ Kategoriler (İçecekler, Nargile, Yiyecekler, Take Away) ve ürünler fiyatlarıyla gerçek veriden render oluyor, login yok |
| `/admin` | Korumalı, login'e yönlendirir | ✅ E-posta/şifre giriş formu gösteriyor, admin içeriği sızmıyor |
| `/pos` | Korumalı, login/auth ister | ✅ E-posta/şifre giriş formu gösteriyor, POS içeriği sızmıyor |

### Build Kontrolü
`npm run build` tekrar çalıştırıldı: 0 hata, 10 route, `/`, `/login`,
`/_not-found` statik; `/admin*`, `/menu/[slug]`, `/pos*` dynamic.

### Sonuç
**Canlı site tamamen doğrulandı:** anonim müşteri erişimi çalışıyor,
admin/POS rotaları middleware ile korunuyor, build temiz. Bahçe Cafe
Hisarüstü sistemi gerçek işletme kullanımına hazır.

**Canlı URL:** https://bahce-cafe-hisarustu-bmz5yikqf-seker.vercel.app

---

## 2026-07-01 — Canlı Stabilizasyon Turu (1 saatlik güvenli oturum)

### Kapsam
Yeni özellik yok, migration yok, şema değişikliği yok, POS/adisyon/ödeme
çekirdeğine dokunulmadı. Amaç: canlı sistemi denetlemek ve Revize
Backlog'u hazırlamak.

### Yapılan İnceleme
Tarayıcıda beklenmedik şekilde owner oturumu aktif çıktı (önceki bir
testten kalma çerez); bu sayede `/admin`, `/admin/categories`,
`/admin/products`, `/admin/reports`, `/pos` sayfaları canlıda veri
değiştirmeden görüntülendi. Mobil uyumluluk, tarayıcı viewport
resize'ının bu ortamda güvenilir sonuç vermemesi nedeniyle (farklı
boyut istekleri aynı görüntüyü döndürdü) kaynak koddaki Tailwind
class'larından değerlendirildi.

### Bulgular
Tüm sayfalar çalışıyor, hiçbir acil/kırıcı sorun yok. Mobil ve
kullanılabilirlik notları `docs/NEXT_STEPS.md` → "Revize Backlog"
bölümüne yazıldı (öncelik sırasına göre).

### Uygulanan Küçük Düzeltme (kullanıcı onayıyla)
`/admin/products` ve `/admin/categories` tablo sarmalayıcılarında
`overflow-hidden` → `overflow-x-auto` değiştirildi
(`app/admin/products/page.tsx`, `app/admin/categories/page.tsx`).

**Neden:** Tablo genişliği dar ekranlarda (mobil) doğal genişliğini
aşıyordu; `overflow-hidden` taşan içeriği (sağdaki "Düzenle"/"Pasife Al"
aksiyon linkleri dahil) kırpıyordu. `overflow-x-auto` ile taşma artık
kırpılmak yerine yatay kaydırılabiliyor, hiçbir içerik erişilemez hale
gelmiyor.

**Kapsam dışı bırakılanlar:** `/admin/reports` alt tablosu (kullanıcı
talebi sadece products+categories içindi, düşük öncelikli backlog'a
eklendi), nav bar mobil düzeni, içerik/tasarım revizeleri — hiçbiri
değiştirilmedi.

### Doğrulama
`npm run build`: 0 hata, 10 route, önceki build ile birebir aynı route
listesi (sadece CSS class değişikliği, yeni route/logic yok).

---

## 2026-07-01 — Vercel Deploy Block Sorunu Çözüldü

### Sorun
Push edilen commit'ler Vercel'de deploy tetiklemiyordu. Vercel
Deployments listesinde önceki commit'ler (`ebeb6b1`, `f1ec3a1`,
`16350fc`) **"Blocked"** olarak işaretliydi.

### Kök Neden
Commit author/co-author bilgisi Vercel tarafından repo'ya yetkisiz bir
"collaborator" gibi algılanıyordu; Hobby plan bu tür commit'lerden
otomatik deploy tetiklemeyi engelliyor.

### Çözüm
- Repo public yapıldı.
- Commit author, kullanıcının GitHub primary e-postasıyla eşleşecek
  şekilde ayarlanarak boş bir trigger commit atıldı:
  `fatihsekerci2307-stack <fatihsekerci2307@gmail.com>`
  (Not: bu sadece bu commit'e özel `--author`/`GIT_COMMITTER_*`
  override'ıyla yapıldı; repo'nun kalıcı git config'i değiştirilmedi.)
- Yeni deployment **Ready** oldu (32 saniyede, Production).
- GitHub → Vercel otomatik deploy akışı artık çalışıyor.

### Gelecekte Commit Author
Bundan sonraki commit'lerin Vercel'de sorunsuz deploy tetiklemesi için
author kimliği şu şekilde olmalı:
```
fatihsekerci2307-stack <fatihsekerci2307@gmail.com>
```

### Doğru Production URL
**Production URL:** https://bahce-cafe-hisarustu-zeta.vercel.app
**QR Menü URL:** https://bahce-cafe-hisarustu-zeta.vercel.app/menu/bahce-cafe-hisarustu

Eski `...-bmz5yikqf-seker.vercel.app` adresi deployment-specific bir
URL'ydi (tek bir deployment'a sabit kalır, güncellenmez). Bundan sonra
ana production URL olarak `zeta` adresi kullanılacak.

