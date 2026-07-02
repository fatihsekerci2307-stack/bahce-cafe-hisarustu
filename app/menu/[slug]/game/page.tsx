import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/types";
import NargilePrepGame from "@/components/menu/NargilePrepGame";

interface GamePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
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

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="bg-green-800 text-white px-4 py-4 text-center">
        <Link
          href={`/menu/${slug}`}
          className="text-green-200 text-xs hover:text-white transition"
        >
          ← Menüye Dön
        </Link>
        <h1 className="text-lg font-bold mt-1">Nargile Hazırlama Oyunu</h1>
        <p className="text-green-300 text-[11px] mt-0.5">
          🔞 Yetişkin konsept mini oyun — sadece eğlence amaçlıdır
        </p>
      </div>
      <NargilePrepGame businessName={business.name} slug={slug} />
    </main>
  );
}
