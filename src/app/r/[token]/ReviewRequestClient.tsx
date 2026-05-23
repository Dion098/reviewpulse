"use client";

import * as React from "react";

interface Props {
  businessName: string;
  locationName: string;
  token: string;
  googleReviewUrl: string | null;
}

type FlowState =
  | { step: "rating" }
  | { step: "redirecting" }
  | { step: "feedback" }
  | { step: "done"; variant: "google" | "feedback" };

export default function ReviewRequestClient({
  businessName,
  locationName,
  token,
  googleReviewUrl,
}: Props) {
  const [flow, setFlow] = React.useState<FlowState>({ step: "rating" });
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [feedbackText, setFeedbackText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const showLocationName =
    locationName !== businessName && locationName.length > 0;

  // Submit the star rating
  const handleSubmitRating = async () => {
    if (selectedRating === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/review-requests/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selectedRating }),
      });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      const data = (await res.json()) as {
        action?: string;
        redirect?: string;
      };

      if (data.action === "google") {
        setFlow({ step: "redirecting" });
        const url = data.redirect ?? googleReviewUrl;
        if (url) {
          setTimeout(() => {
            window.open(url, "_blank", "noopener,noreferrer");
            setFlow({ step: "done", variant: "google" });
          }, 1500);
        } else {
          setFlow({ step: "done", variant: "google" });
        }
      } else {
        setFlow({ step: "feedback" });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit written feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/review-requests/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedbackText.trim() }),
      });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setFlow({ step: "done", variant: "feedback" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* ---------------------------------------------------------------- */}
        {/* Business avatar + name (shown on all steps except done)          */}
        {/* ---------------------------------------------------------------- */}
        {flow.step !== "done" && (
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {businessName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {businessName}
            </h1>
            {showLocationName && (
              <p className="text-sm text-gray-400 mt-0.5">{locationName}</p>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Rating step                                                       */}
        {/* ---------------------------------------------------------------- */}
        {flow.step === "rating" && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                How was your experience?
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Tap a star to rate us
              </p>
            </div>

            {/* Stars */}
            <div
              className="flex gap-2"
              onMouseLeave={() => setHoveredRating(0)}
              role="group"
              aria-label="Star rating"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoveredRating || selectedRating);
                return (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                    onMouseEnter={() => setHoveredRating(star)}
                    onClick={() => setSelectedRating(star)}
                    disabled={submitting}
                    className="focus:outline-none disabled:opacity-50 transition-transform active:scale-90"
                    style={{ width: 56, height: 56 }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: 56, height: 56 }}
                      className="transition-colors duration-100"
                    >
                      <path
                        d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.8 3 1.1-6.5L2.6 8.8l6.5-.9L12 2z"
                        fill={filled ? "#FACC15" : "#E5E7EB"}
                        stroke={filled ? "#F59E0B" : "#D1D5DB"}
                        strokeWidth={0.5}
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={selectedRating === 0 || submitting}
              className="w-full rounded-2xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 active:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Redirecting step                                                  */}
        {/* ---------------------------------------------------------------- */}
        {flow.step === "redirecting" && (
          <div className="w-full flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
            {/* Animated checkmark */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
              <p className="mt-2 text-gray-500 text-base leading-relaxed">
                {"Thanks! We're opening Google for you…"}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Redirecting you automatically…
              </p>
            </div>
            {googleReviewUrl && (
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-[#4285F4] px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#3367d6] transition-colors"
              >
                <GoogleIcon />
                Open Google Reviews
              </a>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Feedback step                                                     */}
        {/* ---------------------------------------------------------------- */}
        {flow.step === "feedback" && (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-500">
            <div className="text-center">
              {/* Echo back selected stars */}
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: 28, height: 28 }}
                  >
                    <path
                      d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.8 3 1.1-6.5L2.6 8.8l6.5-.9L12 2z"
                      fill={star <= selectedRating ? "#FACC15" : "#E5E7EB"}
                      stroke={
                        star <= selectedRating ? "#F59E0B" : "#D1D5DB"
                      }
                      strokeWidth={0.5}
                      strokeLinejoin="round"
                    />
                  </svg>
                ))}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Thank you for your feedback
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Help us improve — what could we have done better?
              </p>
            </div>

            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your experience with us…"
              disabled={submitting}
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmitFeedback}
              disabled={!feedbackText.trim() || submitting}
              className="w-full rounded-2xl bg-gray-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 active:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {submitting ? "Sending…" : "Submit Feedback"}
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Done — Google variant                                             */}
        {/* ---------------------------------------------------------------- */}
        {flow.step === "done" && flow.variant === "google" && (
          <div className="w-full flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
            {/* Big green checkmark */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-sm">
              <svg
                className="h-12 w-12 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {"You're amazing!"}
              </h2>
              <p className="mt-2 text-base text-gray-600 leading-relaxed">
                Thank you for leaving us a review.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Your review helps others find us.
              </p>
            </div>

            {/* 5 stars display */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: 32, height: 32 }}
                >
                  <path
                    d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.8 3 1.1-6.5L2.6 8.8l6.5-.9L12 2z"
                    fill="#FACC15"
                    stroke="#F59E0B"
                    strokeWidth={0.5}
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Done — Feedback variant                                           */}
        {/* ---------------------------------------------------------------- */}
        {flow.step === "done" && flow.variant === "feedback" && (
          <div className="w-full flex flex-col items-center gap-6 text-center animate-in fade-in duration-500">
            {/* Big blue checkmark */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 shadow-sm">
              <svg
                className="h-12 w-12 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Thank you!</h2>
              <p className="mt-2 text-base text-gray-600 leading-relaxed">
                Your feedback helps us improve.
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Powered by footer                                                 */}
        {/* ---------------------------------------------------------------- */}
        <p className="mt-12 text-xs text-gray-300 text-center">
          Powered by{" "}
          <span className="font-semibold text-gray-400">ReviewPulse</span>
        </p>
      </div>
    </main>
  );
}

// Inline Google "G" icon
function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 fill-white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
