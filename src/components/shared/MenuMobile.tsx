import type { ReactElement } from 'react';
import Link from 'next/link';
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
      <DropdownMenuTrigger className='p-1 md:hidden'>
        <FiMenu size='28px' aria-label='モバイルメニュー' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='mr-4 w-[200px] py-1.5'>
        {params.map((param) => (
          <Link
            className='w-full items-center py-1'
            href={param.href}
            key={param.href}
          >
            <DropdownMenuItem className='flex w-full gap-2 py-2'>
              {param.icon}
              {param.title}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
