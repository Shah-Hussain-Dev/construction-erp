'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  Receipt,
  Book,
  PencilSimple,
  Trash,
  Eye,
  MagnifyingGlass,
  CheckCircle,
  CurrencyInr,
  Printer,
  ArrowsLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Scales,
  Clock,
  WarningCircle,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr, day } from '@/lib/format';
import type { RecordData } from '@/schemas';

interface VoucherRecord extends RecordData {
  type?: 'payment' | 'receipt' | 'journal' | 'contra';
  referenceNo?: string;
}

interface LedgerRecord extends RecordData {
  name?: string;
  code?: string;
  group?: string;
}

export function VouchersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'payment' | 'receipt' | 'journal' | 'contra'>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherRecord | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<VoucherRecord | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<VoucherRecord | null>(null);
  const [slipVoucher, setSlipVoucher] = useState<VoucherRecord | null>(null);

  // Form State
  const [formType, setFormType] = useState<'payment' | 'receipt' | 'journal' | 'contra'>('payment');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formReferenceNo, setFormReferenceNo] = useState('');
  const [formFirmId, setFormFirmId] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formLines, setFormLines] = useState<Array<{ id: string; accountId: string; debit: number; credit: number; description?: string }>>([
    { id: '1', accountId: '', debit: 0, credit: 0, description: '' },
    { id: '2', accountId: '', debit: 0, credit: 0, description: '' },
  ]);

  // Load Vouchers
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => dataClient.list('vouchers') as Promise<VoucherRecord[]>,
  });

  // Load Ledgers for Account Dropdown
  const { data: ledgers = [] } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => dataClient.list('ledgers') as Promise<LedgerRecord[]>,
  });

  // Load Firms & Projects
  const { data: firms = [] } = useQuery({
    queryKey: ['firms'],
    queryFn: () => dataClient.list('firms') as Promise<any[]>,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => dataClient.list('projects') as Promise<any[]>,
  });

  // Ledger Lookup Map
  const ledgerMap = useMemo(() => {
    const map = new Map<string, LedgerRecord>();
    ledgers.forEach((l) => {
      if (l.id) map.set(l.id, l);
    });
    return map;
  }, [ledgers]);

  // Calculate Form Totals
  const totalDebits = useMemo(
    () => formLines.reduce((sum, l) => sum + Number(l.debit || 0), 0),
    [formLines]
  );
  const totalCredits = useMemo(
    () => formLines.reduce((sum, l) => sum + Number(l.credit || 0), 0),
    [formLines]
  );
  const balanceDifference = Math.abs(totalDebits - totalCredits);
  const isBalanced = totalDebits > 0 && totalDebits === totalCredits;

  // Open modal for Create
  const handleOpenAdd = () => {
    const defaultAcc1 = ledgers[0]?.id || '';
    const defaultAcc2 = ledgers[1]?.id || '';
    setFormType('payment');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormReferenceNo(`REF-${Date.now().toString().slice(-5)}`);
    setFormFirmId(firms[0]?.id || '');
    setFormProjectId(projects[0]?.id || '');
    setFormPurpose('');
    setFormLines([
      { id: '1', accountId: defaultAcc1, debit: 0, credit: 0, description: '' },
      { id: '2', accountId: defaultAcc2, debit: 0, credit: 0, description: '' },
    ]);
    setIsAddOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (v: VoucherRecord) => {
    setEditingVoucher(v);
    setFormType(v.type || 'payment');
    setFormDate(v.date || new Date().toISOString().slice(0, 10));
    setFormReferenceNo(v.referenceNo || '');
    setFormFirmId((v as any).firmId || firms[0]?.id || '');
    setFormProjectId((v as any).projectId || projects[0]?.id || '');
    setFormPurpose(v.purpose || '');
    setFormLines(
      (v.lines || []).map((l, i) => ({
        id: l.id || String(i + 1),
        accountId: l.accountId || '',
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
        description: (l as any).description || '',
      }))
    );
  };

  // Add line to form
  const handleAddLine = () => {
    setFormLines((prev) => [
      ...prev,
      { id: String(Date.now()), accountId: ledgers[0]?.id || '', debit: 0, credit: 0, description: '' },
    ]);
  };

  // Remove line from form
  const handleRemoveLine = (idx: number) => {
    if (formLines.length <= 2) {
      toast.error('A voucher requires at least two lines for double entry');
      return;
    }
    setFormLines((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update line field
  const handleLineChange = (
    index: number,
    field: 'accountId' | 'debit' | 'credit' | 'description',
    value: string | number
  ) => {
    setFormLines((prev) => {
      const next = [...prev];
      if (field === 'debit') {
        const d = Number(value) || 0;
        next[index] = { ...next[index], debit: d, credit: d > 0 ? 0 : next[index].credit };
      } else if (field === 'credit') {
        const c = Number(value) || 0;
        next[index] = { ...next[index], credit: c, debit: c > 0 ? 0 : next[index].debit };
      } else if (field === 'accountId') {
        next[index] = { ...next[index], accountId: String(value) };
      } else if (field === 'description') {
        next[index] = { ...next[index], description: String(value) };
      }
      return next;
    });
  };

  // Auto-Balance Helper: fills remaining difference on last line
  const handleAutoBalance = () => {
    if (formLines.length < 2) return;
    const lastIdx = formLines.length - 1;
    const diff = totalDebits - totalCredits;
    if (diff === 0) return;

    setFormLines((prev) => {
      const next = [...prev];
      if (diff > 0) {
        // Debits > Credits -> add diff to last line's credit
        next[lastIdx] = { ...next[lastIdx], credit: (next[lastIdx].credit || 0) + diff, debit: 0 };
      } else {
        // Credits > Debits -> add |diff| to last line's debit
        next[lastIdx] = { ...next[lastIdx], debit: (next[lastIdx].debit || 0) + Math.abs(diff), credit: 0 };
      }
      return next;
    });
    toast.success('Voucher balanced automatically');
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newVoucher: Partial<VoucherRecord>) =>
      dataClient.create('vouchers', newVoucher as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      setIsAddOpen(false);
      toast.success('Double-entry voucher posted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to post voucher');
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoucherRecord> }) =>
      dataClient.update('vouchers', id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      setEditingVoucher(null);
      toast.success('Voucher updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update voucher');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataClient.delete('vouchers', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      setDeletingVoucher(null);
      toast.success('Voucher reversed / deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete voucher');
    },
  });

  // Post Draft Voucher Mutation
  const postDraftMutation = useMutation({
    mutationFn: (v: VoucherRecord) =>
      dataClient.update('vouchers', v.id!, {
        ...v,
        status: 'posted',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      toast.success('Voucher posted to General Ledger');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to post voucher');
    },
  });

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPurpose.trim()) {
      toast.error('Narration / purpose is required');
      return;
    }
    if (!isBalanced) {
      toast.error(`Voucher is unbalanced. Difference: ${inr(balanceDifference)}`);
      return;
    }
    for (const l of formLines) {
      if (!l.accountId) {
        toast.error('Choose an account on every voucher line');
        return;
      }
    }

    createMutation.mutate({
      type: formType,
      number: `VCH-26-${String(vouchers.length + 1).padStart(4, '0')}`,
      date: formDate,
      referenceNo: formReferenceNo.trim(),
      purpose: formPurpose.trim(),
      firmId: formFirmId || undefined,
      projectId: formProjectId || undefined,
      status: 'posted',
      lines: formLines.map((l) => ({
        id: l.id,
        accountId: l.accountId,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
        description: l.description?.trim() || undefined,
      })),
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher?.id) return;
    if (!formPurpose.trim()) {
      toast.error('Narration / purpose is required');
      return;
    }
    if (!isBalanced) {
      toast.error(`Voucher is unbalanced. Difference: ${inr(balanceDifference)}`);
      return;
    }
    for (const l of formLines) {
      if (!l.accountId) {
        toast.error('Choose an account on every voucher line');
        return;
      }
    }

    editMutation.mutate({
      id: editingVoucher.id,
      data: {
        type: formType,
        date: formDate,
        referenceNo: formReferenceNo.trim(),
        purpose: formPurpose.trim(),
        firmId: formFirmId || undefined,
        projectId: formProjectId || undefined,
        lines: formLines.map((l) => ({
          id: l.id,
          accountId: l.accountId,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
          description: l.description?.trim() || undefined,
        })),
      },
    });
  };

  // Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch =
        !search ||
        (v.number && v.number.toLowerCase().includes(search.toLowerCase())) ||
        (v.purpose && v.purpose.toLowerCase().includes(search.toLowerCase())) ||
        (v.referenceNo && v.referenceNo.toLowerCase().includes(search.toLowerCase())) ||
        (v.lines || []).some((l) =>
          ledgerMap.get(l.accountId || '')?.name?.toLowerCase().includes(search.toLowerCase())
        );

      const matchType = typeFilter === 'all' || v.type === typeFilter;
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [vouchers, search, typeFilter, statusFilter, ledgerMap]);

  // Export CSV
  const handleExportCsv = () => {
    const keys = ['Voucher No', 'Date', 'Type', 'Narration', 'Reference No', 'Total Amount (INR)', 'Status'];
    const rows = filteredVouchers.map((v) => {
      const totalAmt = (v.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
      return [
        v.number || '',
        v.date || '',
        v.type?.toUpperCase() || '',
        v.purpose || '',
        v.referenceNo || '',
        totalAmt,
        v.status || 'posted',
      ];
    });

    const escape = (val: any) => `"${String(val).replaceAll('"', '""')}"`;
    const csv = [keys.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vouchers_Journal_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Vouchers exported to CSV');
  };

  // Table Columns
  const columns = useMemo<ColumnDef<VoucherRecord>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Voucher & Ref',
        cell: ({ row }) => {
          const v = row.original;
          const typeTone =
            v.type === 'payment'
              ? 'text-rose-600 bg-rose-50 border-rose-100'
              : v.type === 'receipt'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : v.type === 'contra'
                  ? 'text-indigo-600 bg-indigo-50 border-indigo-100'
                  : 'text-amber-600 bg-amber-50 border-amber-100';

          return (
            <div className="flex items-center gap-3 py-1">
              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${typeTone}`}
              >
                {v.type === 'payment' ? (
                  <ArrowUpRight size={18} weight="bold" />
                ) : v.type === 'receipt' ? (
                  <ArrowDownLeft size={18} weight="bold" />
                ) : v.type === 'contra' ? (
                  <ArrowsLeftRight size={18} weight="bold" />
                ) : (
                  <Scales size={18} weight="bold" />
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <span>{v.number || 'VCH-26-XXXX'}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 bg-slate-50">
                    {v.type || 'journal'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-mono">
                  {v.date ? day(v.date) : '—'} {v.referenceNo && `• Ref: ${v.referenceNo}`}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'purpose',
        header: 'Narration & Double Entry Accounts',
        cell: ({ row }) => {
          const v = row.original;
          const drAccounts = (v.lines || [])
            .filter((l) => Number(l.debit || 0) > 0)
            .map((l) => ledgerMap.get(l.accountId || '')?.name || 'Account')
            .join(', ');
          const crAccounts = (v.lines || [])
            .filter((l) => Number(l.credit || 0) > 0)
            .map((l) => ledgerMap.get(l.accountId || '')?.name || 'Account')
            .join(', ');

          return (
            <div className="max-w-md">
              <div className="text-sm font-medium text-slate-800 truncate" title={v.purpose}>
                {v.purpose || 'No narration entered'}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-2">
                <span className="text-emerald-700 font-medium">Dr: {drAccounts || '—'}</span>
                <span className="text-slate-300">|</span>
                <span className="text-rose-700 font-medium">Cr: {crAccounts || '—'}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Voucher Total (INR)</div>,
        cell: ({ row }) => {
          const v = row.original;
          const totalAmt = (v.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
          return (
            <div className="text-right">
              <div className="font-mono font-bold text-sm text-slate-900">
                {inr(totalAmt)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {(v.lines || []).length} balanced legs
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.status || 'posted';
          if (st === 'posted') {
            return <Badge tone="success">Posted to GL</Badge>;
          }
          return <Badge tone="neutral">Draft</Badge>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const v = row.original;
          const isDraft = v.status === 'draft';
          return (
            <div className="flex items-center justify-end gap-1">
              {isDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-emerald-700 hover:bg-emerald-50"
                  onClick={() => postDraftMutation.mutate(v)}
                  title="Post to General Ledger"
                >
                  Post
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                onClick={() => setViewingVoucher(v)}
                title="View Double Entry Legs"
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                onClick={() => setSlipVoucher(v)}
                title="Print Official Voucher Slip"
              >
                <Printer size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => handleOpenEdit(v)}
                title="Edit Voucher"
              >
                <PencilSimple size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                onClick={() => setDeletingVoucher(v)}
                title="Reverse / Delete Voucher"
              >
                <Trash size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    [ledgerMap]
  );

  // Stats Calculations
  const stats = useMemo(() => {
    let payments = 0;
    let receipts = 0;
    let contra = 0;
    let drafts = 0;

    vouchers.forEach((v) => {
      const amt = (v.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0);
      if (v.status === 'draft') drafts++;
      if (v.type === 'payment') payments += amt;
      else if (v.type === 'receipt') receipts += amt;
      else if (v.type === 'contra') contra += amt;
    });

    return { payments, receipts, contra, drafts };
  }, [vouchers]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Accounting Vouchers & Journal Register"
        eyebrow="FINANCE & GENERAL LEDGER"
        description="Double-entry financial vouchers: Bank & Cash Payments, Client Receipts, Contra Transfers, and Depreciation/Adjustment Journals."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <DownloadSimple size={16} className="mr-1.5" />
              Export Journal
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus size={16} className="mr-1.5" />
              New Voucher Entry
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Payments Disbursed
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {vouchersLoading ? <Skeleton className="h-8 w-24" /> : inr(stats.payments)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Vendor, labor & site expenses</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Receipts Inward
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            {vouchersLoading ? <Skeleton className="h-8 w-24" /> : inr(stats.receipts)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Client billing collections & capital</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contra Fund Transfers
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowsLeftRight size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {vouchersLoading ? <Skeleton className="h-8 w-24" /> : inr(stats.contra)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Bank-to-bank & petty cash top-ups</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Double-Entry Integrity
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            100% Balanced
          </div>
          <p className="mt-1 text-xs text-slate-500">∑ Debits = ∑ Credits on all entries</p>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
            {(
              [
                { id: 'all', label: 'All Entries' },
                { id: 'payment', label: 'Payments (Dr)' },
                { id: 'receipt', label: 'Receipts (Cr)' },
                { id: 'contra', label: 'Contra Transfers' },
                { id: 'journal', label: 'Journal Adjustments' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  typeFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="posted">Posted to GL</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search vouchers by voucher number, narration, reference number, or linked account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {vouchersLoading ? (
          <div className="p-8 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredVouchers.length === 0 ? (
          <Empty
            title="No vouchers found"
            description="Record payments, receipts, or journal adjustments to maintain accurate accounting books."
          >
            <div className="mt-4">
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus size={16} className="mr-1.5" />
                Post First Voucher
              </Button>
            </div>
          </Empty>
        ) : (
          <DataTable
            data={filteredVouchers}
            columns={columns}
            pageSize={10}
            totalCount={filteredVouchers.length}
          />
        )}
      </div>

      {/* Modal: New / Edit Voucher */}
      {(isAddOpen || editingVoucher) && (
        <Modal
          size="xl"
          title={isAddOpen ? 'New Double-Entry Voucher' : `Edit Voucher · ${editingVoucher?.number}`}
          open={isAddOpen || Boolean(editingVoucher)}
          onClose={() => {
            setIsAddOpen(false);
            setEditingVoucher(null);
          }}
        >
          <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
            {/* Header Form Controls */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Voucher Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="payment">Payment Voucher (Outflow)</option>
                    <option value="receipt">Receipt Voucher (Inflow)</option>
                    <option value="contra">Contra Voucher (Bank/Cash)</option>
                    <option value="journal">Journal Voucher (Adjustment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Voucher Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project / Cost Center
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">General Overhead / Head Office</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ref / Cheque / UTR No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-902184"
                    value={formReferenceNo}
                    onChange={(e) => setFormReferenceNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entity / Operating Firm
                  </label>
                  <select
                    value={formFirmId}
                    onChange={(e) => setFormFirmId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {firms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Narration / Transaction Purpose <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Clear description of transaction for GL audit trail..."
                    value={formPurpose}
                    onChange={(e) => setFormPurpose(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Double-Entry Ledger Lines Table */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Double-Entry Account Legs
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    (Each leg must be either Debit or Credit)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLine}
                  className="h-7 text-xs bg-white shadow-sm"
                >
                  <Plus size={14} className="mr-1" />
                  Add Leg
                </Button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5 w-72">Account Head / Ledger</th>
                      <th className="p-2.5">Particulars / Narration</th>
                      <th className="p-2.5 w-36 text-right">Debit (INR)</th>
                      <th className="p-2.5 w-36 text-right">Credit (INR)</th>
                      <th className="p-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {formLines.map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <select
                            required
                            value={line.accountId}
                            onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                            className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          >
                            <option value="" disabled>
                              Select Ledger Account
                            </option>
                            {ledgers.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.code ? `[${l.code}] ` : ''}{l.name} ({l.group || 'Account'})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Optional leg remark..."
                            value={line.description || ''}
                            onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                            className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            placeholder="0.00"
                            value={line.debit || ''}
                            onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                            className="w-full p-2 text-xs text-right font-mono font-medium border border-slate-200 rounded-lg bg-white text-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            placeholder="0.00"
                            value={line.credit || ''}
                            onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                            className="w-full p-2 text-xs text-right font-mono font-medium border border-slate-200 rounded-lg bg-white text-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            disabled={formLines.length <= 2}
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-20"
                            title="Remove Leg"
                          >
                            <Trash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-slate-700 text-right">Total Debit & Credit Turnover:</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">
                        {inr(totalDebits)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-rose-700">
                        {inr(totalCredits)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Balance Verification Banner */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isBalanced
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50/80 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isBalanced ? (
                    <CheckCircle size={18} weight="bold" className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <WarningCircle size={18} weight="bold" className="text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {isBalanced
                        ? 'Voucher is mathematically balanced (Total Debit == Total Credit).'
                        : `Voucher is unbalanced · Difference: ${inr(balanceDifference)}`}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {isBalanced
                        ? 'Ready to post into the General Ledger audit trail.'
                        : 'Double-entry accounting requires total debits and credits to be identical before posting.'}
                    </p>
                  </div>
                </div>
                {!isBalanced && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-50 font-semibold shadow-sm"
                    onClick={handleAutoBalance}
                  >
                    Auto-Balance Difference
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingVoucher(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !isBalanced ||
                  createMutation.isPending ||
                  editMutation.isPending
                }
              >
                {createMutation.isPending || editMutation.isPending
                  ? 'Posting to GL...'
                  : isAddOpen
                    ? 'Post Voucher to GL'
                    : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Voucher Legs */}
      {viewingVoucher && (
        <Modal
          size="lg"
          title={`Voucher Details · ${viewingVoucher.number}`}
          open={Boolean(viewingVoucher)}
          onClose={() => setViewingVoucher(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  {viewingVoucher.number}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type: {viewingVoucher.type?.toUpperCase()} • Date:{' '}
                  {viewingVoucher.date ? day(viewingVoucher.date) : '—'}
                </p>
              </div>
              <Badge tone="success">Posted to GL</Badge>
            </div>

            <div className="p-3 bg-white rounded border border-slate-100 text-xs">
              <span className="text-slate-500 block mb-0.5">Narration:</span>
              <p className="font-medium text-slate-800">{viewingVoucher.purpose}</p>
              {viewingVoucher.referenceNo && (
                <p className="text-slate-500 mt-1 font-mono">
                  Reference / Cheque: {viewingVoucher.referenceNo}
                </p>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Account Ledger</th>
                    <th className="p-2.5 w-32 text-right">Debit (INR)</th>
                    <th className="p-2.5 w-32 text-right">Credit (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(viewingVoucher.lines || []).map((l, i) => (
                    <tr key={l.id || i}>
                      <td className="p-2.5 font-medium text-slate-800">
                        {ledgerMap.get(l.accountId || '')?.name || 'Account'}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {Number(l.debit) > 0 ? inr(l.debit) : '—'}
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        {Number(l.credit) > 0 ? inr(l.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setViewingVoucher(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const v = viewingVoucher;
                  setViewingVoucher(null);
                  setSlipVoucher(v);
                }}
              >
                <Printer size={16} className="mr-1.5" />
                Print Voucher Slip
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Official Printable Voucher Slip */}
      {slipVoucher && (
        <Modal
          size="xl"
          title={`Official Voucher Slip · ${slipVoucher.number}`}
          open={Boolean(slipVoucher)}
          onClose={() => setSlipVoucher(null)}
        >
          <div className="space-y-4">
            <div id="voucher-print-area" className="p-6 bg-white border border-slate-300 rounded-lg space-y-4 text-xs font-sans">
              <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    VARDHAN CIVIL & INFRASTRUCTURE
                  </h2>
                  <p className="text-[11px] text-slate-500">Corporate & Project Construction Division</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-900">
                    {slipVoucher.type?.toUpperCase()} VOUCHER
                  </div>
                  <div className="font-mono text-xs text-slate-600 mt-0.5">
                    No: {slipVoucher.number}
                  </div>
                  <div className="text-xs text-slate-500">
                    Date: {slipVoucher.date ? day(slipVoucher.date) : '—'}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2">Particulars / Account Head</th>
                      <th className="p-2 w-28 text-right">Debit (INR)</th>
                      <th className="p-2 w-28 text-right">Credit (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(slipVoucher.lines || []).map((l, i) => (
                      <tr key={i}>
                        <td className="p-2 text-slate-800">
                          {ledgerMap.get(l.accountId || '')?.name || 'Account'}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {Number(l.debit) > 0 ? inr(l.debit) : '—'}
                        </td>
                        <td className="p-2 text-right font-mono">
                          {Number(l.credit) > 0 ? inr(l.credit) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                    <tr>
                      <td className="p-2">Grand Total</td>
                      <td className="p-2 text-right font-mono">
                        {inr((slipVoucher.lines || []).reduce((s, l) => s + Number(l.debit || 0), 0))}
                      </td>
                      <td className="p-2 text-right font-mono">
                        {inr((slipVoucher.lines || []).reduce((s, l) => s + Number(l.credit || 0), 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-700 block mb-0.5">Narration / Being:</span>
                <p className="text-slate-800 italic">{slipVoucher.purpose}</p>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-8 text-center text-[11px] text-slate-600">
                <div className="border-t border-slate-400 pt-1">Prepared By</div>
                <div className="border-t border-slate-400 pt-1">Checked By</div>
                <div className="border-t border-slate-400 pt-1">Passed / Approved</div>
                <div className="border-t border-slate-400 pt-1">Receiver Signature</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSlipVoucher(null)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={16} className="mr-1.5" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingVoucher && (
        <Modal
          title="Reverse / Delete Accounting Voucher"
          open={Boolean(deletingVoucher)}
          onClose={() => setDeletingVoucher(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to reverse voucher{' '}
              <strong className="text-slate-900">{deletingVoucher.number}</strong>?
            </p>
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <strong>Caution:</strong> Deleting or reversing this voucher will remove all its debit
              and credit legs from the General Ledger balances.
            </div>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDeletingVoucher(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (deletingVoucher.id) {
                    deleteMutation.mutate(deletingVoucher.id);
                  }
                }}
              >
                {deleteMutation.isPending ? 'Reversing...' : 'Confirm Reversal'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
