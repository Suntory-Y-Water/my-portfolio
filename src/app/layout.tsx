import '@/styles/globals.css';
import '@/styles/mdx.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';
import type React from 'react';
import { fontPlemolJP35Console } from '@/assets/fonts';
import Footer from '@/components/shared/Footer';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { siteConfig } from '@/config/site';
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
  return (
    <html
      lang='ja'
      suppressHydrationWarning
      className={fontPlemolJP35Console.variable}
    >
      <head>
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
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className='mx-auto w-[calc(100%-32px)] max-w-screen-lg py-4 md:w-[calc(100%-100px)] md:py-8'>
            {children}
          </main>
          <Footer />
          <GoogleAnalytics gaId='G-VJECTY2TM6' />
        </ThemeProvider>
      </body>
    </html>
  );
}
