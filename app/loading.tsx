import { FullPageLoader } from '@/components/ui/full-page-loader';
import { BRAND_CONFIG } from '@/lib/config';

export default function Loading() {
  return (
    <FullPageLoader
      title={BRAND_CONFIG.title}
      subtitle={BRAND_CONFIG.subtitle}
      statusMessage={`Loading ${BRAND_CONFIG.name}...`}
    />
  );
}
