<!-- https://docs.astro.build/en/guides/syntax-highlighting/#setting-light-and-dark-mode-themes -->

[Skip to content](https://docs.astro.build/en/guides/syntax-highlighting/#_top)

Astro comes with built-in support for [Shiki](https://shiki.style/) and [Prism](https://prismjs.com/). This provides syntax highlighting for:

- all [code fences (\`\`\`)](https://docs.astro.build/en/guides/syntax-highlighting/#markdown-code-blocks) used in a Markdown or MDX file.
- content within the [built-in `<Code />` component](https://docs.astro.build/en/guides/syntax-highlighting/#code-) (powered by Shiki) in `.astro` files.
- content within the [`<Prism />` component](https://docs.astro.build/en/guides/syntax-highlighting/#prism-) (powered by Prism) in `.astro` files.

Add [community integrations such as Expressive Code](https://astro.build/integrations/?search=syntax+highlight) for even more text marking and annotation options in your code blocks.

A Markdown code block is indicated by a block with three backticks \`\`\` at the start and end. You can indicate the programming language being used after the opening backticks to indicate how to color and style your code to make it easier to read.

```markdown
\`\`\`js
// Javascript code with syntax highlighting.
var fun = function lang(l) {
  dateformat.i18n = require('./lang/' + l);
  return true;
};
\`\`\`
```

Astro’s Markdown code blocks are styled by Shiki by default, preconfigured with the `github-dark` theme. The compiled output will be limited to inline `style` s without any extraneous CSS classes, stylesheets, or client-side JS.

You can [add a Prism stylesheet and switch to Prism’s highlighting](https://docs.astro.build/en/guides/syntax-highlighting/#add-a-prism-stylesheet), or disable Astro’s syntax highlighting entirely, with the [`markdown.syntaxHighlight`](https://docs.astro.build/en/reference/configuration-reference/#markdownsyntaxhighlight) configuration option.

You can configure any [built-in Shiki theme](https://shiki.style/themes) for your Markdown code blocks in your Astro config:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});
```

You can specify dual Shiki themes for light and dark mode in your Astro config:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
```

Then, [add Shiki’s dark mode CSS variables via media query or classes](https://shiki.style/guide/dual-themes#query-based-dark-mode) to apply to all your Markdown code blocks by default. Replace the `.shiki` class in the examples from Shiki’s documentation with `.astro-code`:

```css
@media (prefers-color-scheme: dark) {
  .shiki,
  .shiki span {
  .astro-code,
  .astro-code span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
    /* Optional, if you also want font styles */
    font-style: var(--shiki-dark-font-style) !important;
    font-weight: var(--shiki-dark-font-weight) !important;
    text-decoration: var(--shiki-dark-text-decoration) !important;
  }
}
```

Instead of using one of Shiki’s predefined themes, you can import a custom Shiki theme from a local file.

```js
import { defineConfig } from 'astro/config';
import customTheme from './my-shiki-theme.json';

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: customTheme,
    },
  },
});
```

You can follow [Shiki’s own theme documentation](https://shiki.style/themes) for more customization options for themes, [light vs dark mode toggles](https://shiki.style/guide/dual-themes), or styling via [CSS variables](https://shiki.style/guide/theme-colors#css-variables-theme).

You will need to adjust the examples from Shiki’s documentation for your Astro project by making the following substitutions:

- Code blocks are styled using the `.astro-code` class instead of `.shiki`
- When using the `css-variables` theme, custom properties are prefixed with `--astro-code-` instead of `--shiki-`

There are two Astro components available for `.astro` and `.mdx` files to render code blocks: [`<Code />`](https://docs.astro.build/en/guides/syntax-highlighting/#code-) and [`<Prism />`](https://docs.astro.build/en/guides/syntax-highlighting/#prism-).

You can reference the `Props` of these components using the [`ComponentProps` type](https://docs.astro.build/en/guides/typescript/#componentprops-type) utility.

This component is powered internally by Shiki. It supports all popular Shiki themes and languages as well as several other Shiki options such as custom themes, languages, [transformers](https://docs.astro.build/en/guides/syntax-highlighting/#transformers), and default colors.

These values are passed to the `<Code />` component using the `theme`, `lang`, `transformers`, and `defaultColor` attributes respectively as props. The `<Code />` component will not inherit your `shikiConfig` settings for Markdown code blocks.

```astro
---
import { Code } from 'astro:components';
---
<!-- Syntax highlight some JavaScript code. -->
<Code code={\`const foo = 'bar';\`} lang="js" />
<!-- Optional: Customize your theme. -->
<Code code={\`const foo = 'bar';\`} lang="js" theme="dark-plus" />
<!-- Optional: Enable word wrapping. -->
<Code code={\`const foo = 'bar';\`} lang="js" wrap />
<!-- Optional: Output inline code. -->
<p>
  <Code code={\`const foo = 'bar';\`} lang="js" inline />
  will be rendered inline.
</p>
<!-- Optional: defaultColor -->
<Code code={\`const foo = 'bar';\`} lang="js" defaultColor={false} />
```

**Added in:**`astro@4.11.0`

[Shiki transformers](https://shiki.style/packages/transformers#shikijs-transformers) can optionally be applied to code by passing them in through the `transformers` property as an array. Since Astro v4.14.0, you can also provide a string for [Shiki’s `meta` attribute](https://shiki.style/guide/transformers#meta) to pass options to transformers.

Note that `transformers` only applies classes and you must provide your own CSS rules to target the elements of your code block.

```astro
---
import { transformerNotationFocus, transformerMetaHighlight } from '@shikijs/transformers'
import { Code } from 'astro:components'
const code = \`const foo = 'hello'
const bar = ' world'
console.log(foo + bar) // [!code focus]
\`
---
<Code
  code={code}
  lang="js"
  transformers={[transformerMetaHighlight()]}
  meta="{1,3}"
/>

<style is:global>
  pre.has-focused .line:not(.focused) {
    filter: blur(1px);
  }
</style>
```

This component provides language-specific syntax highlighting for code blocks by applying Prism’s CSS classes. Note that you must [provide a Prism CSS stylesheet](https://docs.astro.build/en/guides/syntax-highlighting/#add-a-prism-stylesheet) (or bring your own) to style the classes.

To use the `Prism` highlighter component, you must install the `@astrojs/prism` package:

- [npm](https://docs.astro.build/en/guides/syntax-highlighting/#tab-panel-2133)
- [pnpm](https://docs.astro.build/en/guides/syntax-highlighting/#tab-panel-2134)
- [Yarn](https://docs.astro.build/en/guides/syntax-highlighting/#tab-panel-2135)

```shell
pnpm add @astrojs/prism
```

Then, you can import and use the `<Prism />` component like any other Astro component, passing a language and the code to render.

```astro
---
import { Prism } from '@astrojs/prism';
---
<Prism lang="js" code={\`const foo = 'bar';\`} />
```

In addition to the [list of languages supported by Prism](https://prismjs.com/#supported-languages), you can also use `lang="astro"` to display Astro code blocks.

If you opt to use Prism (either by configuring `markdown.syntaxHighlight: 'prism'` or with the `<Prism />` component), Astro will apply Prism’s CSS classes instead of Shiki’s to your code. You will need to bring your own CSS stylesheet for syntax highlighting to appear.

1. Choose a premade stylesheet from the available [Prism Themes](https://github.com/PrismJS/prism-themes).
2. Add this stylesheet to [your project’s `public/` directory](https://docs.astro.build/en/basics/project-structure/#public).
3. Load this into your page’s `<head>` in a [layout component](https://docs.astro.build/en/basics/layouts/) via a `<link>` tag. (See [Prism basic usage](https://prismjs.com/#basic-usage).)

You can also visit the [list of languages supported by Prism](https://prismjs.com/#supported-languages) for options and usage.