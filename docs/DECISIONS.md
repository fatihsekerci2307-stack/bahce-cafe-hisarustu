# Mimari Kararlar — Bahçe Cafe Hisarüstü

---

## KARAR-001: RLS'de business_id Doğrulama Mantığı
**Tarih:** 2026-06-30
**Durum:** Kesinleşti

### Karar
Supabase RLS policy'lerinde `auth.uid() = business_id` ifadesi KULLANILMAYACAK.
Bu yanlış olur çünkü `auth.uid()` kullanıcının kimlik ID'sidir, `business_id` ise işletme ID'sidir.

### Doğru Mantık
```sql
-- Kullanıcının hangi business_id'ye bağlı olduğunu ve rolünü bul:
EXISTS (
  SELECT 1 FROM business_users bu
  WHERE bu.user_id = auth.uid()
    AND bu.business_id = [tablo].business_id
    AND bu.is_active = true
    AND bu.role IN ('staff', 'admin', 'owner')  -- rol filtreleme
)
```

### Rol Bazlı Yetki Özeti
| İşlem | Staff | Admin | Owner |
|---|---|---|---|
| QR menüsünü görme | ✓ (anon) | ✓ (anon) | ✓ (anon) |
| Masa görme (POS) | ✓ | ✓ | ✓ |
| Adisyon açma/kapama | ✓ | ✓ | ✓ |
| Ürün/kategori yönetimi | ✗ | ✓ | ✓ |
| Masa/alan yönetimi | ✗ | ✓ | ✓ |
| İşletme ayarları | ✗ | ✗ | ✓ |
| Kullanıcı yönetimi | ✗ | ✗ | ✓ |

### QR Ziyaretçisi (Anonim)
Giriş yapmadan sadece şunları okuyabilir:
- `businesses` → `is_active = true` olan işletme bilgileri
- `categories` → aynı `business_id`'ye ait, `is_active = true`
- `products` → aynı `business_id`'ye ait, `is_active = true`

### Neden Bu Karar Alındı
Kullanıcının doğrudan `business_id`'ye sahip olması (auth.uid() = business_id) hem güvenlik açığı hem mantık hatası oluşturur. `business_users` ara tablosu sayesinde:
- Bir kullanıcı birden fazla işletmeye farklı rollerle bağlanabilir.
- Rol değişikliği (staff → admin) tek bir satır güncellemesiyle yapılabilir.
- İşletmeler arası veri izolasyonu garanti altına alınır.

---

## KARAR-002: Masa Durumu Hesaplama
**Tarih:** 2026-06-30
**Durum:** Kesinleşti

### Karar
`tables` tablosunda `status` kolonu tutulmayacak. Masa durumu (boş/açık) her zaman o masaya ait açık bir `bill` (adisyon) var mı yok mu sorgulanarak hesaplanacak.

### Neden
- `status` kolonu ve gerçek durum arasında tutarsızlık riski ortadan kalkar.
- Bill kapandığında masa otomatik "boş" sayılır, ayrıca güncelleme gerekmez.
- Raporlarda da tutarlı veri sağlar.

---

## KARAR-003: Ödeme Yapısı
**Tarih:** 2026-06-30
**Durum:** Kesinleşti

### Karar
Sadece `bills.payment_method` tutmak yerine ayrı `payments` tablosu oluşturulacak.

### Neden
- Bir adisyon hem nakit hem kart ile ödenebilir (parçalı ödeme).
- İade kaydı yapılabilir.
- Gün sonu raporları `payments` tablosu üzerinden alınır:
  - Toplam ciro: `SUM(amount)`
  - Nakit: `WHERE method = 'cash'`
  - Kart: `WHERE method = 'card'`

---

## KARAR-004: Geçmiş Fiyat Koruması
**Tarih:** 2026-06-30
**Durum:** Kesinleşti

### Karar
`bill_items` tablosunda `product_name_snapshot` ve `unit_price_snapshot` alanları tutulacak.

### Neden
Ürün fiyatı sonradan değişse bile geçmiş adisyonlar o andaki fiyatı gösterir. Raporlarda güvenilir gelir hesabı yapılabilir.

---

## KARAR-006: Public QR Menü Policy Kapsamı
**Tarih:** 2026-06-30
**Durum:** Kesinleşti (MVP), ileride revize edilecek

### Karar
MVP'de `businesses`, `categories` ve `products` tabloları anonim (giriş yapmayan) kullanıcılara `is_active = true` filtresiyle tamamen açık okunabilir bırakıldı.

### Neden
QR kodu okutan müşteriler giriş yapmaz. Uygulama kodu her sorguya `WHERE business_id = <id>` ekler, dolayısıyla farklı işletme verisi görme riski pratikte yoktur.

### İleride (M11 — çok işletmeli satış)
Yüzlerce işletme aynı Supabase projesinde olduğunda daha kontrollü bir yapı değerlendirilecek:
- `public_menu` adında bir view (sadece public alanları expose eder)
- veya slug bazlı RPC fonksiyonu (`get_menu_by_slug(slug TEXT)`)

Bu geçiş yapılana kadar mevcut açık policy kabul edilebilir güvenlik seviyesindedir.

---

## KARAR-005: URL Yapısı
**Tarih:** 2026-06-30
**Durum:** Kesinleşti

### MVP (şimdi)
```
/menu/bahce-cafe-hisarustu
/pos
/admin
/login
```

### İleride (M11 — çok işletmeli)
```
/[businessSlug]/menu
/[businessSlug]/pos
/[businessSlug]/admin
```
veya işletme başına özel domain bağlama.
`businesses.slug` baştan tutulduğu için geçiş kolayca yapılabilir.
