# Sonraki Adımlar — Bahçe Cafe Hisarüstü

**Son güncelleme:** 2026-06-30

---

## Şu An: M0+M1+M2+M3+M4+M5+M6 Tamamlandı ✅

- Node.js v24.18.0, Next.js 15.5.19 ✅
- Supabase bağlantısı + 9 tablo + 30 RLS policy ✅
- Owner kullanıcı bağlandı ✅
- `/login` → fonksiyonel Supabase Auth girişi ✅
- `/admin` → rol korumalı (owner/admin), nav + çıkış ✅
- `/admin/categories` → liste + ekle + düzenle + aktif/pasif ✅
- `/admin/products` → liste + kategori filtresi + ekle + düzenle + aktif/pasif ✅
- `/admin/reports` → gün sonu raporu, ciro + ödeme dağılımı + kapalı adisyon listesi ✅
- `/menu/[slug]` → anonim QR menüsü, kategoriye göre gruplu ürünler ✅
- `/pos` → alan/masa grid, boş/dolu renk gösterimi ✅
- `/pos/table/[tableId]` → adisyon aç, ürün ekle/çıkar, kapat + ödeme ✅
- Build başarılı (0 TypeScript hatası) ✅

---

## Sonraki Milestone: M7

**Hedef:** Instagram/Maps/Wi-Fi bilgilerini admin'den yönetilebilir hale getirme + müşteri menüsünde mini oyunlar.

### M7'de yapılacaklar:
- [ ] `/admin/settings` → işletme Instagram/Maps/Wi-Fi bilgilerini düzenleme formu
- [ ] Müşteri menüsünde Wi-Fi şifresi gösterimi (QR ile bağlanma)
- [ ] Mini oyun fikri netleştirilecek (ör. çark, puan sistemi)

---

## Milestone Takvimi
| # | Milestone | Durum |
|---|---|---|
| M0+M1 | Kurulum + Hafıza | ✅ Tamamlandı |
| M2 | Veritabanı + Örnek Veri | ✅ Tamamlandı |
| M3 | Admin Ürün/Kategori Yönetimi | ✅ Tamamlandı |
| M4 | Müşteri QR Menüsü | ✅ Tamamlandı |
| M5 | Masa/Adisyon Paneli | ✅ Tamamlandı |
| M6 | Ödeme + Gün Sonu Raporu | ✅ Tamamlandı |
| M7 | Instagram/Maps/Wi-Fi + Mini Oyunlar | ⏳ Sıradaki |
| M8 | Excel Menü Import | — |
| M9 | Müşteri AI Önerici | — |
| M10 | Admin AI Komutları | — |
| M11 | Çok İşletmeli Hazırlık | — |
