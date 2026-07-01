import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bizUser } = await supabase
    .from("business_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single() as { data: { role: string } | null; error: unknown };

  if (!bizUser) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <span className="font-bold text-lg">Adisyon Paneli</span>
        <div className="flex items-center gap-3">
          <span className="text-blue-200 text-sm capitalize">{bizUser.role}</span>
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
