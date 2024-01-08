'use client';

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { navgationLinks } from '@/data';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import HeaderNavigation from '@/components/HeaderMenuItem';
import HeaderToggleContent from '@/components/HeaderToggleContent';
import MobileMenu from '@/components/MobileMenu';
import { liveNames } from '@/data';

function Header() {
  return (
    <header
      data-testid='header'
      className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
    >
      <div className='container px-4 flex h-14 items-center'>
        <div className='flex title-font font-medium items-center md:mb-0'>
          <Link href='/'>
            <Image src='/icon.png' alt='icon' width={40} height={40} priority={true} />
          </Link>
          <span className='ml-3 text-xl'>Sui Portforio</span>
        </div>
        <nav className='hidden md:flex md:ml-auto items-center text-base justify-center font-medium'>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>セトリ一覧</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className='gap-3 p-6 md:w-[400px] lg:w-[300px] lg:grid-cols-[.75fr_1fr]'>
                    {liveNames.map((live) => (
                      <HeaderToggleContent
                        key={live.id}
                        href={`/set-list/${live.id}`}
                        query={live.name}
                        title={live.name}
                      />
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {navgationLinks.map((link) => (
                <HeaderNavigation key={link.href} href={link.href} title={link.title} />
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className='ml-auto md:ml-2'>
          <ModeToggle />
        </div>
      </div>
      <div className='md:hidden border-t'>
        <MobileMenu />
      </div>
    </header>
  );
}

export default Header;
