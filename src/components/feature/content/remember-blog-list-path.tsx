'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { BLOG_NAVIGATION_CONSTANTS } from '@/constants';

/**
 * ブログ一覧系ページで、最後に表示したパスを sessionStorage に記録する。
 *
 * @example
 * ```tsx
 * // ブログ一覧ページのJSX先頭で呼び出す
 * <RememberBlogListPath />
 * ```
 */
export function RememberBlogListPath() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname !== '/blog' && !pathname.startsWith('/blog/page/')) return;

    window.sessionStorage.setItem(
      BLOG_NAVIGATION_CONSTANTS.LIST_PATH_STORAGE_KEY,
      pathname,
    );
  }, [pathname]);

  return null;
}
