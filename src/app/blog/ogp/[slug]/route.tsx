import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config/site';
import { getBlogPostBySlug } from '@/lib/markdown';

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: NextRequest, { params }: ImageProps) {
  const { slug } = await params;
  // フォントファイルを読み込み
  const fontData = fs.readFileSync(
    path.join(process.cwd(), 'src/assets/fonts/NotoSansJP-SemiBold.ttf'),
  );

  const post = await getBlogPostBySlug(slug);

  const title = post?.metadata.title || 'Blog Post';
  const tags = post?.metadata.tags || [];

  try {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          padding: 48,
          height: '100%',
          background: 'linear-gradient(to bottom right, #9BD4FF, #FFFA9B)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
            backgroundColor: 'white',
            color: '#000000d1',
            padding: 48,
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 64, maxWidth: 1000, fontWeight: 600 }}>
              {title}
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}
            >
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    border: '1px solid #d1d5db',
                    padding: '4px 24px',
                    borderRadius: 9999,
                    marginRight: 12,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: OGP image generation */}
              <img
                src='https://avatars.githubusercontent.com/u/116779921?v=4'
                width={60}
                height={60}
                alt='avatar'
                style={{ borderRadius: 9999, marginRight: 24 }}
              />
              sui
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Noto Sans JP',
            data: fontData,
            weight: 600,
            style: 'normal',
          },
        ],
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error generating OG image: ${message}`);

    // エラー時のフォールバック画像
    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          fontSize: 32,
          color: '#333',
        }}
      >
        {siteConfig.name}
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
