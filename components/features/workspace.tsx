'use client';
import Link from 'next/link';
import { useState, useRef, useMemo } from 'react';
import { useQueries, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../ui/data-table';
import {
  ArrowRight,
  DownloadSimple,
  UploadSimple,
  FileCsv,
  Bell,
  Check,
  DeviceMobile,
  Printer,
  ShieldCheck,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { can, totals, approvalResources } from '@/lib/domain.cjs';
import { modules, books } from '@/lib/modules';
import { day, inr, label, text } from '@/lib/format';
import { Detail } from './detail';
import { OpeningStockImport } from './opening-stock-import';
import type { RecordData } from '@/schemas';
import { useSession } from '../providers';
import { PageHeader } from '../shell';
import { Button } from '../ui/button';
import { Badge, Empty, ErrorState, Skeleton } from '../ui/primitives';
export function Approvals() {
  const { user, siteId } = useSession();
  const [type, setType] = useState('all');
  const resources = approvalResources.filter((r: string) => can(user, r));
  const queries = useQueries({
    queries: resources.map((r: string) => ({
      queryKey: [r, user?.id],
      queryFn: () => dataClient.list(r),
    })),
  });
  const rows = resources.flatMap((resource: string, i: number) =>
    (queries[i].data || [])
      .filter((r) => r.siteId === siteId && ['submitted', 'under_review'].includes(r.status || ''))
      .map((r) => ({ ...r, resource })),
  );
  return (
    <>
      <PageHeader
        title="Approval inbox"
        description="Make the decisions that keep your sites moving."
        eyebrow="REVIEW & APPROVE"
      />
      <div className="tabs" role="group" aria-label="Filter approvals">
        {['all', ...resources].map((r: string) => (
          <button key={r} className={type === r ? 'active' : ''} onClick={() => setType(r)}>
            {r === 'all' ? 'All documents' : modules.find((m) => m.resource === r)?.title}
            <span>
              {r === 'all'
                ? rows.length
                : rows.filter((v: { resource: string }) => v.resource === r).length}
            </span>
          </button>
        ))}
      </div>
      {queries.some((q) => q.isLoading) ? (
        <Skeleton />
      ) : queries.some((q) => q.error) ? (
        <ErrorState
          error={queries.find((q) => q.error)!.error!}
          retry={() => queries.forEach((q) => q.refetch())}
        />
      ) : !rows.length ? (
        <Empty
          title="All caught up"
          description="Documents awaiting a decision will appear here."
        />
      ) : (
        <div className="approval-grid">
          {rows
            .filter((r: { resource: string }) => type === 'all' || r.resource === type)
            .map((r: RecordData & { resource: string }) => (
              <Link
                className="panel approval-card"
                key={r.id}
                href={`${modules.find((m) => m.resource === r.resource)?.path}/${r.id}`}
              >
                <div>
                  <span className="record-number">{r.number}</span>
                  <Badge status={r.status} />
                </div>
                <h2>{text(r.purpose) || 'Document review'}</h2>
                <p>
                  {modules.find((m) => m.resource === r.resource)?.singular} · {day(r.createdAt)}
                </p>
                <footer>
                  <strong className="number">{inr(totals(r).net)}</strong>
                  <span>
                    Review <ArrowRight size={18} />
                  </span>
                </footer>
              </Link>
            ))}
        </div>
      )}
    </>
  );
}
export function Notifications() {
  const { user } = useSession();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => dataClient.list('notifications'),
  });
  const mutation = useMutation({
    mutationFn: (id: string) => dataClient.transition('notifications', id, 'read'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Notifications" description="Updates from your sites and your team." />
      <section className="panel">
        {query.isLoading ? (
          <Skeleton />
        ) : query.error ? (
          <ErrorState error={query.error} retry={() => query.refetch()} />
        ) : !query.data?.length ? (
          <Empty title="No notifications yet" />
        ) : (
          query.data
            .slice()
            .reverse()
            .map((n) => (
              <div className={`notification-row ${n.read ? 'read' : ''}`} key={n.id}>
                <Bell size={23} />
                <div>
                  <strong>{n.name}</strong>
                  <p>{text(n.message)}</p>
                  <small>{day(n.createdAt)}</small>
                  {!!n.href && <Link href={text(n.href)}>Open record</Link>}
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Mark ${n.name} read`}
                    onClick={() => mutation.mutate(n.id)}
                    disabled={mutation.isPending}
                  >
                    <Check size={22} />
                  </Button>
                )}
              </div>
            ))
        )}
      </section>
    </>
  );
}
type BookRow = {
  id?: string;
  name?: string;
  number?: string;
  date?: string;
  sourceId?: string;
  accountId?: string;
  debit?: number;
  credit?: number;
};

export function Book({ kind = 'day-book' }: { kind?: string }) {
  const { user, siteId } = useSession();
  const vouchers = useQuery({
    queryKey: ['vouchers', user?.id],
    queryFn: () => dataClient.list('vouchers'),
  });
  const ledgers = useQuery({
    queryKey: ['ledgers', user?.id],
    queryFn: () => dataClient.list('ledgers'),
  });

  const bookColumns = useMemo<ColumnDef<BookRow>[]>(
    () => [
      {
        id: 'account',
        header: 'Account / Document',
        cell: ({ row: { original: r } }) =>
          r.name ? (
            <strong className="text-slate-900 font-semibold">{text(r.name)}</strong>
          ) : (
            <div>
              <Link
                className="font-semibold text-blue-600 hover:underline"
                href={`/finance/vouchers/${r.sourceId}`}
              >
                {r.number}
              </Link>
              <small className="block text-slate-500 font-mono">
                {ledgers.data?.find((l) => l.id === r.accountId)?.name}
              </small>
            </div>
          ),
      },
      {
        id: 'debit',
        header: () => <div className="text-right">Debit (INR)</div>,
        cell: ({ row: { original: r } }) => (
          <div className="text-right font-mono font-semibold text-slate-900">
            {Number(r.debit) > 0 ? inr(r.debit) : <span className="text-slate-400">—</span>}
          </div>
        ),
      },
      {
        id: 'credit',
        header: () => <div className="text-right">Credit (INR)</div>,
        cell: ({ row: { original: r } }) => (
          <div className="text-right font-mono font-semibold text-slate-900">
            {Number(r.credit) > 0 ? inr(r.credit) : <span className="text-slate-400">—</span>}
          </div>
        ),
      },
      {
        id: 'balance',
        header: () => <div className="text-right">Balance (INR)</div>,
        cell: ({ row: { original: r } }) => {
          const bal = Number(r.debit || 0) - Number(r.credit || 0);
          return (
            <div
              className={`text-right font-mono font-bold ${
                bal < 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {inr(bal)}
            </div>
          );
        },
      },
    ],
    [ledgers.data],
  );

  if (!can(user, 'vouchers'))
    return (
      <Empty title="Access restricted" description="Your role cannot view internal accounts." />
    );
  const entries = (vouchers.data || [])
    .filter((v) => v.siteId === siteId && v.status === 'posted')
    .flatMap((v) =>
      (v.lines || []).map((l) => ({ ...l, number: v.number, date: v.date, sourceId: v.id })),
    );
  const balances = (ledgers.data || []).map((l) => ({
    ...l,
    debit: entries
      .filter((e) => e.accountId === l.id)
      .reduce((s, e) => s + Number(e.debit || 0), 0),
    credit: entries
      .filter((e) => e.accountId === l.id)
      .reduce((s, e) => s + Number(e.credit || 0), 0),
  }));
  const rows =
    kind === 'trial-balance'
      ? balances
      : entries.filter(
          (e) =>
            kind === 'day-book' ||
            ledgers.data?.find((l) => l.id === e.accountId)?.name ===
              (kind === 'cash-book' ? 'Cash in hand' : 'HDFC current account'),
        );
  const dr = rows.reduce((s, r) => s + Number(r.debit || 0), 0),
    cr = rows.reduce((s, r) => s + Number(r.credit || 0), 0);

  return (
    <>
      <PageHeader
        title={label(kind)}
        description="Calculated from posted vouchers in the selected site."
        eyebrow="FINANCE"
        action={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={18} />
            Print / PDF
          </Button>
        }
      />
      <div className="tabs">
        {books.map((b) => (
          <Link className={kind === b ? 'active' : ''} key={b} href={`/finance/${b}`}>
            {label(b)}
          </Link>
        ))}
      </div>
      <div className="book-totals">
        <div>
          <small>Total debits</small>
          <strong>{inr(dr)}</strong>
        </div>
        <div>
          <small>Total credits</small>
          <strong>{inr(cr)}</strong>
        </div>
        <div>
          <small>Net balance</small>
          <strong>{inr(dr - cr)}</strong>
        </div>
      </div>
      <div className="book-table-container">
        {vouchers.isLoading || ledgers.isLoading ? (
          <Skeleton />
        ) : vouchers.error || ledgers.error ? (
          <ErrorState
            error={(vouchers.error || ledgers.error)!}
            retry={() => {
              vouchers.refetch();
              ledgers.refetch();
            }}
          />
        ) : (
          <DataTable
            columns={bookColumns}
            data={rows}
            caption={label(kind)}
            searchPlaceholder="Search accounts or documents…"
            emptyTitle="No posted entries"
            emptyDescription="Posted vouchers will automatically reflect in this report."
            pageSizeOptions={[10, 25, 50, 100]}
          />
        )}
      </div>
    </>
  );
}
export function Reports() {
  const { user } = useSession();
  return (
    <>
      <PageHeader
        title="Reports"
        description="Reliable views of your materials, commitments, and accounts."
      />
      <div className="module-grid">
        {[
          {
            title: 'Inventory & materials',
            description: 'Stock levels and movement history.',
            links: [
              ['Stock summary', '/inventory/stock'],
              ['Stock ledger', '/inventory/ledger'],
              ['Material requests', '/requests'],
            ],
          },
          {
            title: 'Purchasing & contractors',
            description: 'Commitments, receipts, and certified work.',
            links: [
              ['Purchase orders', '/purchasing/orders'],
              ['Goods receipts', '/inventory/grn'],
              ['Contractor bills', '/contractors/bills'],
            ],
          },
          ...(can(user, 'vouchers')
            ? [
                {
                  title: 'Financial books',
                  description: 'Read-only reports from posted entries.',
                  links: books.map((b) => [label(b), `/finance/${b}`]),
                },
              ]
            : []),
        ].map((g) => (
          <section className="panel" key={g.title}>
            <h2>{g.title}</h2>
            <p className="muted">{g.description}</p>
            {g.links.map(([title, href]) => (
              <Link className="module-link" href={href} key={href}>
                {title}
                <ArrowRight size={18} />
              </Link>
            ))}
          </section>
        ))}
      </div>
      <div className="info-banner">
        Use Export in registers for CSV. Use Print / PDF on documents and financial reports to save
        a clean copy.
      </div>
    </>
  );
}
type ImportRow = {
  name: string;
  code: string;
  uom: string;
  reorderLevel: number;
  errors: string[];
};
export function Imports() {
  const [kind, setKind] = useState('materials');
  const { user, siteId, sites, online } = useSession();
  const [rows, setRows] = useState<ImportRow[]>([]),
    [fileName, setFileName] = useState(''),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const operation = useRef(crypto.randomUUID());
  const [mapping, setMapping] = useState<Record<string, string>>({
    name: 'name',
    code: 'code',
    uom: 'uom',
    reorderLevel: 'reorderLevel',
  });
  const [raw, setRaw] = useState<Record<string, unknown>[]>([]);
  const items = useQuery({
    queryKey: ['items', user?.id],
    queryFn: () => dataClient.list('items'),
    enabled: can(user, 'items'),
  });
  function validate(records: Record<string, unknown>[], map: Record<string, string>) {
    const codes = new Set((items.data || []).map((i) => text(i.code).toLowerCase()));
    const parsed = records.map((r) => {
      const code = text(r[map.code]).trim(),
        name = text(r[map.name]).trim(),
        uom = text(r[map.uom]).trim().toUpperCase(),
        reorderLevel = Number(r[map.reorderLevel] || 0);
      const errors = [];
      if (!code || !name) errors.push('Name and code are required');
      if (!['BAG', 'MT', 'KG', 'CUM', 'SQM', 'NOS', 'LTR'].includes(uom))
        errors.push('Unknown unit');
      if (codes.has(code.toLowerCase())) errors.push('Duplicate code');
      codes.add(code.toLowerCase());
      if (!Number.isFinite(reorderLevel) || reorderLevel < 0) errors.push('Invalid reorder level');
      return { name, code, uom, reorderLevel, errors };
    });
    setRows(parsed);
  }
  async function load(selected: File) {
    if (selected.size > 5 * 1024 * 1024) return toast.error('Use a file smaller than 5 MB.');
    setBusy(true);
    setDone(false);
    try {
      let parsed: Record<string, unknown>[] = [];
      if (selected.name.toLowerCase().endsWith('.csv')) {
        const Papa = (await import('papaparse')).default;
        const result = Papa.parse<Record<string, unknown>>(await selected.text(), {
          header: true,
          skipEmptyLines: true,
        });
        if (result.errors.length) throw Error(result.errors[0].message);
        parsed = result.data;
      } else if (selected.name.toLowerCase().endsWith('.xlsx')) {
        const ExcelJS = (await import('exceljs')).default;
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(await selected.arrayBuffer());
        const ws = wb.worksheets[0];
        if (!ws) throw Error('Workbook contains no sheet.');
        const headers: string[] = [];
        ws.getRow(1).eachCell((cell, i) => (headers[i] = cell.text));
        ws.eachRow((row, i) => {
          if (i === 1) return;
          const record: Record<string, unknown> = {};
          row.eachCell((cell, c) => (record[headers[c]] = cell.text));
          parsed.push(record);
        });
      } else throw Error('Choose a CSV or XLSX file.');
      if (parsed.length > 500) throw Error('Import up to 500 rows at a time.');
      setRaw(parsed);
      validate(parsed, mapping);
      setFileName(selected.name);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const commit = useMutation({
    mutationFn: () => {
      const site = sites.find((s) => s.id === siteId);
      return dataClient.transition(
        'items',
        'batch',
        'import',
        {
          rows: rows.map((r) => ({
            name: r.name,
            code: r.code,
            uom: r.uom,
            reorderLevel: r.reorderLevel,
          })),
          siteId,
          projectId: site?.projectId,
          firmId: site?.firmId,
        },
        operation.current,
      );
    },
    onSuccess: () => {
      setDone(true);
      qc.invalidateQueries();
      toast.success(`${rows.length} materials imported`);
      operation.current = crypto.randomUUID();
    },
    onError: (e) => toast.error(e.message),
  });
  if (!can(user, 'items', 'create'))
    return (
      <Empty
        title="Import access restricted"
        description="The store keeper or owner can import materials."
      />
    );
  return (
    <>
      <PageHeader
        title="Import materials"
        description="Upload, map, validate, then commit. Your existing records stay intact."
        eyebrow="DATA IMPORT"
        action={
          <Button variant="outline" asChild>
            <a href="/sample-materials.csv" download>
              <DownloadSimple size={18} />
              Download template
            </a>
          </Button>
        }
      />
      <div className="tabs">
        <button
          className={kind === 'materials' ? 'active' : ''}
          onClick={() => setKind('materials')}
        >
          Material masters
        </button>
        <button className={kind === 'stock' ? 'active' : ''} onClick={() => setKind('stock')}>
          Opening stock
        </button>
      </div>
      {kind === 'stock' ? (
        <OpeningStockImport />
      ) : (
        <>
          <section className="panel import-upload">
            <FileCsv size={44} weight="duotone" />
            <h2>Bring your material list into the workspace</h2>
            <p>CSV or Excel (.xlsx) · up to 500 rows · 5 MB maximum</p>
            <Button onClick={() => file.current?.click()} disabled={busy}>
              <UploadSimple size={20} />
              {busy ? 'Reading file…' : 'Choose file'}
            </Button>
            <input
              ref={file}
              className="sr-only"
              type="file"
              accept=".csv,.xlsx"
              aria-label="Upload material import"
              onChange={(e) => {
                if (e.target.files?.[0]) load(e.target.files[0]);
                e.target.value = '';
              }}
            />
          </section>
          {raw.length > 0 && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>{fileName}</h2>
                  <p>
                    {rows.length} rows · {rows.filter((r) => r.errors.length).length} rows need
                    attention
                  </p>
                </div>
                <Badge status={done ? 'posted' : 'draft'} />
              </div>
              <div className="form-grid">
                {Object.keys(mapping).map((key) => (
                  <label key={key}>
                    {label(key)} column
                    <select
                      value={mapping[key]}
                      onChange={(e) => {
                        const next = { ...mapping, [key]: e.target.value };
                        setMapping(next);
                        validate(raw, next);
                      }}
                    >
                      {Object.keys(raw[0]).map((header) => (
                        <option key={header}>{header}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <div className="import-preview-table">
                <DataTable
                  columns={[
                    {
                      id: 'row',
                      header: '#',
                      cell: ({ row }) => (
                        <span className="font-mono text-slate-500">{row.index + 2}</span>
                      ),
                    },
                    {
                      id: 'name',
                      header: 'Material Name',
                      cell: ({ row }) => (
                        <strong className="text-slate-900 font-semibold">
                          {row.original.name}
                        </strong>
                      ),
                    },
                    {
                      id: 'code',
                      header: 'Code',
                      cell: ({ row }) => (
                        <span className="font-mono text-slate-700">{row.original.code}</span>
                      ),
                    },
                    {
                      id: 'uom',
                      header: 'Unit',
                      cell: ({ row }) => (
                        <span className="uom-pill font-mono">{row.original.uom}</span>
                      ),
                    },
                    {
                      id: 'validation',
                      header: 'Validation',
                      cell: ({ row }) => (
                        <span
                          className={row.original.errors.length ? 'field-error' : 'success-text'}
                        >
                          {row.original.errors.join('; ') || 'Ready'}
                        </span>
                      ),
                    },
                  ]}
                  data={rows}
                  caption="Import preview"
                  searchPlaceholder="Search materials in preview…"
                />
              </div>
              <div className="dialog-actions">
                <Button
                  disabled={
                    done || !online || commit.isPending || rows.some((r) => r.errors.length > 0)
                  }
                  onClick={() => commit.mutate()}
                >
                  {done
                    ? 'Import complete'
                    : commit.isPending
                      ? 'Importing…'
                      : `Import ${rows.length} materials`}
                </Button>
              </div>
            </section>
          )}
          <div className="info-banner">
            Validate your preview before committing. Imports are recorded in the audit trail.
          </div>
        </>
      )}
    </>
  );
}
export function Settings() {
  const { user, sites, siteId, online } = useSession();
  return (
    <>
      <PageHeader
        title="Profile & preferences"
        description="Your account, access, and mobile workspace."
      />
      <div className="module-grid">
        <section className="panel">
          <ShieldCheck size={30} />
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <Badge status={user?.role} />
          <dl className="detail-fields">
            <div>
              <dt>Current site</dt>
              <dd>{sites.find((s) => s.id === siteId)?.name}</dd>
            </div>
            <div>
              <dt>Language / currency</dt>
              <dd>English · INR</dd>
            </div>
            <div>
              <dt>Time zone</dt>
              <dd>Asia/Kolkata</dd>
            </div>
            <div>
              <dt>Connection</dt>
              <dd>{online ? 'Online' : 'Offline'}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <DeviceMobile size={30} />
          <h2>Install on your phone</h2>
          <p className="muted">Open this workspace over HTTPS in your phone’s browser.</p>
          <ol className="install-steps">
            <li>
              <strong>iPhone / iPad</strong>
              <p>In Safari, use Share → Add to Home Screen.</p>
            </li>
            <li>
              <strong>Android</strong>
              <p>In Chrome, open the browser menu → Install app or Add to Home screen.</p>
            </li>
          </ol>
          <p className="muted">
            If installation is not available, all online workflows still work in your browser.
          </p>
        </section>
      </div>
    </>
  );
}
type StatementRow = {
  id?: string;
  number?: string;
  purpose?: string;
  date?: string;
  createdAt?: string;
  status?: string;
  lines?: unknown[];
  deductions?: Record<string, unknown>;
  [key: string]: unknown;
};

export function PortalStatement() {
  const { user } = useSession();
  const q = useQuery({
    queryKey: ['contractor-bills', user?.id],
    queryFn: () => dataClient.list('contractor-bills'),
  });

  const statementColumns = useMemo<ColumnDef<StatementRow>[]>(
    () => [
      {
        id: 'number',
        header: 'Document / Bill Number',
        cell: ({ row: { original: r } }) => (
          <div>
            <strong className="text-slate-900 font-semibold">{r.number}</strong>
            <small className="block text-slate-500">{text(r.purpose) || 'Running Bill'}</small>
          </div>
        ),
      },
      {
        id: 'date',
        header: 'Bill Date',
        cell: ({ row: { original: r } }) => (
          <span className="font-mono text-slate-600">{day(r.date || r.createdAt)}</span>
        ),
      },
      {
        id: 'net',
        header: () => <div className="text-right">Certified Net Payable</div>,
        cell: ({ row: { original: r } }) => (
          <div className="text-right font-mono font-bold text-slate-900">
            {inr(totals(r).net)}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Payment Status',
        cell: ({ row: { original: r } }) => <Badge status={r.status} />,
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Payment statement"
        description="Approved bill amounts and their recorded payment status."
      />
      <div className="portal-statement-container">
        {q.isLoading ? (
          <Skeleton />
        ) : q.error ? (
          <ErrorState error={q.error} retry={() => q.refetch()} />
        ) : (
          <DataTable
            columns={statementColumns}
            data={q.data || []}
            searchPlaceholder="Search statement bills…"
            emptyTitle="No payment records"
            emptyDescription="Approved contractor bills will appear here."
          />
        )}
        <p className="table-note muted">
          Amounts reflect recorded bills. A paid status confirms the demo record state; no bank
          transfer is initiated here.
        </p>
      </div>
    </>
  );
}

export function ApprovalRecord({ id }: { id: string }) {
  const { user } = useSession();
  const resources = approvalResources.filter((r: string) => can(user, r));
  const queries = useQueries({
    queries: resources.map((resource: string) => ({
      queryKey: [resource, user?.id],
      queryFn: () => dataClient.list(resource),
    })),
  });
  const index = queries.findIndex((q) => q.data?.some((record) => record.id === id));
  if (queries.some((q) => q.isLoading)) return <Skeleton />;
  if (index < 0)
    return (
      <Empty title="Approval not found" description="The record may be outside your access." />
    );
  return <Detail module={modules.find((m) => m.resource === resources[index])!} id={id} />;
}
