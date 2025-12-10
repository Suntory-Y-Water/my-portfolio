---
paths: src/components/feature/**/*.{ts,tsx}
---

# Feature Component 規約

## 責務
- 特定の機能に特化したコンポーネント
- `ui/` と `shared/` コンポーネントを組み合わせて実装
- ビジネスロジックを含む場合は、`lib/` から関数をインポート

## 依存関係
```
feature/  (このレイヤー)
  ↓ 使用可能
ui/, shared/, lib/, config/, constants/
```

## 実装規約

### Server Components を優先
可能な限り Server Components として実装する。Client Components が必要な場合は、最小限の範囲に限定する。

```tsx
// ✅ Good - Client Component は最小限
'use client';

import { useState } from 'react';
import { BlogCard } from '@/components/feature/blog-card'; // Server Component

export function BlogList() {
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <button onClick={() => setFilter('published')}>Published</button>
      <BlogCard /> {/* Server Component as child */}
    </div>
  );
}
```

### ビジネスロジックは `lib/` に分離
コンポーネント内にビジネスロジックを書かない。`lib/` から関数をインポートする。

```typescript
// ❌ Bad - コンポーネント内にロジック
export function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('ja-JP');
  // ...
}

// ✅ Good - lib/ から関数をインポート
import { formatDate } from '@/lib/date';

export function BlogCard({ post }: { post: BlogPost }) {
  const formattedDate = formatDate({ date: post.publishedAt });
  // ...
}
```
