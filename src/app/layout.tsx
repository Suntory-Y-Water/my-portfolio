import './globals.css';

import type { Metadata } from 'next';
import type React from 'react';

import { ThemeProvider } from '@/components/ui/theme-provider';
import Footer from '../components/Footer';
import Header from '../components/Header';

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
    <html lang='ja' suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className='mx-auto w-[calc(100%-40px)] max-w-[1024px] py-8 md:w-[calc(100%-100px)] md:py-24'>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
