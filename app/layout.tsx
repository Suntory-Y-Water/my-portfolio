import './globals.css';
import type { Metadata } from 'next';
import Header from './Header';
import Footer from './Footer';

export const metadata: Metadata = {
  title: 'Sui portfolio',
  description: 'Sui portfolio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ja'>
      <body className='container p-6 bg-light-blue'>
        <div className='flex flex-col min-h-screen'>
          <Header />
          <main className='flex-grow mt-24'>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
