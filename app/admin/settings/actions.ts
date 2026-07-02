"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bizUser } = await supabase
    .from("business_users")
    .select("business_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single() as { data: { business_id: string; role: string } | null; error: unknown };

  if (!bizUser) redirect("/login");
  if (bizUser.role !== "owner") redirect("/admin/settings?error=forbidden");

  const instagram_url = (formData.get("instagram_url") as string).trim() || null;
  const google_maps_url = (formData.get("google_maps_url") as string).trim() || null;
  const wifi_name = (formData.get("wifi_name") as string).trim() || null;
  const wifi_password = (formData.get("wifi_password") as string).trim() || null;

  const { data, error } = await supabase
    .from("businesses")
    .update({ instagram_url, google_maps_url, wifi_name, wifi_password } as never)
    .eq("id", bizUser.business_id)
    .select() as { data: { slug: string }[] | null; error: unknown };

  if (error || !data || data.length === 0) {
    redirect("/admin/settings?error=save_failed");
  }

  revalidatePath("/admin/settings");
  revalidatePath(`/menu/${data[0].slug}`);
  redirect("/admin/settings?success=1");
}
