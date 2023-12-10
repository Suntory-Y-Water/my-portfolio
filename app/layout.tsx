import './globals.css';
import type { Metadata } from 'next';
import SideNav from '@/components/SideNav';
// eslint-disable-next-line camelcase
import { Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { liveNames } from '@/data/data';
import React from 'react';
import Footer from './Footer';
import Header from './Header';

const notoSansJp = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sui portfolio',
  description: 'Sui portfolio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja'>
      <body className={`mx-auto ${notoSansJp.className}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='flex flex-col min-h-screen'>
            <Header />
            <div className='flex-1'>
              <div className='container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10'>
                <aside className='flex font-medium text-base mt-12 sticky top-0'>
                  <SideNav liveNames={liveNames} className='hidden lg:block' />
                </aside>
                <main className='container mt-12'>{children}</main>
              </div>
            </div>
            <div className='mt-auto '>
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
