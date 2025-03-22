import { Noto_Sans_JP } from 'next/font/google';
import localFont from 'next/font/local';

export const fontNotoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-noto-sans-jp',
});

export const fontPlemolJP35Console = localFont({
  src: './PlemolJP35Console-Regular.ttf',
  display: 'swap',
  variable: '--font-plemol-jp-35-console',
});
