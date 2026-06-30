// ============================================================
// Tüm Supabase tablo tipleri burada tanımlanır.
// M2'de Database tipi Supabase CLI ile otomatik üretilecek.
// Şimdilik manuel tanımlıyoruz.
// ============================================================

export type UserRole = "owner" | "admin" | "staff";
export type BillStatus = "open" | "closed";
export type PaymentMethod = "cash" | "card" | "other";

// ---- businesses ----
export interface Business {
  id: string;
  slug: string;
  name: string;
  instagram_url: string | null;
  google_maps_url: string | null;
  wifi_name: string | null;
  wifi_password: string | null;
  is_active: boolean;
  created_at: string;
}

// ---- business_users ----
export interface BusinessUser {
  id: string;
  user_id: string;
  business_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

// ---- areas ----
export interface Area {
  id: string;
  business_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

// ---- tables ----
export interface Table {
  id: string;
  business_id: string;
  area_id: string;
  display_name: string;
  sort_order: number;
  is_active: boolean;
}

// Masa durumu veritabanında tutulmaz; açık bill var mı diye hesaplanır.
export interface TableWithStatus extends Table {
  isOpen: boolean;
  activeBillId: string | null;
}

// ---- categories ----
export interface Category {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

// ---- products ----
export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

// ---- bills ----
export interface Bill {
  id: string;
  business_id: string;
  table_id: string;
  opened_at: string;
  closed_at: string | null;
  status: BillStatus;
  opened_by: string;
  note: string | null;
}

// ---- bill_items ----
export interface BillItem {
  id: string;
  bill_id: string;
  business_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
}

// ---- payments ----
export interface Payment {
  id: string;
  bill_id: string;
  business_id: string;
  amount: number;
  method: PaymentMethod;
  created_at: string;
}

// ---- Supabase Database tipi (M2'de genişletilecek) ----
export type Database = {
  public: {
    Tables: {
      businesses: { Row: Business; Insert: Omit<Business, "id" | "created_at">; Update: Partial<Business> };
      business_users: { Row: BusinessUser; Insert: Omit<BusinessUser, "id" | "created_at">; Update: Partial<BusinessUser> };
      areas: { Row: Area; Insert: Omit<Area, "id">; Update: Partial<Area> };
      tables: { Row: Table; Insert: Omit<Table, "id">; Update: Partial<Table> };
      categories: { Row: Category; Insert: Omit<Category, "id">; Update: Partial<Category> };
      products: { Row: Product; Insert: Omit<Product, "id">; Update: Partial<Product> };
      bills: { Row: Bill; Insert: Omit<Bill, "id">; Update: Partial<Bill> };
      bill_items: { Row: BillItem; Insert: Omit<BillItem, "id">; Update: Partial<BillItem> };
      payments: { Row: Payment; Insert: Omit<Payment, "id" | "created_at">; Update: Partial<Payment> };
    };
  };
};
