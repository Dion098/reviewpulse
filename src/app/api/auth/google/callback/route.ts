import { NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUserInfo {
  id: string;
  name?: string;
  email?: string;
}

export async function GET(req: NextRequest) {
  const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return Response.redirect(`${settingsUrl}?google=error`);
    }

    const orgId = Buffer.from(state, 'base64url').toString();

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[Google OAuth Callback] Token exchange failed:', await tokenRes.text());
      return Response.redirect(`${settingsUrl}?google=error`);
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    // Fetch user info
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error('[Google OAuth Callback] User info fetch failed:', await userInfoRes.text());
      return Response.redirect(`${settingsUrl}?google=error`);
    }

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;

    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const accountName = userInfo.name ?? userInfo.email ?? 'Google Account';

    const supabase = await createServiceClient();

    const updateData: Record<string, string> = {
      google_access_token: tokens.access_token,
      google_token_expiry: tokenExpiry,
      google_account_name: accountName,
    };

    if (tokens.refresh_token) {
      updateData.google_refresh_token = tokens.refresh_token;
    }

    const { error: updateError } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', orgId);

    if (updateError) {
      console.error('[Google OAuth Callback] DB update error:', updateError);
      return Response.redirect(`${settingsUrl}?google=error`);
    }

    return Response.redirect(`${settingsUrl}?google=connected`);
  } catch (err) {
    console.error('[Google OAuth Callback] Unexpected error:', err);
    return Response.redirect(`${settingsUrl}?google=error`);
  }
}
