'use client';
import React, { useState } from 'react';
import { navgationLinks } from '@/data';
import Link from 'next/link';
import { Button } from './ui/button';

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className='px-4 py-4 w-full'>
        <div className='flex flex-col justify-between'>
          <button className='flex items-center gap-1' type='button' onClick={toggleMenu}>
            <svg
              className='with-icon_icon__MHUeb'
              fill='none'
              height='24'
              shapeRendering='geometricPrecision'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='1.5'
              viewBox='0 0 24 24'
              width='24'
              style={{ color: 'currentcolor', width: '16px', height: '16px' }}
            >
              {isOpen ? <path d='M6 9l6 6 6-6'></path> : <path d='M9 18l6-6-6-6'></path>}
            </svg>
            <span>Menu</span>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className='sticky top-0  w-full px-6'>
          {navgationLinks.map((navgationLink) => (
            <Link href={navgationLink.href} key={navgationLink.href}>
              <Button
                variant='ghost'
                className='w-full justify-start tracking-tight'
                onClick={toggleMenu}
              >
                {navgationLink.title}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MobileMenu;
