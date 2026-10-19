import type { MetadataRoute } from 'next';
import { BRAND_CONFIG } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: 'prince-constructions-erp',
    name: BRAND_CONFIG.name,
    short_name: BRAND_CONFIG.shortName,
    description: BRAND_CONFIG.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: BRAND_CONFIG.themeColor,
    icons: [
      { src: '/icons/logo.jpeg', sizes: '512x512', type: 'image/jpeg' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
