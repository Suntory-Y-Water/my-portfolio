'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import { IoMdHome } from 'react-icons/io';
import { MdOutlineArticle, MdOutlineBook } from 'react-icons/md';
import { Icons } from '@/components/icons';
import HamburgerMenu from '@/components/shared/MenuMobile';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { cn } from '@/lib/utils';

type MenuItemLinkProps = {
  href: string;
  title: string;
  icon: ReactElement;
};

const NAVIGATION_LINKS: MenuItemLinkProps[] = [
  {
    href: '/',
    title: 'Home',
    icon: <IoMdHome size='1.2em' />,
  },
  {
    href: '/posts',
    title: 'Posts',
    icon: <MdOutlineArticle size='1.2em' />,
  },
  {
    href: '/blog',
    title: 'Blog',
    icon: <MdOutlineBook size='1.2em' />,
  },
  {
    href: '/tags',
    title: 'Tags',
    icon: <Icons.tag className='size-5' />,
  },
];

/**
 * アプリケーション全体のヘッダーコンポーネント
 *
 * このコンポーネントはサイトの最上部に固定表示され、ロゴ、ナビゲーションリンク、
 * テーマ切り替えボタン、モバイルメニューを含みます。
 * 現在のページに応じてナビゲーションリンクがアクティブ状態で表示されます。
 *
 * @returns ヘッダーコンポーネント
 *
 * @example
 * ```tsx
 * import Header from '@/components/shared/Header';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       <Header />
 *       <main>{children}</main>
 *     </>
 *   );
 * }
 * ```
 */
export default function Header() {
  const pathname = usePathname();

  /**
   * 指定されたリンクが現在のページでアクティブかどうかを判定
   *
   * ルートパス（'/'）の場合は完全一致が必要で、他のページでもハイライトされないようにします。
   * その他のパスは前方一致で判定し、サブページでも親ページのリンクがアクティブになります。
   *
   * @param linkHref - 判定対象のリンクパス（例: '/', '/posts', '/blog'）
   * @returns リンクがアクティブな場合はtrue、それ以外はfalse
   *
   * @example
   * ```tsx
   * // 現在のパスが '/posts/123' の場合
   * isLinkActive('/');        // false (完全一致が必要)
   * isLinkActive('/posts');   // true (前方一致)
   * isLinkActive('/blog');    // false
   * ```
   */
  function isLinkActive(linkHref: string): boolean {
    // Exact match required for the root path to avoid highlighting on all pages
    if (linkHref === '/') {
      return pathname === linkHref;
    }
    return pathname.startsWith(linkHref);
  }

  return (
    <header className='sticky top-0 z-30 h-16 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm transition-all duration-300'>
      {/* Maintain container and alignment */}
      <div className='container mx-auto flex h-full max-w-5xl items-center justify-between px-4'>
        {/* Logo */}
        <Link
          href='/'
          className='flex items-center gap-2 transition-transform duration-300 hover:scale-105'
          aria-label='最初の画面に戻る'
        >
          <Image
            src='/images/icon.webp'
            alt='ポートフォリオサイトのロゴ'
            width={32}
            height={32}
            priority
            className='rounded-full'
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden items-center gap-1 md:flex'>
          {NAVIGATION_LINKS.map((link) => (
            <Button
              key={link.href}
              variant='link'
              size='sm'
              asChild
              className={cn(
                'text-muted-foreground transition-colors',
                // Apply active styles using the isLinkActive helper function
                isLinkActive(link.href) && 'font-semibold text-foreground', // <-- Updated condition
              )}
            >
              <Link href={link.href}>{link.title}</Link>
            </Button>
          ))}
        </nav>

        {/* Right side elements: Theme toggle and Mobile Menu */}
        <div className='flex items-center gap-2'>
          <ModeToggle />
          {/* Pass updated links to mobile menu */}
          <div className='md:hidden'>
            <HamburgerMenu params={NAVIGATION_LINKS} />
          </div>
        </div>
      </div>
    </header>
  );
}
