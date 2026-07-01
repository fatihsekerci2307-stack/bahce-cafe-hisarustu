# Sonraki Adımlar — Bahçe Cafe Hisarüstü

**Son güncelleme:** 2026-06-30

---

## Şu An: M0+M1+M2+M3+M4+M5 Tamamlandı ✅

- Node.js v24.18.0, Next.js 15.5.19 ✅
- Supabase bağlantısı + 9 tablo + 30 RLS policy ✅
- Owner kullanıcı bağlandı ✅
- `/login` → fonksiyonel Supabase Auth girişi ✅
- `/admin` → rol korumalı (owner/admin), nav + çıkış ✅
- `/admin/categories` → liste + ekle + düzenle + aktif/pasif ✅
- `/admin/products` → liste + kategori filtresi + ekle + düzenle + aktif/pasif ✅
- `/menu/[slug]` → anonim QR menüsü, kategoriye göre gruplu ürünler ✅
- `/pos` → alan/masa grid, boş/dolu renk gösterimi ✅
- `/pos/table/[tableId]` → adisyon aç, ürün ekle/çıkar, kapat + ödeme ✅
- Build başarılı (0 TypeScript hatası) ✅

---

## Sonraki Milestone: M6

**Hedef:** Ödeme detayları + Gün sonu raporu.

### M6'da yapılacaklar:
- [ ] Admin'de gün sonu raporu: toplam ciro, ödeme yöntemi dağılımı
- [ ] Kapalı adisyon listesi (tarih filtreli)
- [ ] İsteğe bağlı: parçalı ödeme (nakit + kart aynı adisyona)

---

## Milestone Takvimi
| # | Milestone | Durum |
|---|---|---|
| M0+M1 | Kurulum + Hafıza | ✅ Tamamlandı |
| M2 | Veritabanı + Örnek Veri | ✅ Tamamlandı |
| M3 | Admin Ürün/Kategori Yönetimi | ✅ Tamamlandı |
| M4 | Müşteri QR Menüsü | ✅ Tamamlandı |
| M5 | Masa/Adisyon Paneli | ✅ Tamamlandı |
| M6 | Ödeme + Gün Sonu Raporu | ⏳ Sıradaki |
| M7 | Instagram/Maps/Wi-Fi + Mini Oyunlar | — |
| M8 | Excel Menü Import | — |
| M9 | Müşteri AI Önerici | — |
| M10 | Admin AI Komutları | — |
| M11 | Çok İşletmeli Hazırlık | — |
