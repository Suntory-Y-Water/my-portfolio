import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';

const HeaderNavigation = (params: { href: string; title: string }) => {
  return (
    <NavigationMenuItem>
      <Link href={params.href} legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
          {params.title}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
};

export default HeaderNavigation;
