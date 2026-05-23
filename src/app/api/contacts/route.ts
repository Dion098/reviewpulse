import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const search = searchParams.get('search') ?? '';
    const offset = (page - 1) * PAGE_SIZE;

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .eq('org_id', org.id)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    query = query.range(offset, offset + PAGE_SIZE - 1);

    const { data: contacts, count, error } = await query;

    if (error) {
      console.error('[Contacts GET] Query error:', error);
      return Response.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    return Response.json({ contacts: contacts ?? [], total, page, totalPages });
  } catch (err) {
    console.error('[Contacts GET] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface CreateContactBody {
  name?: string;
  phone?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as CreateContactBody;
    const { name, phone, email } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ error: 'name is required' }, { status: 400 });
    }

    if (!phone && !email) {
      return Response.json({ error: 'At least one of phone or email is required' }, { status: 400 });
    }

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

    const { data: contact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        org_id: org.id,
        name: name.trim(),
        phone: phone?.trim() ?? null,
        email: email?.trim() ?? null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Contacts POST] Insert error:', insertError);
      return Response.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    return Response.json({ contact }, { status: 201 });
  } catch (err) {
    console.error('[Contacts POST] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
