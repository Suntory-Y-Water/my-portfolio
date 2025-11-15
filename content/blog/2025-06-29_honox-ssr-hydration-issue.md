---
title: HonoXにおけるSSRとクライアントサイドHydrationの同期問題とその解決策
public: true
date: 2025-06-29
icon: >-
  https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Cloud%20with%20rain/Flat/cloud_with_rain_flat.svg
slug: honox-ssr-hydration-issue
tags:
  - HonoX
  - React
description: >-
  HonoXのSSRとクライアントHydrationの同期問題を解説。サーバーで正しく描画された表示がクライアントで元に戻る現象の原因を解明し、確実な状態同期を行う実装パターンを紹介します。
---



## TL;DR

HonoXにおいて、サーバーサイドでレンダリング(SSR)されたコンポーネントの表示が、クライアントサイドでのHydration時に初期状態に戻ってしまう問題があります。

原因は、SSRで生成されたHTMLの状態と、クライアントサイドでReactがコンポーネントを制御しようとする際のタイミングのズレです。

この問題は、`select`要素の`value`属性を`defaultValue`に変更し、`useEffect`フックを使ってDOMマウント後に明示的に値を同期させることで解決できます。

---


## この記事について

HonoXで開発を進めていると、「サーバーサイドでは正しく動作しているのに、クライアントサイドで表示が更新されない」という、一見不可解な問題に遭遇することがあります。
この記事では、私が実際のプロジェクトで遭遇した「ソート順ドロップダウンの表示不整合」という問題を題材に、その原因特定に至るまでの調査プロセス、試行錯誤した他のアプローチ、そして最終的な解決策までの過程を解説します。

### 想定読者

- HonoXの基本的な使い方を理解している方
- Islandsアーキテクチャの概念を知っている方
- SSRとHydrationの仕組みについて基本的な知識がある方

### この記事で得られること

- HonoXでのSSRとクライアントサイド同期の問題が起こるメカニズム
- `useEffect`を使った実践的な解決方法とその背景にある理論
- 同様の問題を避けるための具体的な設計指針

## 発生した問題

個人開発していた[金髪ヒロイン.com](https://kinpatsu-heroine.com/)のキャラクター一覧ページには、表示順を切り替えるドロップダウンメニューがありました。
ここで、URLのクエリパラメータ(`/?sort=random`など)で並び順を指定した際、実際の表示内容は正しく並び替えられるものの、ドロップダウンメニューの表示が常に「新着順」のままになる、という問題が発生します。

### 現象の詳細

- `/?sort=random`でアクセスすると、コンテンツはランダム順で表示される。
- しかし、ドロップダウンでは「新着順」が選択されたままになってしまう。

## 原因の調査プロセス

この不可解な現象を解決するため、サーバーサイドとクライアントサイドの両面から調査を行いました。

### サーバーサイドの実装確認

まず、リクエストを受け取りHTMLを生成しているサーバーサイドのルートハンドラー(`app/routes/index.tsx`)を調査対象とします。
URLパラメータを正しく解釈し、コンポーネントにプロパティとして渡せているかの確認です。

```typescript
export default createRoute(async (c) => {
  const sortQuery = c.req.query('sort') as SortOrder;
  const currentSort: SortOrder = sortOptions.some(
    (opt) => opt.key === sortQuery,
  )
    ? sortQuery
    : 'newest';

  return c.render(
    <SortSelector currentSort={currentSort} options={sortOptions} />
  );
});

```

サーバー側のログで確認すると、`/?sort=random`でのアクセス時には`currentSort`変数が`random`という値を持ち、`SortSelector`コンポーネントに正しく渡されていることがわかりました。サーバーサイドのロジックに問題はなさそうです。

### クライアントサイドの実装確認

次に、インタラクティブな部分を担当するIslandsコンポーネント(`app/islands/SortSelector.tsx`)の実装に目を向けます。

```typescript
export function SortSelector({ currentSort, options }: SortSelectorProps) {
  return (
    <select
      name='sort'
      value={currentSort}
      onChange={handleChange}
    >
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

```

このコードはReact(HonoX)ならよく見るComponentで、明らかな間違いは見当たりません。

### デバッグによる原因特定

サーバーからクライアントへのプロパティの受け渡しは正常に見えます。
そこで、クライアントサイドのコンポーネントが受け取ったプロパティの値を、ブラウザのコンソールに出力して確認することにしました。

```typescript
export function SortSelector({ currentSort, options }: SortSelectorProps) {
  console.log('SortSelector - currentSort:', currentSort);
}

```

`/?sort=random`でアクセスすると、コンソールには`SortSelector - currentSort: random`と表示されました。
このログから、クライアントサイドのコンポーネントは、`currentSort`プロパティとして`random`という値を正しく受け取っています。
プロパティは正しく渡されているにも関わらず、DOM上の`select`要素の値だけが反映されないということで、SSRとクライアントサイドHydrationの間に、何らかの同期問題が発生していることが分かります。

## 原因の詳細分析


### HonoXのIslandsアーキテクチャの特徴

この問題を理解するには、HonoXがページを表示するまでの流れを把握する必要があります。
1. サーバーがリクエストを受け取り、初期HTMLを生成します(SSR)。
2. クライアントへの送信: 生成されたHTMLをブラウザに送信します。ユーザーはすぐにコンテンツを見ることが可能です。
3. ブラウザがJavaScriptを読み込み、静的なHTMLに対してイベントリスナーなどを追加しインタラクティブな状態に「復元(Hydrate)」します。

### 問題の根本原因

問題の根本は、ReactやHonoXのJSXにおける挙動と、SSRのプロセスの間に生じる不整合にあります。
具体的なメカニズムは以下の通りです。
1. サーバーサイドで`value="random"`を持つ`select`要素を含んだHTMLが正しく生成される。
2. ブラウザでそのHTMLが表示される。この時点では、見た目上は「ランダム」が選択されている。
3. JavaScriptが実行され、クライアントサイドでのHydrationが開始される。
4. このHydrationの過程で、React(HonoXのJSXランタイム)がDOMを自身の仮想DOMと同期させようとします。しかし、このタイミングで`value={currentSort}`の再適用がうまく機能せず、結果として`select`要素の値がDOMの初期状態、つまりHTMLソースコード上で一番上にある`<option>`の値(今回は「新着順」)にリセットされてしまう、というものでした。

## 解決策の実装


### useEffectを使った明示的な状態同期

この問題を解決するためには、クライアントサイドのJavaScriptが実行された後、つまりDOMがマウントされた後に、明示的に`select`要素の値をサーバーから渡されたプロパティと同期させる必要がありました。

```typescript
import { useEffect } from 'hono/jsx/dom';

export function SortSelector({ currentSort, options }: SortSelectorProps) {
  useEffect(() => {
    const select = document.querySelector('select[name="sort"]');
    if (select && select instanceof HTMLSelectElement) {
      select.value = currentSort;
    }
  }, [currentSort]);

  function handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const form = select.form;
    if (form) {
      form.submit();
    }
  }

  return (
    <form method='get' action='' className='flex justify-end'>
      <select
        name='sort'
        defaultValue={currentSort}
        onChange={handleChange}
        className='...'
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}

```

`defaultValue`はSSR時の初期HTML生成には寄与しますが、クライアントサイドでの状態管理の競合を引き起こしません。
その上で、`useEffect`を用いてDOMがマウントされた後に確実に値を同期させることで、SSRの恩恵とクライアントサイドでの正確な状態表示を両立させることができます。

## 他のアプローチの検討

最終的な解決策に至るまでには、いくつかの試行錯誤を経ています。

### 試行したが効果がなかった方法

#### defaultValueのみの使用

`useEffect`を使わずに`defaultValue={currentSort}`だけを指定する方法です。これだと最初のページ読み込みは正しく表示されますが、クライアントサイドのナビゲーションでページが遷移し、`currentSort`プロパティの値が変わった場合に、表示が追従しないという問題が残ります。

#### key属性によるコンポーネント再マウント

`<select key={currentSort} ...>`のように`key`属性を渡す方法です。プロパティが変わるたびにコンポーネント全体が再生成されるため表示は正しくなりますが、これはパフォーマンスへの影響が大きく、またドロップダウンを開いた瞬間にアニメーションが中断されるなど、別のUX上の問題が発生します。

## まとめ

HonoXのIslandsアーキテクチャにおけるSSRとクライアントサイドHydrationの同期問題は、一見すると原因が分かりにくいですが適切なデバッグで原因を切り分け、`useEffect`を活用した明示的な同期処理を実装することで確実に解決できます。

今回の経験から学んだ最も重要なポイントは、SSRフレームワークではサーバーサイドで決定された状態とクライアントサイドで管理される状態を常に意識し、必要に応じてそれらを明示的に同期させる必要がある、ということです。

もし同様の問題に遭遇した際は、まずプロパティの受け渡しを確認し、次にDOM要素の実際の状態をチェックすることから始めることをお勧めします。
