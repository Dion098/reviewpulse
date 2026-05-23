import { createServiceClient } from "@/lib/supabase/server";
import ReviewRequestClient from "./ReviewRequestClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewRequestPage({ params }: PageProps) {
  const { token } = await params;

  const supabase = await createServiceClient();

  const { data: reviewRequest } = await supabase
    .from("review_requests")
    .select(
      "id, opened_at, status, locations(name, google_review_url, organizations(name))"
    )
    .eq("token", token)
    .single();

  // Mark as opened on first visit
  if (reviewRequest && !reviewRequest.opened_at) {
    await supabase
      .from("review_requests")
      .update({ opened_at: new Date().toISOString(), status: "opened" })
      .eq("id", reviewRequest.id);
  }

  if (!reviewRequest) {
    return (
      <main className="min-h-dvh bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-[420px] text-center py-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            This link has expired
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            This review link is no longer valid. Please contact the business
            directly if you&apos;d like to share feedback.
          </p>
        </div>
      </main>
    );
  }

  const location = reviewRequest.locations as unknown as {
    name: string;
    google_review_url: string | null;
    organizations: { name: string } | null;
  } | null;

  if (!location) {
    return (
      <main className="min-h-dvh bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-[420px] text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            This link has expired
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            This review link is no longer valid.
          </p>
        </div>
      </main>
    );
  }

  const businessName = location.organizations?.name ?? location.name;
  const locationName = location.name;
  const googleReviewUrl = location.google_review_url ?? null;

  return (
    <ReviewRequestClient
      businessName={businessName}
      locationName={locationName}
      token={token}
      googleReviewUrl={googleReviewUrl}
    />
  );
}
