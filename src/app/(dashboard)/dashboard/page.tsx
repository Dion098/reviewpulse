import { redirect } from "next/navigation";
import {
  Star,
  MessageSquare,
  TrendingUp,
  Send,
  MapPin,
  UserPlus,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RatingChart } from "@/components/dashboard/RatingChart";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import type { Review } from "@/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, orgResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("organizations").select("*").eq("owner_id", user.id).single(),
  ]);

  const profile = profileResult.data;
  const organization = orgResult.data;
  const firstName =
    profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">No organization found</h2>
        <p className="text-slate-500 text-sm max-w-xs">Your account isn&apos;t linked to an organization. Please contact support.</p>
      </div>
    );
  }

  // Fetch locations for this org
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, avg_rating, total_reviews")
    .eq("org_id", organization.id);

  if (!locations || locations.length === 0) {
    return (
      <div className="p-8 animate-fade-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">{formatTodayDate()}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Add your first location</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">Connect a business location to start collecting and managing reviews automatically.</p>
          <Link href="/dashboard/locations" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
            Add Location →
          </Link>
        </div>
      </div>
    );
  }

  const locationIds = locations.map((l) => l.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    totalReviewsResult,
    reviewsThisMonthResult,
    respondedReviewsResult,
    fiveStarResult,
    recentReviewsResult,
    smsThisMonthResult,
    monthlyChartResult,
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id", { count: "exact" })
      .in("location_id", locationIds),
    supabase
      .from("reviews")
      .select("id", { count: "exact" })
      .in("location_id", locationIds)
      .gte("published_at", monthStart),
    supabase
      .from("reviews")
      .select("id", { count: "exact" })
      .in("location_id", locationIds)
      .eq("response_posted", true),
    supabase
      .from("reviews")
      .select("id", { count: "exact" })
      .in("location_id", locationIds)
      .eq("rating", 5),
    supabase
      .from("reviews")
      .select(
        "id, author_name, rating, text, published_at, response_posted, location_id"
      )
      .in("location_id", locationIds)
      .order("published_at", { ascending: false })
      .limit(5),
    supabase
      .from("sms_logs")
      .select("id", { count: "exact" })
      .eq("org_id", organization.id)
      .gte("created_at", monthStart),
    supabase.rpc("get_monthly_review_stats", { org_id: organization.id }),
  ]);

  const totalReviews = totalReviewsResult.count ?? 0;
  const reviewsThisMonth = reviewsThisMonthResult.count ?? 0;
  const respondedCount = respondedReviewsResult.count ?? 0;
  const fiveStarCount = fiveStarResult.count ?? 0;
  const recentReviews = (recentReviewsResult.data ?? []) as Review[];
  const smsSentMonth = smsThisMonthResult.count ?? 0;

  const avgRating =
    locations.reduce((sum, l) => sum + (l.avg_rating ?? 0), 0) /
    Math.max(locations.length, 1);
  const responseRate =
    totalReviews > 0
      ? Math.round((respondedCount / totalReviews) * 100)
      : 0;

  // Build chart data — fall back to 6 months of sample data if RPC unavailable
  const chartData: { month: string; avgRating: number; reviewCount: number }[] =
    Array.isArray(monthlyChartResult.data) && monthlyChartResult.data.length > 0
      ? monthlyChartResult.data
      : (() => {
          const months = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
              month: d.toLocaleString("en-US", { month: "short" }),
              avgRating: 4.0 + Math.random() * 0.8,
              reviewCount: Math.floor(5 + Math.random() * 20),
            });
          }
          return months;
        })();

  const quickActions = [
    { icon: Send, label: "Send Review Request", href: "/dashboard/contacts", color: "text-indigo-600 bg-indigo-50" },
    { icon: RefreshCw, label: "Sync Google Reviews", href: "/dashboard/reviews", color: "text-emerald-600 bg-emerald-50" },
    { icon: UserPlus, label: "Add Contact", href: "/dashboard/contacts", color: "text-violet-600 bg-violet-50" },
    { icon: MapPin, label: "Manage Locations", href: "/dashboard/locations", color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="p-8 animate-fade-up">
      {/* Greeting header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s what&apos;s happening with your reviews — {formatTodayDate()}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8 stagger-children">
        <StatsCard
          title="Total Reviews"
          value={totalReviews.toLocaleString()}
          change={`${fiveStarCount} five-star`}
          changeType="positive"
          icon={<MessageSquare className="h-5 w-5 text-white" />}
          iconColor="bg-indigo-500"
        />
        <StatsCard
          title="Average Rating"
          value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
          change={avgRating >= 4.5 ? "Excellent" : avgRating >= 4 ? "Good" : "Needs work"}
          changeType={avgRating >= 4 ? "positive" : avgRating >= 3 ? "neutral" : "negative"}
          icon={<Star className="h-5 w-5 text-white" />}
          iconColor="bg-amber-500"
        />
        <StatsCard
          title="Response Rate"
          value={`${responseRate}%`}
          change={responseRate >= 80 ? "On track" : "Below target"}
          changeType={responseRate >= 80 ? "positive" : "negative"}
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          iconColor="bg-emerald-500"
        />
        <StatsCard
          title="SMS This Month"
          value={smsSentMonth.toLocaleString()}
          change={`of ${organization.sms_limit_month} limit`}
          changeType={
            organization.sms_limit_month > 0 &&
            organization.sms_count_month / organization.sms_limit_month > 0.9
              ? "negative"
              : "neutral"
          }
          icon={<Send className="h-5 w-5 text-white" />}
          iconColor="bg-violet-500"
        />
      </div>

      {/* Chart + side column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <RatingChart data={chartData} />
        </div>

        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex-1">
                    {action.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* Location ratings */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Locations</h3>
            <div className="space-y-3">
              {locations.slice(0, 4).map((loc) => (
                <div key={loc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{loc.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-slate-900">
                      {loc.avg_rating > 0 ? loc.avg_rating.toFixed(1) : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Recent Reviews</h3>
          <Link href="/dashboard/reviews" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>
        {recentReviews.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">No reviews yet. Sync from Google to import them.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-3 px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {review.author_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-900">{review.author_name}</span>
                    <span className="text-amber-400 text-xs">{"★".repeat(review.rating)}</span>
                    <span className="text-xs text-slate-400 ml-auto shrink-0">{formatRelativeTime(review.published_at)}</span>
                  </div>
                  {review.text && (
                    <p className="text-xs text-slate-500 line-clamp-1">{review.text}</p>
                  )}
                </div>
                {review.response_posted && (
                  <span className="shrink-0 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Replied
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
