'use client';

import Image from 'next/image';
import { ImageWithFallback } from '@/components/shared/image-with-fallback';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface LinkCardProps {
  url: string;
  title: string;
  description: string;
  image?: string;
  isInternal: boolean;
  error: boolean;
  className?: string;
}

/**
 * リンクカードコンポーネント
 *
 * OGPデータを使用してリッチなリンクプレビューを表示します。
 * Next.jsの<Image>コンポーネントを使用して画像を最適化します。
 */
export function LinkCard({
  url,
  title,
  description,
  image,
  isInternal,
  error,
  className,
}: LinkCardProps) {
  const isExternal = url.startsWith('http');
  const hostname = isExternal ? new URL(url).hostname : '';

  const cardClasses = cn(
    'group my-4 flex overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:bg-accent/5 hover:shadow-md',
    error && 'border-border/50 bg-card/50',
    className,
  );

  const linkProps = isInternal
    ? { href: url }
    : { href: url, target: '_blank' as const, rel: 'noopener noreferrer' };

  return (
    <a {...linkProps} className={cardClasses}>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* ヘッダー部分（ファビコン+ホスト名 or 内部リンク表示） */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {isExternal ? (
              // 外部リンク
              <>
                <div className="relative size-4 overflow-hidden rounded-full bg-muted">
                  {hostname && (
                    <Image
                      src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                      alt=""
                      className="object-cover"
                      fill
                      sizes="12px"
                      loading="lazy"
                    />
                  )}
                </div>
                <span>{hostname.replace(/^www\./, '')}</span>
                <Icons.externalLink className="size-3 text-muted-foreground/70" />
              </>
            ) : (
              // 内部リンク
              <span className="flex items-center gap-1.5">
                <div className="size-4 rounded-full bg-primary/10">
                  <span className="flex size-full items-center justify-center text-[10px] font-bold text-primary">
                    B
                  </span>
                </div>
                <span>Blog Post</span>
              </span>
            )}
          </div>
        </div>

        {/* タイトルと説明 */}
        <div className="flex-1">
          <h3 className="font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
            {error ? 'Page Not Found' : title || 'Untitled'}{' '}
          </h3>
          {error ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              This page may have been moved or deleted.
            </p>
          ) : description ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {/* OGP画像（デスクトップのみ表示） */}
      {image ? (
        <div className="hidden w-[148px] shrink-0 sm:block">
          <div className="relative size-full">
            <ImageWithFallback
              src={image || '/placeholder.svg'}
              alt={title || 'Link preview'}
            />
          </div>
        </div>
      ) : (
        <div className="hidden w-[148px] shrink-0 bg-muted/30 sm:block">
          <div className="flex size-full items-center justify-center">
            <span className="text-4xl text-muted-foreground/20">
              {isExternal ? '🔗' : '📝'}
            </span>
          </div>
        </div>
      )}
    </a>
  );
}
