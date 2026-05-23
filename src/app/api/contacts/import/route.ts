import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const BATCH_LIMIT = 500;

interface ContactRow {
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

    const body = await req.json() as { contacts?: ContactRow[] };
    const { contacts } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return Response.json({ error: 'contacts array is required and must not be empty' }, { status: 400 });
    }

    if (contacts.length > BATCH_LIMIT) {
      return Response.json(
        { error: `Maximum ${BATCH_LIMIT} contacts per import` },
        { status: 400 }
      );
    }

    // Get user's profile and org
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

    // Fetch existing phone numbers in this org to deduplicate
    const incomingPhones = contacts
      .map((c) => c.phone?.trim())
      .filter((p): p is string => Boolean(p));

    const existingPhones = new Set<string>();

    if (incomingPhones.length > 0) {
      const { data: existingContacts } = await supabase
        .from('contacts')
        .select('phone')
        .eq('org_id', org.id)
        .in('phone', incomingPhones);

      for (const ec of existingContacts ?? []) {
        if (ec.phone) existingPhones.add(ec.phone);
      }
    }

    // Deduplicate within the import batch itself (by phone, first occurrence wins)
    const seenPhones = new Set<string>();
    const toInsert: Array<{ org_id: string; name: string; phone: string | null; email: string | null }> = [];
    let skipped = 0;

    for (const row of contacts) {
      const name = row.name?.trim();
      const phone = row.phone?.trim() || null;
      const email = row.email?.trim() || null;

      // Skip rows with no name
      if (!name) {
        skipped++;
        continue;
      }

      // Skip rows with no contact info
      if (!phone && !email) {
        skipped++;
        continue;
      }

      // Deduplicate by phone
      if (phone) {
        if (existingPhones.has(phone) || seenPhones.has(phone)) {
          skipped++;
          continue;
        }
        seenPhones.add(phone);
      }

      toInsert.push({ org_id: org.id, name, phone, email });
    }

    if (toInsert.length === 0) {
      return Response.json({ imported: 0, skipped });
    }

    const { error: insertError } = await supabase
      .from('contacts')
      .insert(toInsert);

    if (insertError) {
      console.error('[Contacts Import] Insert error:', insertError);
      return Response.json({ error: 'Failed to import contacts' }, { status: 500 });
    }

    return Response.json({ imported: toInsert.length, skipped });
  } catch (err) {
    console.error('[Contacts Import] Unexpected error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
