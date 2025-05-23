import type * as React from 'react';
import { type EvaluateOptions, evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { components } from '@/components/feature/content/mdx-components';

interface CustomMDXProps {
  source: string;

  additionalComponents?: Record<
    string,
    React.ComponentType<Record<string, unknown>>
  >;
}

const rehypePrettyCodeOptions = {
  theme: 'slack-dark',
  keepBackground: true,
  defaultLang: 'plaintext',
};

/**
 * Renders MDX content with provided components
 *
 * This component evaluates MDX source content and renders it with the provided components.
 * It passes the React runtime directly to the MDX evaluator to avoid React version conflicts,
 * which is a common issue in Next.js 15.2.0+ with MDX libraries.
 */
export async function CustomMDX({
  source,
  additionalComponents,
}: CustomMDXProps) {
  try {
    const options: EvaluateOptions = {
      ...runtime,
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug, [rehypePrettyCode, rehypePrettyCodeOptions]],
    };

    const { default: MDXContent } = await evaluate(source, options);

    const mergedComponents = {
      ...components,
      ...(additionalComponents || {}),
    };

    return <MDXContent components={mergedComponents} />;
  } catch (error) {
    console.error('Error rendering MDX:', error);
    return (
      <div className='rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive'>
        An error occurred while rendering the content.
      </div>
    );
  }
}
