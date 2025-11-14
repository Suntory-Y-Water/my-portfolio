import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import remarkLinkCard from 'remark-link-card';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';

interface CustomMarkdownProps {
  source: string;
}

const rehypePrettyCodeOptions = {
  theme: 'slack-dark',
  keepBackground: true,
  defaultLang: 'plaintext',
};

/**
 * Renders Markdown content with remark/rehype plugins
 *
 * This component processes Markdown source content and renders it as HTML.
 * It supports GFM, link cards, and GitHub-style alerts.
 */
export async function CustomMarkdown({ source }: CustomMarkdownProps) {
  try {
    const result = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkBreaks)
      .use(remarkGithubBlockquoteAlert)
      .use(remarkLinkCard)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypePrettyCode, rehypePrettyCodeOptions)
      .use(rehypeStringify)
      .process(source);

    return (
      <div
        className='markdown-content'
        dangerouslySetInnerHTML={{ __html: String(result) }}
      />
    );
  } catch (error) {
    console.error('Error rendering Markdown:', error);
    return (
      <div className='rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive'>
        An error occurred while rendering the content.
      </div>
    );
  }
}
