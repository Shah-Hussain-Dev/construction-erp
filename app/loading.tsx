import { Skeleton } from '@/components/ui/primitives';

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto" aria-busy="true" aria-label="Loading page content">
      <Skeleton variant="page" />
    </div>
  );
}
