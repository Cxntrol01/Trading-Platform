limport './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Platform',
  description: 'Live crypto charting platform built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
