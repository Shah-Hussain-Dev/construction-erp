'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash, FloppyDisk, PaperPlane, CheckCircle } from '@phosphor-icons/react';
import { dataClient } from '@/lib/api';
import { can, totals, validateDocument } from '@/lib/domain.cjs';
import { inr, text } from '@/lib/format';
import type { Module } from '@/lib/modules';
import type { Line, RecordData } from '@/schemas';
import { useSession } from '../providers';
import { PageHeader } from '../shell';
import { Button } from '../ui/button';
import { Empty, ErrorState, Skeleton, Modal } from '../ui/primitives';
export function Editor({
  module: m,
  id,
  pathOverride,
}: {
  module: Module;
  id?: string;
  pathOverride?: string;
}) {
  const query = useQuery({
    queryKey: [m.resource, id],
    queryFn: () => dataClient.get(m.resource, id!),
    enabled: !!id,
  });
  if (id && query.isLoading) return <Skeleton />;
  if (query.error) return <ErrorState error={query.error} retry={() => query.refetch()} />;
  return (
    <EditorForm
      key={`${id || 'new'}-${query.data?.updatedAt || ''}`}
      module={m}
      record={query.data}
      pathOverride={pathOverride}
    />
  );
}
function EditorForm({
  module: m,
  record,
  pathOverride,
}: {
  module: Module;
  record?: RecordData;
  pathOverride?: string;
}) {
  const router = useRouter(),
    params = useSearchParams();
  const query = useQueryClient();
  const { user, siteId, sites, online } = useSession();
  const path = pathOverride || m.path;
  const site = sites.find((s) => s.id === siteId);
  const [lines, setLines] = useState<Line[]>(record?.lines || []),
    [error, setError] = useState(''),
    [draftStatus, setDraftStatus] = useState(''),
    [discard, setDiscard] = useState(false),
    [restored, setRestored] = useState(false);
  const key = `civil.draft.v1.${user?.id}.${siteId}.${record?.id || 'new'}`;
  const operation = useRef(crypto.randomUUID()),
    savedId = useRef(record?.id);
  const changed = useRef(false);
  const defaults = Object.fromEntries(
    m.fields.map((f) => [
      f.key,
      record?.[f.key] ??
        params.get(f.key) ??
        (f.type === 'date'
          ? new Date().toISOString().slice(0, 10)
          : f.type === 'number'
            ? 0
            : f.options?.[0] || ''),
    ]),
  ) as Record<string, string | number>;
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<Record<string, string | number>>({ defaultValues: defaults });
  const resources = [
    ...new Set([
      ...m.fields.flatMap((f) => (f.resource ? [f.resource] : [])),
      ...(m.lines ? [m.lines === 'voucher' ? 'ledgers' : 'items'] : []),
    ]),
  ];
  const refs = useQueries({
    queries: resources.map((resource) => ({
      queryKey: [resource, user?.id],
      queryFn: () => dataClient.list(resource),
      enabled: can(user, resource),
    })),
  });
  const options = Object.fromEntries(resources.map((r, i) => [r, refs[i].data || []]));
  const values = watch();
  const dirty = isDirty || changed.current;
  useEffect(() => {
    if (m.resource !== 'material-requests') return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.version === 1) {
          reset(saved.values);
          setLines(saved.lines);
          setRestored(true);
          setDraftStatus('Local draft restored');
        }
      }
    } catch {
      setDraftStatus('Local draft could not be restored.');
    }
  }, [key, m.resource, reset]);
  useEffect(() => {
    if (m.resource !== 'material-requests' || (!dirty && !restored)) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ version: 1, values, lines, updatedAt: new Date().toISOString() }),
        );
        setDraftStatus('Saved on this device');
      } catch {
        setDraftStatus('Device storage unavailable. Save online to keep your work.');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [values, lines, key, m.resource, dirty, restored]);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const guard = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href !== location.href &&
        !window.confirm('Leave this form? Unsaved changes may be lost.')
      )
        e.preventDefault();
    };
    window.addEventListener('beforeunload', prevent);
    document.addEventListener('click', guard, true);
    return () => {
      window.removeEventListener('beforeunload', prevent);
      document.removeEventListener('click', guard, true);
    };
  }, [dirty]);
  const mutation = useMutation({
    mutationFn: async ({
      fields,
      submit,
    }: {
      fields: Record<string, string | number>;
      submit: boolean;
    }) => {
      if (!site) throw Error('Select a site before creating a record.');
      const normalized = lines.map((l) => ({
        ...l,
        qtyRequested:
          m.lines === 'material'
            ? {
                value: Number(l.qty || 0),
                uom: text(options.items?.find((i) => i.id === l.itemId)?.uom) || 'NOS',
              }
            : l.qtyRequested,
        qtyApproved: l.qtyApproved ?? null,
        qtyIssued: l.qtyIssued ?? null,
      }));
      const input = {
        ...fields,
        lines: normalized,
        siteId,
        projectId: site.projectId,
        firmId: site.firmId,
        prefix: m.prefix,
        evidenceIds: record?.evidenceIds || [],
      };
      if (m.document) validateDocument(m.resource, input, submit);
      const result = await dataClient.save(m.resource, input, savedId.current, operation.current);
      savedId.current = result.id;
      operation.current = crypto.randomUUID();
      if (submit) await dataClient.transition(m.resource, result.id, 'submit');
      return result;
    },
    onSuccess: async (result) => {
      changed.current = false;
      reset(values);
      if (m.resource === 'material-requests') localStorage.removeItem(key);
      await query.invalidateQueries();
      toast.success(`${m.singular} saved`);
      router.push(`${path}/${result.id}`);
    },
    onError: (e) => setError(e.message),
  });
  if (
    !can(user, m.resource, record ? 'edit' : 'create') ||
    (record && !['draft', 'returned', 'active'].includes(record.status || ''))
  )
    return (
      <Empty
        title="This record is read-only"
        description="Your role or the document status does not allow changes."
      />
    );
  const update = (index: number, field: string, value: unknown) => {
    changed.current = true;
    setLines((current) => current.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };
  const add = () => {
    changed.current = true;
    setLines((l) => [
      ...l,
      {
        id: crypto.randomUUID(),
        ...(m.lines === 'voucher'
          ? { accountId: '', debit: 0, credit: 0 }
          : m.lines === 'bill'
            ? { description: '', uom: 'CUM', previous: 0, qty: 1, rate: 0 }
            : { itemId: '', qty: 1, rate: 0 }),
      },
    ]);
  };
  const computed = totals({ ...values, lines });
  const debit = lines.reduce((s, l) => s + Number(l.debit || 0), 0),
    credit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  return (
    <>
      <PageHeader
        title={`${record ? 'Edit' : 'New'} ${m.singular.toLowerCase()}`}
        description={`${text(site?.name)} · ${m.document ? 'Drafts stay editable until submission.' : 'Keep master data accurate and up to date.'}`}
        back={path}
      />
      <form
        className="editor"
        onSubmit={handleSubmit((fields) => mutation.mutate({ fields, submit: false }))}
      >
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>{m.document ? 'Document details' : 'Basic information'}</h2>
              <p>Fields marked * are required.</p>
            </div>
            <span className="step-label">01</span>
          </div>
          <div className="form-grid">
            {m.fields.map((f) => (
              <label key={f.key} className={f.type === 'textarea' ? 'full-width' : ''}>
                {f.label}
                {f.required ? ' *' : ''}
                {f.resource || f.options ? (
                  <select
                    {...register(f.key, {
                      required: f.required ? `${f.label} is required` : false,
                    })}
                  >
                    <option value="">Select {f.label.toLowerCase()}</option>
                    {f.options?.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                    {options[f.resource || '']
                      ?.filter(
                        (r) =>
                          !r.siteId ||
                          r.siteId === siteId ||
                          ['vendors', 'contractors', 'items', 'ledgers', 'projects'].includes(
                            f.resource || '',
                          ),
                      )
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {text(r.number || r.name)}
                        </option>
                      ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    {...register(f.key, {
                      required: f.required ? `${f.label} is required` : false,
                    })}
                  />
                ) : (
                  <input
                    type={f.type || 'text'}
                    min={f.type === 'number' ? 0 : undefined}
                    step={f.type === 'number' ? '0.01' : undefined}
                    inputMode={f.type === 'number' ? 'decimal' : undefined}
                    {...register(f.key, {
                      required: f.required ? `${f.label} is required` : false,
                      valueAsNumber: f.type === 'number',
                      min:
                        f.type === 'number'
                          ? { value: 0, message: 'Enter zero or greater' }
                          : undefined,
                    })}
                  />
                )}{' '}
                {errors[f.key] && (
                  <span role="alert" className="field-error">
                    {errors[f.key]?.message}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>
        {m.lines && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>
                  {m.lines === 'voucher'
                    ? 'Accounting entries'
                    : m.lines === 'bill'
                      ? 'Work measurements'
                      : 'Material lines'}
                </h2>
                <p>
                  {m.lines === 'bill'
                    ? 'Previous + current = cumulative quantity.'
                    : 'Add the details for each line item.'}
                </p>
              </div>
              <span className="step-label">02</span>
            </div>
            <div className="line-list">
              {lines.map((line, index) => (
                <div className="line-card" key={line.id}>
                  <div className="line-card-head">
                    <strong>Line {String(index + 1).padStart(2, '0')}</strong>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove line ${index + 1}`}
                      onClick={() => {
                        changed.current = true;
                        setLines(lines.filter((_, i) => i !== index));
                      }}
                    >
                      <Trash size={19} />
                    </Button>
                  </div>
                  <div className="line-fields">
                    {m.lines === 'voucher' ? (
                      <>
                        <label className="line-main">
                          Account
                          <select
                            aria-label={`Account ${index + 1}`}
                            value={line.accountId || ''}
                            onChange={(e) => update(index, 'accountId', e.target.value)}
                            required
                          >
                            <option value="">Choose account</option>
                            {options.ledgers?.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        {['debit', 'credit'].map((k) => (
                          <label key={k}>
                            {k === 'debit' ? 'Debit' : 'Credit'} (INR)
                            <input
                              aria-label={`${k} ${index + 1}`}
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={Number(line[k] || 0)}
                              onChange={(e) => update(index, k, Number(e.target.value))}
                            />
                          </label>
                        ))}
                      </>
                    ) : (
                      <>
                        {m.lines === 'material' ? (
                          <label className="line-main">
                            Material
                            <select
                              aria-label={`Material ${index + 1}`}
                              required
                              value={line.itemId || ''}
                              onChange={(e) => update(index, 'itemId', e.target.value)}
                            >
                              <option value="">Choose a material</option>
                              {options.items?.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} · {text(item.uom)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <label className="line-main">
                            Work description
                            {m.resource === 'contractor-bills' ? (
                              <select
                                required
                                value={line.description || ''}
                                onChange={(e) => {
                                  const agreed = options['work-orders']
                                    ?.find((w) => w.id === values.workOrderId)
                                    ?.lines?.find((l) => l.description === e.target.value);
                                  changed.current = true;
                                  setLines((current) =>
                                    current.map((l, i) =>
                                      i === index
                                        ? {
                                            ...l,
                                            description: e.target.value,
                                            rate: Number(agreed?.rate || 0),
                                            uom: agreed?.uom || 'CUM',
                                          }
                                        : l,
                                    ),
                                  );
                                }}
                              >
                                <option value="">Choose an agreed work item</option>
                                {options['work-orders']
                                  ?.find((w) => w.id === values.workOrderId)
                                  ?.lines?.map((l) => (
                                    <option key={l.id} value={l.description}>
                                      {l.description}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <input
                                required
                                value={line.description || ''}
                                onChange={(e) => update(index, 'description', e.target.value)}
                              />
                            )}
                          </label>
                        )}
                        {m.lines === 'bill' && (
                          <>
                            <label>
                              Unit
                              <input
                                value={line.uom || 'CUM'}
                                onChange={(e) => update(index, 'uom', e.target.value)}
                              />
                            </label>
                            <label>
                              Previous quantity
                              <input
                                type="number"
                                min="0"
                                step="0.001"
                                value={line.previous || 0}
                                onChange={(e) => update(index, 'previous', Number(e.target.value))}
                              />
                            </label>
                          </>
                        )}
                        <label>
                          {m.lines === 'bill' ? 'Current quantity' : 'Quantity'}
                          <input
                            aria-label={`Quantity ${index + 1}`}
                            type="number"
                            min="0.001"
                            step="0.001"
                            inputMode="decimal"
                            required
                            value={line.qty ?? line.qtyRequested?.value ?? 1}
                            onChange={(e) => update(index, 'qty', Number(e.target.value))}
                          />
                        </label>
                        <label>
                          Rate (INR)
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            required
                            value={line.rate ?? 0}
                            onChange={(e) => update(index, 'rate', Number(e.target.value))}
                          />
                        </label>
                        <div className="line-total">
                          <small>
                            {m.lines === 'bill'
                              ? `Cumulative: ${Number(line.previous || 0) + Number(line.qty || 0)}`
                              : 'Line amount'}
                          </small>
                          <strong className="number">
                            {inr(Number(line.qty || 0) * Number(line.rate || 0))}
                          </strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={add}>
              <Plus size={20} />
              Add {m.lines === 'voucher' ? 'entry' : 'line item'}
            </Button>
          </section>
        )}
        {m.lines && (
          <section className="panel totals-panel">
            {m.lines === 'voucher' ? (
              <>
                <span>
                  Debit <strong>{inr(debit)}</strong>
                </span>
                <span>
                  Credit <strong>{inr(credit)}</strong>
                </span>
                <span
                  className={
                    Math.round((debit - credit) * 100) === 0 ? 'success-text' : 'field-error'
                  }
                >
                  {Math.round((debit - credit) * 100) === 0
                    ? 'Entries balance'
                    : `Difference: ${inr(debit - credit)}`}
                </span>
              </>
            ) : (
              <>
                <span>
                  Gross amount<strong>{inr(computed.gross)}</strong>
                </span>
                {m.lines === 'bill' && (
                  <span>
                    Deductions<strong>{inr(computed.deductions)}</strong>
                  </span>
                )}
                <span className="net-total">
                  Net amount<strong>{inr(computed.net)}</strong>
                </span>
              </>
            )}
          </section>
        )}
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}
        <div className="editor-footer">
          <div className="draft-status">
            <CheckCircle size={17} />
            {draftStatus || 'Save your progress as a draft'}
          </div>
          <div className="editor-buttons">
            <Button type="button" variant="ghost" onClick={() => setDiscard(true)}>
              Discard
            </Button>
            <Button variant="outline" type="submit" disabled={mutation.isPending || !online}>
              <FloppyDisk size={19} />
              {mutation.isPending ? 'Saving…' : m.document ? 'Save draft' : 'Save record'}
            </Button>
            {m.document && can(user, m.resource, 'submit') && (
              <Button
                type="button"
                disabled={mutation.isPending || !online}
                onClick={handleSubmit((fields) => mutation.mutate({ fields, submit: true }))}
              >
                <PaperPlane size={19} />
                Submit
              </Button>
            )}
          </div>
        </div>
      </form>
      <Modal
        open={discard}
        onOpenChange={setDiscard}
        title="Discard changes?"
        description="Changes since your last save will be removed."
      >
        <div className="dialog-actions">
          <Button variant="outline" onClick={() => setDiscard(false)}>
            Keep editing
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              localStorage.removeItem(key);
              changed.current = false;
              reset(defaults);
              router.push(path);
            }}
          >
            Discard changes
          </Button>
        </div>
      </Modal>
    </>
  );
}
