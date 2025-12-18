import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import type { ReactElement } from 'react';
import satori from 'satori';
import { siteConfig } from '@/config/site';

type OgpImageProps = {
  title: string;
  tags: string[];
  iconDataUrl: string | null;
};

/**
 * OGP画像のReactコンポーネント
 *
 * JSXでOGP画像のデザインを定義します。
 * Satoriがこのコンポーネントを受け取り、SVGに変換します。
 *
 * @param title - 記事タイトル
 * @param tags - タグ一覧
 * @param iconDataUrl - アイコンのData URL
 */
function OgpImage({ title, tags, iconDataUrl }: OgpImageProps): ReactElement {
  return (
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
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {iconDataUrl && (
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
    </div>
  );
}

// フォントデータをモジュールスコープでキャッシュ
let cachedFontData: Buffer | null = null;

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
 * OGP画像を生成する
 *
 * JSX → SVG → PNG の変換パイプラインを実行し、PNGバイナリを返します。
 *
 * @param options - OGP画像生成オプション
 * @param options.title - 記事タイトル
 * @param options.tags - タグ一覧
 * @param options.iconPath - アイコンのパス (public/配下)
 * @returns PNGバイナリデータ (Uint8Array)
 */
export async function generateOgpImage({
  title,
  tags,
  iconPath,
}: {
  title: string;
  tags: string[];
  iconPath?: string;
}): Promise<Uint8Array> {
  // フォント読み込み(初回のみ)
  if (!cachedFontData) {
    cachedFontData = fs.readFileSync(
      path.join(process.cwd(), 'public/fonts/NotoSansJP-SemiBold.ttf'),
    );
  }

  // アイコン読み込み
  const iconDataUrl = iconPath ? loadLocalSvg({ iconPath }) : null;

  // JSX → SVG 変換
  const svg = await satori(
    <OgpImage title={title} tags={tags} iconDataUrl={iconDataUrl} />,
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

  // SVG → PNG 変換
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const image = resvg.render();

  return image.asPng();
}

/**
 * エラー時のフォールバック画像を生成する
 *
 * @returns PNGバイナリデータ (Uint8Array)
 */
export async function generateFallbackOgpImage(): Promise<Uint8Array> {
  // フォント読み込み(初回のみ)
  if (!cachedFontData) {
    cachedFontData = fs.readFileSync(
      path.join(process.cwd(), 'src/assets/fonts/NotoSansJP-SemiBold.ttf'),
    );
  }

  const svg = await satori(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontSize: 48,
        fontWeight: 600,
        fontFamily: '"Noto Sans JP", sans-serif',
        color: '#333',
      }}
    >
      {siteConfig.name}
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

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const image = resvg.render();

  return image.asPng();
}
