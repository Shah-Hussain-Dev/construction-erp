'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import type {
  ColumnDef,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  ArrowUpRight,
  Cube,
  WarningCircle,
  Package,
} from '@phosphor-icons/react';
import { dataClient } from '@/lib/api';
import { can, totals } from '@/lib/domain.cjs';
import { day, inr, label, qty, text } from '@/lib/format';
import type { Module } from '@/lib/modules';
import type { RecordData } from '@/schemas';
import { useSession } from '../providers';
import { PageHeader } from '../shell';
import { Badge, Modal } from '../ui/primitives';
import { Button } from '../ui/button';
import { DataTable } from '../ui/data-table';
type TableRecord = RecordData & {
  displayName: string;
  detail: string;
  storeName: string;
  category: string;
  low: boolean;
  reorderLevel: number;
  value: number;
  unit: string;
  partyName: string;
};
export function exportCsv(
  rows: RecordData[],
  title: string,
  keys = ['number', 'name', 'status', 'date', 'purpose', 'amount', 'onHand'],
) {
  const escape = (v: unknown) =>
    `"${String(v ?? '')
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => escape(r[k])).join(','))].join(
    '\n',
  );
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
export function Register({
  module: m,
  pathOverride,
  filter,
}: {
  module: Module;
  pathOverride?: string;
  filter?: (r: RecordData) => boolean;
}) {
  const { user, siteId } = useSession();
  const path = pathOverride || m.path;
  const stock = m.resource === 'stock-balances',
    movement = m.resource === 'stock-ledger',
    materials = m.resource === 'items';
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(''),
    status: parseAsString.withDefault('all'),
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
    sort: parseAsString.withDefault('date'),
    direction: parseAsString.withDefault('desc'),
    dateFrom: parseAsString.withDefault(''),
    dateTo: parseAsString.withDefault(''),
    store: parseAsString.withDefault('all'),
  });
  const [drawer, setDrawer] = useState(false),
    [compact, setCompact] = useState(false),
    [selection, setSelection] = useState<RowSelectionState>({}),
    [visibility, setVisibility] = useState<VisibilityState>({});
  const query = useQuery({
    queryKey: [m.resource, user?.id],
    queryFn: () => dataClient.list(m.resource),
  });
  const refs = ['items', 'stores', 'vendors', 'contractors'];
  const referenceQueries = useQueries({
    queries: refs.map((resource) => ({
      queryKey: [resource, user?.id],
      queryFn: () => dataClient.list(resource),
      enabled:
        can(user, resource) &&
        ((resource === 'items' && (stock || movement)) ||
          (resource === 'stores' && (stock || movement)) ||
          (resource === 'vendors' && m.group === 'Purchasing') ||
          (resource === 'contractors' && m.group === 'Contractors')),
    })),
  });
  const reference = Object.fromEntries(refs.map((r, i) => [r, referenceQueries[i].data || []]));
  const records = (query.data || []).filter(
    (r) =>
      (!r.siteId ||
        r.siteId === siteId ||
        [
          'firms',
          'projects',
          'sites',
          'users',
          'items',
          'vendors',
          'contractors',
          'ledgers',
          'cost-codes',
        ].includes(m.resource)) &&
      (!filter || filter(r)),
  );
  const enriched: TableRecord[] = records.map((r) => {
    const item = reference.items.find((i) => i.id === r.itemId);
    return {
      ...r,
      displayName: text(item?.name || r.number || r.name),
      detail: text(item?.code || r.purpose || r.code || r.specifications || r.email),
      unit: text(item?.uom || r.uom),
      category: text(item?.category || r.category || r.group || r.role),
      storeName: text(reference.stores.find((s) => s.id === r.storeId)?.name),
      partyName: text(
        reference.vendors.find((v) => v.id === r.vendorId)?.name ||
          reference.contractors.find((c) => c.id === r.contractorId)?.name ||
          r.clientName,
      ),
      reorderLevel: Number(item?.reorderLevel || r.reorderLevel || 0),
      low: stock && Number(r.onHand) < Number(item?.reorderLevel || 0),
      value: stock
        ? Number(r.onHand || 0)
        : movement
          ? Number(r.qty || 0)
          : m.lines === 'voucher'
            ? (r.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0)
            : Number(r.amount ?? totals(r).net),
    };
  });
  const rows = enriched
    .filter(
      (r) =>
        Object.values(r)
          .filter((v) => typeof v === 'string')
          .join(' ')
          .toLowerCase()
          .includes(filters.q.toLowerCase()) &&
        (filters.status === 'all' ||
          (filters.status === 'low'
            ? r.low
            : filters.status === 'healthy'
              ? !r.low
              : r.status === filters.status)) &&
        (filters.store === 'all' || r.storeId === filters.store) &&
        (!filters.dateFrom || text(r.date || r.createdAt).slice(0, 10) >= filters.dateFrom) &&
        (!filters.dateTo || text(r.date || r.createdAt).slice(0, 10) <= filters.dateTo),
    )
    .sort((a, b) => {
      const key = filters.sort;
      let cmp = 0;
      if (['value', 'reserved', 'reorderLevel'].includes(key))
        cmp = Number(a[key] || 0) - Number(b[key] || 0);
      else
        cmp = text(
          key === 'record'
            ? a.displayName
            : key === 'date'
              ? a.updatedAt || a.createdAt || a.date
              : a[key],
        ).localeCompare(
          text(
            key === 'record'
              ? b.displayName
              : key === 'date'
                ? b.updatedAt || b.createdAt || b.date
                : b[key],
          ),
        );
      return filters.direction === 'desc' ? -cmp : cmp;
    });
  const pageSize = [10, 25, 50].includes(filters.pageSize) ? filters.pageSize : 10;
  const page = Math.min(Math.max(1, filters.page), Math.max(1, Math.ceil(rows.length / pageSize)));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('civil.return.' + path);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.url === location.pathname + location.search)
          requestAnimationFrame(() => window.scrollTo(0, saved.scroll));
      }
    } catch {}
  }, [path, query.isSuccess]);
  const selected = rows.filter((r) => selection[r.id]);
  const columnDefs = useMemo<ColumnDef<TableRecord>[]>(() => {
    const result: ColumnDef<TableRecord>[] = [
      {
        id: 'select',
        enableHiding: false,
        meta: { align: 'center' },
        header: ({ table }) => (
          <label className="table-checkbox">
            <input
              type="checkbox"
              aria-label="Select all rows on this page"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
            <span className="sr-only">Select page</span>
          </label>
        ),
        cell: ({ row }) => (
          <label className="table-checkbox">
            <input
              type="checkbox"
              aria-label={`Select ${row.original.displayName}`}
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
            <span className="sr-only">Select record</span>
          </label>
        ),
      },
      {
        id: 'record',
        enableHiding: false,
        header: m.document ? 'Document' : stock || movement || materials ? 'Material' : 'Name',
        meta: { align: 'left' },
        cell: ({ row: { original: r } }) => (
          <Link className="record-title" href={`${path}/${r.id}`}>
            <span>
              <strong>{r.displayName}</strong>
              <small>{r.detail || m.singular}</small>
            </span>
          </Link>
        ),
      },
    ];
    if (stock || materials)
      result.push({
        id: 'category',
        header: 'Category',
        meta: { align: 'left' },
        cell: ({ row: { original: r } }) => (
          <span className="category-label">{label(r.category) || 'General'}</span>
        ),
      });
    if (stock || movement)
      result.push({
        id: 'storeName',
        header: 'Store',
        meta: { align: 'left' },
        cell: ({ row: { original: r } }) => (
          <span className="store-cell">{r.storeName || '—'}</span>
        ),
      });
    if (m.document && m.group !== 'Site operations')
      result.push({
        id: 'partyName',
        header:
          m.group === 'Contractors'
            ? 'Contractor'
            : m.group === 'Purchasing'
              ? 'Vendor'
              : 'Reference',
        meta: { align: 'left' },
        cell: ({ row: { original: r } }) => r.partyName || text(r.type) || '—',
      });
    result.push({
      id: 'value',
      header: stock ? 'On hand' : movement ? 'Movement' : m.document ? 'Amount (INR)' : 'Details',
      meta: {
        align: 'left',
      },
      cell: ({ row: { original: r } }) =>
        stock || movement ? (
          <span className={`quantity-cell ${r.low ? 'quantity-low' : ''}`}>
            <strong>{qty(r.value)}</strong>
            <small>{r.unit}</small>
          </span>
        ) : m.document ? (
          <span className="amount-cell">{inr(r.value)}</span>
        ) : (
          <span className="cell-detail">
            {text(r.email || r.uom || r.clientName || r.group || r.role || '—')}
          </span>
        ),
    });
    if (stock) {
      result.push(
        {
          id: 'reserved',
          header: 'Reserved',
          meta: { align: 'left' },
          cell: ({ row: { original: r } }) => (
            <span className="quantity-cell secondary-quantity">
              <strong>{qty(r.reserved)}</strong>
              <small>{r.unit}</small>
            </span>
          ),
        },
        {
          id: 'reorderLevel',
          header: 'Reorder at',
          meta: { align: 'left' },
          cell: ({ row: { original: r } }) => (
            <span className="quantity-cell secondary-quantity">
              <strong>{qty(r.reorderLevel)}</strong>
              <small>{r.unit}</small>
            </span>
          ),
        },
      );
    }
    result.push({
      id: 'status',
      header: 'Status',
      meta: { align: 'left' },
      cell: ({ row: { original: r } }) => (
        <Badge status={stock ? (r.low ? 'low_stock' : 'in_stock') : r.status || 'active'} />
      ),
    });
    if (!stock)
      result.push({
        id: 'date',
        header: 'Last updated',
        meta: { align: 'left' },
        cell: ({ row: { original: r } }) => (
          <span className="date-cell">{day(r.updatedAt || r.createdAt || r.date)}</span>
        ),
      });
    result.push({
      id: 'open',
      enableHiding: false,
      header: '',
      meta: { align: 'center' },
      cell: ({ row: { original: r } }) => (
        <Link className="row-open" aria-label={`Open ${r.displayName}`} href={`${path}/${r.id}`}>
          <ArrowUpRight size={18} />
        </Link>
      ),
    });
    return result;
  }, [m, path, stock, movement, materials]);
  const filterCount = [
    filters.status !== 'all',
    !!filters.dateFrom,
    !!filters.dateTo,
    filters.store !== 'all',
  ].filter(Boolean).length;
  const statuses = stock
    ? ['all', 'low', 'healthy']
    : ['all', ...new Set(records.map((r) => r.status || 'active'))];
  const tabLabel = (s: string) =>
    s === 'all'
      ? stock
        ? 'All materials'
        : 'All records'
      : s === 'low'
        ? 'Low stock'
        : s === 'healthy'
          ? 'Healthy stock'
          : label(s);
  function sortBy(id: string) {
    setFilters({
      sort: id,
      direction: filters.sort === id && filters.direction === 'asc' ? 'desc' : 'asc',
      page: 1,
    });
  }
  const downloads = () =>
    exportCsv(
      selected.length ? selected : rows,
      m.title,
      stock
        ? [
            'displayName',
            'detail',
            'category',
            'storeName',
            'onHand',
            'reserved',
            'reorderLevel',
            'unit',
          ]
        : ['number', 'name', 'status', 'date', 'purpose', 'value', 'partyName'],
    );
  return (
    <>
      <PageHeader
        title={m.title}
        description={m.description}
        eyebrow={m.group}
        action={
          <>
            <Button variant="outline" onClick={downloads} disabled={!rows.length}>
              <DownloadSimple size={19} />
              Export{selected.length ? ` (${selected.length})` : ''}
            </Button>
            {stock && can(user, 'grn', 'create') ? (
              <Button asChild>
                <Link href="/inventory/grn/new">
                  <Plus size={19} />
                  Record receipt
                </Link>
              </Button>
            ) : !m.readonly && can(user, m.resource, 'create') ? (
              <Button asChild>
                <Link href={`${path}/new`}>
                  <Plus size={19} />
                  New {m.singular.toLowerCase()}
                </Link>
              </Button>
            ) : null}
          </>
        }
      />
      {stock ? (
        <div className="inventory-summary-cards">
          <div className="inventory-summary-card">
            <span className="summary-card-icon blue">
              <Cube size={22} weight="duotone" />
            </span>
            <div className="summary-card-content">
              <span className="summary-card-label">Tracked materials</span>
              <strong className="summary-card-value">
                {records.length.toString().padStart(2, '0')}
              </strong>
              <small className="summary-card-sub">Across the selected site</small>
            </div>
          </div>
          <div className="inventory-summary-card">
            <span className="summary-card-icon gold">
              <WarningCircle size={22} weight="duotone" />
            </span>
            <div className="summary-card-content">
              <span className="summary-card-label">Below reorder level</span>
              <strong className="summary-card-value">
                {enriched
                  .filter((r) => r.low)
                  .length.toString()
                  .padStart(2, '0')}
              </strong>
              <small className="summary-card-sub">Plan your next purchase</small>
            </div>
          </div>
          <div className="inventory-summary-card">
            <span className="summary-card-icon teal">
              <Package size={22} weight="duotone" />
            </span>
            <div className="summary-card-content">
              <span className="summary-card-label">Stores in this site</span>
              <strong className="summary-card-value">
                {new Set(records.map((r) => r.storeId)).size.toString().padStart(2, '0')}
              </strong>
              <small className="summary-card-sub">Active receipt points</small>
            </div>
          </div>
        </div>
      ) : m.document ? (
        <div className="register-summary">
          <span>
            <strong>{records.length}</strong>Total records
          </span>
          <span>
            <i className="dot gold" />
            <strong>{records.filter((r) => r.status === 'submitted').length}</strong>Awaiting review
          </span>
          <span>
            <i className="dot teal" />
            <strong>
              {
                records.filter((r) =>
                  ['approved', 'posted', 'fulfilled', 'paid'].includes(r.status || ''),
                ).length
              }
            </strong>
            Approved / completed
          </span>
        </div>
      ) : null}
      <section
        onClick={(event) => {
          const link = (event.target as HTMLElement).closest('a');
          if (link?.getAttribute('href')?.startsWith(path + '/')) {
            try {
              sessionStorage.setItem(
                'civil.return.' + path,
                JSON.stringify({
                  url: location.pathname + location.search,
                  scroll: window.scrollY,
                }),
              );
            } catch {}
          }
        }}
        className="register-table-wrapper"
      >
        <DataTable
          columns={columnDefs}
          data={pageRows}
          getRowId={(r) => r.id}
          caption={`${m.title}; sortable columns and selectable rows`}
          totalCount={rows.length}
          page={page}
          pageSize={pageSize}
          onPageChange={(p) => setFilters({ page: p })}
          onPageSizeChange={(s) => setFilters({ pageSize: s, page: 1 })}
          currentSort={filters.sort}
          currentDirection={filters.direction === 'asc' ? 'asc' : 'desc'}
          onSortBy={sortBy}
          searchQuery={filters.q}
          onSearchChange={(q) => setFilters({ q, page: 1 })}
          searchPlaceholder={
            stock ? 'Search material name or code…' : `Search ${m.title.toLowerCase()}…`
          }
          tabs={statuses.slice(0, 5).map((status) => ({
            id: status,
            label: tabLabel(status),
            count:
              status === 'all'
                ? records.length
                : status === 'low'
                  ? enriched.filter((r) => r.low).length
                  : status === 'healthy'
                    ? enriched.filter((r) => !r.low).length
                    : records.filter((r) => r.status === status).length,
          }))}
          activeTab={filters.status}
          onTabChange={(status) => setFilters({ status, page: 1 })}
          filterCount={filterCount}
          onOpenFilters={() => setDrawer(true)}
          columnVisibility={visibility}
          onColumnVisibilityChange={setVisibility}
          selectionMap={selection}
          onSelectionChange={setSelection}
          onExportSelected={downloads}
          onExportAll={downloads}
          density={compact ? 'compact' : 'comfortable'}
          onDensityChange={(d) => setCompact(d === 'compact')}
          isLoading={query.isLoading}
          emptyTitle="No matching records"
          emptyDescription="Try another search or clear your filters."
          emptyAction={
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ q: '', status: 'all', store: 'all', dateFrom: '', dateTo: '' })
              }
            >
              Clear filters
            </Button>
          }
          renderMobileCard={(r) => (
            <Link key={r.id} href={`${path}/${r.id}`} className="mobile-record">
              <div>
                <span className="record-number">
                  {text(r.number || r.detail || m.singular)}
                </span>
                <Badge
                  status={stock ? (r.low ? 'low_stock' : 'in_stock') : r.status || 'active'}
                />
              </div>
              <h3>{stock ? r.displayName : text(r.purpose) || r.displayName}</h3>
              {stock && (
                <p className="mobile-store">
                  {r.storeName} · {label(r.category)}
                </p>
              )}
              <div className="mobile-record-bottom">
                <span>
                  {stock
                    ? `Reorder at ${qty(r.reorderLevel)} ${r.unit}`
                    : day(r.date || r.createdAt)}
                </span>
                <strong className="number">
                  {stock || movement
                    ? `${qty(r.value)} ${r.unit}`
                    : m.document
                      ? inr(r.value)
                      : text(r.uom || r.email)}
                </strong>
                <ArrowUpRight size={18} />
              </div>
            </Link>
          )}
        />
      </section>
      <div className="table-footnote">
        <span>
          <span className="live-dot" />
          Live workspace data
        </span>
        <span>
          {stock
            ? 'Quantities are updated when receipts, issues, and transfers are posted.'
            : 'Changes are saved to your workspace and recorded in the audit trail.'}
        </span>
      </div>
      <Modal open={drawer} onOpenChange={setDrawer} title="Filter records">
        <div className="filter-fields">
          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value, page: 1 })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {tabLabel(s)}
                </option>
              ))}
            </select>
          </label>
          {stock && (
            <label>
              Store
              <select
                value={filters.store}
                onChange={(e) => setFilters({ store: e.target.value, page: 1 })}
              >
                <option value="all">All stores</option>
                {reference.stores.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            From date
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ dateFrom: e.target.value, page: 1 })}
            />
          </label>
          <label>
            To date
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ dateTo: e.target.value, page: 1 })}
            />
          </label>
          <Button
            variant="ghost"
            onClick={() =>
              setFilters({ status: 'all', dateFrom: '', dateTo: '', store: 'all', page: 1 })
            }
          >
            Clear filters
          </Button>
          <Button onClick={() => setDrawer(false)}>Apply filters</Button>
        </div>
      </Modal>
    </>
  );
}
