import './globals.css';
import type { Metadata } from 'next';
// eslint-disable-next-line camelcase
import { Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import React from 'react';
import Header from './Header';

const notoSansJp = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s - Portfolio',
    default: 'Portfolio',
  },
  description:
    'スイのPortfolioサイトです。簡単な経歴と自己紹介、今まで投稿した技術記事をまとめています。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja'>
      <body className={notoSansJp.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <div className='mx-auto w-[calc(100%-40px)] max-w-[640px] py-16 md:w-[calc(100%-100px)] md:py-24'>
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
