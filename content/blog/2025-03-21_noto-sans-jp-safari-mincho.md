---
title: NotoSansJP使ってるのにSafariのフォントが明朝体になる
public: true
date: 2025-03-21
icon: >-
  https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pencil/Flat/pencil_flat.svg
slug: noto-sans-jp-safari-mincho
tags:
  - Tailwind CSS
  - Next.js
description: SafariやiOSのGoogle Chromeだけフォントが明朝体に変わってしまっている件。
---


## iOSのSafariだけFontが崩れる

font-familyに何も指定しなかった場合は、OS・ブラウザごとのデフォルトフォントが適用されます。
大半のブラウザのデフォルトフォントは、ゴシック体ですが、macOSとiOS（iPhone、iPad）の標準ブラウザSafariだけはデフォルトフォントが明朝体になっています。

https://qiita.com/ksk1015/items/9d2028454ee144c64c60

## layout.tsxに複数指定しているけど、何故か崩れてしまう

```typescript title="layout.tsx"
// src\app\layout.tsx
import '@/styles/globals.css';
import '@/styles/mdx.css';

import type { Metadata } from 'next';
import type React from 'react';

import { siteConfig } from '@/config/site';

import { fontNotoSansJp, fontPlemolJP35Console } from '@/assets/fonts';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import Header from '../components/Header';

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
  },
  twitter: {
    title: siteConfig.name,
    description: siteConfig.description,
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <body className={`${fontNotoSansJp.variable} ${fontPlemolJP35Console.variable}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className='mx-auto w-[calc(100%-32px)] max-w-[1024px] py-4 md:w-[calc(100%-100px)] md:py-8'>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```typescript title="index.ts"
// src\assets\fonts\index.ts
import { Noto_Sans_JP } from 'next/font/google';
import localFont from 'next/font/local';

export const fontNotoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans-jp',
});

export const fontPlemolJP35Console = localFont({
  src: './PlemolJP35Console-Regular.ttf',
  variable: '--font-plemol-jp-35-console',
});
```

## 公式ドキュメントを見直してみる

`layout.tsx`でフォントを指定する箇所がbodyではなくhtmlタグに設定する必要があった

https://nextjs.org/docs/app/building-your-application/optimizing/fonts#with-tailwind-css

```typescript title="layout.tsx"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='ja'
      suppressHydrationWarning
      className={`${fontNotoSansJp.variable} ${fontPlemolJP35Console.variable}`}
    >
      <body>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className='mx-auto w-[calc(100%-32px)] max-w-[1024px] py-4 md:w-[calc(100%-100px)] md:py-8'>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```
