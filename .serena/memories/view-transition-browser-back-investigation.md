# ViewTransition ブラウザバック実装調査メモ

## 調査日
2025-11-24

## 調査目的
ブラウザの戻るボタン（ブラウザバック）でもViewTransitionアニメーションを動作させる方法を調査

## 調査結果

### 現状の問題点

React 19のViewTransitionは、**従来のpopstateイベント経由のナビゲーション（ブラウザバック）ではアニメーションがスキップされる**

#### 理由
- popstateイベントからの`startTransition`は、スクロール位置とフォームの復元のために同期的に完了する必要がある
- これがView Transitionアニメーションの実行と競合する
- そのため、Reactは意図的にpopstateからのアニメーションをスキップする

### 解決方法

**Navigation APIへのルーター移行が必要**

React公式ドキュメント（https://ja.react.dev/reference/react/ViewTransition）の"Building View Transition enabled routers"セクションより：

> If a `startTransition` is started from the legacy popstate event, such as during a "back"-navigation then it must finish synchronously to ensure scroll and form restoration works correctly. This is in conflict with running a View Transition animation. Therefore, React will skip animations from popstate. Therefore animations won't run for the back button. **You can fix this by upgrading your router to use the Navigation API.**

## Navigation APIとは

### 概要
- ブラウザの履歴ナビゲーションを管理するモダンなWeb標準API
- 従来の`popstate`イベントや`history.pushState()`を置き換える
- View Transitionとの統合がスムーズ

### 基本的な使い方

```javascript
// Navigation APIの基本
navigation.addEventListener('navigate', (event) => {
  // ブラウザバック・フォワードを検出
  const isBackForward = event.navigationType === 'traverse';
  
  // ナビゲーションをインターセプト
  event.intercept({
    handler: async () => {
      // ReactのstartTransitionと組み合わせる
      startTransition(() => {
        // 状態更新
        updateRoute(event.destination.url);
      });
    }
  });
});
```

### ブラウザサポート状況

| ブラウザ | サポート状況 |
|---------|------------|
| Chrome/Edge | ✅ v102+ |
| Safari | ❌ 未サポート |
| Firefox | ❌ 未サポート |

### フォールバック対応

```javascript
if ('navigation' in window) {
  // Navigation API使用
  navigation.addEventListener('navigate', handleNavigate);
} else {
  // フォールバック（従来のpopstate）
  window.addEventListener('popstate', handlePopstate);
}
```

## 現在のプロジェクト状況

### 使用中のルーター
- Next.js App Router

### 制約
- Navigation APIはChromeベースブラウザのみサポート
- Safari/Firefoxでは動作しない
- Next.jsのApp RouterがNavigation APIに対応しているか要確認

## 今後の検討事項

1. **Next.js App RouterのNavigation API対応状況を確認**
   - 公式ドキュメントやIssueを確認
   - 実験的な機能として提供されているか

2. **カスタムルーター実装の検討**
   - Navigation APIを使用した独自ルーター
   - Next.jsとの統合方法

3. **プログレッシブエンハンスメントの検討**
   - Chrome: Navigation API + View Transition
   - Safari/Firefox: 従来のpopstate（アニメーションなし）

4. **代替案の検討**
   - ブラウザバック時のアニメーションを諦める
   - 通常のページ遷移のみでView Transitionを使用

## 参考リンク

- React ViewTransition公式ドキュメント: https://ja.react.dev/reference/react/ViewTransition
- MDN Navigation API: https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
- Chrome Developers Navigation API: https://developer.chrome.com/docs/web-platform/navigation-api

## メモ

- 現時点（2025-11-24）では、React 19の公式ドキュメントに**具体的な実装コード例は記載されていない**
- "Navigation APIにアップグレードせよ"という指示のみ
- 実装には独自の調査と実験が必要
