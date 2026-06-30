# Proje Brief — Bahçe Cafe Hisarüstü

## İşletme Bilgileri
- **Ad:** Bahçe Cafe Hisarüstü
- **Tür:** Nargile Cafe
- **Slug:** bahce-cafe-hisarustu

## Sistem Hedefi
QR ile erişilen müşteri menüsü + garson adisyon paneli + işletme sahibi admin panelinden oluşan tam entegre bir cafe yönetim sistemi.

## Müşteri QR Menüsü (`/menu/bahce-cafe-hisarustu`)
- Müşteri sadece menüyü görür, sipariş VERMEZ.
- Ürünler, fiyatlar, açıklamalar, görseller.
- Instagram butonu, Google Maps / konum butonu, Wi-Fi bilgisi.
- Mini oyunlar alanı (M7).
- İleride AI asistan: nargile/içecek/tatlı önerisi (M9).

## Adisyon Paneli (`/pos`)
- Masa alanları: Kolon, Salon, Bahçe Kolon, Bahçe, S.M. vb.
- Masalar büyük kart görünümünde: boş=yeşil, açık=farklı renk.
- Sol: adisyon/hesap. Sağ: ürün butonları (büyük, dokunmatik).
- Ürünler kategori sekmeleriyle: İçecekler, Yiyecekler, Nargile, Take Away.
- Nakit/kart ödeme kapatma.
- Gün sonu raporu (M6).

## Admin Paneli (`/admin`)
- Kategori yönetimi.
- Ürün ve fiyat yönetimi.
- Masa ve alan yönetimi.
- İşletme ayarları (Instagram, Maps, Wi-Fi).
- Raporlar.
- İleride AI komut: "nargilelere 50 TL zam yap" → önizleme → onay (M10).

## Çok İşletmeli Yapı
- Her tablo `business_id` taşır.
- İlk MVP sadece Bahçe Cafe için çalışır.
- M11'de yeni cafe ekleme altyapısı kurulur.
- Slug yapısı baştan URL-uyumlu tutulur.

## Teknoloji
- Next.js 15 (App Router)
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS 3
- Vercel (deployment)
- TypeScript

## Veri Kaynağı
- Şu an: örnek/seed veriler.
- İleride: admin panelden manuel giriş veya Excel import (M8).
