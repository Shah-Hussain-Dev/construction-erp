'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  Book,
  PencilSimple,
  Trash,
  Eye,
  MagnifyingGlass,
  CheckCircle,
  CurrencyInr,
  Printer,
  Scales,
  TrendUp,
  TrendDown,
  CaretRight,
  FolderOpen,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr, day } from '@/lib/format';
import type { RecordData } from '@/schemas';

interface LedgerRecord extends RecordData {
  name?: string;
  code?: string;
  group?: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense' | string;
  openingBalance?: number;
  openingType?: 'Dr' | 'Cr';
  description?: string;
  status?: string;
}

interface VoucherRecord extends RecordData {
  type?: string;
}

export function LedgersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<LedgerRecord | null>(null);
  const [statementLedger, setStatementLedger] = useState<LedgerRecord | null>(null);
  const [deletingLedger, setDeletingLedger] = useState<LedgerRecord | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formGroup, setFormGroup] = useState<'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'>('Asset');
  const [formSubGroup, setFormSubGroup] = useState('Bank Account');
  const [formOpeningBalance, setFormOpeningBalance] = useState<number>(0);
  const [formOpeningType, setFormOpeningType] = useState<'Dr' | 'Cr'>('Dr');
  const [formGstRate, setFormGstRate] = useState('None');
  const [formIsReconciled, setFormIsReconciled] = useState(false);
  const [formDescription, setFormDescription] = useState('');

  // Load Ledgers
  const { data: ledgers = [], isLoading: ledgersLoading } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => dataClient.list('ledgers') as Promise<LedgerRecord[]>,
  });

  // Load Vouchers to calculate running balances
  const { data: vouchers = [] } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => dataClient.list('vouchers') as Promise<VoucherRecord[]>,
  });

  // Calculate Balances for each Ledger
  const ledgerMetrics = useMemo(() => {
    const drMap = new Map<string, number>();
    const crMap = new Map<string, number>();

    vouchers.forEach((v) => {
      if (v.status !== 'posted') return;
      (v.lines || []).forEach((l) => {
        if (!l.accountId) return;
        const curDr = drMap.get(l.accountId) || 0;
        const curCr = crMap.get(l.accountId) || 0;
        drMap.set(l.accountId, curDr + Number(l.debit || 0));
        crMap.set(l.accountId, curCr + Number(l.credit || 0));
      });
    });

    return { drMap, crMap };
  }, [vouchers]);

  // Open modal for Create
  const handleOpenAdd = () => {
    setFormName('');
    setFormCode(`ACC-${String(ledgers.length + 1).padStart(3, '0')}`);
    setFormGroup('Asset');
    setFormSubGroup('Bank Account');
    setFormOpeningBalance(0);
    setFormOpeningType('Dr');
    setFormGstRate('None');
    setFormIsReconciled(false);
    setFormDescription('');
    setIsAddOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (l: LedgerRecord) => {
    setEditingLedger(l);
    setFormName(l.name || '');
    setFormCode(l.code || '');
    setFormGroup((l.group as any) || 'Asset');
    setFormSubGroup((l as any).subGroup || 'General Account');
    setFormOpeningBalance(Number(l.openingBalance || 0));
    setFormOpeningType(l.openingType || 'Dr');
    setFormGstRate((l as any).gstRate || 'None');
    setFormIsReconciled(Boolean((l as any).isReconciled));
    setFormDescription(l.description || '');
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newLedger: Partial<LedgerRecord>) =>
      dataClient.create('ledgers', newLedger as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      setIsAddOpen(false);
      toast.success('Ledger account created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create ledger account');
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LedgerRecord> }) =>
      dataClient.update('ledgers', id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      setEditingLedger(null);
      toast.success('Ledger account updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update ledger');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataClient.delete('ledgers', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledgers'] });
      setDeletingLedger(null);
      toast.success('Ledger account deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete ledger');
    },
  });

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Account name is required');
      return;
    }
    if (!formCode.trim()) {
      toast.error('Account code is required');
      return;
    }

    createMutation.mutate({
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      group: formGroup,
      subGroup: formSubGroup,
      openingBalance: Number(formOpeningBalance || 0),
      openingType: formOpeningType,
      gstRate: formGstRate,
      isReconciled: formIsReconciled,
      description: formDescription.trim(),
      status: 'active',
    } as any);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLedger?.id) return;
    if (!formName.trim()) {
      toast.error('Account name is required');
      return;
    }

    editMutation.mutate({
      id: editingLedger.id,
      data: {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        group: formGroup,
        subGroup: formSubGroup,
        openingBalance: Number(formOpeningBalance || 0),
        openingType: formOpeningType,
        gstRate: formGstRate,
        isReconciled: formIsReconciled,
        description: formDescription.trim(),
      } as any,
    });
  };

  // Filtered Ledgers
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((l) => {
      const matchSearch =
        !search ||
        (l.name && l.name.toLowerCase().includes(search.toLowerCase())) ||
        (l.code && l.code.toLowerCase().includes(search.toLowerCase())) ||
        (l.group && l.group.toLowerCase().includes(search.toLowerCase()));

      const matchGroup = groupFilter === 'all' || l.group === groupFilter;

      return matchSearch && matchGroup;
    });
  }, [ledgers, search, groupFilter]);

  // Statement rows for selected ledger
  const statementEntries = useMemo(() => {
    if (!statementLedger?.id) return [];
    const id = statementLedger.id;
    const isAssetOrExpense = ['Asset', 'Expense'].includes(statementLedger.group || '');

    const entries: Array<{
      id: string;
      date: string;
      number: string;
      type: string;
      narration: string;
      debit: number;
      credit: number;
      runningBalance: number;
    }> = [];

    let currentBal =
      (statementLedger.openingType === 'Dr' ? 1 : -1) *
      Number(statementLedger.openingBalance || 0);

    const sortedVouchers = [...vouchers]
      .filter((v) => v.status === 'posted')
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    sortedVouchers.forEach((v) => {
      (v.lines || []).forEach((l) => {
        if (l.accountId === id) {
          const dr = Number(l.debit || 0);
          const cr = Number(l.credit || 0);
          currentBal += dr - cr;
          entries.push({
            id: v.id + '-' + l.id,
            date: v.date || '',
            number: v.number || 'VCH',
            type: v.type?.toUpperCase() || 'JOURNAL',
            narration: v.purpose || 'No narration',
            debit: dr,
            credit: cr,
            runningBalance: isAssetOrExpense ? currentBal : -currentBal,
          });
        }
      });
    });

    return entries;
  }, [statementLedger, vouchers]);

  // Export Chart of Accounts CSV
  const handleExportCsv = () => {
    const keys = ['Account Code', 'Account Name', 'Group', 'Total Debits (INR)', 'Total Credits (INR)', 'Current Balance (INR)'];
    const rows = filteredLedgers.map((l) => {
      const dr = ledgerMetrics.drMap.get(l.id || '') || 0;
      const cr = ledgerMetrics.crMap.get(l.id || '') || 0;
      const isAssetOrExpense = ['Asset', 'Expense'].includes(l.group || '');
      const bal = isAssetOrExpense ? dr - cr : cr - dr;
      return [
        l.code || '',
        l.name || '',
        l.group || '',
        dr,
        cr,
        bal,
      ];
    });

    const escape = (val: any) => `"${String(val).replaceAll('"', '""')}"`;
    const csv = [keys.map(escape).join(','), ...rows.map((r) => r.map(escape).join(',')),].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chart_of_Accounts_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Chart of accounts exported to CSV');
  };

  // Table Columns
  const columns = useMemo<ColumnDef<LedgerRecord>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Account Name & Code',
        cell: ({ row }) => {
          const l = row.original;
          const groupTone =
            l.group === 'Asset'
              ? 'text-blue-600 bg-blue-50 border-blue-100'
              : l.group === 'Liability'
                ? 'text-amber-600 bg-amber-50 border-amber-100'
                : l.group === 'Equity'
                  ? 'text-purple-600 bg-purple-50 border-purple-100'
                  : l.group === 'Income'
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    : 'text-rose-600 bg-rose-50 border-rose-100';

          return (
            <div className="flex items-center gap-3 py-1">
              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${groupTone}`}>
                <Book size={18} weight="duotone" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setStatementLedger(l)}
                  className="font-semibold text-slate-900 hover:text-blue-600 text-left flex items-center gap-1.5"
                >
                  <span>{l.name}</span>
                  <CaretRight size={12} className="text-slate-400" />
                </button>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  {l.code || 'ACC-XXX'} {l.description && `• ${l.description}`}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'group',
        header: 'Account Classification',
        cell: ({ row }) => {
          const g = row.original.group || 'Asset';
          const tone =
            g === 'Asset'
              ? 'info'
              : g === 'Liability'
                ? 'warning'
                : g === 'Income'
                  ? 'success'
                  : g === 'Expense'
                    ? 'danger'
                    : 'neutral';

          return <Badge tone={tone as any}>{g}</Badge>;
        },
      },
      {
        id: 'turnover',
        header: () => <div className="text-right">Period Debits / Credits</div>,
        cell: ({ row }) => {
          const l = row.original;
          const dr = ledgerMetrics.drMap.get(l.id || '') || 0;
          const cr = ledgerMetrics.crMap.get(l.id || '') || 0;
          return (
            <div className="text-right text-xs">
              <div className="text-emerald-700 font-mono">Dr: {inr(dr)}</div>
              <div className="text-rose-700 font-mono mt-0.5">Cr: {inr(cr)}</div>
            </div>
          );
        },
      },
      {
        id: 'balance',
        header: () => <div className="text-right">Net Balance (INR)</div>,
        cell: ({ row }) => {
          const l = row.original;
          const dr = ledgerMetrics.drMap.get(l.id || '') || 0;
          const cr = ledgerMetrics.crMap.get(l.id || '') || 0;
          const isAssetOrExpense = ['Asset', 'Expense'].includes(l.group || '');
          const net = isAssetOrExpense ? dr - cr : cr - dr;

          return (
            <div className="text-right">
              <div
                className={`font-mono font-bold text-sm ${
                  net < 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {inr(Math.abs(net))} {net >= 0 ? (isAssetOrExpense ? 'Dr' : 'Cr') : isAssetOrExpense ? 'Cr' : 'Dr'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Calculated from posted vouchers</div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2 text-slate-700 hover:bg-slate-50"
                onClick={() => setStatementLedger(l)}
                title="View Full Ledger Statement"
              >
                Statement
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => handleOpenEdit(l)}
                title="Edit Account"
              >
                <PencilSimple size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                onClick={() => setDeletingLedger(l)}
                title="Delete Account"
              >
                <Trash size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    [ledgerMetrics]
  );

  // Group Counts
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Asset: 0,
      Liability: 0,
      Equity: 0,
      Income: 0,
      Expense: 0,
    };
    ledgers.forEach((l) => {
      const g = l.group || 'Asset';
      if (counts[g] !== undefined) counts[g]++;
    });
    return counts;
  }, [ledgers]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Chart of Accounts & General Ledgers"
        eyebrow="FINANCE & ACCOUNTING"
        description="Comprehensive master chart of accounts: Asset, Liability, Equity, Income, and Expense classifications with drill-down ledger statements."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <DownloadSimple size={16} className="mr-1.5" />
              Export Chart
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus size={16} className="mr-1.5" />
              New Account Ledger
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Assets ({groupCounts.Asset})
          </span>
          <div className="mt-1.5 text-lg font-bold text-blue-700">
            Cash, Bank & Stock
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Resources owned</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Liabilities ({groupCounts.Liability})
          </span>
          <div className="mt-1.5 text-lg font-bold text-amber-700">
            Payables & Retainage
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Amounts owed to parties</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Equity ({groupCounts.Equity})
          </span>
          <div className="mt-1.5 text-lg font-bold text-purple-700">
            Capital & Reserves
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Owner equity & surplus</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Income ({groupCounts.Income})
          </span>
          <div className="mt-1.5 text-lg font-bold text-emerald-700">
            Project Revenue
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Certified client billings</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Expenses ({groupCounts.Expense})
          </span>
          <div className="mt-1.5 text-lg font-bold text-rose-700">
            Materials & Labor
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Site execution costs</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search accounts by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Groups</option>
            <option value="Asset">Assets</option>
            <option value="Liability">Liabilities</option>
            <option value="Equity">Equity</option>
            <option value="Income">Income / Revenue</option>
            <option value="Expense">Direct & Indirect Expenses</option>
          </select>

          {(search || groupFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setGroupFilter('all');
              }}
              className="text-slate-500 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {ledgersLoading ? (
          <div className="p-8 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredLedgers.length === 0 ? (
          <Empty
            title="No ledger accounts found"
            description="Create your chart of accounts to organize financial balances."
          >
            <div className="mt-4">
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus size={16} className="mr-1.5" />
                Add First Ledger
              </Button>
            </div>
          </Empty>
        ) : (
          <DataTable
            data={filteredLedgers}
            columns={columns}
            pageSize={10}
            totalCount={filteredLedgers.length}
          />
        )}
      </div>

      {/* Modal: Add / Edit Ledger */}
      {(isAddOpen || editingLedger) && (
        <Modal
          size="lg"
          title={isAddOpen ? 'Add Master Ledger Account' : `Edit Ledger · ${editingLedger?.name}`}
          open={isAddOpen || Boolean(editingLedger)}
          onClose={() => {
            setIsAddOpen(false);
            setEditingLedger(null);
          }}
        >
          <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
            {/* Group 1: Identity & Classification */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Book size={14} className="text-blue-600" />
                Account Particulars & Master Hierarchy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Head Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Operating Current Account"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BANK-HDFC-01"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Balance Sheet / P&L Group <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formGroup}
                    onChange={(e) => {
                      const grp = e.target.value as any;
                      setFormGroup(grp);
                      if (grp === 'Asset') setFormSubGroup('Bank Account');
                      else if (grp === 'Liability') setFormSubGroup('Sundry Creditors (Trade)');
                      else if (grp === 'Equity') setFormSubGroup('Capital Reserves');
                      else if (grp === 'Income') setFormSubGroup('Contract Revenue');
                      else if (grp === 'Expense') setFormSubGroup('Direct Construction Material');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="Asset">Asset (Cash, Bank, Receivables, Fixed Assets)</option>
                    <option value="Liability">Liability (Payables, Loans, Retentions, Taxes)</option>
                    <option value="Equity">Equity (Capital, Retained Earnings)</option>
                    <option value="Income">Income (Contract Revenue, Scrap & Recoveries)</option>
                    <option value="Expense">Expense (Direct Materials, Labor, Overheads)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sub-Classification Head
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Current Bank Account, Trade Creditors..."
                    value={formSubGroup}
                    onChange={(e) => setFormSubGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Opening Balance, Statutory Taxes & BRS */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scales size={14} className="text-emerald-600" />
                Financial Balance & Statutory Compliance
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opening Financial Balance
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={formOpeningBalance || ''}
                      onChange={(e) => setFormOpeningBalance(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0.00"
                    />
                    <select
                      value={formOpeningType}
                      onChange={(e) => setFormOpeningType(e.target.value as any)}
                      className="px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg bg-white text-slate-900"
                    >
                      <option value="Dr">Dr (Debit)</option>
                      <option value="Cr">Cr (Credit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GST / Statutory Tax Rate
                  </label>
                  <select
                    value={formGstRate}
                    onChange={(e) => setFormGstRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="None">None / Not Applicable</option>
                    <option value="GST 0%">GST 0% (Exempt Materials)</option>
                    <option value="GST 5%">GST 5% (Aggregates, Sand, Earthwork)</option>
                    <option value="GST 12%">GST 12% (Government Works Contracts)</option>
                    <option value="GST 18%">GST 18% (Commercial Construction, Steel, Plant)</option>
                    <option value="GST 28%">GST 28% (Cement OPC/PPC, Heavy Equipment)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ledger Description / Operational Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="Operational accounting guidance or notes for this head..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reconcile-check"
                  checked={formIsReconciled}
                  onChange={(e) => setFormIsReconciled(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="reconcile-check" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Enable automated Bank Reconciliation Statement (BRS) tracking for this account
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingLedger(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || editMutation.isPending}
              >
                {createMutation.isPending || editMutation.isPending
                  ? 'Saving to Ledger...'
                  : isAddOpen
                    ? 'Create Master Ledger'
                    : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Full Ledger Statement Drill-Down */}
      {statementLedger && (
        <Modal
          size="xl"
          title={`Statement of Account · ${statementLedger.name}`}
          open={Boolean(statementLedger)}
          onClose={() => setStatementLedger(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {statementLedger.name}
                </span>
                <span className="font-mono text-slate-500">
                  Code: {statementLedger.code} • Group: {statementLedger.group}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Opening Balance</span>
                <span className="font-mono font-semibold text-slate-800">
                  {inr(statementLedger.openingBalance || 0)} {statementLedger.openingType || 'Dr'}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs max-h-80 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Voucher</th>
                    <th className="p-2.5">Particulars / Narration</th>
                    <th className="p-2.5 text-right w-24">Debit (INR)</th>
                    <th className="p-2.5 text-right w-24">Credit (INR)</th>
                    <th className="p-2.5 text-right w-28">Balance (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statementEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        No transactions posted against this ledger account yet.
                      </td>
                    </tr>
                  ) : (
                    statementEntries.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60">
                        <td className="p-2.5 text-slate-600 font-mono">{day(e.date)}</td>
                        <td className="p-2.5 font-semibold text-blue-600 font-mono">{e.number}</td>
                        <td className="p-2.5 text-slate-800 truncate max-w-xs" title={e.narration}>
                          {e.narration}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-900">
                          {e.debit > 0 ? inr(e.debit) : '—'}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-900">
                          {e.credit > 0 ? inr(e.credit) : '—'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                          {inr(Math.abs(e.runningBalance))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 font-mono">
                Total Transactions: {statementEntries.length}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setStatementLedger(null)}>
                  Close
                </Button>
                <Button onClick={() => window.print()}>
                  <Printer size={16} className="mr-1.5" />
                  Print Statement
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingLedger && (
        <Modal
          title="Delete Ledger Account"
          open={Boolean(deletingLedger)}
          onClose={() => setDeletingLedger(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete ledger{' '}
              <strong className="text-slate-900">{deletingLedger.name}</strong> (
              <span className="font-mono text-xs">{deletingLedger.code}</span>)?
            </p>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDeletingLedger(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (deletingLedger.id) {
                    deleteMutation.mutate(deletingLedger.id);
                  }
                }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
