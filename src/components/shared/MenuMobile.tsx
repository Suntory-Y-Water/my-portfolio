import Link from 'next/link';
import type { ReactElement } from 'react';
import { FiMenu } from 'react-icons/fi';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type Props = {
  params: {
    href: string;
    title: string;
    icon: ReactElement;
  }[];
};

export default function HamburgerMenu({ params }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='md:hidden p-1'>
        <FiMenu size='28px' aria-label='モバイルメニュー' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-[200px] mr-4 py-1.5'>
        {params.map((param) => (
          <Link className='items-center py-1 w-full' href={param.href} key={param.href}>
            <DropdownMenuItem className='flex gap-2 w-full py-2'>
              {param.icon}
              {param.title}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
