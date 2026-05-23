import { createServiceClient } from '@/lib/supabase/server';

interface GoogleRefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export async function getValidAccessToken(orgId: string): Promise<string> {
  const supabase = await createServiceClient();

  const { data: org, error } = await supabase
    .from('organizations')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('id', orgId)
    .single();

  if (error || !org) {
    throw new Error('Organization not found or Google not connected');
  }

  if (!org.google_access_token) {
    throw new Error('Google account not connected for this organization');
  }

  // Check if token expires within 5 minutes
  const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000);
  const tokenExpiry = org.google_token_expiry ? new Date(org.google_token_expiry) : null;

  const needsRefresh = !tokenExpiry || tokenExpiry < fiveMinFromNow;

  if (needsRefresh) {
    if (!org.google_refresh_token) {
      throw new Error('Google token expired and no refresh token available');
    }

    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: org.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshRes.ok) {
      const body = await refreshRes.text();
      throw new Error(`Failed to refresh Google token: ${body}`);
    }

    const refreshed = (await refreshRes.json()) as GoogleRefreshResponse;
    const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        google_access_token: refreshed.access_token,
        google_token_expiry: newExpiry,
      })
      .eq('id', orgId);

    if (updateError) {
      throw new Error(`Failed to update refreshed Google token: ${updateError.message}`);
    }

    return refreshed.access_token;
  }

  return org.google_access_token;
}

export async function postReviewReply(
  orgId: string,
  googleReviewId: string,
  replyText: string
): Promise<void> {
  const accessToken = await getValidAccessToken(orgId);

  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${googleReviewId}/reply`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment: replyText }),
    }
  );

  if (!res.ok) {
    let message = `Google API error ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }
}
