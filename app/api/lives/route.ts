import { supabase } from '@/app/utils/supabaseClient';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const { data, error } = await supabase.from('liveName').select(
    `
      id,
      liveName,
      liveType: liveTypeId(type)
    `,
  );

  if (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
};
