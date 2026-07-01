"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getPosContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single() as { data: { business_id: string } | null; error: unknown };

  if (!data) redirect("/login");
  return { supabase, business_id: data.business_id, user_id: user.id };
}

export async function openBill(formData: FormData) {
  const tableId = formData.get("table_id") as string;
  const { supabase, business_id, user_id } = await getPosContext();

  await supabase.from("bills").insert({
    business_id,
    table_id: tableId,
    opened_by: user_id,
    status: "open",
  } as never);

  revalidatePath(`/pos/table/${tableId}`);
  revalidatePath("/pos");
}

export async function addItem(formData: FormData) {
  const billId = formData.get("bill_id") as string;
  const productId = formData.get("product_id") as string;
  const tableId = formData.get("table_id") as string;
  const { supabase, business_id } = await getPosContext();

  const { data: product } = await supabase
    .from("products")
    .select("name, price")
    .eq("id", productId)
    .single() as { data: { name: string; price: number } | null; error: unknown };

  if (!product) return;

  await supabase.from("bill_items").insert({
    bill_id: billId,
    business_id,
    product_id: productId,
    product_name_snapshot: product.name,
    unit_price_snapshot: product.price,
    quantity: 1,
  } as never);

  revalidatePath(`/pos/table/${tableId}`);
}

export async function removeItem(formData: FormData) {
  const itemId = formData.get("item_id") as string;
  const tableId = formData.get("table_id") as string;
  const { supabase, business_id } = await getPosContext();

  await supabase.from("bill_items").delete().eq("id", itemId).eq("business_id", business_id);
  revalidatePath(`/pos/table/${tableId}`);
}

export async function closeBill(formData: FormData) {
  const billId = formData.get("bill_id") as string;
  const total = parseFloat(formData.get("total") as string);
  const method = (formData.get("method") as string) || "cash";
  const { supabase, business_id } = await getPosContext();

  await supabase
    .from("bills")
    .update({ status: "closed", closed_at: new Date().toISOString() } as never)
    .eq("id", billId)
    .eq("business_id", business_id);

  if (total > 0) {
    await supabase.from("payments").insert({
      bill_id: billId,
      business_id,
      amount: total,
      method,
    } as never);
  }

  revalidatePath("/pos");
  redirect("/pos");
}
