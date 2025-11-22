import fs from 'node:fs';
import path from 'node:path';

/**
 * public/icons 配下の SVG を読み込み、パスをキーにインライン用の文字列を返す。
 * ビルド時に一度だけ同期読み込みし、ランタイムではメモリキャッシュを参照する。
 */
function loadIcons(): Record<string, string> {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  const cache: Record<string, string> = {};

  if (!fs.existsSync(iconsDir)) {
    return cache;
  }

  for (const file of fs.readdirSync(iconsDir)) {
    if (!file.endsWith('.svg')) continue;
    const abs = path.join(iconsDir, file);
    try {
      const svg = fs.readFileSync(abs, 'utf8');
      cache[`/icons/${file}`] = svg;
    } catch {
      // 読み込み失敗時はスキップ
    }
  }

  return cache;
}

const iconCache = loadIcons();

/**
 * `/icons/foo.svg` のようなパスからインラインSVG文字列を取得する
 */
export function getInlineIcon(pathname: string): string | undefined {
  return iconCache[pathname];
}
