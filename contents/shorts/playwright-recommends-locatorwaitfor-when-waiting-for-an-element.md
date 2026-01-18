---
title: "Playwright では 要素を待つとき locator.waitFor() が推奨されている"
date: 2026-01-18
---

Playwright で特定のセレクタを待つ場合、`page.waitForSelector()` は**非推奨 (discouraged)** とされており、代わりに `locator.waitFor()` を使用することが公式に推奨されています。

```ts
// 🤔
await page.waitForSelector('#order-sent');

// ☺️
const orderSent = page.locator('#order-sent');
await orderSent.waitFor();
```

---

公式ドキュメントでは、`waitForSelector()` について以下のように明記されています。

> "The `Page.waitForSelector` method is **discouraged**; instead, use web assertions that assert visibility or a locator-based `Locator.waitFor`."

Locator ベースの API は自動待機機能を持ち、より modern で信頼性の高いアプローチとされている。ただし、Playwright の多くのアクション (`click()`, `fill()` など) は自動で待機するため、ほとんどの場合は明示的な待機自体が不要です。

---

明示的な待機が必要なケースは以下の通り。

```ts
// 1. locator.all() を使う前 (自動待機しないため)
await page.getByRole('listitem').first().waitFor();
const items = await page.getByRole('listitem').all();

// 2. 要素が消えるのを待つ
await page.locator('.loading').waitFor({ state: 'hidden' });

// 3. 要素が DOM から削除されるのを待つ
await page.locator('.modal').waitFor({ state: 'detached' });
```

---

参考リンク: [Playwright API - Locator.waitFor](https://playwright.dev/docs/api/class-locator#locator-wait-for)
