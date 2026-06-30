"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

export async function addCategory(formData: FormData) {
  const { supabase, business_id } = await getBusinessId();
  const name = formData.get("name") as string;
  const sort_order = Number(formData.get("sort_order"));
  await supabase.from("categories").insert({
    business_id,
    name,
    slug: toSlug(name),
    sort_order,
    is_active: true,
  } as never);
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  const { supabase } = await getBusinessId();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const sort_order = Number(formData.get("sort_order"));
  await supabase
    .from("categories")
    .update({ name, slug: toSlug(name), sort_order } as never)
    .eq("id", id);
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function toggleCategory(formData: FormData) {
  const { supabase } = await getBusinessId();
  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";
  await supabase.from("categories").update({ is_active } as never).eq("id", id);
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
