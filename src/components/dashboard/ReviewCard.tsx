"use client";

import * as React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { type Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  onDraftResponse: (reviewId: string) => void;
  onPostResponse: (reviewId: string, responseText: string) => void;
  isGenerating: boolean;
}

function StarRatingInline({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating) ? "text-yellow-400" : "text-slate-200"
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-slate-500">({rating.toFixed(1)})</span>
    </span>
  );
}

function borderColorForRating(rating: number) {
  if (rating <= 2) return "border-red-400";
  if (rating === 3) return "border-amber-400";
  return "border-emerald-400";
}

export function ReviewCard({
  review,
  onDraftResponse,
  onPostResponse,
  isGenerating,
}: ReviewCardProps) {
  const [draftText, setDraftText] = React.useState(
    review.ai_draft_response ?? ""
  );
  const [expanded, setExpanded] = React.useState(false);

  // Sync draft text when the prop changes (e.g. after AI generates)
  React.useEffect(() => {
    if (review.ai_draft_response) {
      setDraftText(review.ai_draft_response);
    }
  }, [review.ai_draft_response]);

  const initials = review.author_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const relativeTime = formatDistanceToNow(new Date(review.published_at), {
    addSuffix: true,
  });

  const isLongText = (review.text?.length ?? 0) > 200;
  const displayText =
    isLongText && !expanded
      ? review.text!.slice(0, 200).trimEnd() + "…"
      : review.text;

  const hasDraft = review.ai_draft_response !== null;
  const hasPostedResponse = review.response_posted && review.response_text;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200",
        "border-l-4",
        borderColorForRating(review.rating)
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-sm font-semibold flex items-center justify-center shrink-0 select-none">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {review.author_name}
            </p>
            <StarRatingInline rating={review.rating} />
          </div>
        </div>
        <span className="text-xs text-slate-400 shrink-0 pt-0.5">
          {relativeTime}
        </span>
      </div>

      {/* Review text */}
      {review.text && (
        <div className="px-5 pb-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {displayText}
          </p>
          {isLongText && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Posted response */}
      {hasPostedResponse && (
        <div className="mx-5 mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Your response
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {review.response_text}
          </p>
        </div>
      )}

      {/* AI Draft section */}
      {!hasPostedResponse && hasDraft && (
        <div className="mx-5 mb-4 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mb-2">
            ✨ AI Draft
          </div>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="w-full text-sm text-slate-700 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 min-h-[80px]"
            placeholder="Edit the draft response…"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onPostResponse(review.id, draftText)}
              disabled={!draftText.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              ✓ Post Response
            </button>
            <button
              onClick={() => onDraftResponse(review.id)}
              disabled={isGenerating}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              {isGenerating ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Regenerating…
                </span>
              ) : (
                "↻ Regenerate"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bottom action bar — no draft, no posted response */}
      {!hasPostedResponse && !hasDraft && (
        <div className="flex items-center gap-2 px-5 pb-5">
          <button
            onClick={() => onDraftResponse(review.id)}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <span>✨</span>
                Generate AI Response
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
