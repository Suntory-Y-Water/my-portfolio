'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface LinkCardProps {
  url: string;
  title: string;
  description: string;
  image?: string;
  isInternal: boolean;
  error: boolean;
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
}: LinkCardProps) {
  const hostname = url.startsWith('http') ? new URL(url).hostname : '';

  const cardClasses = `group my-4 flex overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:bg-accent/5 hover:shadow-md ${
    error ? 'border-border/50 bg-card/50' : ''
  }`;

  const linkProps = isInternal
    ? { href: url }
    : { href: url, target: '_blank' as const, rel: 'noopener noreferrer' };

  return (
    <a {...linkProps} className={cardClasses}>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* ヘッダー部分（ファビコン+ホスト名 or 内部リンク表示） */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {isInternal ? (
              // 内部リンク
              <span className="flex items-center gap-1.5">
                <div className="size-4 rounded-full bg-primary/10">
                  <span className="flex size-full items-center justify-center text-[10px] font-bold text-primary">
                    B
                  </span>
                </div>
                <span>Blog Post</span>
              </span>
            ) : (
              // 外部リンク
              <>
                <div className="relative size-4 overflow-hidden rounded-full bg-muted">
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="12px"
                  />
                </div>
                <span>{hostname.replace(/^www\./, '')}</span>
                <ExternalLink className="size-3 text-muted-foreground/70" aria-hidden="true" />
              </>
            )}
          </div>
        </div>

        {/* タイトルと説明 */}
        <div className="flex-1">
          <h3 className="font-semibold leading-tight text-foreground transition-colors group-hover:text-accent">
            {error ? 'Page Not Found' : title}
          </h3>
          {description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* OGP画像（デスクトップのみ表示） */}
      {image ? (
        <div className="hidden w-[148px] shrink-0 sm:block">
          <div className="relative size-full">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="148px"
            />
          </div>
        </div>
      ) : (
        <div className="hidden w-[148px] shrink-0 bg-muted/30 sm:block">
          <div className="flex size-full items-center justify-center">
            <span className="text-4xl text-muted-foreground/20">
              {isInternal ? '📝' : '🔗'}
            </span>
          </div>
        </div>
      )}
    </a>
  );
}
