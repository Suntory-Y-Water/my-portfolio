import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';
import type React from 'react';

type Props = {
  children: React.ReactNode;
};

const metaDescription =
  '技術記事を投稿しています。ページを選択すると記事ページへ移動します。';

export const metadata: Metadata = {
  title: 'Blog',
  description: metaDescription,
  openGraph: {
    title: 'Blog',
    description: metaDescription,
    images: [siteConfig.ogImage],
  },
  twitter: {
    title: 'Blog',
    description: metaDescription,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({ children }: Props) {
  return children;
}
