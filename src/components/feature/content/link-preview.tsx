import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { getOGData } from '@/actions/fetch-og-metadata';
import { Icons } from '@/components/icons';
import { ImageWithFallback } from '@/components/shared/image-with-fallback';
import { siteConfig } from '@/config/site';
import { getBlogPostBySlug } from '@/lib/markdown';
import { cn } from '@/lib/utils';

type LinkCardProps = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  className?: string;
  error?: boolean;
};

type LinkPreviewProps = {
  url: string;
  className?: string;
};

/**
 * URLが内部ブログリンクかどうかを判定
 *
 * 指定されたURLが'/blog/'で始まる内部リンクかどうかをチェックします。
 * 絶対URLと相対URLの両方に対応しています。
 *
 * @param url - 判定対象のURL（例: '/blog/typescript', 'https://example.com/blog/react'）
 * @returns 内部ブログリンクの場合はtrue、それ以外はfalse
 *
 * @example
 * ```tsx
 * isInternalBlogLink('/blog/typescript');  // true
 * isInternalBlogLink('https://example.com/blog/react');  // true
 * isInternalBlogLink('/about');  // false
 * isInternalBlogLink('https://zenn.dev/article');  // false
 * ```
 */
function isInternalBlogLink(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.startsWith('/blog/');
  } catch {
    return url.startsWith('/blog/');
  }
}

/**
 * URLからスラッグ（最後のパス部分）を抽出
 *
 * URLのパスから最後の部分を抽出してスラッグとして返します。
 * 絶対URLと相対URLの両方に対応しています。
 *
 * @param url - スラッグを抽出するURL（例: '/blog/typescript', 'https://example.com/blog/react'）
 * @returns 抽出されたスラッグ（例: 'typescript', 'react'）
 *
 * @example
 * ```tsx
 * getSlugFromUrl('/blog/typescript');  // 'typescript'
 * getSlugFromUrl('https://example.com/blog/react');  // 'react'
 * getSlugFromUrl('/blog/nested/path/article');  // 'article'
 * ```
 */
function getSlugFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    return parts[parts.length - 1];
  } catch {
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}

/**
 * リンクプレビューカードを表示するコンポーネント
 *
 * このコンポーネントは指定されたURLのプレビューカードを表示します。
 * タイトル、説明文、画像、ファビコンを含むカード形式でリンクを視覚的に表現します。
 * 内部リンクと外部リンクの両方に対応し、外部リンクの場合は新しいタブで開きます。
 *
 * @param url - リンク先のURL
 * @param title - リンクのタイトル（任意）。指定されていない場合は'Untitled'と表示されます
 * @param description - リンクの説明文（任意）。指定されている場合は最大2行まで表示されます
 * @param image - プレビュー画像のURL（任意）。指定されていない場合はプレースホルダーが表示されます
 * @param className - 追加のCSSクラス名（任意）
 * @param error - エラー状態かどうか（デフォルト: false）。trueの場合は'Page Not Found'と表示されます
 * @returns リンクカードコンポーネント
 *
 * @example
 * ```tsx
 * import { LinkCard } from '@/components/feature/content/link-preview';
 *
 * // 外部リンクのプレビュー
 * <LinkCard
 *   url='https://zenn.dev/example/articles/typescript'
 *   title='TypeScriptの型定義について'
 *   description='TypeScriptの基本的な型定義を解説します'
 *   image='https://example.com/og-image.png'
 * />
 *
 * // エラー状態
 * <LinkCard url='https://example.com/404' error={true} />
 * ```
 */
export function LinkCard({
  url,
  title,
  description,
  image,
  className,
  error = false,
}: LinkCardProps) {
  const isExternal = url.startsWith('http');
  const hostname = isExternal ? new URL(url).hostname : '';

  const CardContent = (
    <>
      <div className='flex flex-1 flex-col gap-2 p-4'>
        <div className='flex items-center gap-1'>
          <div className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
            {isExternal ? (
              <>
                <div className='relative size-4 overflow-hidden rounded-full bg-muted'>
                  {hostname && (
                    <Image
                      src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                      alt=''
                      className='object-cover'
                      fill
                      sizes='12px'
                      loading='lazy'
                    />
                  )}
                </div>
                <span>{hostname.replace(/^www\./, '')}</span>
                <Icons.externalLink className='size-3 text-muted-foreground/70' />
              </>
            ) : (
              <span className='flex items-center gap-1.5'>
                <div className='size-4 rounded-full bg-primary/10'>
                  <span className='flex size-full items-center justify-center text-[10px] font-bold text-primary'>
                    B
                  </span>
                </div>
                <span>Blog Post</span>
              </span>
            )}
          </div>
        </div>

        <div className='flex-1'>
          <h3 className='font-semibold leading-tight text-foreground transition-colors group-hover:text-accent'>
            {error ? 'Page Not Found' : title || 'Untitled'}{' '}
          </h3>
          {error ? (
            <p className='mt-1.5 line-clamp-2 text-sm text-muted-foreground'>
              This page may have been moved or deleted.
            </p>
          ) : description ? (
            <p className='mt-1.5 line-clamp-2 text-sm text-muted-foreground'>
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {image ? (
        <div className='hidden w-[148px] shrink-0 sm:block'>
          <div className='relative size-full'>
            <ImageWithFallback
              src={image || '/placeholder.svg'}
              alt={title || 'Link preview'}
            />
          </div>
        </div>
      ) : (
        <div className='hidden w-[148px] shrink-0 bg-muted/30 sm:block'>
          <div className='flex size-full items-center justify-center'>
            <span className='text-4xl text-muted-foreground/20'>
              {isExternal ? '🔗' : '📝'}
            </span>
          </div>
        </div>
      )}
    </>
  );

  const cardClasses = cn(
    'group my-4 flex overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:bg-accent/5 hover:shadow-md',
    error && 'border-border/50 bg-card/50',
    className,
  );

  return isExternal ? (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className={cardClasses}
    >
      {CardContent}
    </a>
  ) : (
    <Link href={url} className={cardClasses} prefetch={false} target='_blank'>
      {CardContent}
    </Link>
  );
}

/**
 * 内部ブログリンクのプレビューカードを表示する非同期コンポーネント
 *
 * このコンポーネントは内部ブログ記事のURLからスラッグを抽出し、
 * ブログ記事のメタデータを取得してLinkCardコンポーネントで表示します。
 * 記事が見つからない場合はエラー状態のカードを表示します。
 *
 * @param url - 内部ブログ記事のURL（例: '/blog/typescript'）
 * @param className - 追加のCSSクラス名（任意）
 * @returns 内部リンクカードコンポーネント
 *
 * @example
 * ```tsx
 * // LinkPreviewコンポーネント内で自動的に使用されます
 * <InternalLinkCard url='/blog/typescript' />
 * ```
 */
async function InternalLinkCard({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const slug = getSlugFromUrl(url);
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return <LinkCard url={url} error={true} className={className} />;
  }

  return (
    <LinkCard
      url={url}
      title={post.metadata.title}
      description={post.metadata.description}
      image={siteConfig.ogImage}
      className={className}
    />
  );
}

/**
 * 外部リンクのプレビューカードを表示する非同期コンポーネント
 *
 * このコンポーネントは外部URLからOGP（Open Graph Protocol）データを取得し、
 * LinkCardコンポーネントで表示します。
 * データ取得に失敗した場合やOGPデータがない場合はエラー状態のカードを表示します。
 *
 * @param url - 外部リンクのURL（例: 'https://zenn.dev/example/articles/typescript'）
 * @param className - 追加のCSSクラス名（任意）
 * @returns 外部リンクカードコンポーネント
 *
 * @example
 * ```tsx
 * // LinkPreviewコンポーネント内で自動的に使用されます
 * <ExternalLinkCard url='https://zenn.dev/example/articles/typescript' />
 * ```
 */
async function ExternalLinkCard({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  try {
    const ogData = await getOGData(url);

    if (!ogData.title) {
      return <LinkCard url={url} error={true} className={className} />;
    }

    return (
      <LinkCard
        url={url}
        title={ogData.title}
        description={ogData.description}
        image={ogData.image}
        className={className}
      />
    );
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return <LinkCard url={url} error={true} className={className} />;
  }
}

/**
 * リンクプレビューを表示するコンポーネント（メインエクスポート）
 *
 * このコンポーネントは指定されたURLが内部リンクか外部リンクかを自動判定し、
 * 適切なプレビューカードを表示します。データ取得中はローディング状態を表示します。
 * Markdown記事内で自動的にリンクをカード形式に変換するために使用されます。
 *
 * @param url - プレビューを表示するURL（内部: '/blog/typescript', 外部: 'https://zenn.dev/article'）
 * @param className - 追加のCSSクラス名（任意）
 * @returns リンクプレビューコンポーネント
 *
 * @example
 * ```tsx
 * import { LinkPreview } from '@/components/feature/content/link-preview';
 *
 * // 内部ブログリンクのプレビュー
 * export default function Article() {
 *   return (
 *     <article>
 *       <p>関連記事:</p>
 *       <LinkPreview url='/blog/typescript' />
 *     </article>
 *   );
 * }
 *
 * // 外部リンクのプレビュー
 * export default function References() {
 *   return (
 *     <div>
 *       <h2>参考資料</h2>
 *       <LinkPreview url='https://zenn.dev/example/articles/react' />
 *     </div>
 *   );
 * }
 * ```
 */
export function LinkPreview({ url, className }: LinkPreviewProps) {
  const isInternal = !url.startsWith('http') && isInternalBlogLink(url);

  return (
    <Suspense
      fallback={
        <div
          className={cn(
            'my-4 h-[124px] animate-pulse rounded-lg border bg-muted/50',
            className,
          )}
        />
      }
    >
      {isInternal ? (
        <InternalLinkCard url={url} className={className} />
      ) : (
        <ExternalLinkCard url={url} className={className} />
      )}
    </Suspense>
  );
}
