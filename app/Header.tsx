'use client';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { ModeToggle } from '@/components/ui/ModeToggle';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import HeaderNavigation from '@/components/HeaderMenuItem';
import lives from '@/data/liveName.json';
import HeaderToggleContent from '@/components/HeaderToggleContent';

const Header = () => {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-14 items-center'>
        <div className='flex title-font font-medium items-center text-navy-blue mb-4 md:mb-0'>
          <Link href={'/'}>
            <Image src={'/icon.png'} alt='icon' width={40} height={40} />
          </Link>
          <span className='ml-3 text-xl'>Sui Portforio</span>
        </div>
        <nav className='md:ml-auto flex items-center text-base justify-center font-medium'>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>セトリ一覧</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='gap-3 p-6 md:w-[400px] lg:w-[300px] lg:grid-cols-[.75fr_1fr]'>
                    {lives.map((live) => (
                      <HeaderToggleContent
                        key={live.id}
                        href={`/contents/setList/${live.id}`}
                        title={live.name}
                      />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <HeaderNavigation href='/contents/setList' title='ライブ一覧' />
              <HeaderNavigation href='/contents/liveChecker' title='ライブチェッカー' />
              <HeaderNavigation href='/contents/profile' title='プロフィール' />
            </NavigationMenuList>
          </NavigationMenu>
          <div className='ml-4'>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
