# コーディング規約

このファイルは、プロジェクトのコーディング規約をまとめたものです。

## TypeScript型定義

### 型定義の基本原則

#### typeを使用(interfaceは使用しない)
```typescript
// ✅ Good
type User = {
  id: string;
  name: string;
};

// ❌ Bad
interface User {
  id: string;
  name: string;
}
```

#### 構造的型付けによる型安全性
```typescript
// ✅ Good - 引数を構造的に型付け
function add({ a, b }: { a: number; b: number }) {
  return a + b;
}

// ❌ Bad - 引数の型が明示されていない
function add(a, b) {
  return a + b;
}
```

#### 配列の型定義は`[]`を使用
```typescript
// ✅ Good
type Users = User[];

// ❌ Bad
type Users = Array<User>;
```

### 型の再利用

既存の型定義を尊重し、`Pick`、`Omit`、型合成などを活用して型を再利用する。

```typescript
// ✅ Good - 既存の型を再利用
type UserWithoutPassword = Omit<User, 'password'>;
type UserIdAndName = Pick<User, 'id' | 'name'>;

// ❌ Bad - 同じような型を別途定義
type UserWithoutPassword = {
  id: string;
  name: string;
};
```

## 関数定義

### 引数が2個以上の場合はオブジェクト形式

```typescript
// ✅ Good
function createUser({ name, email }: { name: string; email: string }) {
  // ...
}

// ❌ Bad
function createUser(name: string, email: string) {
  // ...
}
```

### 最上位の関数はfunction宣言
見通しを良くするため、最上位の関数は`function`宣言で実装する。

```typescript
// ✅ Good
function fetchUserData({ userId }: { userId: string }) {
  // ...
}

// ❌ Bad
const fetchUserData = ({ userId }: { userId: string }) => {
  // ...
};
```

### map、filter、即時関数はアロー関数
```typescript
// ✅ Good
const userIds = users.map((user) => user.id);
const activeUsers = users.filter((user) => user.isActive);

// 即時関数
const result = (() => {
  // ...
})();
```

## クラスは使用しない

このプロジェクトでは、クラスは使用せず、関数ベースの実装を行う。

```typescript
// ✅ Good - 関数ベース
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

// ❌ Bad - クラスベース
class Counter {
  private count = 0;
  increment() { return ++this.count; }
  decrement() { return --this.count; }
  getCount() { return this.count; }
}
```

## アンチパターン(禁止事項)

### 暗黙のフォールバックは禁止
合理的な理由がない限り、デフォルト値や暗黙のフォールバックは禁止。

```typescript
// ❌ Bad - 暗黙のフォールバック
function getUser({ userId = 'default' }: { userId?: string }) {
  // ...
}

// ✅ Good - 必須引数として明示
function getUser({ userId }: { userId: string }) {
  // ...
}
```

### スイッチ引数は禁止
合理的な理由がない限り、スイッチ引数(boolean引数で動作を切り替える)は禁止。

```typescript
// ❌ Bad - スイッチ引数
function fetchData({ includeDetails }: { includeDetails: boolean }) {
  if (includeDetails) {
    // ...
  } else {
    // ...
  }
}

// ✅ Good - 別々の関数に分割
function fetchData() { /* ... */ }
function fetchDataWithDetails() { /* ... */ }
```

### オプショナル引数・デフォルト値は禁止
合理的な理由がない限り、オプショナル引数やデフォルト値は禁止。

```typescript
// ❌ Bad
function createPost({ title, draft = false }: { title: string; draft?: boolean }) {
  // ...
}

// ✅ Good - 必須として明示
function createPost({ title, draft }: { title: string; draft: boolean }) {
  // ...
}
```

### 将来的な拡張性の考慮は禁止
現時点で必要のない拡張性を考慮したコードは書かない(YAGNI原則)。

### 関数を引数に渡すことは合理的理由がない限り禁止
```typescript
// ❌ Bad - 不要な関数渡し
function processData({ data, formatter }: { data: Data; formatter: (d: Data) => string }) {
  return formatter(data);
}

// ✅ Good - 直接処理
function formatData({ data }: { data: Data }): string {
  return `${data.name}: ${data.value}`;
}
```

### ラッパー関数の作成禁止
合理的な理由がない限り、ラッパー関数の作成は禁止。拡張するような関数でない限り直接呼び出したほうが保守しやすい。

```typescript
// ❌ Bad - 不要なラッパー
function getUsers() {
  return fetchUsers();
}

// ✅ Good - 直接呼び出し
import { fetchUsers } from './api';
// 使用箇所で直接 fetchUsers() を呼び出す
```

### 不要なexportは禁止
合理的な理由がない限り、使用されていない関数や型定義のexportは禁止。デッドコードになる。

```typescript
// ❌ Bad - 使われていないのにexport
export function unusedFunction() { /* ... */ }

// ✅ Good - 必要な場合のみexport
function internalFunction() { /* ... */ }
export function publicFunction() { /* ... */ }
```

## インポート規約

### バレルインポート禁止
`@/` aliasを使用した個別インポートを使用する。バレルインポート(`index.ts`経由の再エクスポート)は禁止。

```typescript
// ✅ Good - 個別インポート
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ❌ Bad - バレルインポート
import { Button, Card } from '@/components/ui';
```

## コメント規約

### TsDocコメントは必須
関数やコンポーネントには TsDoc コメントを必ず追加する。初めて見た人でも使い方や入力・出力がわかる例を掲載し、説明を一切省略せず具体的に記載する。

```typescript
/**
 * ユーザー情報を取得する
 *
 * @param {Object} params - パラメータ
 * @param {string} params.userId - ユーザーID
 * @returns {Promise<User>} ユーザー情報
 *
 * @example
 * const user = await fetchUser({ userId: '123' });
 * console.log(user.name); // 'John Doe'
 */
function fetchUser({ userId }: { userId: string }): Promise<User> {
  // ...
}
```

### 日本語コメントで意図を明確に
コードの意図を日本語コメントで説明する。

```typescript
// ✅ Good
// ユーザーがログイン済みかどうかを確認
if (user.isAuthenticated) {
  // ...
}
```

### 装飾的なコメントは禁止
「(契約による設計)」など装飾的なコメントや、事前・事後・不変条件の詳細なコメント記述は禁止。

```typescript
// ❌ Bad
/**
 * 事前条件: userId は null でないこと
 * 事後条件: User オブジェクトを返すこと
 * 不変条件: User.id === userId であること
 * (契約による設計)
 */
function getUser({ userId }: { userId: string }) { /* ... */ }

// ✅ Good
/**
 * ユーザー情報を取得する
 */
function getUser({ userId }: { userId: string }) { /* ... */ }
```

## Biome設定との整合性

### フォーマット
- **インデント**: スペース2つ
- **行幅**: 80文字
- **クォート**: シングルクォート(`'`)
- **セミコロン**: 必須
- **トレーリングカンマ**: 必須

### Lint
- **noExplicitAny**: エラー(`any`型は禁止)
- **noImplicitAnyLet**: エラー(暗黙の`any`型は禁止)
- **noEvolvingTypes**: エラー(型の進化は禁止)
- **useConsistentTypeDefinitions**: 警告(typeの使用を推奨)

### オートインポート整理
Biomeの`assist.actions.source.organizeImports`が有効になっているため、インポート文は自動的に整理される。

## 契約による設計(Design by Contract)

### 避けるべき実装パターン
- 既にTypeScriptで型保証されている引数の再チェック
- 例外を投げないライブラリ関数への不要なtry-catch
  - 例外処理は呼び出し元でキャッチするため、正常系のみを実装

### 推奨する実装パターン
- 関数名と型定義で契約を明示
- シンプルで読みやすいコード構造
- 必要最小限のJSDocコメント
- 純粋関数としての実装(副作用なし)

## まとめ

このプロジェクトでは、以下の原則を重視しています：

1. **型安全性**: TypeScriptの型システムを最大限活用
2. **シンプルさ**: YAGNI原則に従い、必要最小限の実装
3. **明確さ**: 関数名、型定義、コメントで意図を明確に
4. **保守性**: 過度な抽象化を避け、直接的で読みやすいコードを書く
