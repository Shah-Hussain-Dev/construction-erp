'use client';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  PencilSimple,
  Check,
  Printer,
  PaperPlane,
  Package,
  ArrowRight,
} from '@phosphor-icons/react';
import { dataClient } from '@/lib/api';
import { can, totals } from '@/lib/domain.cjs';
import { inr, day, text, label } from '@/lib/format';
import { type Module, modules } from '@/lib/modules';
import { useSession } from '../providers';
import { PageHeader } from '../shell';
import { Button } from '../ui/button';
import { Badge, Empty, ErrorState, Modal, Skeleton } from '../ui/primitives';
import { LineItemsTable } from '../ui/line-items-table';
import { Evidence } from './evidence';
export function Detail({
  module: m,
  id,
  pathOverride,
}: {
  module: Module;
  id: string;
  pathOverride?: string;
}) {
  const { user, online } = useSession();
  const qc = useQueryClient();
  const path = pathOverride || m.path;
  const query = useQuery({
    queryKey: [m.resource, id],
    queryFn: () => dataClient.get(m.resource, id),
  });
  const items = useQuery({
    queryKey: ['items', user?.id],
    queryFn: () => dataClient.list('items'),
    enabled: m.lines === 'material' && can(user, 'items'),
  });
  const ledgers = useQuery({
    queryKey: ['ledgers', user?.id],
    queryFn: () => dataClient.list('ledgers'),
    enabled: m.lines === 'voucher' && can(user, 'ledgers'),
  });
  const audit = useQuery({
    queryKey: ['audit', id, user?.id],
    queryFn: () => dataClient.list('audit'),
  });
  const [action, setAction] = useState(''),
    [comment, setComment] = useState(''),
    [confirm, setConfirm] = useState('');
  const [approvedQuantities, setApprovedQuantities] = useState<Record<string, number>>({});
  const operation = useRef(crypto.randomUUID());
  const mutate = useMutation({
    mutationFn: () =>
      dataClient.transition(
        m.resource,
        id,
        action,
        { comment, approvedQuantities },
        operation.current,
      ),
    onSuccess: async () => {
      await qc.invalidateQueries();
      toast.success('Document updated');
      setAction('');
      setComment('');
      operation.current = crypto.randomUUID();
    },
    onError: (e) => toast.error(e.message),
  });
  if (query.isLoading) return <Skeleton />;
  if (query.error) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const r = query.data;
  if (!r) return <Empty />;
  const draft = ['draft', 'returned', 'active'].includes(r.status || '');
  const submitted = ['submitted', 'under_review'].includes(r.status || '');
  const computed = totals(r);
  const actions = (
    <>
      {' '}
      {draft && !m.readonly && can(user, m.resource, 'edit') && (
        <Button variant="outline" asChild>
          <Link href={`${path}/${id}/edit`}>
            <PencilSimple size={19} />
            Edit
          </Link>
        </Button>
      )}
      {m.document && (
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={19} />
          <span>Print</span>
        </Button>
      )}
      {draft && m.document && can(user, m.resource, 'submit') && (
        <Button onClick={() => setAction('submit')} disabled={!online}>
          <PaperPlane size={18} />
          Submit
        </Button>
      )}
      {submitted && can(user, m.resource, 'approve') && (
        <>
          <Button variant="outline" onClick={() => setAction('return')} disabled={!online}>
            Return
          </Button>
          <Button variant="outline" onClick={() => setAction('reject')} disabled={!online}>
            Reject
          </Button>
          <Button onClick={() => setAction('approve')} disabled={!online}>
            <Check size={19} />
            Approve
          </Button>
        </>
      )}
      {['draft', 'submitted'].includes(r.status || '') &&
        ['grn', 'material-issues', 'stock-transfers', 'vouchers'].includes(m.resource) &&
        can(user, m.resource, 'post') && (
          <Button onClick={() => setAction('post')} disabled={!online}>
            <Check size={19} />
            Post {m.singular.toLowerCase()}
          </Button>
        )}
    </>
  );
  return (
    <>
      <PageHeader
        title={text(r.number || r.name) || m.singular}
        description={text(r.purpose) || m.description}
        eyebrow={m.group}
        back={path}
        action={actions}
      />
      <section className="panel document-overview">
        <div>
          <span className="eyebrow">DOCUMENT STATUS</span>
          <Badge status={r.status} />
        </div>
        <div>
          <small>Created</small>
          <strong>{day(r.createdAt)}</strong>
        </div>
        <div>
          <small>Last updated</small>
          <strong>{day(r.updatedAt)}</strong>
        </div>
        {m.document && (
          <div>
            <small>{m.lines === 'voucher' ? 'Total debit' : 'Net amount'}</small>
            <strong className="number">
              {inr(
                m.lines === 'voucher'
                  ? (r.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0)
                  : computed.net,
              )}
            </strong>
          </div>
        )}
      </section>
      {!draft && (
        <div className="info-banner">
          {r.status === 'posted'
            ? 'Posted records are locked. Adjustments require a separate, traceable record.'
            : `This document is ${label(r.status).toLowerCase()}. Editing is locked until it is returned.`}
        </div>
      )}
      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel">
            <div className="section-heading">
              <h2>{m.document ? 'Document information' : 'Record details'}</h2>
            </div>
            <dl className="detail-fields">
              {m.fields
                .filter((f) => !f.resource)
                .map((f) => (
                  <div key={f.key}>
                    <dt>{f.label}</dt>
                    <dd>{f.type === 'date' ? day(r[f.key]) : text(r[f.key]) || '—'}</dd>
                  </div>
                ))}
              {m.fields
                .filter((f) => f.resource && r[f.key])
                .map((f) => (
                  <Reference
                    key={f.key}
                    title={f.label}
                    resource={f.resource!}
                    id={text(r[f.key])}
                  />
                ))}
            </dl>
          </section>
          {r.lines && (
            <section className="panel detail-lines-panel">
              <div className="section-heading">
                <div>
                  <h2>{m.lines === 'voucher' ? 'Accounting entries' : 'Line items'}</h2>
                  <p className="muted">
                    {m.lines === 'voucher'
                      ? 'Balanced debit and credit entries.'
                      : `${r.lines.length} recorded line items.`}
                  </p>
                </div>
                <span className="count-chip">{r.lines.length}</span>
              </div>
              <LineItemsTable
                lines={r.lines}
                type={m.lines || 'material'}
                itemsMap={items.data}
                ledgersMap={ledgers.data}
                resource={m.resource}
                totals={computed}
                deductions={
                  m.lines === 'bill'
                    ? {
                        advance: r.advance,
                        retention: r.retention,
                        tds: r.tds,
                        materialRecovery: r.materialRecovery,
                        penalty: r.penalty,
                      }
                    : undefined
                }
              />
            </section>
          )}
          {m.document && <Evidence resource={m.resource} id={id} />}
        </div>
        <aside className="detail-aside">
          <section className="panel">
            <h2>Activity trail</h2>
            <div className="timeline">
              {(audit.data || [])
                .filter((a) => a.recordId === id)
                .reverse()
                .map((a) => (
                  <div key={a.id}>
                    <span className="timeline-dot" />
                    <strong>{label(a.action)}</strong>
                    <p>{text(a.message)}</p>
                    <small>
                      {text(a.actor)} · {day(a.createdAt)}
                    </small>
                  </div>
                ))}
              {!(audit.data || []).some((a) => a.recordId === id) && (
                <p className="muted">
                  Created on {day(r.createdAt)}. New actions will appear here.
                </p>
              )}
            </div>
          </section>
          {m.resource === 'material-requests' &&
            ['approved', 'partial'].includes(r.status || '') &&
            can(user, 'material-issues', 'create') && (
              <section className="panel next-step">
                <Package size={30} />
                <h3>Ready for fulfilment</h3>
                <p>Issue available stock against the approved quantities.</p>
                <Button asChild>
                  <Link href={`/inventory/issues/new?requestId=${id}`}>
                    Create issue
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Link href={`/purchasing/requisitions/new?requestId=${id}`}>
                  Request procurement
                </Link>
              </section>
            )}
          {m.resource === 'purchase-orders' &&
            ['approved', 'partial'].includes(r.status || '') &&
            can(user, 'grn', 'create') && (
              <Button asChild>
                <Link href={`/inventory/grn/new?orderId=${id}&vendorId=${r.vendorId}`}>
                  Receive materials
                  <ArrowRight size={18} />
                </Link>
              </Button>
            )}
        </aside>
      </div>
      <Modal
        open={!!action}
        onOpenChange={(v) => {
          if (!mutate.isPending && !v) {
            setAction('');
            setConfirm('');
          }
        }}
        title={`${label(action)} ${r.number || m.singular}?`}
        description={
          action === 'post'
            ? 'Posting updates stock or accounts and locks this document. Verify the quantities and amounts.'
            : 'This action is recorded in the document audit trail.'
        }
      >
        {action === 'approve' && m.resource === 'material-requests' && (
          <div className="approval-quantities">
            {r.lines?.map((line, i) => (
              <label key={line.id}>
                Approved quantity ·{' '}
                {items.data?.find((item) => item.id === line.itemId)?.name || `Line ${i + 1}`}
                <input
                  type="number"
                  min="0"
                  max={line.qtyRequested?.value}
                  step="0.001"
                  value={approvedQuantities[line.id] ?? line.qtyRequested?.value ?? 0}
                  onChange={(e) =>
                    setApprovedQuantities({
                      ...approvedQuantities,
                      [line.id]: Number(e.target.value),
                    })
                  }
                />
              </label>
            ))}
          </div>
        )}
        {['return', 'reject', 'approve'].includes(action) && (
          <label>
            Comment{action !== 'approve' ? ' *' : ''}
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          </label>
        )}
        {action === 'post' && (
          <label>
            Type POST to confirm
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
          </label>
        )}
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setAction('')} disabled={mutate.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => mutate.mutate()}
            disabled={
              mutate.isPending ||
              !online ||
              (action === 'post' && confirm !== 'POST') ||
              (['return', 'reject'].includes(action) && !comment.trim())
            }
          >
            {mutate.isPending ? 'Updating…' : label(action)}
          </Button>
        </div>
      </Modal>
    </>
  );
}
function Reference({ resource, id, title }: { resource: string; id: string; title: string }) {
  const q = useQuery({ queryKey: [resource, id], queryFn: () => dataClient.get(resource, id) });
  const path = modules.find((m) => m.resource === resource)?.path;
  return (
    <div>
      <dt>{title}</dt>
      <dd>
        {path ? (
          <Link href={`${path}/${id}`}>
            {text(q.data?.number || q.data?.name) || 'View linked record'}
          </Link>
        ) : (
          id
        )}
      </dd>
    </div>
  );
}
