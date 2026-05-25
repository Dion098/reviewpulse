import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Star,
  UserCheck,
  Settings,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Header } from "@/components/dashboard/Header";

export const dynamic = "force-dynamic";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AgencyPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, is_agency, agency_name")
    .eq("owner_id", profile.id)
    .single();

  if (!org) {
    redirect("/login");
  }

  // Not an agency — show upgrade prompt
  if (!org.is_agency) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Agency" subtitle="Manage your client portfolio" />
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Upgrade to the Agency Plan
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            Manage multiple client locations, white-label the dashboard, and
            track revenue across your entire portfolio from one place.
          </p>
          <Link
            href="/dashboard/billing"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            View Agency Plans
          </Link>
        </div>
      </div>
    );
  }

  // Fetch clients
  const { data: clients } = await supabase
    .from("agency_clients")
    .select("id, client_name, client_email, plan, status, monthly_revenue, created_at")
    .eq("agency_org_id", org.id)
    .order("created_at", { ascending: false });

  const clientList = clients ?? [];

  const totalClients = clientList.length;
  const activeClients = clientList.filter((c) => c.status === "active").length;
  const monthlyRevenue = clientList.reduce(
    (sum, c) => sum + (c.monthly_revenue ?? 0),
    0
  );

  // Fetch avg rating across all client locations
  const { data: clientLocations } = await supabase
    .from("agency_clients")
    .select("location_id")
    .eq("agency_org_id", org.id)
    .not("location_id", "is", null);

  const locationIds = (clientLocations ?? [])
    .map((c) => c.location_id)
    .filter(Boolean) as string[];

  let avgRating = 0;
  if (locationIds.length > 0) {
    const { data: locs } = await supabase
      .from("locations")
      .select("avg_rating")
      .in("id", locationIds);
    const ratings = (locs ?? []).map((l) => l.avg_rating ?? 0);
    avgRating =
      ratings.length > 0
        ? ratings.reduce((s, r) => s + r, 0) / ratings.length
        : 0;
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Agency"
        subtitle={org.agency_name ?? org.name}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/agency/settings"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <Settings className="h-4 w-4" />
              Agency Settings
            </Link>
            <Link
              href="/dashboard/agency/clients/new"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <UserPlus className="h-4 w-4" />
              Add Client
            </Link>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-8 animate-fade-up">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <StatsCard
            title="Total Clients"
            value={totalClients.toLocaleString()}
            change={`${activeClients} active`}
            changeType="neutral"
            icon={<Users className="h-5 w-5 text-white" />}
            iconColor="bg-indigo-500"
          />
          <StatsCard
            title="Active Clients"
            value={activeClients.toLocaleString()}
            change={
              totalClients > 0
                ? `${Math.round((activeClients / totalClients) * 100)}% of total`
                : "No clients yet"
            }
            changeType={activeClients > 0 ? "positive" : "neutral"}
            icon={<UserCheck className="h-5 w-5 text-white" />}
            iconColor="bg-emerald-500"
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyRevenue)}
            change={`${totalClients} client${totalClients !== 1 ? "s" : ""}`}
            changeType={monthlyRevenue > 0 ? "positive" : "neutral"}
            icon={<DollarSign className="h-5 w-5 text-white" />}
            iconColor="bg-violet-500"
          />
          <StatsCard
            title="Avg Client Rating"
            value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
            change={
              avgRating >= 4.5
                ? "Excellent"
                : avgRating >= 4
                ? "Good"
                : avgRating > 0
                ? "Needs work"
                : "No data"
            }
            changeType={
              avgRating >= 4 ? "positive" : avgRating > 0 ? "negative" : "neutral"
            }
            icon={<Star className="h-5 w-5 text-white" />}
            iconColor="bg-amber-500"
          />
        </div>

        {/* Clients table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Clients</h3>
            <Link
              href="/dashboard/agency/clients/new"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add client
            </Link>
          </div>

          {clientList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-1">
                No clients yet
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Add your first client to start tracking their performance.
              </p>
              <Link
                href="/dashboard/agency/clients/new"
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Add Client
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Monthly Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {clientList.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {client.client_name}
                          </p>
                          {client.client_email && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {client.client_email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-slate-700">
                          {client.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            client.status === "active"
                              ? "inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                              : "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                          }
                        >
                          {client.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        {formatCurrency(client.monthly_revenue ?? 0)}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(client.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
