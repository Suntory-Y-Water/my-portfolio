import './globals.css';

import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import React from 'react';

import { ThemeProvider } from '@/components/ui/theme-provider';

import Header from './Header';

const notoSansJp = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://sui-portfolio.vercel.app/'),
  title: {
    template: '%s - Portfolio',
    default: 'Portfolio',
  },
  description:
    'スイのPortfolioです。簡単な経歴と自己紹介、今まで投稿した技術記事をまとめています。',
  openGraph: {
    title: 'スイのPortfolio',
    description:
      'スイのPortfolioです。簡単な経歴と自己紹介、今まで投稿した技術記事をまとめています。',
  },
  twitter: {
    title: 'スイのPortfolio',
    description:
      'スイのPortfolioです。簡単な経歴と自己紹介、今まで投稿した技術記事をまとめています。',
    card: 'summary_large_image',
  },
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
          <main className='mx-auto w-[calc(100%-40px)] max-w-[640px] py-16 md:w-[calc(100%-100px)] md:py-24'>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
