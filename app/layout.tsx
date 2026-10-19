import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Providers } from '@/components/providers';
import { Shell } from '@/components/shell';
import { BRAND_CONFIG } from '@/lib/config';
import './globals.css';
const sans = localFont({
  src: '../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
  variable: '--font-interface',
  weight: '100 1000',
  display: 'swap',
});
const heading = localFont({
  src: '../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  variable: '--font-heading',
  weight: '200 800',
  display: 'swap',
});
const mono = localFont({
  src: '../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2',
  variable: '--font-plex',
  display: 'swap',
});
export const metadata: Metadata = {
  title: {
    default: `${BRAND_CONFIG.name} · Enterprise ERP`,
    template: `%s · ${BRAND_CONFIG.name}`,
  },
  description: BRAND_CONFIG.description,
  appleWebApp: { capable: true, statusBarStyle: 'default', title: BRAND_CONFIG.name },
  icons: { icon: '/icons/logo.jpeg', apple: '/icons/logo.jpeg' },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B1F42',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${heading.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
