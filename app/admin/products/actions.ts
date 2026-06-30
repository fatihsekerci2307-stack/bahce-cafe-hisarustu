"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getBusinessId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single() as { data: { business_id: string } | null; error: unknown };
  if (!data) redirect("/login");
  return { supabase, business_id: data.business_id };
}

export async function addProduct(formData: FormData) {
  const { supabase, business_id } = await getBusinessId();
  const description = (formData.get("description") as string).trim();
  await supabase.from("products").insert({
    business_id,
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    description: description || null,
    price: Number(formData.get("price")),
    sort_order: Number(formData.get("sort_order")),
    is_active: true,
    is_featured: false,
  } as never);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(formData: FormData) {
  const { supabase } = await getBusinessId();
  const id = formData.get("id") as string;
  const description = (formData.get("description") as string).trim();
  await supabase
    .from("products")
    .update({
      category_id: formData.get("category_id") as string,
      name: formData.get("name") as string,
      description: description || null,
      price: Number(formData.get("price")),
      sort_order: Number(formData.get("sort_order")),
    } as never)
    .eq("id", id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProduct(formData: FormData) {
  const { supabase } = await getBusinessId();
  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";
  await supabase.from("products").update({ is_active } as never).eq("id", id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
