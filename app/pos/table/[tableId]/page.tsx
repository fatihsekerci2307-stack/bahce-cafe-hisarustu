import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Table, Bill, BillItem, Category, Product } from "@/types";
import { openBill, addItem, removeItem, closeBill } from "./actions";

interface TablePageProps {
  params: Promise<{ tableId: string }>;
  searchParams: Promise<{ cat?: string }>;
}

export default async function TablePage({ params, searchParams }: TablePageProps) {
  const { tableId } = await params;
  const { cat: selectedCatId } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: bizData } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .single() as { data: { business_id: string } | null; error: unknown };

  if (!bizData) notFound();
  const { business_id } = bizData;

  const { data: rawTable } = await supabase
    .from("tables")
    .select("*")
    .eq("id", tableId)
    .eq("business_id", business_id)
    .single() as { data: Table | null; error: unknown };

  if (!rawTable) notFound();
  const table = rawTable;

  const { data: rawBill } = await supabase
    .from("bills")
    .select("*")
    .eq("table_id", tableId)
    .eq("status", "open")
    .maybeSingle() as { data: Bill | null; error: unknown };

  const bill = rawBill;

  let items: BillItem[] = [];
  if (bill) {
    const { data: rawItems } = await supabase
      .from("bill_items")
      .select("*")
      .eq("bill_id", bill.id) as { data: BillItem[] | null; error: unknown };
    items = (rawItems ?? []) as BillItem[];
  }

  const [{ data: rawCategories }, { data: rawProducts }] = await Promise.all([
    supabase.from("categories").select("*").eq("business_id", business_id).eq("is_active", true).order("sort_order"),
    supabase.from("products").select("*").eq("business_id", business_id).eq("is_active", true).order("sort_order"),
  ]);

  const categories = (rawCategories ?? []) as Category[];
  const products = (rawProducts ?? []) as Product[];

  const activeCatId = selectedCatId ?? categories[0]?.id;
  const filteredProducts = products.filter((p) => p.category_id === activeCatId);

  const total = items.reduce((sum, item) => sum + item.unit_price_snapshot * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Sub-header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <Link href="/pos" className="text-blue-600 text-sm font-medium">
          Masalar
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-bold text-gray-900">{table.display_name}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          bill ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
        }`}>
          {bill ? "Dolu" : "Boş"}
        </span>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* No bill */}
        {!bill && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500 mb-5">Bu masada açık adisyon yok.</p>
            <form action={openBill}>
              <input type="hidden" name="table_id" value={tableId} />
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition active:scale-95"
              >
                Adisyon Aç
              </button>
            </form>
          </div>
        )}

        {/* Open bill */}
        {bill && (
          <>
            {/* Item list */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800">Sipariş</span>
                <span className="text-sm text-gray-400">{items.length} kalem</span>
              </div>

              {items.length === 0 ? (
                <p className="px-4 py-8 text-sm text-gray-400 text-center">
                  Henüz ürün eklenmedi.
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 leading-tight">
                          {item.product_name_snapshot}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {item.quantity} × ₺{Number(item.unit_price_snapshot).toFixed(0)}
                        </div>
                      </div>
                      <div className="font-semibold text-gray-700 text-sm tabular-nums">
                        ₺{(item.unit_price_snapshot * item.quantity).toFixed(0)}
                      </div>
                      <form action={removeItem}>
                        <input type="hidden" name="item_id" value={item.id} />
                        <input type="hidden" name="table_id" value={tableId} />
                        <button
                          type="submit"
                          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition text-xl leading-none"
                          title="Kaldır"
                        >
                          ×
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800">Toplam</span>
                <span className="font-bold text-xl text-blue-700 tabular-nums">
                  ₺{total.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Close bill */}
            <form action={closeBill}>
              <input type="hidden" name="bill_id" value={bill.id} />
              <input type="hidden" name="total" value={total.toString()} />
              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <p className="font-semibold text-gray-700 text-sm">Ödeme Yöntemi</p>
                <div className="flex gap-2">
                  {(["cash", "card", "other"] as const).map((m) => (
                    <label key={m} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="method"
                        value={m}
                        defaultChecked={m === "cash"}
                        className="sr-only peer"
                      />
                      <span className="block text-center py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-500 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition">
                        {m === "cash" ? "Nakit" : m === "card" ? "Kart" : "Diğer"}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-base hover:bg-blue-700 transition active:scale-95"
                >
                  Adisyonu Kapat — ₺{total.toFixed(0)}
                </button>
              </div>
            </form>

            {/* Product picker */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-800">Ürün Ekle</span>
                </div>

                {/* Category tabs */}
                <div className="overflow-x-auto border-b border-gray-100">
                  <div className="flex min-w-max">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/pos/table/${tableId}?cat=${cat.id}`}
                        className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                          cat.id === activeCatId
                            ? "border-blue-500 text-blue-700 bg-blue-50"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Products grid */}
                <div className="p-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {filteredProducts.length === 0 && (
                    <p className="col-span-2 sm:col-span-3 text-center text-sm text-gray-400 py-6">
                      Bu kategoride ürün yok.
                    </p>
                  )}
                  {filteredProducts.map((product) => (
                    <form key={product.id} action={addItem}>
                      <input type="hidden" name="bill_id" value={bill.id} />
                      <input type="hidden" name="product_id" value={product.id} />
                      <input type="hidden" name="table_id" value={tableId} />
                      <button
                        type="submit"
                        className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition active:scale-95"
                      >
                        <div className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
                          {product.name}
                        </div>
                        <div className="text-sm font-bold text-blue-600 mt-1">
                          +₺{Number(product.price).toFixed(0)}
                        </div>
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
