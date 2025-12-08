import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config/site';
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/markdown';

type ImageProps = {
  params: Promise<{ slug: string }>;
};

// フォントデータをモジュールスコープでキャッシュ(初回リクエスト時のみ読み込み)
let cachedFontData: Buffer | null = null;

// 許可していないパラメータでのアクセスを防止
export const dynamicParams = false;

/**
 * 静的生成用のパラメータを生成
 * ビルド時に全ブログ記事のOGP画像を事前生成
 */
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * ローカルのSVGファイルを読み込んでBase64エンコードされたData URIに変換する
 *
 * @param iconPath - public/配下のSVGファイルパス (例: 'icons/typescript.svg')
 * @returns Base64エンコードされたSVG Data URI (例: 'data:image/svg+xml;base64,...')
 *          ファイルが存在しない場合やエラー時はnullを返す
 */
function loadLocalSvg({ iconPath }: { iconPath: string }): string | null {
  try {
    const fullPath = path.join(process.cwd(), 'public', iconPath);
    const fileBuffer = fs.readFileSync(fullPath);
    return `data:image/svg+xml;base64,${fileBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Failed to load icon: ${iconPath}`, error);
    return null;
  }
}

/**
 * ブログ記事のOGP画像を動的に生成するAPIルートハンドラ
 *
 * @param _request - NextRequestオブジェクト(未使用)
 * @param params - ルートパラメータを含むオブジェクト
 * @param params.params - slug を含む Promise
 * @returns 1200x630のOGP画像を含むImageResponse
 */
export async function GET(_request: NextRequest, { params }: ImageProps) {
  const { slug } = await params;

  // 1. フォント読み込み(キャッシュ利用)
  if (!cachedFontData) {
    cachedFontData = fs.readFileSync(
      path.join(process.cwd(), 'src/assets/fonts/NotoSansJP-SemiBold.ttf'),
    );
  }

  // 2. 記事データ取得
  const post = await getBlogPostBySlug(slug);
  const title = post?.metadata.title || 'Blog Post';
  const tags = post?.metadata.tags || [];

  // 3. アイコン読み込み (ローカルSVGのみ対象)
  const iconDataUrl = post?.metadata.icon_url
    ? loadLocalSvg({ iconPath: post.metadata.icon_url })
    : null;

  try {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: 32,
          background: 'linear-gradient(to bottom right, #9BD4FF, #FFFA9B)',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'relative', // 基準点
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {/* --- 背景アイコン (絶対配置: 右下固定) --- */}
          {iconDataUrl && (
            // biome-ignore lint/performance/noImgElement: OGP image generation does not support next/image
            <img
              src={iconDataUrl}
              alt=''
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: 400,
                height: 400,
                opacity: 0.15,
                objectFit: 'contain',
              }}
            />
          )}

          {/* --- メインコンテンツ --- */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              padding: 48,
            }}
          >
            {/* タイトル & タグ */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 600,
                  fontFamily: '"Noto Sans JP", sans-serif',
                  color: 'rgba(0,0,0,0.82)',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}
              >
                {tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      fontSize: 24,
                      fontWeight: 400,
                      fontFamily: '"Noto Sans JP", sans-serif',
                      color: 'rgba(0,0,0,0.82)',
                      border: '1px solid #d1d5db',
                      padding: '4px 24px',
                      borderRadius: 9999,
                      marginRight: 12,
                      backgroundColor: 'white',
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* フッター */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 400,
                fontFamily: '"Noto Sans JP", sans-serif',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(0,0,0,0.82)',
              }}
            >
              {/* biome-ignore lint/performance/noImgElement: OGP image generation does not support next/image */}
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
            data: cachedFontData,
            weight: 600,
            style: 'normal',
          },
        ],
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error generating OG image: ${message}`);

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
