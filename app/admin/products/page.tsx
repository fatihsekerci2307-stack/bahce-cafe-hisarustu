import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types";
import { addProduct, updateProduct, toggleProduct } from "./actions";

interface PageProps {
  searchParams: Promise<{ new?: string; edit?: string; cat?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const supabase = await createClient();

  const [{ data: rawCategories }, { data: rawProducts }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*").order("sort_order"),
  ]);

  const categories = (rawCategories ?? []) as Category[];
  const products = (rawProducts ?? []) as Product[];

  const params = await searchParams;
  const isNew = params.new === "1";
  const editingId = params.edit ?? null;
  const filterCat = params.cat ?? "";

  const editingProduct = editingId
    ? (products.find((p) => p.id === editingId) ?? null)
    : null;

  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const filtered = filterCat
    ? products.filter((p) => p.category_id === filterCat)
    : products;

  const nextOrder = products.length + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
        {!isNew && !editingId && (
          <a
            href="/admin/products?new=1"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition"
          >
            + Ürün Ekle
          </a>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isNew || editingProduct) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            {isNew ? "Yeni Ürün" : `Düzenle: ${editingProduct?.name}`}
          </h2>
          <form
            action={isNew ? addProduct : updateProduct}
            className="space-y-4"
          >
            {editingProduct && (
              <input type="hidden" name="id" value={editingProduct.id} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editingProduct?.name ?? ""}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  name="category_id"
                  required
                  defaultValue={editingProduct?.category_id ?? ""}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                >
                  <option value="">Seç…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺)
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={editingProduct?.price ?? ""}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıra
                </label>
                <input
                  name="sort_order"
                  type="number"
                  min="1"
                  required
                  defaultValue={editingProduct?.sort_order ?? nextOrder}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama{" "}
                <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
              </label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingProduct?.description ?? ""}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition"
              >
                {isNew ? "Ekle" : "Kaydet"}
              </button>
              <a
                href="/admin/products"
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition"
              >
                İptal
              </a>
            </div>
          </form>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/products"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            !filterCat
              ? "bg-gray-800 text-white"
              : "bg-white border border-gray-300 text-gray-600 hover:border-gray-500"
          }`}
        >
          Tümü ({products.length})
        </a>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <a
              key={cat.id}
              href={`/admin/products?cat=${cat.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filterCat === cat.id
                  ? "bg-gray-800 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-gray-500"
              }`}
            >
              {cat.name} ({count})
            </a>
          );
        })}
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!filtered.length ? (
          <p className="text-gray-400 text-center py-12 text-sm">
            Henüz ürün yok.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Ad
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Kategori
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-28">
                  Fiyat
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">
                  Durum
                </th>
                <th className="px-4 py-3 w-36"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {catMap.get(product.category_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ₺{Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <a
                        href={`/admin/products?edit=${product.id}${filterCat ? `&cat=${filterCat}` : ""}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Düzenle
                      </a>
                      <form action={toggleProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={String(!product.is_active)}
                        />
                        <button
                          type="submit"
                          className={`text-xs font-medium ${
                            product.is_active
                              ? "text-red-500 hover:text-red-700"
                              : "text-green-600 hover:text-green-800"
                          }`}
                        >
                          {product.is_active ? "Pasife Al" : "Aktife Al"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
