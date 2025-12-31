# Locator Strategies

Comprehensive guide to locator strategies and selection.

## Locator Priority Order

Choose locators in this priority order to maximize test resilience:

### 1. Role-based (Highest Priority)

Best for accessibility and semantic meaning.

```typescript
// ✅ Buttons
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('button', { name: /submit/i }); // Case-insensitive regex

// ✅ Links
await page.getByRole('link', { name: 'Home' });

// ✅ Form controls
await page.getByRole('textbox', { name: 'Username' });
await page.getByRole('checkbox', { name: 'Remember me' });
await page.getByRole('radio', { name: 'Option A' });

// ✅ Headings
await page.getByRole('heading', { name: 'Welcome' });
await page.getByRole('heading', { level: 1 }); // <h1>

// ✅ Lists
await page.getByRole('listitem').filter({ hasText: 'Item 2' });
```

**Common roles:**
- `button`, `link`, `textbox`, `checkbox`, `radio`, `combobox`
- `heading`, `listitem`, `row`, `cell`, `tab`, `dialog`
- See [ARIA roles reference](https://www.w3.org/TR/wai-aria-1.2/#role_definitions)

### 2. Label-based (Form Elements)

Best for form inputs with associated labels.

```typescript
// ✅ Input fields
await page.getByLabel('Email address');
await page.getByLabel('Password');
await page.getByLabel(/username/i); // Case-insensitive

// ✅ Checkboxes
await page.getByLabel('I agree to terms');

// ✅ Selects
await page.getByLabel('Country');
```

**How it works:** Matches via `<label for="id">`, wrapping labels, or `aria-labelledby`.

### 3. Placeholder-based

For inputs without visible labels.

```typescript
// ✅ When label isn't visible
await page.getByPlaceholder('name@example.com');
await page.getByPlaceholder('Search...');
```

### 4. Text-based

For elements with visible text content.

```typescript
// ✅ Exact match
await page.getByText('Submit');

// ✅ Substring match
await page.getByText('Sub', { exact: false });

// ✅ Regex match
await page.getByText(/submit/i);

// ✅ With element type
await page.locator('button', { hasText: 'Submit' });
```

### 5. Alt text (Images)

For images and area elements.

```typescript
// ✅ Images
await page.getByAltText('Company logo');
await page.getByAltText(/logo/i);
```

### 6. Title attribute

For elements with title attributes.

```typescript
// ✅ Tooltip or title
await page.getByTitle('Close dialog');
```

### 7. Test ID (data-testid)

For stable test-specific attributes.

```typescript
// ✅ Custom test IDs
await page.getByTestId('submit-button');
await page.getByTestId('user-profile');

// Configure custom attribute in playwright.config.ts
use: {
  testIdAttribute: 'data-test-id' // or 'data-qa', etc.
}
```

**When to use:** When semantic attributes aren't available or change frequently.

### 8. CSS/XPath (Last Resort)

Only when other options aren't viable.

```typescript
// ⚠️ Less resilient to DOM changes
await page.locator('.btn-primary');
await page.locator('#submit-button');
await page.locator('div.container > button:nth-child(2)');

// ⚠️ XPath
await page.locator('xpath=//button[@class="submit"]');
```

**Drawbacks:**
- Breaks when CSS classes change
- Breaks when DOM structure changes
- Less readable
- Doesn't reflect user perception

## Filtering and Chaining

Combine locators to narrow selection:

```typescript
// ✅ Filter by text
const product = page.getByRole('listitem')
  .filter({ hasText: 'Product 2' });
await product.getByRole('button', { name: 'Add to cart' }).click();

// ✅ Filter by another locator
const row = page.getByRole('row')
  .filter({ has: page.getByRole('cell', { name: 'Alice' }) });
await row.getByRole('button', { name: 'Edit' }).click();

// ✅ Multiple filters
const item = page.getByRole('listitem')
  .filter({ hasText: 'Product' })
  .filter({ has: page.locator('.in-stock') });
```

## Locating in Parent/Child Relationships

```typescript
// ✅ Find parent, then child
const form = page.locator('form.login');
await form.getByLabel('Username').fill('john');
await form.getByLabel('Password').fill('secret');
await form.getByRole('button', { name: 'Submit' }).click();

// ✅ Find specific list item
const products = page.locator('ul.products');
await products.getByText('Product 2').click();

// ✅ Scoped operations
const dialog = page.locator('dialog.confirmation');
await dialog.getByRole('button', { name: 'Confirm' }).click();
```

## Working with Multiple Elements

```typescript
// Count elements
const count = await page.getByRole('listitem').count();

// Get all elements (requires explicit wait)
await page.getByRole('listitem').first().waitFor();
const items = await page.getByRole('listitem').all();
for (const item of items) {
  console.log(await item.textContent());
}

// Access by index
await page.getByRole('listitem').nth(2).click(); // 3rd item (0-indexed)
await page.getByRole('listitem').first().click();
await page.getByRole('listitem').last().click();

// Filter and iterate
const products = await page.getByRole('listitem')
  .filter({ hasText: 'On sale' })
  .all();
```

## Frames and iframes

```typescript
// ✅ Frame locator
const frame = page.frameLocator('iframe#payment');
await frame.getByLabel('Card number').fill('4242424242424242');
await frame.getByRole('button', { name: 'Pay' }).click();

// Wait for frame to load
await frame.locator('body').waitFor();

// Nested frames
const outerFrame = page.frameLocator('iframe#outer');
const innerFrame = outerFrame.frameLocator('iframe#inner');
await innerFrame.getByRole('button').click();
```

## Shadow DOM

```typescript
// ✅ Piercing shadow DOM (enabled by default)
await page.locator('my-component').getByRole('button').click();

// ✅ Explicit shadow root
await page.locator('my-component')
  .locator('css=button') // Pierces shadow automatically
  .click();
```

## Dynamic Locators

Build locators dynamically based on data:

```typescript
// ✅ Dynamic role names
async function clickButton(name: string) {
  await page.getByRole('button', { name }).click();
}

// ✅ Dynamic selectors
async function fillField(label: string, value: string) {
  await page.getByLabel(label).fill(value);
}

// ✅ With conditions
const selector = condition === 'A' ? '#element-a' : '#element-b';
await page.locator(selector).click();
```

## Best Practices Summary

### DO:
- ✅ Use role, label, text - user-facing attributes
- ✅ Use `getByRole()` when possible
- ✅ Use `getByLabel()` for form fields
- ✅ Filter and chain for precision
- ✅ Use `getByTestId()` when semantic locators aren't stable

### DON'T:
- ❌ Use CSS classes as primary locator strategy
- ❌ Use complex XPath expressions
- ❌ Use nth-child unless necessary
- ❌ Hard-code indexes when avoidable
- ❌ Rely on DOM structure (parent/sibling relationships)

## Examples: Converting CSS to Semantic Locators

```typescript
// ❌ CSS-based (brittle)
await page.locator('.btn-primary').click();
await page.locator('#username-input').fill('john');
await page.locator('div.container > form > input:nth-child(2)').fill('secret');

// ✅ Semantic (resilient)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Username').fill('john');
await page.getByLabel('Password').fill('secret');
```

```typescript
// ❌ Complex CSS (hard to maintain)
await page.locator('ul.products li:nth-child(2) button.add-to-cart').click();

// ✅ Semantic chain (clear intent)
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });
await product.getByRole('button', { name: 'Add to cart' }).click();
```

## Official Documentation

- [Locators](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices#use-locators)
- [ARIA Roles](https://www.w3.org/TR/wai-aria-1.2/#role_definitions)
