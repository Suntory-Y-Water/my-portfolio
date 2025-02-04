'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { IoMdHome } from 'react-icons/io';
import { MdOutlineArticle } from 'react-icons/md';

import HamburgerMenu from '@/components/MenuMobile';
import { ModeToggle } from '@/components/ui/ModeToggle';

type MenuItemLinkProps = {
  href: string;
  title: string;
  icon: ReactElement;
};

export default function Header() {
  const navgationLinks: MenuItemLinkProps[] = [
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
  ];

  return (
    <header className='sticky top-0 z-20 h-[64px] border-b bg-background backdrop-blur'>
      <div className='mx-auto flex h-full max-w-[1024px] items-center justify-between px-4'>
        <div className=''>
          <Link
            href='/'
            className='ease flex w-8 items-center stroke-[5] text-xl font-bold duration-300 hover:-translate-y-0.5'
            aria-label='最初の画面に戻る'
          >
            <Image
              src='/icon.jpg'
              width={64}
              height={64}
              alt='icon'
              className='rounded-full'
              priority
              quality={75}
            />
          </Link>
        </div>
        <nav className='hidden sm:flex items-center text-base justify-center font-medium'>
          <ul>
            {navgationLinks.map((link) => (
              <li
                key={link.href}
                className='inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 px-4 py-2'
              >
                <Link href={link.href} className='px-4'>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* モバイルのときだけハンバーガーメニューを表示する */}
        <div className='flex items-center'>
          <ModeToggle />
          <HamburgerMenu params={navgationLinks} />
        </div>
      </div>
    </header>
  );
}
