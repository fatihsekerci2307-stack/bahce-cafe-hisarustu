import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";
import { addCategory, updateCategory, toggleCategory } from "./actions";

interface PageProps {
  searchParams: Promise<{ new?: string; edit?: string }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const categories = (rawCategories ?? []) as Category[];

  const params = await searchParams;
  const isNew = params.new === "1";
  const editingId = params.edit ?? null;
  const editingCategory = editingId
    ? (categories.find((c) => c.id === editingId) ?? null)
    : null;

  const nextOrder = categories.length + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
        {!isNew && !editingId && (
          <a
            href="/admin/categories?new=1"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition"
          >
            + Kategori Ekle
          </a>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isNew || editingCategory) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            {isNew ? "Yeni Kategori" : `Düzenle: ${editingCategory?.name}`}
          </h2>
          <form
            action={isNew ? addCategory : updateCategory}
            className="space-y-4 max-w-md"
          >
            {editingCategory && (
              <input type="hidden" name="id" value={editingCategory.id} />
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Adı
              </label>
              <input
                name="name"
                required
                defaultValue={editingCategory?.name ?? ""}
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
                defaultValue={editingCategory?.sort_order ?? nextOrder}
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
                href="/admin/categories"
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition"
              >
                İptal
              </a>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!categories.length ? (
          <p className="text-gray-400 text-center py-12 text-sm">
            Henüz kategori yok.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Ad
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">
                  Sıra
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">
                  Durum
                </th>
                <th className="px-4 py-3 w-36"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        cat.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <a
                        href={`/admin/categories?edit=${cat.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Düzenle
                      </a>
                      <form action={toggleCategory}>
                        <input type="hidden" name="id" value={cat.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={String(!cat.is_active)}
                        />
                        <button
                          type="submit"
                          className={`text-xs font-medium ${
                            cat.is_active
                              ? "text-red-500 hover:text-red-700"
                              : "text-green-600 hover:text-green-800"
                          }`}
                        >
                          {cat.is_active ? "Pasife Al" : "Aktife Al"}
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
