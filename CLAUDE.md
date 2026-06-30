# Bahçe Cafe Hisarüstü — Claude Proje Hafızası

## Proje Özeti
Web tabanlı QR menü + adisyon + admin panel sistemi.
İşletme: Bahçe Cafe Hisarüstü (nargile cafe)
Slug: `bahce-cafe-hisarustu`

## Teknoloji Yığını
- **Framework:** Next.js 15 (App Router)
- **Veritabanı:** Supabase (PostgreSQL)
- **Stil:** Tailwind CSS 3
- **Deployment:** Vercel
- **Dil:** TypeScript

## Supabase Env Değişkenleri
- `NEXT_PUBLIC_SUPABASE_URL` — proje URL'si
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — tarayıcı taraflı public key
- ⚠️ Secret/service_role key ASLA istenmesin, kullanılmasın.

## Klasör Yapısı
```
app/                   Next.js sayfaları (App Router)
  menu/[slug]/         Müşteri QR menüsü
  pos/                 Garson adisyon paneli
  admin/               Admin yönetim paneli
  login/               Giriş sayfası
components/            UI bileşenleri (menu/, pos/, admin/, ui/)
lib/supabase/          Supabase istemcileri (client.ts, server.ts)
types/index.ts         Tüm TypeScript tipleri
docs/                  Proje dokümantasyonu
```

## Veritabanı Tabloları (9 adet)
`businesses`, `business_users`, `areas`, `tables`, `categories`, `products`, `bills`, `bill_items`, `payments`

## Kullanıcı Rolleri
- `owner` → tüm yetkiler + kullanıcı yönetimi
- `admin` → ürün/kategori/masa/ayar yönetimi + POS
- `staff` → sadece POS (adisyon aç/kapat/öde)

## RLS Mantığı (ÖNEMLİ)
`auth.uid()` kullanıcı ID'sidir, `business_id` değildir.
Doğru akış:
1. `auth.uid()` ile giriş yapan kullanıcı bulunur.
2. `business_users` tablosundan o kullanıcının `business_id`'si ve `role`'ü sorgulanır.
3. Kullanıcı sadece kendi `business_id`'sine ait verilere erişebilir.
4. Rol'e göre okuma/yazma/yönetim yetkileri ayrılır.

## Güvenlik Kuralları
- `.env.local` asla GitHub'a gitmez (.gitignore'da)
- Secret key / service_role key client'a asla verilmez
- Tüm tablolarda RLS aktif
- QR ziyaretçileri sadece aktif business/categories/products okuyabilir (anonim)

## Önemli Kararlar
→ docs/DECISIONS.md dosyasına bak

## Mevcut Durum
→ docs/NEXT_STEPS.md dosyasına bak
