# Sonraki Adımlar — Bahçe Cafe Hisarüstü

**Son güncelleme:** 2026-06-30

---

## Şu An: M0+M1 Tamamlandı ✅

Proje iskeleti kuruldu. Sayfalar açılır ama gerçek veri yok.

---

## Kullanıcının Yapması Gerekenler (M2'den önce)

### 1. Node.js Kur
- https://nodejs.org adresine git
- "LTS" (uzun vadeli destek) versiyonunu indir ve kur
- Kurulumdan sonra terminali yeniden aç

### 2. Projeyi Çalıştır
```bash
# Proje klasörüne git
cd "C:\Users\Fatih Şekerci\OneDrive\Masaüstü\CLAUDE SİSTEM ANALİZ\bahce-cafe-hisarustu"

# Paketleri yükle (ilk seferinde yapılır)
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### 3. .env.local Oluştur
Proje klasöründe `.env.local` adında bir dosya oluştur ve içine yaz:
```
NEXT_PUBLIC_SUPABASE_URL=https://wlwaiyejdxchgqklketz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_j8Px533PNh3-afRVxHnCkw_aY_zd9Wn
```

### 4. GitHub'a Push Et
```bash
git add .
git commit -m "M0+M1: Proje kurulumu ve iskelet sayfalar"
git push
```

---

## Sonraki Milestone: M2

**Hedef:** Supabase'de 9 tabloyu oluşturmak, RLS politikalarını yazmak ve Bahçe Cafe örnek verilerini eklemek.

### M2'de yapılacaklar:
- [ ] Supabase SQL Editor'da tablo oluşturma migration'ı çalıştır
- [ ] RLS politikalarını yaz (business_users üzerinden yetki)
- [ ] Supabase Auth'u kur, ilk admin kullanıcısını oluştur
- [ ] Örnek kategoriler: İçecekler, Nargile, Yiyecekler, Take Away
- [ ] Örnek ürünler (her kategoriden 4-5 ürün)
- [ ] Örnek masa alanları: Kolon, Salon, Bahçe, S.M.
- [ ] Örnek masalar (her alandan 3-4 masa)
- [ ] Supabase bağlantısını Next.js'ten test et

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
