import { Metadata } from 'next';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export const metadata: Metadata = {
  title: 'Contents',
  description:
    '私がいままで作成したアプリケーションやWebページの紹介です。クリックすると成果物の詳細ページへ移動します。',
};

export default function RootLayout({ children }: Props) {
  return children;
}
