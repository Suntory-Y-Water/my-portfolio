# OGメタデータキャッシュ実装手順書

## 📋 概要

**目的**: 本番ビルド時に外部URLへの直接アクセスを減らし、Cloudflare Workers KVでOGメタデータをキャッシュすることでビルド時間を短縮

**対象ファイル**: `src/lib/fetch-og-metadata.ts`

---

## 🎯 実装フロー

```
1. GET /api/og?url=xxx でKVキャッシュ確認
   ├─ 200 (キャッシュあり) → そのデータを使用
   └─ 404 (キャッシュなし) →
      ├─ 2. 従来通り外部URLにfetch
      └─ 3. POST /api/og でKVに登録（本番ビルド時のみ）
```

---

## 📝 実装手順

### **ステップ1: 環境変数の設定**

プロジェクトルートに `.env` ファイルを作成（なければ）:

```bash
# Cloudflare Workers API認証トークン
API_SECRET=your-secret-token-here
```

**注意**:
- `.gitignore` に `.env` が含まれていることを確認
- CI/CD環境にも同じ環境変数を設定する必要あり

---

### **ステップ2: `fetch-og-metadata.ts` の修正**

以下の実装を追加:

```typescript
// src/lib/fetch-og-metadata.ts

type OGData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

const OG_API_ENDPOINT = 'https://suntory-n-water.com/api/og';
const API_SECRET = process.env.API_SECRET || '';

/**
 * Cloudflare Workers KVからOGデータを取得
 */
async function fetchFromCache(url: string): Promise<Partial<OGData> | null> {
  try {
    const response = await fetch(`${OG_API_ENDPOINT}?url=${encodeURIComponent(url)}`);

    if (response.status === 404) {
      // キャッシュなし
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Cloudflare Workers KVにOGデータを保存
 */
async function saveToCache(url: string, data: Partial<OGData>): Promise<void> {
  // 本番ビルド時のみ保存
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // API_SECRETがない場合はスキップ
  if (!API_SECRET) {
    return;
  }

  try {
    const response = await fetch(OG_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify({
        url,
        data: {
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          url: data.url || url,
        },
      }),
    });

    if (!response.ok) {
      console.error(`Failed to save OG cache: ${response.status} for ${url}`);
    }
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * 外部URLから直接OGデータを取得（従来のロジック）
 */
async function fetchOGDataDirect(url: string): Promise<Partial<OGData>> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'bot',
      },
    });

    const html = await response.text();

    const getMetaContent = (property: string): string | undefined => {
      const regex1 = new RegExp(
        `<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]+)"`,
        'i',
      );
      const match1 = regex1.exec(html)?.[1];
      if (match1) {
        return match1;
      }

      const regex2 = new RegExp(
        `<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="${property}"`,
        'i',
      );
      return regex2.exec(html)?.[1];
    };

    const titleMatch = /<title>(.*?)<\/title>/i.exec(html);

    return {
      title: getMetaContent('og:title') || titleMatch?.[1] || '',
      description:
        getMetaContent('og:description') || getMetaContent('description') || '',
      image: resolveImageUrl({
        imageUrl: getMetaContent('og:image'),
        baseUrl: url,
      }),
      url,
    };
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return { url };
  }
}

/**
 * URLからOGP(Open Graph Protocol)データを取得する
 *
 * 本番ビルド時はCloudflare Workers KVキャッシュを使用。
 * キャッシュミス時は外部URLから取得し、KVに保存する。
 *
 * @param url - OGPデータを取得するURL
 * @returns OGPデータの部分的なオブジェクト(title、description、image、url)
 */
export async function getOGData(url: string): Promise<Partial<OGData>> {
  // 本番ビルド時はキャッシュを使用
  if (process.env.NODE_ENV === 'production') {
    // 1. キャッシュ確認
    const cachedData = await fetchFromCache(url);
    if (cachedData) {
      return cachedData;
    }

    // 2. 外部URLから取得
    const freshData = await fetchOGDataDirect(url);

    // 3. キャッシュに保存（非同期、待たない）
    saveToCache(url, freshData).catch(() => {
      // エラーは無視（ビルドを止めない）
    });

    return freshData;
  }

  // 開発環境では従来通り直接fetch
  return fetchOGDataDirect(url);
}

// resolveImageUrl 関数はそのまま維持
function resolveImageUrl({
  imageUrl,
  baseUrl,
}: {
  imageUrl: string | undefined;
  baseUrl: string;
}): string {
  if (!imageUrl) {
    return '';
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(imageUrl);
  if (isAbsoluteUrl) {
    return imageUrl;
  }

  const base = new URL(baseUrl);
  const absoluteUrl = new URL(imageUrl, base.origin);
  return absoluteUrl.href;
}
```

---

### **ステップ3: 型定義ファイル（オプション）**

Workers APIの型と揃えたい場合は、`src/types/og.ts` を作成:

```typescript
// src/types/og.ts
export type OGData = {
  title: string;
  description: string;
  image: string;
  url: string;
};

export type OGAPIResponse = OGData | { found: false } | { error: string };

export type PostOGRequest = {
  url: string;
  data: OGData;
};
```

---

### **ステップ4: 動作確認**

1. **開発環境での確認**:
```bash
bun run dev
# 開発環境ではキャッシュを使わず、従来通り動作することを確認
```

2. **本番ビルドでの確認**:
```bash
NODE_ENV=production API_SECRET=your-token bun run build
# ビルドが正常に完了することを確認
```

3. **キャッシュの確認**:
- 初回ビルド: 外部fetch → KVに保存
- 2回目ビルド: KVから取得（高速化）

---

## ⚠️ 注意事項

1. **API_SECRETの管理**
   - `.env` ファイルは `.gitignore` に含める
   - CI/CD環境（Cloudflare Pages等）に環境変数を設定

2. **エラーハンドリング**
   - キャッシュ取得/保存が失敗しても、従来のfetchロジックでフォールバック
   - ビルドは必ず成功する設計

3. **開発体験**
   - 開発環境（`NODE_ENV !== 'production'`）ではキャッシュを使わない
   - 常に最新のOGデータを取得できる

4. **パフォーマンス**
   - `saveToCache()` は非同期で実行し、ビルドをブロックしない
   - 初回ビルドは遅いが、2回目以降は高速化

5. **ロギング**
   - エラー時のみログ出力
   - 通常のビルドログはクリーンに保つ

---

## 🔍 検証ポイント

- [ ] `.env` に `API_SECRET` が設定されている
- [ ] 本番ビルドが正常に完了する
- [ ] 初回ビルド後、Workers KVにデータが保存されている
- [ ] 2回目ビルドでキャッシュが使用され、ビルド時間が短縮されている
- [ ] 開発環境では従来通り動作する

---

## 📊 Cloudflare Workers API仕様

### エンドポイント

#### GET `/api/og?url={url}`
OGメタデータをKVから取得

**レスポンス**:
- 200: `{title: string, description: string, image: string, url: string}`
- 404: `{found: false}`
- 400: `{error: string}`

#### POST `/api/og`
OGメタデータをKVに保存

**リクエスト**:
```json
{
  "url": "https://example.com",
  "data": {
    "title": "Example",
    "description": "Description",
    "image": "https://example.com/image.png",
    "url": "https://example.com"
  }
}
```

**ヘッダー**:
- `Authorization: Bearer {API_SECRET}`
- `Content-Type: application/json`

**レスポンス**:
- 201: `{success: true}`
- 401: Unauthorized
