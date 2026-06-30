# M2 Veritabanı Planı — Bahçe Cafe Hisarüstü

## Çalıştırma Talimatı

Bu SQL **iki ayrı parçada** çalıştırılacak:

**Parça 1 — ADIM 1–6:** Tabloları, index'leri, RLS'yi, fonksiyonu, policy'leri ve seed verisini içerir.
Supabase SQL Editor'da doğrudan çalıştırılabilir.

**Parça 2 — ADIM 7:** Sadece şu adımlardan sonra çalıştırın:
1. Supabase Dashboard → **Authentication → Users → Add User**
2. Owner'ın e-postasını ve şifresini girin
3. Oluşan kullanıcının UUID'sini kopyalayın
4. ADIM 7'deki `<KULLANICI_UUID>` yerine o UUID'yi yazın
5. Sadece ADIM 7 bloğunu çalıştırın

> `<KULLANICI_UUID>` bir placeholder'dır — gerçek UUID ile değiştirilmeden çalıştırılırsa hata verir.

**Şu an sadece taslak — henüz hiçbir SQL çalıştırılmadı.**

---

## 1. CREATE TABLE — 9 Tablo

### businesses — Cafe bilgileri

```sql
CREATE TABLE businesses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,          -- 'bahce-cafe-hisarustu'
  name            TEXT        NOT NULL,
  instagram_url   TEXT,
  google_maps_url TEXT,
  wifi_name       TEXT,
  wifi_password   TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### business_users — Kullanıcı & rol köprüsü

> RLS'nin kalbi bu tablodur. `auth.uid()` buraya sorgu yaparak kullanıcının rolünü öğrenir.

```sql
CREATE TABLE business_users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);
```

---

### areas — Masa alanları

```sql
CREATE TABLE areas (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID    NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,    -- 'Kolon', 'Salon', 'Bahçe', 'S.M.' vb.
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);
```

---

### tables — Masalar

> **Not:** `status` kolonu yoktur. Masa durumu (boş/açık), o masaya ait açık `bill` olup olmadığına göre hesaplanır.

```sql
CREATE TABLE tables (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID    NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  area_id      UUID    NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  display_name TEXT    NOT NULL,   -- 'K1', 'S3', 'B2' vb.
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true
);
```

---

### categories — Ürün kategorileri

```sql
CREATE TABLE categories (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID    NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,   -- 'İçecekler', 'Nargile', 'Yiyecekler', 'Take Away'
  slug        TEXT    NOT NULL,   -- 'icecekler', 'nargile', 'yiyecekler', 'take-away'
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(business_id, slug)
);
```

---

### products — Ürünler

```sql
CREATE TABLE products (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID          NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url   TEXT,
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  is_featured BOOLEAN       NOT NULL DEFAULT false,
  sort_order  INTEGER       NOT NULL DEFAULT 0
);
```

---

### bills — Adisyonlar

> **Not:** `payment_method` kolonu yoktur. Ödemeler ayrı `payments` tablosunda tutulur.

```sql
CREATE TABLE bills (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  table_id    UUID        NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  opened_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at   TIMESTAMPTZ,
  status      TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_by   UUID        NOT NULL REFERENCES auth.users(id),
  note        TEXT
);
```

---

### bill_items — Adisyon kalemleri

> `product_name_snapshot` ve `unit_price_snapshot`: fiyat ileride değişse bile eski adisyon bozulmaz.

```sql
CREATE TABLE bill_items (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id               UUID          NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  business_id           UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id            UUID          REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT          NOT NULL,
  unit_price_snapshot   NUMERIC(10,2) NOT NULL,
  quantity              INTEGER       NOT NULL DEFAULT 1 CHECK (quantity > 0)
);
```

---

### payments — Ödemeler

> Bir adisyon hem nakit hem kart olabilir (parçalı ödeme). Gün sonu raporu buradan alınır.

```sql
CREATE TABLE payments (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id     UUID          NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  business_id UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  method      TEXT          NOT NULL CHECK (method IN ('cash', 'card', 'other')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

## 2. Foreign Key İlişki Haritası

```
auth.users
    ├──▶ business_users.user_id
    └──▶ bills.opened_by

businesses
    ├──▶ business_users.business_id
    ├──▶ areas.business_id
    ├──▶ tables.business_id
    ├──▶ categories.business_id
    ├──▶ products.business_id
    ├──▶ bills.business_id
    ├──▶ bill_items.business_id
    └──▶ payments.business_id

areas        ──▶ tables.area_id
categories   ──▶ products.category_id
bills        ──▶ bill_items.bill_id
bills        ──▶ payments.bill_id
products     ──▶ bill_items.product_id   (ON DELETE SET NULL)
tables       ──▶ bills.table_id          (ON DELETE RESTRICT — masa silinmeden adisyon kapanmalı)
```

---

## 3. Index'ler

```sql
-- RLS her sorguda business_users'a bakar — bu iki index kritik
CREATE INDEX idx_business_users_user_id      ON business_users(user_id);
CREATE INDEX idx_business_users_business_id  ON business_users(business_id);

-- POS: masa listesi area_id'ye göre çekilir
CREATE INDEX idx_tables_business_id          ON tables(business_id);
CREATE INDEX idx_tables_area_id              ON tables(area_id);

-- "Bu masada açık adisyon var mı?" sorusu çok sık sorgulanır
CREATE INDEX idx_bills_table_id_status       ON bills(table_id, status);
CREATE INDEX idx_bills_business_id_status    ON bills(business_id, status);

-- QR menü: kategori ve ürün listeleri
CREATE INDEX idx_categories_business_active  ON categories(business_id, is_active);
CREATE INDEX idx_products_category_id        ON products(category_id);
CREATE INDEX idx_products_business_active    ON products(business_id, is_active);

-- Gün sonu raporu: tarih aralıklı sorgular
CREATE INDEX idx_payments_business_created   ON payments(business_id, created_at);

-- Adisyon toplamı hesaplamak için
CREATE INDEX idx_bill_items_bill_id          ON bill_items(bill_id);

-- Aynı masada aynı anda yalnızca bir açık adisyon olabilir (kısmi unique index)
CREATE UNIQUE INDEX uniq_open_bill_per_table
  ON bills(table_id)
  WHERE status = 'open';
```

---

## 4. RLS Aktifleştirme

```sql
ALTER TABLE businesses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments         ENABLE ROW LEVEL SECURITY;
```

---

## 5. Yardımcı Fonksiyon (RLS'nin Temeli)

> Bu fonksiyon olmadan her policy'de aynı sorguyu tekrar yazmak gerekir.
> `SECURITY DEFINER`: RLS'yi atlayarak `business_users`'ı okuyabilir.
> `STABLE`: aynı sorgu içinde sonuç cache'lenir — performans için önemli.

```sql
CREATE OR REPLACE FUNCTION auth_user_role_for_business(bid UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role
  FROM business_users
  WHERE user_id     = auth.uid()
    AND business_id = bid
    AND is_active   = true
  LIMIT 1;
$$;
-- Dönüş: 'owner' | 'admin' | 'staff' | NULL (bu işletmede değil)
```

---

## 6. Public QR Menü Read Policy

QR kodu okutan müşteri sisteme giriş yapmaz (anonim). Sadece şunları okuyabilir:

```sql
-- Aktif işletme bilgisi (Instagram, Maps, Wi-Fi dahil)
CREATE POLICY "public_read_active_businesses"
  ON businesses FOR SELECT
  USING (is_active = true);

-- Aktif kategoriler
CREATE POLICY "public_read_active_categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Aktif ürünler
CREATE POLICY "public_read_active_products"
  ON products FOR SELECT
  USING (is_active = true);
```

> Uygulama kodu her zaman `WHERE business_id = <id>` ile sorgular;
> farklı cafe verilerini görme riski yoktur.

> **İleride (M11 — çok işletmeli):** Daha kontrollü erişim için `public_menu` view
> veya slug bazlı RPC fonksiyonu değerlendirilecek (bkz. DECISIONS.md KARAR-006).

---

## 7. Staff / Admin / Owner Policy'leri

### businesses — İşletme ayarları

```sql
-- Sadece owner: işletme bilgilerini güncelleyebilir
CREATE POLICY "owner_update_business"
  ON businesses FOR UPDATE
  USING     (auth_user_role_for_business(id) = 'owner')
  WITH CHECK (auth_user_role_for_business(id) = 'owner');
```

### business_users — Kullanıcı yönetimi

```sql
-- Her kullanıcı: kendi kaydını görebilir
CREATE POLICY "user_read_own_record"
  ON business_users FOR SELECT
  USING (user_id = auth.uid());

-- Owner: işletmedeki tüm kullanıcıları görebilir
CREATE POLICY "owner_read_all_business_users"
  ON business_users FOR SELECT
  USING (auth_user_role_for_business(business_id) = 'owner');

-- Owner: yeni kullanıcı ekleyebilir
CREATE POLICY "owner_insert_business_users"
  ON business_users FOR INSERT
  WITH CHECK (auth_user_role_for_business(business_id) = 'owner');

-- Owner: kullanıcının rolünü veya aktifliğini güncelleyebilir
CREATE POLICY "owner_update_business_users"
  ON business_users FOR UPDATE
  USING     (auth_user_role_for_business(business_id) = 'owner')
  WITH CHECK (auth_user_role_for_business(business_id) = 'owner');
```

### areas ve tables — Alan ve masa yönetimi

```sql
-- Staff / admin / owner: görebilir (POS için)
CREATE POLICY "staff_read_areas"
  ON areas FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- Admin / owner: ekleyebilir, güncelleyebilir, silebilir
CREATE POLICY "admin_insert_areas"
  ON areas FOR INSERT
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_update_areas"
  ON areas FOR UPDATE
  USING     (auth_user_role_for_business(business_id) IN ('admin', 'owner'))
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_delete_areas"
  ON areas FOR DELETE
  USING (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

-- (tables için aynı 4 policy — tablo adı 'tables' olarak değişir)
CREATE POLICY "staff_read_tables"
  ON tables FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

CREATE POLICY "admin_insert_tables"
  ON tables FOR INSERT
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_update_tables"
  ON tables FOR UPDATE
  USING     (auth_user_role_for_business(business_id) IN ('admin', 'owner'))
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_delete_tables"
  ON tables FOR DELETE
  USING (auth_user_role_for_business(business_id) IN ('admin', 'owner'));
```

### categories ve products — Ürün yönetimi

```sql
-- (Public SELECT zaten yukarıda tanımlandı)
-- Admin / owner: yönetim

CREATE POLICY "admin_insert_categories"
  ON categories FOR INSERT
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_update_categories"
  ON categories FOR UPDATE
  USING     (auth_user_role_for_business(business_id) IN ('admin', 'owner'))
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_delete_categories"
  ON categories FOR DELETE
  USING (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_insert_products"
  ON products FOR INSERT
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_update_products"
  ON products FOR UPDATE
  USING     (auth_user_role_for_business(business_id) IN ('admin', 'owner'))
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

CREATE POLICY "admin_delete_products"
  ON products FOR DELETE
  USING (auth_user_role_for_business(business_id) IN ('admin', 'owner'));
```

### bills — Adisyon açma / kapama

```sql
CREATE POLICY "staff_read_bills"
  ON bills FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- Açan kişi kendisi olmalı; table_id aynı işletmeye ve aktif masaya ait olmalı
CREATE POLICY "staff_insert_bills"
  ON bills FOR INSERT
  WITH CHECK (
    auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner')
    AND opened_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tables t
      WHERE t.id          = table_id
        AND t.business_id = business_id
        AND t.is_active   = true
    )
  );

-- Adisyon kapatma (status: open → closed)
CREATE POLICY "staff_update_bills"
  ON bills FOR UPDATE
  USING     (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'))
  WITH CHECK (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));
```

### bill_items — Kalem ekleme / iptali

```sql
CREATE POLICY "staff_read_bill_items"
  ON bill_items FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- bill_id aynı işletmeye ait ve AÇIK bir adisyon olmalı
CREATE POLICY "staff_insert_bill_items"
  ON bill_items FOR INSERT
  WITH CHECK (
    auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner')
    AND EXISTS (
      SELECT 1 FROM bills b
      WHERE b.id          = bill_id
        AND b.business_id = business_id
        AND b.status      = 'open'
    )
  );

-- Kalem iptali: sadece açık adisyona ait kalemler silinebilir
CREATE POLICY "staff_delete_bill_items"
  ON bill_items FOR DELETE
  USING (
    auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner')
    AND EXISTS (
      SELECT 1 FROM bills b
      WHERE b.id          = bill_id
        AND b.business_id = business_id
        AND b.status      = 'open'
    )
  );
```

### payments — Ödeme kaydı

```sql
CREATE POLICY "staff_read_payments"
  ON payments FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- bill_id aynı işletmeye ait bir adisyon olmalı
CREATE POLICY "staff_insert_payments"
  ON payments FOR INSERT
  WITH CHECK (
    auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner')
    AND EXISTS (
      SELECT 1 FROM bills b
      WHERE b.id          = bill_id
        AND b.business_id = business_id
    )
  );
```

### Yetki Özet Tablosu

| İşlem | Anonim (QR) | Staff | Admin | Owner |
|---|---|---|---|---|
| businesses okuma | ✅ | ✅ | ✅ | ✅ |
| businesses güncelleme | ✗ | ✗ | ✗ | ✅ |
| categories / products okuma | ✅ | ✅ | ✅ | ✅ |
| categories / products yönetimi | ✗ | ✗ | ✅ | ✅ |
| areas / tables okuma | ✗ | ✅ | ✅ | ✅ |
| areas / tables yönetimi | ✗ | ✗ | ✅ | ✅ |
| bills açma / kapama | ✗ | ✅ | ✅ | ✅ |
| bill_items ekleme / silme | ✗ | ✅ | ✅ | ✅ |
| payments ekleme | ✗ | ✅ | ✅ | ✅ |
| business_users yönetimi | ✗ | ✗ | ✗ | ✅ |

---

## 8. Seed — Örnek Bahçe Cafe Verileri

```sql
DO $$
DECLARE
  v_biz      UUID;
  v_kolon    UUID;  v_salon UUID;
  v_bk       UUID;  v_bahce UUID;  v_sm UUID;
  v_icecek   UUID;  v_nargile  UUID;
  v_yiyecek  UUID;  v_takeaway UUID;
BEGIN

  -- İşletme
  INSERT INTO businesses (slug, name, instagram_url, google_maps_url,
                          wifi_name, wifi_password, is_active)
  VALUES (
    'bahce-cafe-hisarustu',
    'Bahçe Cafe Hisarüstü',
    'https://instagram.com/bahcecafehisarustu',
    'https://maps.app.goo.gl/bahcecafe',   -- gerçek link M7'de girilecek
    'BahceCafe_Wifi',
    'Bahce2024',
    true
  ) RETURNING id INTO v_biz;

  -- Alanlar
  INSERT INTO areas (business_id, name, sort_order) VALUES (v_biz, 'Kolon',       1) RETURNING id INTO v_kolon;
  INSERT INTO areas (business_id, name, sort_order) VALUES (v_biz, 'Salon',       2) RETURNING id INTO v_salon;
  INSERT INTO areas (business_id, name, sort_order) VALUES (v_biz, 'Bahçe Kolon', 3) RETURNING id INTO v_bk;
  INSERT INTO areas (business_id, name, sort_order) VALUES (v_biz, 'Bahçe',       4) RETURNING id INTO v_bahce;
  INSERT INTO areas (business_id, name, sort_order) VALUES (v_biz, 'S.M.',        5) RETURNING id INTO v_sm;

  -- Masalar: Kolon
  INSERT INTO tables (business_id, area_id, display_name, sort_order) VALUES
    (v_biz, v_kolon, 'K1', 1), (v_biz, v_kolon, 'K2', 2),
    (v_biz, v_kolon, 'K3', 3), (v_biz, v_kolon, 'K4', 4);

  -- Masalar: Salon
  INSERT INTO tables (business_id, area_id, display_name, sort_order) VALUES
    (v_biz, v_salon, 'S1', 1), (v_biz, v_salon, 'S2', 2),
    (v_biz, v_salon, 'S3', 3);

  -- Masalar: Bahçe Kolon
  INSERT INTO tables (business_id, area_id, display_name, sort_order) VALUES
    (v_biz, v_bk, 'BK1', 1), (v_biz, v_bk, 'BK2', 2),
    (v_biz, v_bk, 'BK3', 3);

  -- Masalar: Bahçe
  INSERT INTO tables (business_id, area_id, display_name, sort_order) VALUES
    (v_biz, v_bahce, 'B1', 1), (v_biz, v_bahce, 'B2', 2),
    (v_biz, v_bahce, 'B3', 3), (v_biz, v_bahce, 'B4', 4),
    (v_biz, v_bahce, 'B5', 5);

  -- Masalar: S.M.
  INSERT INTO tables (business_id, area_id, display_name, sort_order) VALUES
    (v_biz, v_sm, 'SM1', 1), (v_biz, v_sm, 'SM2', 2);

  -- Kategoriler
  INSERT INTO categories (business_id, name, slug, sort_order)
    VALUES (v_biz, 'İçecekler', 'icecekler',  1) RETURNING id INTO v_icecek;
  INSERT INTO categories (business_id, name, slug, sort_order)
    VALUES (v_biz, 'Nargile',   'nargile',    2) RETURNING id INTO v_nargile;
  INSERT INTO categories (business_id, name, slug, sort_order)
    VALUES (v_biz, 'Yiyecekler','yiyecekler', 3) RETURNING id INTO v_yiyecek;
  INSERT INTO categories (business_id, name, slug, sort_order)
    VALUES (v_biz, 'Take Away', 'take-away',  4) RETURNING id INTO v_takeaway;

  -- Ürünler: İçecekler
  INSERT INTO products (business_id, category_id, name, description, price, sort_order) VALUES
    (v_biz, v_icecek, 'Türk Çayı',    'Demlik çay',              30,  1),
    (v_biz, v_icecek, 'Türk Kahvesi', 'Geleneksel Türk kahvesi', 60,  2),
    (v_biz, v_icecek, 'Nescafé',      'Sıcak Nescafé',           70,  3),
    (v_biz, v_icecek, 'Limonata',     'Taze limonata',           80,  4),
    (v_biz, v_icecek, 'Kola',         '330ml kutu',              60,  5),
    (v_biz, v_icecek, 'Ice Tea',      '330ml kutu',              60,  6),
    (v_biz, v_icecek, 'Meyve Suyu',   '200ml kutu',              50,  7),
    (v_biz, v_icecek, 'Su',           '500ml',                   20,  8);

  -- Ürünler: Nargile
  INSERT INTO products (business_id, category_id, name, description, price, is_featured, sort_order) VALUES
    (v_biz, v_nargile, 'Standart Nargile',     'Klasik tütün çeşitleri', 300, true,  1),
    (v_biz, v_nargile, 'Premium Nargile',       'Özel tütün karışımı',   400, true,  2),
    (v_biz, v_nargile, 'Extra Premium Nargile', 'En kaliteli karışım',   500, false, 3),
    (v_biz, v_nargile, 'Taş Kömür Eklentisi',   'Ekstra taş kömür',       50, false, 4);

  -- Ürünler: Yiyecekler
  INSERT INTO products (business_id, category_id, name, description, price, sort_order) VALUES
    (v_biz, v_yiyecek, 'Tost',   'Karışık tost',              80,  1),
    (v_biz, v_yiyecek, 'Kumpir', 'Patates, malzemeler dahil', 150, 2),
    (v_biz, v_yiyecek, 'Waffle', 'Çikolatalı veya meyveli',   120, 3),
    (v_biz, v_yiyecek, 'Pide',   'Peynirli pide',             100, 4);

  -- Ürünler: Take Away
  INSERT INTO products (business_id, category_id, name, description, price, sort_order) VALUES
    (v_biz, v_takeaway, 'Paket Çay (Demet)', '25li çay demeti',        100, 1),
    (v_biz, v_takeaway, 'Paket Kahve',       'Öğütülmüş Türk kahvesi', 150, 2);

  RAISE NOTICE 'Seed tamamlandı. Business ID: %', v_biz;
END $$;
```

---

## 9. İlk Owner Kullanıcısı — 3 Adım

**Sorun:** Tavuk-yumurta döngüsü — owner yokken `business_users`'a RLS izin vermez.
**Çözüm:** Supabase SQL Editor servis yetkisiyle çalışır ve RLS'yi atlar.

### Adım 1 — Supabase Dashboard'da kullanıcı oluştur

```
Supabase Dashboard
→ Authentication
→ Users
→ Add User → Create New User
→ E-posta ve şifre gir
→ Oluşan kullanıcının UUID'sini kopyala
```

### Adım 2 — SQL Editor'da owner olarak bağla

```sql
-- <KULLANICI_UUID> yerine 1. adımda kopyaladığın UUID'yi yaz
INSERT INTO business_users (user_id, business_id, role, is_active)
SELECT
  '<KULLANICI_UUID>',
  id,
  'owner',
  true
FROM businesses
WHERE slug = 'bahce-cafe-hisarustu';
```

### Adım 3 — Kontrol sorgusu

```sql
SELECT bu.role, bu.is_active, b.name AS isletme
FROM business_users bu
JOIN businesses b ON b.id = bu.business_id
WHERE bu.user_id = '<KULLANICI_UUID>';

-- Beklenen sonuç:
-- role  | is_active | isletme
-- owner | true      | Bahçe Cafe Hisarüstü
```

---

## Uygulama Sırası (Onaydan Sonra)

| Sıra | İçerik | Notlar |
|---|---|---|
| 1 | CREATE TABLE (9 tablo) | Sırayla — FK bağımlılıkları var |
| 2 | CREATE INDEX | Tablolar kurulduktan sonra |
| 3 | ALTER TABLE … ENABLE ROW LEVEL SECURITY | |
| 4 | CREATE FUNCTION (yardımcı fonksiyon) | Policy'lerden önce olmalı |
| 5 | CREATE POLICY (tüm tablolar) | |
| 6 | DO $$ … $$ (seed verileri) | |
| 7 | Auth'tan kullanıcı oluştur + INSERT INTO business_users | Manuel |
