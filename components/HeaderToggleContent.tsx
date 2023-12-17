import { HeaderLinkProps } from '@/app/types/types';
import { NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';
import React from 'react';

function HeaderToggleContent({ href, query, title }: HeaderLinkProps) {
  return (
    <li>
      <Link
        href={{
          pathname: href,
          query: { live_name: `${query}` },
        }}
      >
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>{title}</NavigationMenuLink>
      </Link>
    </li>
  );
}

export default HeaderToggleContent;
