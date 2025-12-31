# Element Actions

Detailed guide to element action methods and their behavior.

## Click Operations

### Basic Click

```typescript
// Standard click
await page.getByRole('button', { name: 'Submit' }).click();

// With options
await page.getByRole('button').click({
  timeout: 5 * 1000,           // Custom timeout
  force: false,            // Skip actionability checks (not recommended)
  noWaitAfter: false,      // Wait for navigation after click
  trial: false,            // Dry run - checks without clicking
  clickCount: 1,           // Number of clicks
  delay: 0,                // Delay between mousedown and mouseup
  button: 'left',          // 'left', 'right', 'middle'
  modifiers: [],           // ['Alt', 'Control', 'Meta', 'Shift']
  position: undefined      // { x: number, y: number }
});
```

### Click Variants

```typescript
// Double click
await page.getByText('Item').dblclick();

// Right click (context menu)
await page.getByText('File').click({ button: 'right' });

// Middle click
await page.getByRole('link').click({ button: 'middle' });

// Click with modifier keys
await page.getByText('Item').click({ modifiers: ['Shift'] });
await page.getByText('Link').click({ modifiers: ['ControlOrMeta'] }); // Ctrl on Windows/Linux, Cmd on Mac

// Click at specific position (relative to element)
await page.getByRole('canvas').click({ position: { x: 100, y: 200 } });
```

### Actionability Checks for Click

Before clicking, Playwright verifies:

1. **Visible**: Element has bounding box and not `visibility: hidden`
2. **Stable**: Element position doesn't change for 2 consecutive frames
3. **Receives Events**: Element isn't obscured by another element
4. **Enabled**: Element doesn't have `disabled` attribute

```typescript
// ✅ All these checks happen automatically
await page.getByRole('button').click();

// ⚠️ Force click (skips checks - rarely needed)
await page.getByRole('button').click({ force: true });
```

### When to Use force: true

Only use `force: true` when:
- Element is intentionally obscured but still clickable
- Testing overlays or complex UI states
- You understand the risks of bypassing safety checks

```typescript
// ⚠️ Example: Clicking element behind overlay (rare case)
await page.locator('.hidden-button').click({ force: true });
```

## Text Input Operations

### fill() - Standard Text Input

Recommended for most text input scenarios.

```typescript
// Basic usage
await page.getByLabel('Email').fill('user@example.com');

// With options
await page.getByLabel('Email').fill('user@example.com', {
  timeout: 5 * 1000,
  noWaitAfter: false,
  force: false
});
```

**What fill() does:**
1. Focuses the element
2. Clears existing content
3. Types new content
4. Fires `input` event

**Actionability checks:**
- Visible
- Enabled
- Editable (not `readonly`)

**Supported elements:**
- `<input>` (except type=file)
- `<textarea>`
- `[contenteditable]` elements

### pressSequentially() - Character-by-Character Input

Use only when you need individual key events.

```typescript
// Types character by character with delays
await page.locator('input').pressSequentially('Hello World', { delay: 100 });

// Use cases:
// - Autocomplete fields that need keydown events
// - Fields with character-by-character validation
// - Simulating slow typing
```

### type() - Deprecated, Use fill() or pressSequentially()

```typescript
// ❌ Deprecated
await page.locator('input').type('text');

// ✅ Use fill() instead
await page.getByLabel('Username').fill('text');

// ✅ Or pressSequentially() if you need key events
await page.getByLabel('Search').pressSequentially('text', { delay: 100 });
```

### clear() - Clear Input Field

```typescript
// Clear content
await page.getByLabel('Email').clear();

// fill() automatically clears first
await page.getByLabel('Email').fill('new@example.com'); // Clears then fills
```

## Checkbox and Radio Operations

### check() and uncheck()

```typescript
// Check checkbox
await page.getByLabel('I agree').check();

// Uncheck checkbox
await page.getByLabel('Subscribe').uncheck();

// Radio button (use check)
await page.getByLabel('Option A').check();

// With options
await page.getByLabel('I agree').check({
  timeout: 5 * 1000,
  force: false,
  noWaitAfter: false,
  trial: false,
  position: undefined
});
```

**Actionability checks:**
- Visible
- Stable
- Receives Events
- Enabled

**Supported elements:**
- `<input type="checkbox">`
- `<input type="radio">`
- `[role="checkbox"]`
- `[role="radio"]`

### setChecked() - Ensure Specific State

```typescript
// Set to checked (idempotent)
await page.getByLabel('Remember me').setChecked(true);

// Set to unchecked (idempotent)
await page.getByLabel('Remember me').setChecked(false);

// Useful when you don't know current state
const shouldCheck = userPreference === 'remember';
await page.getByLabel('Remember me').setChecked(shouldCheck);
```

## Select Operations

### selectOption() - Dropdown Selection

```typescript
// Select by label (visible text)
await page.getByLabel('Country').selectOption({ label: 'Japan' });

// Select by value attribute
await page.getByLabel('Country').selectOption({ value: 'jp' });

// Select by index (0-based)
await page.getByLabel('Country').selectOption({ index: 1 });

// Select multiple options
await page.locator('select[multiple]').selectOption(['option1', 'option2']);

// Select by element handle
const option = await page.locator('option').nth(2).elementHandle();
await page.locator('select').selectOption(option);
```

**Actionability checks:**
- Visible
- Enabled

**Works with:**
- `<select>` elements only
- For custom dropdowns, use click() and filter operations

### Custom Dropdowns (Not <select>)

```typescript
// Open dropdown
await page.getByRole('button', { name: 'Select country' }).click();

// Select option
await page.getByRole('option', { name: 'Japan' }).click();

// Or with listbox role
await page.getByRole('listbox').getByText('Japan').click();
```

## Hover Operations

### hover() - Mouse Over

```typescript
// Basic hover
await page.getByRole('button', { name: 'Menu' }).hover();

// With options
await page.getByRole('button').hover({
  timeout: 5 * 1000,
  force: false,
  noWaitAfter: false,
  trial: false,
  position: { x: 10, y: 10 },
  modifiers: ['Shift']
});
```

**Actionability checks:**
- Visible
- Stable
- Receives Events

**Use cases:**
- Reveal tooltips
- Show dropdown menus
- Trigger hover effects before clicking

## Focus Operations

```typescript
// Set focus
await page.getByLabel('Username').focus();

// Remove focus (blur)
await page.getByLabel('Username').blur();

// Focus and type
await page.getByLabel('Username').focus();
await page.keyboard.type('john');
```

## Keyboard Operations

### press() - Single Key Press

```typescript
// Press single key
await page.getByLabel('Search').press('Enter');
await page.press('body', 'Control+S'); // Save shortcut

// Common keys:
// 'Enter', 'Escape', 'Tab', 'Backspace', 'Delete'
// 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
// 'Home', 'End', 'PageUp', 'PageDown'
// 'F1' through 'F12'

// With modifiers:
await page.press('body', 'Control+A'); // Select all
await page.press('body', 'Meta+C');    // Copy on Mac
await page.press('body', 'Shift+Tab'); // Reverse tab
```

### Keyboard Navigation

```typescript
// Navigate with keyboard
await page.keyboard.press('Tab');         // Next field
await page.keyboard.press('Shift+Tab');   // Previous field
await page.keyboard.press('Enter');       // Submit
await page.keyboard.press('Escape');      // Close dialog

// Arrow keys in lists/dropdowns
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowUp');
```

## Drag and Drop

```typescript
// Drag and drop
await page.getByRole('listitem', { name: 'Item 1' }).dragTo(
  page.getByRole('listitem', { name: 'Item 3' })
);

// With coordinates
await page.locator('.draggable').dragTo(page.locator('.drop-zone'), {
  sourcePosition: { x: 0, y: 0 },
  targetPosition: { x: 100, y: 100 }
});
```

## File Upload

```typescript
// Upload single file
await page.getByLabel('Upload file').setInputFiles('path/to/file.pdf');

// Upload multiple files
await page.getByLabel('Upload files').setInputFiles([
  'file1.pdf',
  'file2.pdf'
]);

// Clear file input
await page.getByLabel('Upload file').setInputFiles([]);

// Upload from buffer
await page.getByLabel('Upload file').setInputFiles({
  name: 'file.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('file content')
});
```

## Scroll Operations

```typescript
// Scroll element into view (happens automatically before actions)
await page.getByRole('button').scrollIntoViewIfNeeded();

// Scroll by pixels
await page.evaluate(() => window.scrollBy(0, 100));

// Scroll to bottom
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

// Scroll specific element
await page.locator('.scrollable').evaluate(el => el.scrollTop = 100);
```

## Taking Screenshots

```typescript
// Screenshot specific element
await page.getByRole('dialog').screenshot({ path: 'dialog.png' });

// With options
await page.locator('.component').screenshot({
  path: 'component.png',
  type: 'png',          // 'png' or 'jpeg'
  quality: 80,          // For JPEG only
  omitBackground: true, // Transparent background
  animations: 'disabled' // 'disabled' or 'allow'
});
```

## Actionability Reference Table

| Action | Visible | Stable | Receives Events | Enabled | Editable |
|--------|---------|--------|----------------|---------|----------|
| click() | ✓ | ✓ | ✓ | ✓ | - |
| dblclick() | ✓ | ✓ | ✓ | ✓ | - |
| fill() | ✓ | - | - | ✓ | ✓ |
| clear() | ✓ | - | - | ✓ | ✓ |
| check() | ✓ | ✓ | ✓ | ✓ | - |
| uncheck() | ✓ | ✓ | ✓ | ✓ | - |
| selectOption() | ✓ | - | - | ✓ | - |
| hover() | ✓ | ✓ | ✓ | - | - |
| focus() | - | - | - | - | - |
| press() | - | - | - | - | - |
| setInputFiles() | ✓ | - | - | ✓ | - |

## Official Documentation

- [Actions](https://playwright.dev/docs/input)
- [Actionability](https://playwright.dev/docs/actionability)
- [Keyboard](https://playwright.dev/docs/api/class-keyboard)
