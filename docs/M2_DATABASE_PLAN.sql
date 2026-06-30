-- ================================================================
-- M2: Bahçe Cafe Hisarüstü — Veritabanı Kurulum Planı
-- ================================================================
-- BU SQL IKI PARCADA CALISTIRILACAK:
--
-- PARCA 1 (ADIM 1-6): Tüm tabloları, index'leri, RLS'yi, fonksiyonu,
--   policy'leri ve seed verisini tek seferde çalıştırabilirsiniz.
--
-- PARCA 2 (ADIM 7): SADECE şu adımlardan SONRA çalıştırın:
--   1. Supabase Dashboard → Authentication → Users → Add User
--   2. Owner'ın e-postasını ve şifresini girin
--   3. Oluşan kullanıcının UUID'sini kopyalayın
--   4. Aşağıdaki <KULLANICI_UUID> yerine o UUID'yi yazın
--   5. Sadece ADIM 7 bloğunu çalıştırın
-- ================================================================
-- ADIM 1: Tabloları oluştur
-- ADIM 2: Index'leri ekle
-- ADIM 3: RLS'yi aktifleştir
-- ADIM 4: Yardımcı fonksiyonu ekle
-- ADIM 5: Politikaları (RLS policy) ekle
-- ADIM 6: Örnek verileri ekle (seed)
-- ADIM 7: İlk owner kullanıcısını bağla (AYRI — yukarıdaki talimatı oku)
-- ================================================================


-- ================================================================
-- ADIM 1: TABLOLAR
-- ================================================================

-- TABLO 1: businesses (cafe bilgileri)
CREATE TABLE businesses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  instagram_url   TEXT,
  google_maps_url TEXT,
  wifi_name       TEXT,
  wifi_password   TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLO 2: business_users (kullanici-rol köprüsü)
-- auth.uid() bu tabloya sorgu yaparak kullanicinin rolünü ögrenir
CREATE TABLE business_users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- TABLO 3: areas (masa alanlari: Kolon, Salon, Bahce vb.)
CREATE TABLE areas (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID    NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- TABLO 4: tables (masalar)
-- NOT: status kolonu YOK — masa durumu açik bill var mi? sorgusundan hesaplanir
CREATE TABLE tables (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  UUID    NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  area_id      UUID    NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  display_name TEXT    NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

-- TABLO 5: categories (ürün kategorileri)
CREATE TABLE categories (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID    NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  slug        TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(business_id, slug)
);

-- TABLO 6: products (ürünler)
CREATE TABLE products (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID           NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID           NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT           NOT NULL,
  description TEXT,
  price       NUMERIC(10,2)  NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url   TEXT,
  is_active   BOOLEAN        NOT NULL DEFAULT true,
  is_featured BOOLEAN        NOT NULL DEFAULT false,
  sort_order  INTEGER        NOT NULL DEFAULT 0
);

-- TABLO 7: bills (adisyonlar)
-- NOT: payment_method yok — ödemeler ayri payments tablosunda
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

-- TABLO 8: bill_items (adisyon kalemleri)
-- snapshot alanlar: fiyat sonradan degisse bile eski adisyon bozulmaz
CREATE TABLE bill_items (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id               UUID          NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  business_id           UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id            UUID          REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT          NOT NULL,
  unit_price_snapshot   NUMERIC(10,2) NOT NULL,
  quantity              INTEGER       NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- TABLO 9: payments (ödemeler)
-- Bir adisyon hem nakit hem kart olabilir (parçali ödeme destegi)
CREATE TABLE payments (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id     UUID          NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  business_id UUID          NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  method      TEXT          NOT NULL CHECK (method IN ('cash', 'card', 'other')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);


-- ================================================================
-- ADIM 2: INDEX'LER
-- ================================================================

-- RLS her sorguda business_users'a bakar — bu index kritik
CREATE INDEX idx_business_users_user_id     ON business_users(user_id);
CREATE INDEX idx_business_users_business_id ON business_users(business_id);

-- POS: masa listesi area_id'ye göre çekilir
CREATE INDEX idx_tables_business_id ON tables(business_id);
CREATE INDEX idx_tables_area_id     ON tables(area_id);

-- Masa durumu: "bu masada açik bill var mi?" çok sik sorgulanir
CREATE INDEX idx_bills_table_id_status   ON bills(table_id, status);
CREATE INDEX idx_bills_business_id_status ON bills(business_id, status);

-- QR menü: kategori ve ürün listesi
CREATE INDEX idx_categories_business_id_active ON categories(business_id, is_active);
CREATE INDEX idx_products_category_id          ON products(category_id);
CREATE INDEX idx_products_business_id_active   ON products(business_id, is_active);

-- Gün sonu raporu: tarih aralikli sorgular
CREATE INDEX idx_payments_business_id_created ON payments(business_id, created_at);

-- Adisyon toplami hesaplamak için
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);

-- Ayni masada ayni anda yalnizca bir açik adisyon olabilir (kismi unique index)
CREATE UNIQUE INDEX uniq_open_bill_per_table
  ON bills(table_id)
  WHERE status = 'open';


-- ================================================================
-- ADIM 3: RLS AKTIFLEŞTIRME
-- ================================================================

ALTER TABLE businesses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments        ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- ADIM 4: YARDIMCI FONKSİYON
-- ================================================================
-- Bu fonksiyon: "bu kullanici bu işletmede hangi rolde?" sorusunu cevaplar.
-- SECURITY DEFINER: RLS'yi atlayarak business_users'i okuyabilir.
-- STABLE: tek sorgu içinde sonuç cache'lenir (performans için önemli).
-- Dönüs degeri: 'owner' | 'admin' | 'staff' | NULL (bu işletmede degil)

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


-- ================================================================
-- ADIM 5: RLS POLİTİKALARI
-- ================================================================


-- ── businesses ──────────────────────────────────────────────────

-- Herkes (anonim QR müşteri dahil): aktif işletmeleri okuyabilir
CREATE POLICY "public_read_active_businesses"
  ON businesses FOR SELECT
  USING (is_active = true);

-- Sadece owner: işletme bilgilerini güncelleyebilir
CREATE POLICY "owner_update_business"
  ON businesses FOR UPDATE
  USING     (auth_user_role_for_business(id) = 'owner')
  WITH CHECK (auth_user_role_for_business(id) = 'owner');


-- ── business_users ───────────────────────────────────────────────

-- Kullanici: kendi kaydini görebilir
CREATE POLICY "user_read_own_record"
  ON business_users FOR SELECT
  USING (user_id = auth.uid());

-- Owner: kendi işletmesindeki tüm kullanicilari görebilir
CREATE POLICY "owner_read_all_business_users"
  ON business_users FOR SELECT
  USING (auth_user_role_for_business(business_id) = 'owner');

-- Owner: yeni kullanici ekleyebilir
CREATE POLICY "owner_insert_business_users"
  ON business_users FOR INSERT
  WITH CHECK (auth_user_role_for_business(business_id) = 'owner');

-- Owner: kullanicinin rolünü veya is_active durumunu güncelleyebilir
CREATE POLICY "owner_update_business_users"
  ON business_users FOR UPDATE
  USING     (auth_user_role_for_business(business_id) = 'owner')
  WITH CHECK (auth_user_role_for_business(business_id) = 'owner');


-- ── areas ────────────────────────────────────────────────────────

-- Staff / admin / owner: alanlari görebilir
CREATE POLICY "staff_read_areas"
  ON areas FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- Admin / owner: alan ekleyebilir
CREATE POLICY "admin_insert_areas"
  ON areas FOR INSERT
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

-- Admin / owner: alan güncelleyebilir
CREATE POLICY "admin_update_areas"
  ON areas FOR UPDATE
  USING     (auth_user_role_for_business(business_id) IN ('admin', 'owner'))
  WITH CHECK (auth_user_role_for_business(business_id) IN ('admin', 'owner'));

-- Admin / owner: alan silebilir
CREATE POLICY "admin_delete_areas"
  ON areas FOR DELETE
  USING (auth_user_role_for_business(business_id) IN ('admin', 'owner'));


-- ── tables ───────────────────────────────────────────────────────

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


-- ── categories ───────────────────────────────────────────────────

-- Herkes: aktif kategorileri okuyabilir (QR menü için)
CREATE POLICY "public_read_active_categories"
  ON categories FOR SELECT
  USING (is_active = true);

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


-- ── products ─────────────────────────────────────────────────────

-- Herkes: aktif ürünleri okuyabilir (QR menü için)
CREATE POLICY "public_read_active_products"
  ON products FOR SELECT
  USING (is_active = true);

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


-- ── bills ────────────────────────────────────────────────────────

CREATE POLICY "staff_read_bills"
  ON bills FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- Açan kisi kendisi olmali; table_id ayni işletmeye ve aktif masaya ait olmali
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

-- Adisyon kapatma / güncelleme (status: open → closed)
CREATE POLICY "staff_update_bills"
  ON bills FOR UPDATE
  USING     (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'))
  WITH CHECK (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));


-- ── bill_items ───────────────────────────────────────────────────

CREATE POLICY "staff_read_bill_items"
  ON bill_items FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- bill_id ayni işletmeye ait ve AÇIK bir adisyon olmali
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

-- Kalem iptali: sadece açik adisyona ait kalemler silinebilir
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


-- ── payments ─────────────────────────────────────────────────────

CREATE POLICY "staff_read_payments"
  ON payments FOR SELECT
  USING (auth_user_role_for_business(business_id) IN ('staff', 'admin', 'owner'));

-- bill_id ayni işletmeye ait bir adisyon olmali
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


-- ================================================================
-- ADIM 6: ÖRNEK VERİLER (SEED) — Bahçe Cafe Hisarüstü
-- ================================================================

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
    'https://maps.app.goo.gl/bahcecafe',
    'BahceCafe_Wifi',
    'Bahce2024',
    true
  ) RETURNING id INTO v_biz;

  -- Masa Alanlari
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
  INSERT INTO categories (business_id, name, slug, sort_order) VALUES (v_biz, 'İçecekler', 'icecekler',  1) RETURNING id INTO v_icecek;
  INSERT INTO categories (business_id, name, slug, sort_order) VALUES (v_biz, 'Nargile',   'nargile',    2) RETURNING id INTO v_nargile;
  INSERT INTO categories (business_id, name, slug, sort_order) VALUES (v_biz, 'Yiyecekler','yiyecekler', 3) RETURNING id INTO v_yiyecek;
  INSERT INTO categories (business_id, name, slug, sort_order) VALUES (v_biz, 'Take Away', 'take-away',  4) RETURNING id INTO v_takeaway;

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
    (v_biz, v_takeaway, 'Paket Çay (Demet)', '25li çay demeti',       100, 1),
    (v_biz, v_takeaway, 'Paket Kahve',       'Öğütülmüş Türk kahvesi',150, 2);

  RAISE NOTICE '✓ Seed tamamlandi. Business ID: %', v_biz;
END $$;


-- ================================================================
-- ADIM 7: İLK OWNER KULLANICISINI BAĞLA
-- ================================================================
-- Bu adim SEED'den SONRA çaliştirilir.
-- Önce Supabase Dashboard → Authentication → Users → Add User
-- Kullanicinin UUID'sini kopyala, asagida <KULLANICI_UUID> yerine yaz.

INSERT INTO business_users (user_id, business_id, role, is_active)
SELECT
  '<KULLANICI_UUID>',    -- BURAYA Dashboard'dan kopyaladigin UUID'yi yaz
  id,
  'owner',
  true
FROM businesses
WHERE slug = 'bahce-cafe-hisarustu';

-- Kontrol sorgusu (dogru eklendiyse 1 satir döner):
SELECT bu.role, bu.is_active, b.name AS isletme
FROM business_users bu
JOIN businesses b ON b.id = bu.business_id
WHERE bu.user_id = '<KULLANICI_UUID>';


-- ================================================================
-- YARDIMCI SORGULAR (test ve kontrol için)
-- ================================================================

-- Tüm masalari ve bulunduklari alanlari göster:
-- SELECT t.display_name, a.name AS alan
-- FROM tables t JOIN areas a ON a.id = t.area_id
-- ORDER BY a.sort_order, t.sort_order;

-- Tüm ürünleri kategorileriyle göster:
-- SELECT c.name AS kategori, p.name AS urun, p.price
-- FROM products p JOIN categories c ON c.id = p.category_id
-- ORDER BY c.sort_order, p.sort_order;

-- Herhangi bir masada açik adisyon var mi?
-- SELECT t.display_name, b.id AS bill_id, b.opened_at
-- FROM bills b JOIN tables t ON t.id = b.table_id
-- WHERE b.status = 'open';
