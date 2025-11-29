import '@/styles/globals.css';
import '@/styles/markdown.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import Script from 'next/script';
import type React from 'react';
import { fontPlemolJP35Console } from '@/assets/fonts';
import Footer from '@/components/shared/Footer';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/utils';
import Header from '../components/shared/Header';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    locale: 'ja_JP',
    siteName: siteConfig.name,
  },
  twitter: {
    title: siteConfig.name,
    description: siteConfig.description,
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // WebSite構造化データの定義
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: {
      '@type': 'Person',
      name: siteConfig.name,
      image: {
        '@type': 'ImageObject',
        url: absoluteUrl('/opengraph-image.png'),
      },
    },
  };

  return (
    <html
      lang='ja'
      suppressHydrationWarning
      className={`${fontPlemolJP35Console.variable} overflow-x-hidden`}
    >
      <head>
        <Script
          id='jsonld-website'
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
          strategy='beforeInteractive'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.jpg'
        />
        <meta
          name='google-site-verification'
          content='pd5OEQeX8d8I7AOZbR5U3SPIyZyXYxd392aatHH48yk'
        />
        <meta
          name='theme-color'
          content='#fafafa'
          media='(prefers-color-scheme: light)'
        />
        <meta
          name='theme-color'
          content='#1f1f1f'
          media='(prefers-color-scheme: dark)'
        />
      </head>
      <body className='flex min-h-screen flex-col overflow-x-hidden'>
        <div
          aria-hidden
          className='pointer-events-none fixed inset-0 -z-10 opacity-20'
        />
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 md:px-8'>
            {children}
          </main>
          <Footer />
          <GoogleAnalytics gaId='G-VJECTY2TM6' />
        </ThemeProvider>
      </body>
    </html>
  );
}
