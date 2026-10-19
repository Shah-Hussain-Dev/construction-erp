'use client';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { X, WarningCircle, Tray } from '@phosphor-icons/react';
import { Button } from './button';
import { label } from '@/lib/format';
export function Badge({
  status,
  tone,
  children,
  className,
}: {
  status?: unknown;
  tone?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  if (children !== undefined) {
    const toneClass = tone ? `badge-${tone}` : 'badge-active';
    return <span className={`badge ${toneClass} ${className || ''}`}>{children}</span>;
  }
  const norm = String(status || 'active')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '');
  return <span className={`badge badge-${norm} ${className || ''}`}>{label(status || 'active')}</span>;
}
export function Modal({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  onClose?: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const handleOpenChange = (v: boolean) => {
    onOpenChange?.(v);
    if (!v) onClose?.();
  };
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <div className="modal-head">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <X size={22} />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className={description ? 'muted' : 'sr-only'}>
            {description || title}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Empty({
  title = 'Nothing here yet',
  description = 'Records will appear here as your team gets to work.',
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <Tray size={36} weight="duotone" />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function ErrorState({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div role="alert" className="empty">
      <WarningCircle size={36} />
      <h3>We couldn’t load this view</h3>
      <p>{error.message}</p>
      <Button variant="outline" onClick={retry}>
        Try again
      </Button>
      <Link href="/login">Sign in again</Link>
    </div>
  );
}
export { FullPageLoader } from './full-page-loader';

export function Skeleton({
  variant = 'stack',
  rows = 4,
  className,
}: {
  variant?: 'stack' | 'card' | 'page';
  rows?: number;
  className?: string;
} = {}) {
  if (className) {
    return <div aria-label="Loading..." aria-busy="true" className={`skeleton-bar ${className}`} />;
  }
  if (variant === 'page') {
    return (
      <div aria-label="Loading page content" aria-busy="true" className="skeleton-page-layout">
        <div className="skeleton-page-header">
          <div className="skeleton-bar title-bar" />
          <div className="skeleton-bar action-bar" />
        </div>
        <div className="skeleton-page-metrics">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="skeleton-metric-card"
              style={{ animationDelay: `${n * 0.12}s` }}
            />
          ))}
        </div>
        <div className="skeleton-page-table">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="skeleton-table-row"
              style={{ animationDelay: `${n * 0.08}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-label="Loading content" aria-busy="true" className="skeleton-stack">
      {Array.from({ length: rows }).map((_, n) => (
        <div
          className="skeleton"
          key={n}
          style={{ animationDelay: `${n * 0.15}s` }}
        />
      ))}
    </div>
  );
}

