import { NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';

const HeaderToggleContent = (params: { href: string; title: string }) => {
  return (
    <li>
      <Link href={params.href} legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
          {params.title}
        </NavigationMenuLink>
      </Link>
    </li>
  );
};

export default HeaderToggleContent;
