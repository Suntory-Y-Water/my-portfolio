---
title: Next.js AppRouterで動的OGP画像を作成する
slug: nextjs-approuterogp
date: 2024-09-21
description: 
icon: 📷
icon_url: 
tags:
  - nextjs
  - ogp
  - approuter
---

# 概要

1. OG画像を作成するエンドポイントをNext.js内で作成
2. `ImageResponse()`で返却する画像のレイアウトを作成
3. 画面から`generateMetadata()`のopenGraph.ImagesにエンドポイントのURLを設定（`searchParams`で受け取ったパラメータをよしなに解釈してAPIを実行している）
4. og:imageにAPIのエンドポイントを設定すれば、画像が表示される

# 実装例

画面
```ts:page.tsx
import ResultInfo from '@/components/features/result/ResultInfo';
import songs from '@/data/songs.json';
import songsSung from '@/data/soungsSong.json';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import React from 'react';

type Props = {
  searchParams?: {
    venue_id?: string;
  };
};

function currentUrl() {
  const headersList = headers();
  const host = headersList.get('host');
  const prefix = process.env.HTTP_PREFIX;
  if (!prefix) {
    throw new Error('HTTP_PREFIX is not set');
  }
  return prefix + host;
}

function getResultSongs({ searchParams }: Props) {
  const venueIdsQuery = searchParams?.venue_id || '';

  // クエリパラメータが設定されていない場合は、404 ページを表示
  if (!venueIdsQuery) {
    notFound();
  }

  // venue_id をカンマで区切って配列に変換
  const venueIds = venueIdsQuery.split(',');

  const sungSongIds = songsSung
    .filter((songSung) => venueIds.includes(songSung.venueId))
    .map((songSung) => songSung.songId);

  const uniqueSungSongIds = Array.from(new Set(sungSongIds));
  const unsungSongs = songs.filter((song) => !uniqueSungSongIds.includes(song.id));
  return unsungSongs;
}

export function generateMetadata({ searchParams }: Props) {
  const unsungSongs = getResultSongs({ searchParams });
  const apiUrl = currentUrl();
  return {
    openGraph: {
      url: apiUrl,
      title: '聴いたことがない曲一覧',
      siteName: '聴いたことがない曲一覧',
      type: 'article',
      images: {
        // 作ったAPIのURLを指定
        url: `${apiUrl}/api/og?count=${unsungSongs.length}`,
        width: 1200,
        height: 630,
      },
    },
  };
}
```

`ImageResponse`を生成するエンドポイント
```ts:route.tsx
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import songs from '@/data/songs.json';
import { z } from 'zod';

export const runtime = 'edge';

type OgImageProps = {
  count: string;
};

const querySchema = z.object({
  count: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => !Number.isNaN(val), { message: 'Count must be a number' })
    .refine((val) => val >= 0 && val < songs.length, { message: 'Count out of range' }),
});

const OgImage = ({ count }: OgImageProps) => (
  <div
    style={{
      position: 'relative',
      fontSize: 128,
      background: 'linear-gradient(to bottom right, #9BD4FF, #FFFA9B)', // 背景グラデーション
      width: '100%',
      height: '100%',
      display: 'flex',
      textAlign: 'left',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '16px',
      padding: '32px', 
      fontFamily: "'Noto Sans JP', sans-serif",
      color: '#333333', 
    }}
  >
    {/* 背景の白いボックス */}
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        top: '32px',
        left: '32px',
        right: '32px',
        bottom: '32px',
        backgroundColor: 'white',
        borderRadius: '16px',
        zIndex: 0, 
      }}
    />

    {/* 中央のテキスト */}
    <div
      style={{
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        width: '100%',
      }}
    >
      <p
        style={{
          margin: 32,
          fontSize: '64px',
          wordBreak: 'keep-all',
          whiteSpace: 'pre-wrap',
          width: '92%', 
        }}
      >
        {count === '0'
          ? '全ての曲をライブで聴きました！おめでとうございます🎉'
          : `あなたがまだ聴いたことがない曲は${count}曲でした！`}
      </p>
    </div>
    {/* 右下のテキスト */}
    <div
      style={{
        position: 'absolute',
        bottom: '48px',
        right: '48px',
        zIndex: 1,
        fontSize: '32px',
        color: '#333333',
      }}
    >
      ＃いのなび
    </div>
  </div>
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータをオブジェクトに変換
    const queryParams = Object.fromEntries(searchParams.entries());

    // Zodでバリデーション
    const parseResult = querySchema.safeParse(queryParams);

    if (!parseResult.success) {
      return new Response(`入力値が不正です。設定値：${searchParams.get('count')}`, {
        status: 400,
      });
    }

    const { count } = parseResult.data;

    return new ImageResponse(<OgImage count={String(count) ?? ''} />);
  } catch (e) {
    return new Response(`エラーが発生しました。${e}`, { status: 500 });
  }
}

```

実際にエンドポイント（/api/hoge/og?count=10）リクエストを送ると「◯曲でした！」の部分に`10`が入ってる。
![](https://storage.googleapis.com/zenn-user-upload/75720ac1bcfe-20240921.png)

ただこのやり方だとog:imageのcontentにapiurlを直接埋め込んでいるので、意地悪操作が簡単にできてしまう。
なので上記のソースコードでは最低限のバリデーションは実装した
- 曲の総数 = クエリパラメータだったらそもそもog画像を作成させない
- 曲の総数 > count > 0
- 0（全ての曲をライブで聞いた状態）ならメッセージの文言を変更する

# 感想
あるべき姿だけど、動的og画像はストレージサービスに画像を保存したほうが良い気がする。
ただ個人規模の超ミニマルなものであればストレージを使用せずともバリデーション + αだけしていれば良さそう。

# 参考
https://www.2riniar.com/pages/c_waup6uzi4
