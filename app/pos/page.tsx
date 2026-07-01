import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Area, Table } from "@/types";

interface OpenBillRow {
  id: string;
  table_id: string;
}

export default async function PosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: bizData } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .single() as { data: { business_id: string } | null; error: unknown };

  if (!bizData) {
    return <p className="p-8 text-center text-red-500">İşletme bulunamadı.</p>;
  }
  const { business_id } = bizData;

  const [{ data: rawAreas }, { data: rawTables }, { data: rawBills }] = await Promise.all([
    supabase.from("areas").select("*").eq("business_id", business_id).eq("is_active", true).order("sort_order"),
    supabase.from("tables").select("*").eq("business_id", business_id).eq("is_active", true).order("sort_order"),
    supabase.from("bills").select("id, table_id").eq("business_id", business_id).eq("status", "open"),
  ]);

  const areas = (rawAreas ?? []) as Area[];
  const tables = (rawTables ?? []) as Table[];
  const openBills = (rawBills ?? []) as OpenBillRow[];

  const openTableIds = new Set(openBills.map((b) => b.table_id));

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 mt-2">
      {areas.length === 0 && (
        <p className="text-center text-gray-400 py-16">Henüz alan tanımlı değil.</p>
      )}
      {areas.map((area) => {
        const areaTables = tables.filter((t) => t.area_id === area.id);
        if (areaTables.length === 0) return null;
        return (
          <section key={area.id}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
              {area.name}
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {areaTables.map((table) => {
                const isOpen = openTableIds.has(table.id);
                return (
                  <Link
                    key={table.id}
                    href={`/pos/table/${table.id}`}
                    className={`rounded-2xl p-4 text-center border-2 transition active:scale-95 select-none ${
                      isOpen
                        ? "bg-red-50 border-red-300 hover:bg-red-100"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <p className={`font-bold text-base leading-tight ${isOpen ? "text-red-700" : "text-gray-800"}`}>
                      {table.display_name}
                    </p>
                    <p className={`text-xs mt-1 font-medium ${isOpen ? "text-red-400" : "text-gray-400"}`}>
                      {isOpen ? "Dolu" : "Boş"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
