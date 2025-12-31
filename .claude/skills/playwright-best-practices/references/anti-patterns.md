# Anti-Patterns to Avoid

Detailed explanation of deprecated patterns and why to avoid them.

## waitForNavigation (Deprecated)

### Why it's deprecated

`waitForNavigation()` is officially deprecated in Playwright because:

1. **Race conditions**: Must be set up before the action that triggers navigation
2. **Complex coordination**: Requires Promise.all() for proper timing
3. **Better alternatives exist**: `waitForURL()` and auto-waiting are more reliable

### Examples

```typescript
// ❌ Deprecated: waitForNavigation with race condition risk
const navigationPromise = page.waitForNavigation();
await page.click('button');
await navigationPromise;

// ✅ Use instead: waitForURL (recommended replacement)
await page.click('button');
await page.waitForURL('**/next-page');

// ✅ Or wait for next page element (most stable)
await page.click('button');
await page.waitForSelector('#next-page-element', { timeout: 30 * 1000 });
```

### Migration path

Replace all instances of `waitForNavigation()` with either:
- `waitForURL()` when URL pattern is predictable
- `waitForSelector()` for next page's unique element (most reliable)
- Trust auto-waiting when using locator actions

## networkidle (Unreliable)

### Why it's unreliable

`networkidle` waits for 500ms of no network activity, which causes problems:

1. **False positives**: Network quiets temporarily before page is ready
2. **Unpredictable**: Depends on network timing, not page state
3. **Not recommended for tests**: Official docs discourage test usage

### Examples

```typescript
// ❌ Unstable: networkidle can complete prematurely
await page.waitForLoadState('networkidle', { timeout: 30 * 1000 });

// ✅ Use instead: Wait for specific element
await page.waitForSelector('#content-loaded', { timeout: 30 * 1000 });

// ✅ Or use 'load' state (more reliable)
await page.waitForLoadState('load', { timeout: 30 * 1000 });
```

### Real-world issue

```typescript
// ❌ Problem: Navigation completes before next page is ready
const currentUrl = page.url();
await page.waitForURL((url) => url.toString() !== currentUrl);
await page.waitForLoadState('networkidle'); // ❌ Can finish too early!

// Next operation fails unpredictably
await page.locator('select#year').selectOption('2024'); // ❌ Element not ready

// ✅ Solution: Wait for specific element
const currentUrl = page.url();
await page.waitForURL((url) => url.toString() !== currentUrl);
await page.waitForSelector('select#year', { timeout: 30 * 1000 }); // ✅ Waits for actual element
await page.locator('select#year').selectOption('2024'); // ✅ Works reliably
```

## page.evaluate() for Element Operations

### Why to avoid

Using `page.evaluate()` for clicks/interactions bypasses critical safety checks:

1. **No auto-waiting**: Doesn't wait for element to exist
2. **No actionability checks**: Doesn't verify element is clickable
3. **Misses overlays**: Clicks even when element is obscured
4. **Poor debugging**: Not properly recorded in traces
5. **Not user-realistic**: Doesn't simulate real user interactions

### Actionability checks that get bypassed

| Check | Locator.click() | page.evaluate() |
|-------|----------------|-----------------|
| Element exists | ✓ Auto-waits | ❌ Throws if missing |
| Element visible | ✓ Checks | ❌ Clicks anyway |
| Element stable | ✓ Waits | ❌ No check |
| Not obscured | ✓ Checks | ❌ Clicks anyway |
| Element enabled | ✓ Checks | ❌ Clicks anyway |

### Examples

```typescript
// ❌ Avoid: Direct DOM manipulation
await page.evaluate(() => {
  document.querySelector('button').click();
});

// Problems:
// - Clicks even if button is hidden
// - Clicks even if button is disabled
// - Clicks even if button is covered by modal
// - No retry if button doesn't exist yet

// ✅ Use instead: Locator with auto-waiting
await page.locator('button').click();

// Benefits:
// - Waits for button to exist
// - Verifies button is visible
// - Verifies button is enabled
// - Verifies button isn't obscured
// - Auto-retries until timeout
```

### When page.evaluate() is appropriate

Only use `page.evaluate()` for:

```typescript
// ✅ Appropriate: Reading state
const isChecked = await page.evaluate(() => {
  return document.querySelector('input').checked;
});

// ✅ Appropriate: Complex calculations
const totalHeight = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.item'))
    .reduce((sum, el) => sum + el.offsetHeight, 0);
});

// ❌ NOT for: Element interactions
// Use locator methods instead
```

## Unnecessary Promise.all with Navigation

### Why it's unnecessary in Playwright

Playwright's locator methods automatically wait for navigation:

```typescript
// ❌ Unnecessary: Playwright auto-waits for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('button')
]);

// ✅ Simpler: Just click (auto-waits)
await page.click('button');
```

### When Promise.all IS needed

Only use `Promise.all()` for events that DON'T auto-wait:

```typescript
// ✅ Necessary: New tab/window doesn't auto-wait
const [newPage] = await Promise.all([
  page.context().waitForEvent('page'),
  page.click('a[target="_blank"]')
]);

// ✅ Necessary: Dialog handling
const [dialog] = await Promise.all([
  page.waitForEvent('dialog'),
  page.click('button.delete')
]);
await dialog.accept();

// ✅ Necessary: Download handling
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('a.download')
]);
```

## Excessive waitForSelector

### Why it's often unnecessary

Locator actions already include waiting:

```typescript
// ❌ Redundant: Double waiting
await page.waitForSelector('button');
await page.locator('button').click();

// ✅ Sufficient: Click includes waiting
await page.locator('button').click();

// ❌ Redundant: Double waiting
await page.waitForSelector('input');
await page.locator('input').fill('text');

// ✅ Sufficient: Fill includes waiting
await page.locator('input').fill('text');
```

### When waitForSelector IS needed

Use `waitForSelector()` only for:

```typescript
// ✅ Conditional page destinations
await page.click('.next-button');
const waitSelector = condition === 'A'
  ? '#page-a-element'
  : '#page-b-element';
await page.waitForSelector(waitSelector, { timeout: 30 * 1000 });

// ✅ Before locator.all() (doesn't auto-wait)
await page.locator('.item').first().waitFor();
const items = await page.locator('.item').all();

// ✅ Waiting for element to disappear
await page.locator('.loading').waitFor({ state: 'hidden' });
```

## Mixing waitForURL with networkidle

### The problem

Combining these creates unstable tests:

```typescript
// ❌ Unstable combination
const currentUrl = page.url();
await page.waitForURL((url) => url.toString() !== currentUrl);
await page.waitForLoadState('networkidle'); // ❌ May finish before page is ready

// Next operation fails unpredictably
await page.locator('select#year').selectOption('2024'); // ❌ Element not ready
```

### The solution

Wait for specific elements instead:

```typescript
// ✅ Stable approach
await page.click('.next-button');
await page.waitForSelector('select#year', { timeout: 30 * 1000 });

// Now element is definitely ready
await page.locator('select#year').selectOption('2024'); // ✅ Works reliably
```

## Summary: Migration Guide

| Old Pattern | New Pattern | Reason |
|------------|------------|---------|
| `waitForNavigation()` | `waitForURL()` or `waitForSelector()` | Deprecated, race conditions |
| `networkidle` | `waitForSelector()` or `load` | Unreliable, can finish early |
| `page.evaluate(() => el.click())` | `locator.click()` | Bypasses safety checks |
| `Promise.all([waitForNavigation, click])` | `click()` alone | Auto-waits for navigation |
| `waitForSelector()` + `locator.action()` | `locator.action()` alone | Redundant waiting |
