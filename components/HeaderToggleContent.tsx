import { HeaderLinkProps } from '@/app/types/types';
import { NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import Link from 'next/link';

const HeaderToggleContent = ({ href, title }: HeaderLinkProps) => {
  return (
    <li>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>{title}</NavigationMenuLink>
      </Link>
    </li>
  );
};

export default HeaderToggleContent;
