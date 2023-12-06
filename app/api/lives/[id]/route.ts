import { SongsSungProps } from '@/app/types/types';
import { supabase } from '@/app/utils/supabaseClient';
import { NextResponse, NextRequest } from 'next/server';

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.url.split('/lives/')[1];

  // Supabaseを使用してsongsSungテーブルからデータを取得
  // 関連するvenueテーブルのデータも同時に取得
  const { data, error } = await supabase
    .from('songsSung')
    .select(
      `
      id,
      liveName: liveNameId(liveName),
      song: song(title),
      timesSung,
      venue: venueId (name)
    `,
    )
    .eq('liveNameId', id);

  if (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
};
