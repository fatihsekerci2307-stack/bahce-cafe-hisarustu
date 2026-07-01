import { createClient } from "@/lib/supabase/server";
import type { Bill, Payment, Table, PaymentMethod } from "@/types";

interface ReportsPageProps {
  searchParams: Promise<{ date?: string }>;
}

const methodLabels: Record<PaymentMethod, string> = {
  cash: "Nakit",
  card: "Kart",
  other: "Diğer",
};

function todayInputValue() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { date } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bizData } = (await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .single()) as { data: { business_id: string } | null; error: unknown };

  if (!bizData) {
    return <p className="text-center text-red-500 py-16">İşletme bulunamadı.</p>;
  }
  const { business_id } = bizData;

  const selectedDate = date ?? todayInputValue();
  const startOfDay = new Date(`${selectedDate}T00:00:00`);
  const endOfDay = new Date(`${selectedDate}T23:59:59.999`);

  const { data: rawBills } = (await supabase
    .from("bills")
    .select("*")
    .eq("business_id", business_id)
    .eq("status", "closed")
    .gte("closed_at", startOfDay.toISOString())
    .lte("closed_at", endOfDay.toISOString())
    .order("closed_at", { ascending: false })) as { data: Bill[] | null; error: unknown };

  const bills = (rawBills ?? []) as Bill[];
  const billIds = bills.map((b) => b.id);

  let payments: Payment[] = [];
  if (billIds.length > 0) {
    const { data: rawPayments } = (await supabase
      .from("payments")
      .select("*")
      .in("bill_id", billIds)) as { data: Payment[] | null; error: unknown };
    payments = (rawPayments ?? []) as Payment[];
  }

  const { data: rawTables } = (await supabase
    .from("tables")
    .select("*")
    .eq("business_id", business_id)) as { data: Table[] | null; error: unknown };
  const tables = (rawTables ?? []) as Table[];
  const tableMap = new Map(tables.map((t) => [t.id, t.display_name]));

  const paymentsByBill = new Map<string, Payment[]>();
  payments.forEach((p) => {
    const arr = paymentsByBill.get(p.bill_id) ?? [];
    arr.push(p);
    paymentsByBill.set(p.bill_id, arr);
  });

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const methodTotals = new Map<PaymentMethod, number>();
  payments.forEach((p) => {
    methodTotals.set(p.method, (methodTotals.get(p.method) ?? 0) + Number(p.amount));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Gün Sonu Raporu</h1>
        <form className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={selectedDate}
            max={todayInputValue()}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            Filtrele
          </button>
        </form>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Toplam Ciro</p>
          <p className="text-2xl font-bold text-green-700 mt-1">₺{totalRevenue.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Kapanan Adisyon</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{bills.length}</p>
        </div>
        {(Object.keys(methodLabels) as PaymentMethod[]).map((m) => (
          <div key={m} className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{methodLabels[m]}</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">
              ₺{(methodTotals.get(m) ?? 0).toFixed(0)}
            </p>
          </div>
        ))}
      </div>

      {/* Kapalı adisyon listesi */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-800">
          Kapalı Adisyonlar — {selectedDate}
        </div>
        {bills.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">Bu tarihte kapalı adisyon yok.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-2 font-medium">Masa</th>
                <th className="px-5 py-2 font-medium">Kapanış Saati</th>
                <th className="px-5 py-2 font-medium">Ödeme</th>
                <th className="px-5 py-2 font-medium text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bills.map((bill) => {
                const billPayments = paymentsByBill.get(bill.id) ?? [];
                const billTotal = billPayments.reduce((s, p) => s + Number(p.amount), 0);
                const methods = billPayments
                  .map((p) => methodLabels[p.method] ?? p.method)
                  .join(", ");
                return (
                  <tr key={bill.id}>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {tableMap.get(bill.table_id) ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {bill.closed_at
                        ? new Date(bill.closed_at).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{methods || "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-800">
                      ₺{billTotal.toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
