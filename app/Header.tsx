import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

const Header = () => {
  return (
    <header className='text-gray-600 body-font fixed top-0 left-0 w-full bg-light-blue'>
      <div className='flex flex-wrap p-5 flex-col md:flex-row items-center'>
        <div className='flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0'>
          <Link href={'/'} className=' hover:text-gray-900'>
            <Image src='/icon.png' alt='header icon' width={50} height={50} priority />
          </Link>
          <span className='ml-3 text-xl'>Tailblocks</span>
        </div>
        <nav className='md:ml-auto flex flex-wrap items-center text-base justify-center'>
          <Link href={'/contents/setList'} className='mr-5 hover:text-gray-900'>
            セトリ一覧
          </Link>
          <Link href={'/contents/liveChecker'} className='mr-5 hover:text-gray-900'>
            ライブチェッカー
          </Link>
          <Link href={'/contents/profile'} className='mr-5 hover:text-gray-900'>
            プロフィール
          </Link>
        </nav>
        <button className='inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0'>
          Button
          <svg
            fill='none'
            stroke='currentColor'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            className='w-4 h-4 ml-1'
            viewBox='0 0 24 24'
          >
            <path d='M5 12h14M12 5l7 7-7 7'></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
