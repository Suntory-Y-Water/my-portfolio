import './globals.css';
import type { Metadata } from 'next';
import Header from './Header';
import Footer from './Footer';
import { Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';

const notoSansJp = Noto_Sans_JP({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sui portfolio',
  description: 'Sui portfolio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja'>
      <body className={`mx-auto ${notoSansJp.className}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='flex flex-col min-h-screen'>
            <Header />
            <main className='container flex-grow mt-12'>{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
