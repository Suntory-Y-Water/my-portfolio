import { HeaderLinkProps } from '@/app/types/types';
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import React from 'react';

function HeaderNavigation({ href, title }: HeaderLinkProps) {
  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>{title}</NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}

export default HeaderNavigation;
