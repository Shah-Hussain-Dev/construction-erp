'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  ArrowsClockwise,
  CaretRight,
  ArrowUpRight,
} from '@phosphor-icons/react';
import { PageHeader } from '../shell';
import { DataTable } from '../ui/data-table';
import { Badge } from '../ui/primitives';

export interface ModuleScaffoldProps {
  category: string;
  categoryHref?: string;
  title: string;
  description: string;
  moduleCode: string;
  searchPlaceholder?: string;
  stats?: {
    label: string;
    value: string | number;
    sub?: string;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  tableColumns?: string[];
  mockRows?: Record<string, any>[];
  recordActionLabel?: string;
}

export function ModuleScaffold({
  category,
  categoryHref,
  title,
  description,
  moduleCode,
  searchPlaceholder = 'Search records by name, code, or date...',
  stats = [
    { label: 'Total Records', value: '0', sub: 'Configured in system' },
    { label: 'Active', value: '0', sub: 'Ready for operations' },
    { label: 'Pending Review', value: '0', sub: 'Needs verification' },
    { label: 'Updated Today', value: 'Just now', sub: 'System sync' },
  ],
  tableColumns = ['Code', 'Title / Description', 'Assigned Site', 'Status', 'Last Modified', 'Actions'],
  mockRows = [],
  recordActionLabel = 'New Record',
}: ModuleScaffoldProps) {
  // Find if there is a status column
  const statusCol = useMemo(() => {
    return tableColumns.find((c) =>
      ['status', 'filing status', 'audited status', 'critical path status'].includes(
        c.toLowerCase(),
      ),
    );
  }, [tableColumns]);

  // Derive status tabs
  const { tabs, statusMap } = useMemo(() => {
    if (!statusCol || mockRows.length === 0) {
      return {
        tabs: [{ id: 'all', label: 'All records', count: mockRows.length }],
        statusMap: {} as Record<string, string>,
      };
    }

    const counts: Record<string, number> = {};
    const map: Record<string, string> = {};

    mockRows.forEach((row) => {
      const raw = String(row[statusCol] || 'Active').trim();
      const tabId = raw.toLowerCase().replace(/\s+/g, '-');
      counts[tabId] = (counts[tabId] || 0) + 1;
      map[tabId] = raw;
    });

    const tabList = [{ id: 'all', label: 'All records', count: mockRows.length }];
    Object.entries(counts).forEach(([tabId, count]) => {
      tabList.push({
        id: tabId,
        label: map[tabId] || tabId,
        count,
      });
    });

    return { tabs: tabList, statusMap: map };
  }, [mockRows, statusCol]);

  const [activeTab, setActiveTab] = useState('all');

  // Filter rows by activeTab
  const displayedRows = useMemo(() => {
    if (activeTab === 'all' || !statusCol) return mockRows;
    return mockRows.filter((row) => {
      const raw = String(row[statusCol] || 'Active').trim();
      const tabId = raw.toLowerCase().replace(/\s+/g, '-');
      return tabId === activeTab;
    });
  }, [mockRows, activeTab, statusCol]);

  // Dynamic Column Definitions
  const columns = useMemo<ColumnDef<Record<string, any>, unknown>[]>(() => {
    const defs: ColumnDef<Record<string, any>, unknown>[] = [
      {
        id: 'select',
        enableHiding: false,
        header: ({ table }) => (
          <label className="table-checkbox">
            <input
              type="checkbox"
              aria-label="Select all rows on this page"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
            <span className="sr-only">Select all</span>
          </label>
        ),
        cell: ({ row }) => (
          <label className="table-checkbox">
            <input
              type="checkbox"
              aria-label={`Select row ${row.index + 1}`}
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
            <span className="sr-only">Select</span>
          </label>
        ),
        meta: { align: 'center' },
      },
    ];

    tableColumns.forEach((col, index) => {
      const lower = col.toLowerCase();
      const isFirst = index === 0;
      const isStatus = ['status', 'filing status', 'audited status', 'critical path status'].includes(lower);
      const isAction = lower === 'actions' || lower === 'action';
      const isNumeric = [
        'amount', 'budget', 'spent', 'remaining', 'committed', 'variance',
        'qty', 'quantity', 'balance', 'tax', 'deduction', 'net', 'gross',
        'completion', 'manpower', 'count', 'rate', 'price', 'inr'
      ].some((kw) => lower.includes(kw));
      const isDate = lower.includes('date');

      if (isAction) {
        defs.push({
          id: col,
          header: col,
          meta: { align: 'center' },
          cell: () => (
            <button
              type="button"
              className="row-open"
              title="View record details"
              aria-label="View record details"
            >
              <ArrowUpRight size={18} />
            </button>
          ),
        });
        return;
      }

      if (isStatus) {
        defs.push({
          id: col,
          header: col,
          meta: { align: 'left' },
          cell: ({ row }) => <Badge status={row.original[col]} />,
        });
        return;
      }

      if (isNumeric) {
        defs.push({
          id: col,
          header: col,
          meta: { align: 'right' },
          cell: ({ row }) => (
            <span className="amount-cell">{row.original[col] ?? '—'}</span>
          ),
        });
        return;
      }

      if (isDate) {
        defs.push({
          id: col,
          header: col,
          meta: { align: 'left' },
          cell: ({ row }) => (
            <span className="date-cell">{row.original[col] ?? '—'}</span>
          ),
        });
        return;
      }

      defs.push({
        id: col,
        header: col,
        meta: { align: 'left' },
        cell: ({ row }) => {
          const val = row.original[col] ?? '—';
          if (isFirst) {
            return (
              <strong className="text-slate-900 font-semibold">{val}</strong>
            );
          }
          return <span className="cell-detail">{val}</span>;
        },
      });
    });

    // If no action column was explicitly in tableColumns, append standard open action column
    const hasActionCol = tableColumns.some((c) =>
      ['actions', 'action'].includes(c.toLowerCase()),
    );
    if (!hasActionCol) {
      defs.push({
        id: 'open',
        enableHiding: false,
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <button
            type="button"
            className="row-open"
            title="Open record"
            aria-label={`Open record ${row.index + 1}`}
          >
            <ArrowUpRight size={18} />
          </button>
        ),
      });
    }

    return defs;
  }, [tableColumns]);

  const handleExportAll = () => {
    if (!mockRows.length) return;
    const headers = tableColumns.filter((c) => !['actions', 'action'].includes(c.toLowerCase())).join(',');
    const lines = mockRows.map((r) =>
      tableColumns
        .filter((c) => !['actions', 'action'].includes(c.toLowerCase()))
        .map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    const csvContent = [headers, ...lines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleCode.toLowerCase()}-records.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="module-scaffold-container">
      {/* Breadcrumb Navigation */}
      <nav className="scaffold-breadcrumb" aria-label="Breadcrumb">
        <Link href="/" className="crumb-link">
          Dashboard
        </Link>
        <CaretRight size={12} className="crumb-separator" />
        <span className="crumb-category">{category}</span>
        <CaretRight size={12} className="crumb-separator" />
        <span className="crumb-current">{title}</span>
      </nav>

      {/* Standard ERP Page Header */}
      <PageHeader
        eyebrow={`${category.toUpperCase()} · ${moduleCode}`}
        title={title}
        description={description}
        action={
          <div className="scaffold-header-actions">
            <button
              type="button"
              className="btn btn-outline"
              title="Refresh records"
              onClick={() => setActiveTab('all')}
            >
              <ArrowsClockwise size={16} />
              <span className="btn-label-desktop">Refresh</span>
            </button>
            <button
              type="button"
              className="btn btn-outline"
              title="Export as CSV"
              onClick={handleExportAll}
            >
              <DownloadSimple size={16} />
              <span className="btn-label-desktop">Export</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              title={`Create ${recordActionLabel}`}
            >
              <Plus size={16} weight="bold" />
              <span>{recordActionLabel}</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="scaffold-stats-strip">
        {stats.map((st, idx) => (
          <div key={idx} className="scaffold-stat-card">
            <span className="scaffold-stat-label">{st.label}</span>
            <strong className="scaffold-stat-value">{st.value}</strong>
            {st.sub && <small className="scaffold-stat-sub">{st.sub}</small>}
          </div>
        ))}
      </div>

      {/* Unified Enterprise Data Table */}
      <div className="scaffold-table-panel">
        <DataTable
          columns={columns}
          data={displayedRows}
          getRowId={(r) =>
            r.id ||
            r['Task ID'] ||
            r['Bill No'] ||
            r['Cost Code'] ||
            r['Code'] ||
            r['Document No'] ||
            r['Voucher No'] ||
            r['Client Code'] ||
            r['MB Entry No'] ||
            r['Circular No'] ||
            JSON.stringify(r)
          }
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchPlaceholder={searchPlaceholder}
          onExportAll={handleExportAll}
          emptyTitle={`${title} Module Ready`}
          emptyDescription="This route is registered and ready in your ERP workspace. Full forms, multi-level approvals, and custom workflow tables will be connected here."
          emptyAction={
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '12px' }}
            >
              <Plus size={16} weight="bold" />
              <span>Create First {recordActionLabel}</span>
            </button>
          }
        />
      </div>
    </div>
  );
}
