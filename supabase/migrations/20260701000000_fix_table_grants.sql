-- ================================================================
-- FIX: Rol bazli temel tablo GRANT izinleri
-- ================================================================
-- Sorun: ilk migration'da RLS policy'leri tanimlandi ama Postgres
-- seviyesinde GRANT verilmedi. RLS, temel GRANT olmadan devreye
-- girmez; onsuz Postgres sorguyu "permission denied for table X"
-- ile policy'e ulasmadan reddeder.
-- Bu migration sadece erisim izni acar; RLS policy'leri satir
-- bazinda kisitlamaya devam eder (guvenlik modeli degismedi).
-- ================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- anon: QR menü için sadece aktif businesses/categories/products okuma
GRANT SELECT ON businesses TO anon;
GRANT SELECT ON categories TO anon;
GRANT SELECT ON products   TO anon;

-- authenticated: RLS policy'lerinin zaten izin verdigi komutlarla birebir
GRANT SELECT, UPDATE                 ON businesses     TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON business_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON areas           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tables           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products         TO authenticated;
GRANT SELECT, INSERT, UPDATE         ON bills             TO authenticated;
GRANT SELECT, INSERT, DELETE         ON bill_items        TO authenticated;
GRANT SELECT, INSERT                 ON payments          TO authenticated;
