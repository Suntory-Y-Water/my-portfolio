import { supabase } from '@/app/utils/supabaseClient';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const query = req.url.split('/unheard/')[1];
  const ids = query.split(',');

  const { data: heardSongsData, error: heardSongsError } = await supabase
    .from('songsSung')
    .select('songId')
    .in('venueId', ids);

  if (heardSongsError) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  // 重複するsongIdを削除
  const performedSongIds: number[] = Array.from(
    new Set(heardSongsData.map((sp: any) => sp.songId)),
  );

  // 未歌唱の曲を取得
  const { data: unheardSongsData, error: unheardSongsError } = await supabase
    .from('song')
    .select('id, title')
    .not('id', 'in', `(${performedSongIds})`);

  if (unheardSongsError) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json(unheardSongsData, { status: 200 });
}
