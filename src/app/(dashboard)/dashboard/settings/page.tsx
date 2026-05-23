import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/dashboard/Header";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const googleAccountName: string | null = profile
    ? await (async () => {
        const { data: org } = await supabase
          .from("organizations")
          .select("google_account_name")
          .eq("owner_id", profile.id)
          .single();
        return org?.google_account_name ?? null;
      })()
    : null;

  const resolvedParams = await searchParams;
  const googleStatus = typeof resolvedParams.google === "string"
    ? resolvedParams.google
    : null;

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" />
      <SettingsClient
        googleAccountName={googleAccountName}
        googleStatus={googleStatus}
      />
    </div>
  );
}
