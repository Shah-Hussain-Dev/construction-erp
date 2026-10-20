import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { FullPageLoader } from '../components/ui/full-page-loader';
import { Skeleton } from '../components/ui/primitives';

describe('FullPageLoader and Skeleton UI UX enhancements', () => {
  it('renders FullPageLoader with default enterprise civil branding', () => {
    const html = renderToString(<FullPageLoader />);
    expect(html).toContain('PRINCE');
    expect(html).toContain('CONSTRUCTIONS');
    expect(html).toContain('BUILDING DREAMS • CREATING SPACES');
    expect(html).toContain('civil-full-page-loader');
    expect(html).toContain('loader-compass-ring');
    expect(html).toContain('loader-brand-logo-img');
    expect(html).toContain('/icons/logo.jpeg');
    expect(html).toContain('Cloud Network');
    expect(html).toContain('Encrypted Ledger');
    expect(html).toContain('Offline Sync Engine');
    expect(html).toContain('CIVIL PRO TIP');
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
  });

  it('renders FullPageLoader with custom status message and tips disabled', () => {
    const html = renderToString(
      <FullPageLoader
        title="INFRA CORE"
        subtitle="Highway Project Alpha"
        statusMessage="Compiling BOQ Measurement Books..."
        showTips={false}
        showProgress={false}
      />,
    );
    expect(html).toContain('Compiling BOQ Measurement Books...');
    expect(html).toContain('Highway Project Alpha');
    expect(html).not.toContain('CIVIL PRO TIP');
    expect(html).not.toContain('role="progressbar"');
  });

  it('renders Skeleton with stack variant by default', () => {
    const html = renderToString(<Skeleton rows={3} />);
    expect(html).toContain('skeleton-stack');
    expect(html.match(/class="skeleton"/g)?.length).toBe(3);
  });

  it('renders Skeleton with page variant for rich layout transitions', () => {
    const html = renderToString(<Skeleton variant="page" />);
    expect(html).toContain('skeleton-page-layout');
    expect(html).toContain('skeleton-page-header');
    expect(html).toContain('skeleton-page-metrics');
    expect(html).toContain('skeleton-page-table');
  });

  it('renders lightweight page skeleton in app/loading for route transitions', async () => {
    const LoadingComponent = (await import('../app/loading')).default;
    const html = renderToString(<LoadingComponent />);
    expect(html).toContain('skeleton-page-layout');
    expect(html).not.toContain('civil-full-page-loader');
  });
});
