import './globals.css';
import { AppProvider } from '@/lib/AppProvider';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Oliver Terrell Portfolio',
  description: 'Portfolio page for Oliver Terrell',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={'font-abel'}>
        <div
          className={`inset-0 flex h-screen flex-col items-center bg-neutral-800 text-sm leading-relaxed text-white`}
        >
          <AppProvider>{children}</AppProvider>
        </div>
      </body>
    </html>
  );
}
