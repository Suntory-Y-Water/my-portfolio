'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  source: string;
}

export function TableOfContents({ source }: TableOfContentsProps) {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings from source
  useEffect(() => {
    const headingRegex = /^## (.*$)/gm;
    const matches = [...source.matchAll(headingRegex)];

    const items: TOCItem[] = matches.map((match) => {
      const text = match[1].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      return {
        id,
        text,
        level: 3,
      };
    });

    setToc(items);
  }, [source]);

  // Track active heading on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -80% 0px' },
    );

    // Observe all headings
    for (const item of toc) {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, itemText: string) {
    e.preventDefault();
    const element = document.getElementById(itemText);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'auto',
      });
      window.history.pushState({}, '', `#${itemText}`);
    }
  }

  return (
    <div className='pt-4 rounded-lg border-border/50 bg-card/50'>
      <h3 className='scroll-m-20 text-xl font-semibold tracking-tight'>目次</h3>
      <ul className='space-y-1.5'>
        {toc.map((item) => (
          <li key={item.text} className='line-clamp-2'>
            <a
              href={`#${item.text}`}
              className={cn(
                'inline-block py-1 text-muted-foreground transition-colors hover:text-foreground',
                activeId === item.id && 'font-medium text-primary',
              )}
              onClick={(e) => handleClick(e, item.text)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
