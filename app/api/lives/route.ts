import { supabase } from '@/app/utils/supabaseClient';
import { NextResponse, NextRequest } from 'next/server';

export const GET = async (req: NextRequest, res: NextResponse) => {
  const { data, error } = await supabase.from('liveName').select('*');

  if (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
};
