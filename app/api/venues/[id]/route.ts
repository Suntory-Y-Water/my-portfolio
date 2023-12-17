import { supabase } from '@/app/utils/supabaseClient';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.url.split('/venues/')[1];
  const ids = query.split(',');

  const { data, error } = await supabase
    .from('venue')
    .select(
      `
      id, 
      venueName:name, 
      liveName(
        name: liveName
      ) `,
    )
    .in('liveNameId', [ids]);

  if (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
