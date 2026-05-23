import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Toaster } from "@/components/ui/toaster";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Fetch sequentially: org query needs profile.id (not auth user.id)
  const profileResult = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const orgResult = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", profileResult.data?.id ?? "")
    .single();

  const profile = profileResult.data;
  const organization = orgResult.data;

  const headersList = await headers();
  const currentPath = headersList.get("x-pathname") ?? "/dashboard";

  const sidebarUser = {
    name: profile?.full_name ?? user.email ?? "Account",
    email: profile?.email ?? user.email ?? "",
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-40 w-60">
        <Sidebar currentPath={currentPath} user={sidebarUser} />
      </div>
      <div className="flex flex-1 flex-col pl-60 min-h-screen">
        <main className="flex-1 overflow-y-auto">
          <Suspense>{children}</Suspense>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
