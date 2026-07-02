# Sonraki Adımlar — Bahçe Cafe Hisarüstü

**Son güncelleme:** 2026-07-01

---

## Canlı Site ✅ Yayında ve Doğrulandı

**Production URL (doğrusu, kalıcı — buradan sonra bu kullanılacak):**
https://bahce-cafe-hisarustu-zeta.vercel.app

**QR Menü URL:**
https://bahce-cafe-hisarustu-zeta.vercel.app/menu/bahce-cafe-hisarustu

⚠️ Eski `...-bmz5yikqf-seker.vercel.app` adresi **deployment-specific**
bir URL'ydi (tek bir deployment'a sabit, güncellenmiyor). Bundan sonra
ana production URL olarak yukarıdaki `zeta` adresi kullanılacak.

Deployment Protection kapatıldı, site herkese açık. Claude tarafından
canlı URL üzerinde anonim olarak test edildi:

- `/menu/bahce-cafe-hisarustu` → herkese açık, giriş istemiyor, gerçek
  kategori/ürün verisiyle render oluyor ✅
- `/admin` → kendi login ekranına gidiyor, içerik sızmıyor ✅
- `/pos` → kendi login/auth sistemiyle korunuyor, içerik sızmıyor ✅

**Vercel deploy block sorunu çözüldü** (2026-07-01): GitHub → Vercel
otomatik deploy akışı artık çalışıyor. Detay ve gelecekteki commit
author kuralı için `docs/DEVELOPMENT_LOG.md` → "Vercel Deploy Block
Sorunu Çözüldü" bölümüne bak.

Detay: `docs/DEVELOPMENT_LOG.md` → "Canlıya Alma Tamamlandı: Deployment
Protection Kapatıldı" bölümü.

---

## Revize Backlog

*(2026-07-01 canlı stabilizasyon turunda çıkarıldı — detay:
`docs/DEVELOPMENT_LOG.md` → "Canlı Stabilizasyon Turu")*

**Acil:** Yok.

**Canlı kullanımdan önce iyi olur:**
- [x] `/admin/products` + `/admin/categories` tablo taşması (mobilde aksiyon
      butonları kırpılıyordu) → `overflow-x-auto` ile düzeltildi (2026-07-01)
- [ ] Admin panel üst nav'ı mobilde taşabilir (`app/admin/layout.tsx`,
      6 öğe tek satırda, wrap/hamburger yok)
- [ ] Müşteri menüsünde Wi-Fi **şifresi** eksik, sadece ağ adı gösteriliyor
- [ ] `/admin`'deki "Masalar & Alanlar → yakında" kartı tıklanabilir gibi
      duruyor ama link yok, kafa karıştırıcı

**Sonra yapılabilir:**
- [ ] `/admin/reports` alt tablosunda aynı overflow iyileştirmesi (düşük öncelik)
- [ ] Alan isim kısaltmaları netleştirilebilir (ör. "S.M.") — içerik/eğitim konusu
- [ ] Kullanılmayan `fatih10` Vercel projesinin temizlenmesi
- [ ] Bekleyen `.gitignore` (`.env*`) satırı için karar verilmeli

---

## Şu An: M0+M1+M2+M3+M4+M5+M6 Tamamlandı ✅ (uçtan uca test edildi)

- Node.js v24.18.0, Next.js 15.5.19 ✅
- Supabase bağlantısı + 9 tablo + 30 RLS policy + tablo erişim izinleri (GRANT) ✅
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
- Claude tarafından tarayıcıda bizzat test edildi: menü, admin, POS tam
  akışı (adisyon aç → ürün ekle → kapat → raporda gör) çalışıyor. Test
  verisi temizlendi, canlı veritabanı gerçek işletme kullanımına hazır. ✅

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
