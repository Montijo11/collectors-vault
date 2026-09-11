import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://collectorsvaults.org'),

  title: {
    default: "Collector's Vaults",
    template: "%s | Collector's Vaults",
  },

  description:
    'Track your diecast collection, discover rare finds, and connect with collectors.',

  applicationName: "Collector's Vaults",

  keywords: [
    'diecast',
    'diecast collecting',
    'Hot Wheels',
    'Matchbox',
    'model cars',
    'car collection',
    'collector community',
    'Collector’s Vaults',
  ],

  openGraph: {
    title: "Collector's Vaults",
    description:
      'Track your collection. Discover rare finds. Connect with collectors.',
    url: '/',
    siteName: "Collector's Vaults",
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: "Collector's Vaults",
    description:
      'Track your collection. Discover rare finds. Connect with collectors.',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
