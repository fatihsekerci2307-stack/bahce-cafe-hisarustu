import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business, Category, Product } from "@/types";

interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rawBusiness } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single() as { data: Business | null; error: unknown };

  if (!rawBusiness) notFound();
  const business = rawBusiness;

  const [{ data: rawCategories }, { data: rawProducts }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const categories = (rawCategories ?? []) as Category[];
  const products = (rawProducts ?? []) as Product[];

  const productsByCategory = new Map<string, Product[]>();
  categories.forEach((c) => productsByCategory.set(c.id, []));
  products.forEach((p) => {
    productsByCategory.get(p.category_id)?.push(p);
  });

  const categoriesWithProducts = categories.filter(
    (c) => (productsByCategory.get(c.id)?.length ?? 0) > 0
  );

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-green-800 text-white px-4 py-6 text-center">
        <h1 className="text-2xl font-bold">{business.name}</h1>
        <p className="text-green-300 text-sm mt-1">Nargile Cafe &amp; Menü</p>
      </div>

      {/* Sosyal linkler */}
      {(business.instagram_url || business.google_maps_url || business.wifi_name) && (
        <div className="bg-green-900 px-4 py-3 flex gap-2 justify-center flex-wrap">
          {business.instagram_url && (
            <a
              href={business.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-pink-600 text-white rounded-full text-xs font-medium hover:bg-pink-700 transition"
            >
              Instagram
            </a>
          )}
          {business.google_maps_url && (
            <a
              href={business.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-xs font-medium hover:bg-blue-700 transition"
            >
              Konum
            </a>
          )}
          {business.wifi_name && (
            <span className="px-4 py-1.5 bg-purple-700 text-white rounded-full text-xs font-medium">
              Wi-Fi: {business.wifi_name}
              {business.wifi_password && ` / Şifre: ${business.wifi_password}`}
            </span>
          )}
        </div>
      )}

      {/* Kategori sekmeleri (sticky) */}
      {categoriesWithProducts.length > 1 && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <div className="flex gap-1 px-4 py-2 min-w-max">
              {categoriesWithProducts.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-green-100 hover:text-green-800 transition whitespace-nowrap"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ürün bölümleri */}
      <div className="max-w-xl mx-auto px-4 pb-16 space-y-8 mt-5">
        {categoriesWithProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg">Menü henüz hazır değil.</p>
          </div>
        ) : (
          categoriesWithProducts.map((cat) => {
            const catProducts = productsByCategory.get(cat.id) ?? [];
            return (
              <section key={cat.id} id={`cat-${cat.id}`}>
                <h2 className="text-base font-bold text-green-800 uppercase tracking-wide mb-3 pb-2 border-b-2 border-green-100">
                  {cat.name}
                </h2>
                <div className="space-y-2">
                  {catProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                            {product.description}
                          </div>
                        )}
                      </div>
                      <div className="text-green-700 font-bold text-sm whitespace-nowrap shrink-0">
                        ₺{Number(product.price).toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-300 pb-8">
        {business.name}
      </div>
    </main>
  );
}
