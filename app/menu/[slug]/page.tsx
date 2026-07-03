import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Business, Category, Product } from "@/types";
import Reveal from "@/components/menu/Reveal";

interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

function ProductImage({ src, className }: { src: string | null; className: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`${className} object-cover transition-transform duration-300 group-active:scale-105`}
      />
    );
  }
  return (
    <div
      className={`${className} bg-brand-cream flex items-center justify-center text-brand-gold/50`}
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 13.5l2-2.2 2.4 2.6L16 10l2 3" />
      </svg>
    </div>
  );
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

  const featured = products.filter((p) => p.is_featured).slice(0, 6);

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-green-dark px-4 pb-8 pt-10 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(560px 280px at 50% 0%, rgba(212,175,106,0.16), transparent)",
          }}
        />
        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-brand-gold-light/80">
            Hoş geldiniz
          </p>
          <h1 className="font-display mt-2 text-[28px] font-semibold italic text-white">
            {business.name}
          </h1>
          <div className="mx-auto mt-3 h-px w-10 bg-brand-gold-light/60" />
          <p className="mt-3 text-[13px] tracking-wide text-white/60">
            Nargile Cafe &amp; Menü
          </p>
        </div>
      </div>

      {/* Sosyal linkler */}
      {(business.instagram_url || business.google_maps_url || business.wifi_name) && (
        <div className="flex flex-wrap justify-center gap-2 bg-brand-green px-4 py-3">
          {business.instagram_url && (
            <a
              href={business.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:border-white/50 hover:text-white"
            >
              Instagram
            </a>
          )}
          {business.google_maps_url && (
            <a
              href={business.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-medium text-white/90 transition hover:border-white/50 hover:text-white"
            >
              Konum
            </a>
          )}
          {business.wifi_name && (
            <span className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-medium text-white/90">
              Wi-Fi: {business.wifi_name}
              {business.wifi_password && ` · ${business.wifi_password}`}
            </span>
          )}
        </div>
      )}

      {/* İletişim bilgileri */}
      {(business.phone || business.address || business.hours_text) && (
        <div className="flex flex-col items-center gap-1 border-b border-brand-ink/[0.06] bg-white px-4 py-3 text-center text-xs text-brand-ink/50">
          {business.address && <p>{business.address}</p>}
          <p>
            {business.phone && (
              <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="text-brand-green">
                {business.phone}
              </a>
            )}
            {business.phone && business.hours_text && <span className="mx-1.5">·</span>}
            {business.hours_text}
          </p>
        </div>
      )}

      {/* Beklerken oyna */}
      <div className="mx-auto max-w-xl px-4 pt-5">
        <Link
          href={`/menu/${slug}/game`}
          className="flex items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-white py-3 text-sm font-medium text-brand-green-dark shadow-[0_1px_2px_rgba(28,26,23,0.04)] transition hover:border-brand-gold/60 active:scale-[0.99]"
        >
          <span className="text-brand-gold">✦</span> Beklerken Oyna — Nargile Hazırla
        </Link>
      </div>

      {/* Kategori sekmeleri (sticky) */}
      {categoriesWithProducts.length > 1 && (
        <div className="sticky top-0 z-10 mt-5 border-b border-brand-ink/10 bg-brand-cream/90 backdrop-blur">
          <div className="mx-auto max-w-xl overflow-x-auto">
            <div className="flex min-w-max gap-5 px-4">
              {categoriesWithProducts.map((cat) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.id}`}
                  className="whitespace-nowrap border-b-2 border-transparent py-3 text-[13px] font-medium uppercase tracking-wide text-brand-ink/45 transition hover:text-brand-ink/80"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-xl px-4 pb-16">
        {categoriesWithProducts.length === 0 ? (
          <div className="py-16 text-center text-brand-ink/30">
            <p className="text-lg">Menü henüz hazır değil.</p>
          </div>
        ) : (
          <>
            {/* Şefin önerisi (öne çıkanlar) — kaydırılabilir galeri */}
            {featured.length > 0 && (
              <Reveal className="mb-10 mt-7">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-brand-gold">✦</span>
                  <h2 className="font-display text-lg italic text-brand-green-dark">
                    Şefin Önerisi
                  </h2>
                </div>
                <div className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {featured.map((product) => (
                    <div
                      key={product.id}
                      className="group w-[62%] shrink-0 snap-start overflow-hidden rounded-2xl border border-brand-ink/[0.06] bg-white shadow-[0_2px_10px_rgba(28,26,23,0.05)] transition-transform duration-150 active:scale-[0.98]"
                    >
                      <ProductImage src={product.image_url} className="aspect-[4/3] w-full" />
                      <div className="p-3">
                        <div className="font-display text-[15px] font-medium leading-tight text-brand-ink">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="mt-1 line-clamp-2 text-xs italic text-brand-ink/40">
                            {product.description}
                          </div>
                        )}
                        <div className="font-display mt-2 text-sm font-semibold text-brand-green">
                          ₺{Number(product.price).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Ürün bölümleri */}
            <div className="space-y-9">
              {categoriesWithProducts.map((cat, catIndex) => {
                const catProducts = productsByCategory.get(cat.id) ?? [];
                return (
                  <Reveal
                    key={cat.id}
                    delayMs={Math.min(catIndex, 3) * 80}
                    className="scroll-mt-16"
                  >
                    <section id={`cat-${cat.id}`}>
                      <div className="mb-4">
                        <h2 className="font-display text-xl italic text-brand-green-dark">
                          {cat.name}
                        </h2>
                        <div className="mt-1.5 h-px w-9 bg-brand-gold" />
                      </div>
                      <div className="space-y-2.5">
                        {catProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3.5 rounded-2xl border border-brand-ink/[0.06] bg-white p-2.5 shadow-[0_1px_3px_rgba(28,26,23,0.04)] transition-transform duration-150 active:scale-[0.98]"
                          >
                            <div className="group h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl">
                              <ProductImage src={product.image_url} className="h-full w-full" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[15px] font-medium text-brand-ink">
                                {product.name}
                              </div>
                              {product.description && (
                                <div className="mt-0.5 line-clamp-1 text-xs italic text-brand-ink/40">
                                  {product.description}
                                </div>
                              )}
                            </div>
                            <div className="font-display shrink-0 whitespace-nowrap pr-1 text-[15px] font-semibold text-brand-green">
                              ₺{Number(product.price).toFixed(0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-brand-ink/[0.06] py-8 text-center">
        <div className="font-display mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green text-xs italic text-white">
          B
        </div>
        <p className="text-xs text-brand-ink/35">{business.name}</p>
      </div>
    </main>
  );
}
