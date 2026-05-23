import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Review } from '@/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's org
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', profile.id)
      .single();

    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const locationId = searchParams.get('locationId');
    const filter = searchParams.get('filter') ?? 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const search = searchParams.get('search') ?? '';

    // Verify locationId belongs to this org if provided
    if (locationId) {
      const { data: loc } = await supabase
        .from('locations')
        .select('id')
        .eq('id', locationId)
        .eq('org_id', org.id)
        .single();

      if (!loc) {
        return Response.json({ error: 'Location not found' }, { status: 404 });
      }
    }

    // Build query
    let query = supabase
      .from('reviews')
      .select('*, locations!inner(org_id)', { count: 'exact' });

    // Scope to org
    query = query.eq('locations.org_id', org.id);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    // Apply filters
    switch (filter) {
      case 'needs_response':
        query = query.eq('response_posted', false).gte('rating', 4);
        break;
      case 'responded':
        query = query.eq('response_posted', true);
        break;
      case 'five_star':
        query = query.eq('rating', 5);
        break;
      case 'critical':
        query = query.lte('rating', 2);
        break;
      // 'all' — no additional filter
    }

    if (search) {
      query = query.or(`author_name.ilike.%${search}%,text.ilike.%${search}%`);
    }

    const offset = (page - 1) * PAGE_SIZE;
    query = query
      .order('published_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    const { data: reviews, count, error } = await query;

    if (error) {
      console.error('[Reviews GET] Query error:', error);
      return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Strip the joined locations field from the response
    const cleanedReviews = (reviews ?? []).map(({ locations: _loc, ...r }: Review & { locations: unknown }) => r);

    return Response.json({
      reviews: cleanedReviews,
      total,
      page,
      totalPages,
    });
  } catch (err) {
    console.error('[Reviews GET] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
