import { Suspense } from 'react';
import { WorkspaceRouter } from '@/components/workspace-router';
import { Skeleton } from '@/components/ui/primitives';
export default function Page() {
  return (
    <Suspense fallback={<Skeleton variant="page" />}>
      <WorkspaceRouter />
    </Suspense>
  );
}
