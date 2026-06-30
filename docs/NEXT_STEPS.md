# Sonraki Adımlar — Bahçe Cafe Hisarüstü

**Son güncelleme:** 2026-06-30

---

## Şu An: M0+M1 Tamamlandı ✅ + M2 Planı Hazır ✅

- Node.js v24.18.0 kuruldu ✅
- `npm install` tamamlandı (Next.js 15.5.19) ✅
- `localhost:3000` üzerinde çalışıyor ✅
- `.env.local` oluşturuldu ✅
- GitHub'a push edildi ✅
- `docs/M2_DATABASE_PLAN.md` ve `.sql` taslakları tamamlandı ✅

---

## Sonraki Milestone: M2

**Hedef:** `M2_DATABASE_PLAN.sql` içeriğini Supabase SQL Editor'da çalıştırarak tabloları, index'leri, RLS'yi, policy'leri ve örnek verileri kurmak.

### M2'de yapılacaklar (sırayla):
- [ ] Supabase SQL Editor'da sırayla çalıştır:
  - [ ] 9 tablo CREATE
  - [ ] Index'ler (partial unique index dahil)
  - [ ] RLS enable
  - [ ] `auth_user_role_for_business` fonksiyonu
  - [ ] Tüm policy'ler
  - [ ] Seed DO bloku
- [ ] Supabase Auth'tan ilk owner kullanıcısını oluştur
- [ ] `business_users` tablosuna owner kaydını ekle
- [ ] Next.js'ten Supabase bağlantısını test et

---

## Milestone Takvimi
| # | Milestone | Durum |
|---|---|---|
| M0+M1 | Kurulum + Hafıza | ✅ Tamamlandı |
| M2 | Veritabanı + Örnek Veri | ⏳ Sıradaki |
| M3 | Admin Ürün/Kategori Yönetimi | — |
| M4 | Müşteri QR Menüsü | — |
| M5 | Masa/Adisyon Paneli | — |
| M6 | Ödeme + Gün Sonu Raporu | — |
| M7 | Instagram/Maps/Wi-Fi + Mini Oyunlar | — |
| M8 | Excel Menü Import | — |
| M9 | Müşteri AI Önerici | — |
| M10 | Admin AI Komutları | — |
| M11 | Çok İşletmeli Hazırlık | — |
