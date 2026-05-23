-- ============================================================
-- 1. RPC: get_monthly_review_stats
--    Returns the last 6 calendar months of review stats for
--    a given organization, ordered chronologically.
--    Columns match what the dashboard maps directly:
--      month       text    – 3-letter abbreviation e.g. "Jan"
--      avgRating   numeric – average star rating that month
--      reviewCount bigint  – number of reviews that month
-- ============================================================

CREATE OR REPLACE FUNCTION get_monthly_review_stats(org_id uuid)
RETURNS TABLE (
  month        text,
  "avgRating"  numeric,
  "reviewCount" bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    to_char(date_trunc('month', r.published_at), 'Mon') AS month,
    round(avg(r.rating)::numeric, 2)                    AS "avgRating",
    count(*)                                            AS "reviewCount"
  FROM reviews r
  JOIN locations l ON l.id = r.location_id
  WHERE
    l.org_id = get_monthly_review_stats.org_id
    AND r.published_at >= date_trunc('month', now()) - interval '5 months'
    AND r.published_at <  date_trunc('month', now()) + interval '1 month'
  GROUP BY date_trunc('month', r.published_at)
  ORDER BY date_trunc('month', r.published_at) ASC;
$$;

-- ============================================================
-- 2. Google OAuth token columns on organizations
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS google_access_token  text,
  ADD COLUMN IF NOT EXISTS google_refresh_token text,
  ADD COLUMN IF NOT EXISTS google_token_expiry  timestamptz,
  ADD COLUMN IF NOT EXISTS google_account_name  text;
