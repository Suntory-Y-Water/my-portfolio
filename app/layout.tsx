import './globals.css';

import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import type React from 'react';

import { ThemeProvider } from '@/components/ui/theme-provider';
import Script from 'next/script';

import Snow from '@/components/ui/snow';
import Footer from '../components/Footer';
import Header from '../components/Header';

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
  const gaId = process.env.GA_ID || '';
  return (
    <html lang='ja'>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy='afterInteractive'
          async
        />
        <Script id='google-analytics' strategy='afterInteractive'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </Script>
      </head>
      <body className={notoSansJp.className}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
          <Snow />
          <Header />
          <main className='mx-auto w-[calc(100%-40px)] max-w-[640px] py-16 md:w-[calc(100%-100px)] md:py-24'>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
