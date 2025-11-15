import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { rehypeLinkCard } from '@/lib/rehype-link-card';
import { rehypeCodeCopyButton } from '@/lib/rehype-code-copy-button';
import { MarkdownContent } from './markdown-content';

type CustomMarkdownProps = {
  source: string;
};

const rehypePrettyCodeOptions = {
  theme: 'slack-dark',
  keepBackground: true,
  defaultLang: 'plaintext',
};

/**
 * Markdownコンテンツをremark/rehypeプラグインを使用してレンダリングするコンポーネント
 *
 * このコンポーネントはMarkdownソースを受け取り、HTMLとして処理・表示します。
 * GFM（GitHub Flavored Markdown）、リンクカード、GitHubスタイルのアラート、
 * シンタックスハイライト、コードコピーボタンなど、多くの機能をサポートしています。
 * エラーが発生した場合は、エラーメッセージを表示します。
 *
 * @param source - レンダリングするMarkdownソース文字列
 * @returns レンダリングされたMarkdownコンポーネント。エラー時はエラーメッセージを含むdivを返します
 *
 * @example
 * ```tsx
 * import { CustomMarkdown } from '@/components/feature/content/custom-markdown';
 *
 * export default async function BlogPost() {
 *   const markdownSource = `
 * # タイトル
 *
 * これは**太字**のテキストです。
 *
 * ## コードブロック
 * \`\`\`typescript
 * function greet(name: string): string {
 *   return \`Hello, \${name}!\`;
 * }
 * \`\`\`
 *
 * ## リンクカード
 * https://zenn.dev/example/articles/typescript
 *
 * > [!NOTE]
 * > これはGitHubスタイルのアラートです。
 *   `;
 *
 *   return (
 *     <article>
 *       <CustomMarkdown source={markdownSource} />
 *     </article>
 *   );
 * }
 * ```
 */
export async function CustomMarkdown({ source }: CustomMarkdownProps) {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkBreaks)
      .use(remarkAlert)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeSlug)
      .use(rehypeLinkCard)
      // @ts-expect-error: rehypePrettyCode type mismatch
      .use(rehypePrettyCode, rehypePrettyCodeOptions)
      .use(rehypeCodeCopyButton)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(source);

    return <MarkdownContent html={String(result)} />;
  } catch (error) {
    console.error('Error rendering Markdown:', error);
    return (
      <div className='rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive'>
        An error occurred while rendering the content.
      </div>
    );
  }
}
