"use client";

import * as React from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import type { Review } from "@/types";

type FilterTab = "all" | "needs_response" | "responded" | "five_star" | "critical";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_response", label: "Needs Reply" },
  { key: "responded", label: "Responded" },
  { key: "five_star", label: "5 Star" },
  { key: "critical", label: "Critical" },
];

const PAGE_SIZE = 20;

// Per-tab counts derived from the total for display purposes
// (Counts are approximate; replace with real counts from API if available)
function useTabCounts(reviews: Review[], total: number, filter: FilterTab) {
  // We surface total for the active tab; other tab counts would need API support
  return (tab: FilterTab) => (tab === filter ? total : undefined);
}

export default function ReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<FilterTab>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [generatingId, setGeneratingId] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [tabCounts, setTabCounts] = React.useState<Partial<Record<FilterTab, number>>>({});

  const fetchReviews = React.useCallback(
    async (currentFilter: FilterTab, currentPage: number, currentSearch: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          filter: currentFilter,
          page: String(currentPage),
          limit: String(PAGE_SIZE),
        });
        if (currentSearch.trim()) {
          params.set("search", currentSearch.trim());
        }
        const res = await fetch(`/api/reviews?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch reviews: ${res.statusText}`);
        }
        const json = await res.json();
        setReviews(json.reviews ?? []);
        setTotal(json.total ?? 0);
        // Capture per-tab counts if the API returns them
        if (json.counts) {
          setTabCounts(json.counts);
        } else {
          setTabCounts((prev) => ({ ...prev, [currentFilter]: json.total ?? 0 }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchReviews(filter, page, search);
  }, [filter, page, fetchReviews]);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchReviews(filter, 1, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleGenerateResponse = async (reviewId: string) => {
    setGeneratingId(reviewId);
    try {
      const res = await fetch("/api/ai/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      if (!res.ok) {
        throw new Error("Failed to generate response");
      }
      const { draft } = await res.json();
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, ai_draft_response: draft } : r
        )
      );
      toast.success("AI response generated");
    } catch {
      toast.error("Failed to generate AI response. Please try again.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handlePostResponse = async (reviewId: string, responseText: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseText }),
      });
      if (!res.ok) {
        throw new Error("Failed to post response");
      }
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                response_posted: true,
                response_text: responseText,
                responded_at: new Date().toISOString(),
              }
            : r
        )
      );
      toast.success("Response posted successfully");
    } catch {
      toast.error("Failed to post response. Please try again.");
    }
  };

  const handleSyncGoogle = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/reviews/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      toast.success("Google reviews synced");
      fetchReviews(filter, page, search);
    } catch {
      toast.error("Failed to sync reviews. Check your Google integration.");
    } finally {
      setSyncing(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeStart = (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reviews"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncGoogle}
            disabled={syncing}
            className="gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync from Google"}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto w-full">
          {/* Search + sync row */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search reviews…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border border-slate-200 rounded-xl text-sm w-64 h-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
            {/* Sync button mirrors the header action but lives inline on mobile-like layouts */}
          </div>

          {/* Filter tabs — pill style */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
            {TABS.map((tab) => {
              const count = tabCounts[tab.key];
              const isActive = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setFilter(tab.key);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  {count !== undefined && (
                    <span className="ml-1.5 text-xs opacity-70">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-5 h-40 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-28 bg-slate-200 rounded" />
                      <div className="h-2.5 w-20 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-full bg-slate-100 rounded" />
                    <div className="h-2.5 w-4/5 bg-slate-100 rounded" />
                    <div className="h-2.5 w-3/5 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => fetchReviews(filter, page, search)}
              >
                Retry
              </Button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Star className="h-7 w-7 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {search ? "No reviews found" : "No reviews yet"}
              </h3>
              <p className="text-sm text-slate-500 max-w-xs">
                {search
                  ? "No reviews match your search. Try a different query."
                  : filter === "needs_response"
                  ? "All reviews have been responded to — great job!"
                  : "Sync from Google to import your reviews."}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onDraftResponse={handleGenerateResponse}
                    onPostResponse={handlePostResponse}
                    isGenerating={generatingId === review.id}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Showing {rangeStart}–{rangeEnd} of {total} reviews
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    <span className="text-sm text-slate-500 px-1">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
