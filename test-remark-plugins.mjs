import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const testMarkdown = `
> [!INFO]
> This is an info alert

Some text with **bold**.
`;

const result = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkGithubBlockquoteAlert)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(testMarkdown);

console.log('=== Generated HTML ===');
console.log(String(result));
