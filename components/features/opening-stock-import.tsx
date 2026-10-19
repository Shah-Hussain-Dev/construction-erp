'use client';
import { useMemo, useRef, useState } from 'react';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { UploadSimple, DownloadSimple } from '@phosphor-icons/react';
import { dataClient } from '@/lib/api';
import { text, qty } from '@/lib/format';
import { useSession } from '../providers';
import { Button } from '../ui/button';
import { DataTable } from '../ui/data-table';
type Row = {
  itemId: string;
  storeId: string;
  quantity: number;
  name: string;
  storeName: string;
  errors: string[];
};
export function OpeningStockImport() {
  const { user, siteId, sites, online } = useSession();
  const refs = ['items', 'stores', 'stock-balances'];
  const queries = useQueries({
    queries: refs.map((r) => ({ queryKey: [r, user?.id], queryFn: () => dataClient.list(r) })),
  });
  const [rows, setRows] = useState<Row[]>([]),
    [busy, setBusy] = useState(false),
    [done, setDone] = useState(false);
  const [raw, setRaw] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState({
    itemCode: 'itemCode',
    storeCode: 'storeCode',
    quantity: 'quantity',
  });
  const file = useRef<HTMLInputElement>(null),
    operation = useRef(crypto.randomUUID());
  const qc = useQueryClient();
  function preview(records: Record<string, unknown>[], map: typeof mapping) {
    const seen = new Set<string>();
    setRows(
      records.map((r) => {
        const item = queries[0].data?.find(
          (i) => text(i.code).toLowerCase() === text(r[map.itemCode]).trim().toLowerCase(),
        );
        const store = queries[1].data?.find(
          (s) =>
            text(s.code).toLowerCase() === text(r[map.storeCode]).trim().toLowerCase() &&
            s.siteId === siteId,
        );
        const quantity = Number(r[map.quantity]);
        const errors: string[] = [];
        if (!item) errors.push('Unknown material code');
        if (!store) errors.push('Unknown store code for this site');
        if (!Number.isFinite(quantity) || quantity < 0)
          errors.push('Quantity must be zero or greater');
        const key = `${item?.id}:${store?.id}`;
        if (seen.has(key)) errors.push('Duplicate material/store');
        seen.add(key);
        if (queries[2].data?.some((b) => b.itemId === item?.id && b.storeId === store?.id))
          errors.push('Balance already exists; use a receipt or adjustment');
        return {
          itemId: item?.id || '',
          storeId: store?.id || '',
          quantity,
          name: item?.name || text(r[map.itemCode]),
          storeName: store?.name || text(r[map.storeCode]),
          errors,
        };
      }),
    );
  }
  async function load(selected: File) {
    setBusy(true);
    setDone(false);
    try {
      if (selected.size > 5 * 1024 * 1024) throw Error('Use a file under 5 MB.');
      let data: Record<string, unknown>[] = [];
      if (selected.name.toLowerCase().endsWith('.csv')) {
        const Papa = (await import('papaparse')).default;
        const result = Papa.parse<Record<string, unknown>>(await selected.text(), {
          header: true,
          skipEmptyLines: true,
        });
        if (result.errors.length) throw Error(result.errors[0].message);
        data = result.data;
      } else {
        const ExcelJS = (await import('exceljs')).default;
        const book = new ExcelJS.Workbook();
        await book.xlsx.load(await selected.arrayBuffer());
        const sheet = book.worksheets[0];
        if (!sheet) throw Error('Empty workbook.');
        const headers: string[] = [];
        sheet.getRow(1).eachCell((c, i) => (headers[i] = c.text));
        sheet.eachRow((row, i) => {
          if (i > 1) {
            const r: Record<string, unknown> = {};
            row.eachCell((c, j) => (r[headers[j]] = c.text));
            data.push(r);
          }
        });
      }
      if (!data.length || data.length > 500) throw Error('Import 1–500 rows.');
      setRaw(data);
      preview(data, mapping);
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
        'stock-balances',
        'batch',
        'import',
        {
          siteId,
          projectId: site?.projectId,
          firmId: site?.firmId,
          rows: rows.map((r) => ({ itemId: r.itemId, storeId: r.storeId, quantity: r.quantity })),
        },
        operation.current,
      );
    },
    onSuccess: () => {
      setDone(true);
      qc.invalidateQueries();
      toast.success('Opening stock imported');
      operation.current = crypto.randomUUID();
    },
    onError: (e) => toast.error(e.message),
  });

  const previewColumns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: 'material',
        header: 'Material Name',
        cell: ({ row }) => (
          <strong className="text-slate-900 font-semibold">{row.original.name}</strong>
        ),
      },
      {
        id: 'store',
        header: 'Site Store',
        cell: ({ row }) => <span className="text-slate-700">{row.original.storeName}</span>,
      },
      {
        id: 'quantity',
        header: () => <div className="text-right">Opening Quantity</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-bold text-slate-900">
            {qty(row.original.quantity)}
          </div>
        ),
      },
      {
        id: 'validation',
        header: 'Validation',
        cell: ({ row }) => (
          <span className={row.original.errors.length ? 'field-error' : 'success-text'}>
            {row.original.errors.join('; ') || 'Ready'}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Opening stock</h2>
            <p>
              Create opening quantities for new material/store pairs. Existing balances cannot be
              overwritten.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/sample-opening-stock.csv" download>
              <DownloadSimple size={18} />
              Template
            </a>
          </Button>
        </div>
        <p className="muted">
          Use the material and store codes from your master records. Sample: CEMENT and STORE-2.
        </p>
        <Button
          onClick={() => file.current?.click()}
          disabled={busy || queries.some((q) => q.isLoading)}
        >
          <UploadSimple size={19} />
          {busy ? 'Reading…' : 'Choose CSV or Excel'}
        </Button>
        <input
          className="sr-only"
          ref={file}
          type="file"
          accept=".csv,.xlsx"
          aria-label="Upload opening stock"
          onChange={(e) => {
            if (e.target.files?.[0]) load(e.target.files[0]);
            e.target.value = '';
          }}
        />
      </section>
      {raw.length > 0 && (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="form-grid">
            {(Object.keys(mapping) as (keyof typeof mapping)[]).map((key) => (
              <label key={key}>
                {key} column
                <select
                  value={mapping[key]}
                  onChange={(e) => {
                    const next = { ...mapping, [key]: e.target.value };
                    setMapping(next);
                    preview(raw, next);
                  }}
                >
                  {Object.keys(raw[0]).map((header) => (
                    <option key={header}>{header}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="opening-stock-table-wrapper">
            <DataTable
              columns={previewColumns}
              data={rows}
              caption="Opening stock preview"
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
                  : `Import ${rows.length} opening balances`}
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
