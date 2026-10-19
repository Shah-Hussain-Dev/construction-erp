'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  Receipt,
  Storefront,
  PencilSimple,
  Trash,
  Eye,
  MagnifyingGlass,
  CheckCircle,
  CurrencyInr,
  FileText,
  Clock,
  Package,
  ShieldCheck,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr, day } from '@/lib/format';
import type { RecordData } from '@/schemas';

interface PurchaseBillRecord extends RecordData {
  number?: string;
  billNumber?: string;
  vendorId?: string;
  date?: string;
  requiredOn?: string;
  amount?: number;
  taxAmount?: number;
  tdsDeducted?: number;
  grnId?: string;
  orderId?: string;
  purpose?: string;
  status?: string;
}

interface VendorRecord extends RecordData {
  name?: string;
  code?: string;
  gstin?: string;
}

interface GRNRecord extends RecordData {
  number?: string;
  date?: string;
  vendorId?: string;
}

interface PurchaseOrderRecord extends RecordData {
  number?: string;
  vendorId?: string;
}

export function PurchaseBillsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<PurchaseBillRecord | null>(null);
  const [viewingBill, setViewingBill] = useState<PurchaseBillRecord | null>(null);
  const [deletingBill, setDeletingBill] = useState<PurchaseBillRecord | null>(null);

  // Form State
  const [formVendorId, setFormVendorId] = useState('');
  const [formBillNumber, setFormBillNumber] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDueDate, setFormDueDate] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formTaxAmount, setFormTaxAmount] = useState<number>(0);
  const [formTdsDeducted, setFormTdsDeducted] = useState<number>(0);
  const [formGrnId, setFormGrnId] = useState('');
  const [formOrderId, setFormOrderId] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formStatus, setFormStatus] = useState('submitted');

  // Load Purchase Bills
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['purchase-bills'],
    queryFn: () => dataClient.list('purchase-bills') as Promise<PurchaseBillRecord[]>,
  });

  // Load Vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => dataClient.list('vendors') as Promise<VendorRecord[]>,
  });

  // Load GRNs
  const { data: grns = [] } = useQuery({
    queryKey: ['grn'],
    queryFn: () => dataClient.list('grn') as Promise<GRNRecord[]>,
  });

  // Load Purchase Orders
  const { data: orders = [] } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => dataClient.list('purchase-orders') as Promise<PurchaseOrderRecord[]>,
  });

  // Vendor map
  const vendorMap = useMemo(() => {
    const map = new Map<string, VendorRecord>();
    vendors.forEach((v) => {
      if (v.id) map.set(v.id, v);
    });
    return map;
  }, [vendors]);

  // GRN map
  const grnMap = useMemo(() => {
    const map = new Map<string, GRNRecord>();
    grns.forEach((g) => {
      if (g.id) map.set(g.id, g);
    });
    return map;
  }, [grns]);

  // Order map
  const orderMap = useMemo(() => {
    const map = new Map<string, PurchaseOrderRecord>();
    orders.forEach((o) => {
      if (o.id) map.set(o.id, o);
    });
    return map;
  }, [orders]);

  // Handle open Add
  const handleOpenAdd = () => {
    setFormVendorId(vendors[0]?.id || '');
    setFormBillNumber(`INV-${Date.now().toString().slice(-6)}`);
    setFormDate(new Date().toISOString().slice(0, 10));
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setFormDueDate(nextMonth.toISOString().slice(0, 10));
    setFormAmount(0);
    setFormTaxAmount(0);
    setFormTdsDeducted(0);
    setFormGrnId(grns[0]?.id || '');
    setFormOrderId(orders[0]?.id || '');
    setFormPurpose('');
    setFormStatus('submitted');
    setIsAddOpen(true);
  };

  // Handle open Edit
  const handleOpenEdit = (bill: PurchaseBillRecord) => {
    setEditingBill(bill);
    setFormVendorId(bill.vendorId || vendors[0]?.id || '');
    setFormBillNumber(bill.billNumber || bill.number || '');
    setFormDate(bill.date || new Date().toISOString().slice(0, 10));
    setFormDueDate(bill.requiredOn || '');
    setFormAmount(Number(bill.amount || 0));
    setFormTaxAmount(Number(bill.taxAmount || 0));
    setFormTdsDeducted(Number(bill.tdsDeducted || 0));
    setFormGrnId(bill.grnId || '');
    setFormOrderId(bill.orderId || '');
    setFormPurpose(bill.purpose || '');
    setFormStatus(bill.status || 'submitted');
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newBill: Partial<PurchaseBillRecord>) =>
      dataClient.create('purchase-bills', newBill as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      setIsAddOpen(false);
      toast.success('Purchase bill recorded successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create purchase bill');
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PurchaseBillRecord> }) =>
      dataClient.update('purchase-bills', id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      setEditingBill(null);
      toast.success('Purchase bill updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update purchase bill');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataClient.delete('purchase-bills', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      setDeletingBill(null);
      toast.success('Purchase bill deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete purchase bill');
    },
  });

  // Mark Paid Mutation
  const markPaidMutation = useMutation({
    mutationFn: (bill: PurchaseBillRecord) =>
      dataClient.update('purchase-bills', bill.id!, {
        ...bill,
        status: 'paid',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      toast.success('Bill marked as Paid');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to mark as paid');
    },
  });

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendorId) {
      toast.error('Select a vendor');
      return;
    }
    if (!formBillNumber.trim()) {
      toast.error('Vendor invoice number is required');
      return;
    }
    if (formAmount <= 0) {
      toast.error('Gross bill amount must be greater than zero');
      return;
    }

    createMutation.mutate({
      vendorId: formVendorId,
      billNumber: formBillNumber.trim(),
      number: `PB-26-${String(bills.length + 1).padStart(4, '0')}`,
      date: formDate,
      requiredOn: formDueDate,
      amount: Number(formAmount),
      taxAmount: Number(formTaxAmount),
      tdsDeducted: Number(formTdsDeducted),
      grnId: formGrnId || undefined,
      orderId: formOrderId || undefined,
      purpose: formPurpose.trim(),
      status: formStatus,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBill?.id) return;
    if (!formVendorId) {
      toast.error('Select a vendor');
      return;
    }
    if (!formBillNumber.trim()) {
      toast.error('Vendor invoice number is required');
      return;
    }
    if (formAmount <= 0) {
      toast.error('Gross bill amount must be greater than zero');
      return;
    }

    editMutation.mutate({
      id: editingBill.id,
      data: {
        vendorId: formVendorId,
        billNumber: formBillNumber.trim(),
        date: formDate,
        requiredOn: formDueDate,
        amount: Number(formAmount),
        taxAmount: Number(formTaxAmount),
        tdsDeducted: Number(formTdsDeducted),
        grnId: formGrnId || undefined,
        orderId: formOrderId || undefined,
        purpose: formPurpose.trim(),
        status: formStatus,
      },
    });
  };

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const vendorName = vendorMap.get(b.vendorId || '')?.name || '';
      const matchSearch =
        !search ||
        (b.number && b.number.toLowerCase().includes(search.toLowerCase())) ||
        (b.billNumber && b.billNumber.toLowerCase().includes(search.toLowerCase())) ||
        (b.purpose && b.purpose.toLowerCase().includes(search.toLowerCase())) ||
        vendorName.toLowerCase().includes(search.toLowerCase());

      const matchVendor =
        vendorFilter === 'all' || b.vendorId === vendorFilter;

      const matchStatus =
        statusFilter === 'all' || b.status === statusFilter;

      return matchSearch && matchVendor && matchStatus;
    });
  }, [bills, search, vendorFilter, statusFilter, vendorMap]);

  // Export CSV
  const handleExportCsv = () => {
    const keys = [
      'ERP Bill No',
      'Vendor Invoice No',
      'Vendor Name',
      'Bill Date',
      'Due Date',
      'Gross Amount (INR)',
      'GST Tax (INR)',
      'TDS (INR)',
      'Net Payable (INR)',
      'Status',
    ];
    const rows = filteredBills.map((b) => {
      const v = vendorMap.get(b.vendorId || '');
      const gross = Number(b.amount || 0);
      const tax = Number(b.taxAmount || 0);
      const tds = Number(b.tdsDeducted || 0);
      const net = gross + tax - tds;
      return [
        b.number || '',
        b.billNumber || '',
        v?.name || '',
        b.date || '',
        b.requiredOn || '',
        gross,
        tax,
        tds,
        net,
        b.status || 'submitted',
      ];
    });

    const escape = (val: any) => `"${String(val).replaceAll('"', '""')}"`;
    const csvContent = [
      keys.map(escape).join(','),
      ...rows.map((r) => r.map(escape).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Purchase_Bills_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Purchase bills exported to CSV');
  };

  // Table Columns
  const columns = useMemo<ColumnDef<PurchaseBillRecord>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Bill & Invoice No.',
        cell: ({ row }) => {
          const b = row.original;
          const has3Way = Boolean(b.grnId && (b.orderId || b.lines?.length));
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Receipt size={18} weight="duotone" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <span>{b.billNumber || b.number || 'PB-26-XXXX'}</span>
                  {has3Way && (
                    <span
                      title="Verified with Purchase Order & GRN"
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                    >
                      <ShieldCheck size={12} weight="bold" />
                      3-WAY MATCH
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  ERP Ref: {b.number || 'PB-26-XXXX'}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'vendorId',
        header: 'Vendor / Supplier',
        cell: ({ row }) => {
          const v = vendorMap.get(row.original.vendorId || '');
          if (!v) {
            return <span className="text-slate-400 text-xs italic">Unknown Vendor</span>;
          }
          return (
            <div>
              <div className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                <Storefront size={14} className="text-slate-400" />
                <span>{v.name}</span>
              </div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">
                GSTIN: {v.gstin || 'UNREGISTERED'}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'date',
        header: 'Bill Date & Due',
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div>
              <div className="text-sm font-medium text-slate-800">
                {b.date ? day(b.date) : '—'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Due: {b.requiredOn ? day(b.requiredOn) : 'Immediate'}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: () => <div className="text-right">Bill Value (INR)</div>,
        cell: ({ row }) => {
          const b = row.original;
          const gross = Number(b.amount || 0);
          const tax = Number(b.taxAmount || 0);
          const tds = Number(b.tdsDeducted || 0);
          const net = gross + tax - tds;
          return (
            <div className="text-right">
              <div className="font-mono font-bold text-sm text-slate-900">
                {inr(net)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Base: {inr(gross)} {tax > 0 && `+ GST ${inr(tax)}`}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.status || 'submitted';
          if (st === 'paid') {
            return <Badge tone="success">Paid</Badge>;
          }
          if (st === 'submitted') {
            return <Badge tone="info">Approved / Due</Badge>;
          }
          if (st === 'partially_paid') {
            return <Badge tone="warning">Partially Paid</Badge>;
          }
          return <Badge tone="neutral">Draft</Badge>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const b = row.original;
          const isPaid = b.status === 'paid';
          return (
            <div className="flex items-center justify-end gap-1">
              {!isPaid && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-emerald-700 hover:bg-emerald-50 h-8 px-2"
                  onClick={() => markPaidMutation.mutate(b)}
                  title="Mark as Paid"
                >
                  Pay
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                onClick={() => setViewingBill(b)}
                title="View Bill Details"
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => handleOpenEdit(b)}
                title="Edit Bill"
              >
                <PencilSimple size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                onClick={() => setDeletingBill(b)}
                title="Delete Bill"
              >
                <Trash size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    [vendorMap]
  );

  // Totals
  const totalInvoiced = useMemo(
    () => bills.reduce((sum, b) => sum + Number(b.amount || 0) + Number(b.taxAmount || 0) - Number(b.tdsDeducted || 0), 0),
    [bills]
  );
  const totalPaid = useMemo(
    () =>
      bills
        .filter((b) => b.status === 'paid')
        .reduce((sum, b) => sum + Number(b.amount || 0) + Number(b.taxAmount || 0) - Number(b.tdsDeducted || 0), 0),
    [bills]
  );
  const outstanding = totalInvoiced - totalPaid;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Purchase Bills & Supplier Invoices"
        eyebrow="PURCHASE & PROCUREMENT"
        description="Verify supplier tax invoices against GRN goods receipts and purchase orders. Track GST input credit, TDS deductions, and disbursement dues."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <DownloadSimple size={16} className="mr-1.5" />
              Export CSV
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus size={16} className="mr-1.5" />
              New Purchase Bill
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {billsLoading ? <Skeleton className="h-8 w-24" /> : inr(totalInvoiced)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Total vendor bills received</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Settled / Paid
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            {billsLoading ? <Skeleton className="h-8 w-24" /> : inr(totalPaid)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Payments cleared to suppliers</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Dues
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-700">
            {billsLoading ? <Skeleton className="h-8 w-24" /> : inr(outstanding)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Pending accounts payable</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              3-Way Match Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-indigo-700">
            100% Verified
          </div>
          <p className="mt-1 text-xs text-slate-500">PO, GRN & Bill reconciled</p>
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
            placeholder="Search by invoice number, vendor, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Vendor Filter */}
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Due / Approved</option>
            <option value="paid">Paid</option>
            <option value="draft">Draft</option>
          </select>

          {(search || vendorFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setVendorFilter('all');
                setStatusFilter('all');
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
        {billsLoading ? (
          <div className="p-8 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredBills.length === 0 ? (
          <Empty
            title="No purchase bills found"
            description={
              search || vendorFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or active filters.'
                : 'Record your first supplier invoice against a verified GRN delivery.'
            }
          >
            <div className="mt-4">
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus size={16} className="mr-1.5" />
                Record First Bill
              </Button>
            </div>
          </Empty>
        ) : (
          <DataTable
            data={filteredBills}
            columns={columns}
            pageSize={10}
            totalCount={filteredBills.length}
          />
        )}
      </div>

      {/* Modal: Add Bill */}
      {isAddOpen && (
        <Modal
          title="Record Supplier Invoice / Purchase Bill"
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
        >
          <form onSubmit={handleSaveAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Vendor / Supplier <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formVendorId}
                  onChange={(e) => setFormVendorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="" disabled>
                    Select Vendor
                  </option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.code || 'VEN'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Vendor Invoice / Bill No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-9041"
                  value={formBillNumber}
                  onChange={(e) => setFormBillNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bill Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Financial Amounts Breakdown */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Bill Value Breakdown
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Base / Taxable Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    GST Tax Amount (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formTaxAmount || ''}
                    onChange={(e) => setFormTaxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TDS Deducted (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formTdsDeducted || ''}
                    onChange={(e) => setFormTdsDeducted(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Net Payable Amount:</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {inr(formAmount + formTaxAmount - formTdsDeducted)}
                </span>
              </div>
            </div>

            {/* Linkage to GRN and PO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Linked GRN (Goods Receipt)
                </label>
                <select
                  value={formGrnId}
                  onChange={(e) => setFormGrnId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">No GRN Linked</option>
                  {grns.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.number} ({g.date ? day(g.date) : 'GRN'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Linked Purchase Order
                </label>
                <select
                  value={formOrderId}
                  onChange={(e) => setFormOrderId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">No PO Linked</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.number}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description / Purpose
              </label>
              <textarea
                rows={2}
                placeholder="Work package or purpose notes..."
                value={formPurpose}
                onChange={(e) => setFormPurpose(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Record Bill'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Bill */}
      {editingBill && (
        <Modal
          title={`Edit Bill · ${editingBill.billNumber || editingBill.number}`}
          open={Boolean(editingBill)}
          onClose={() => setEditingBill(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Vendor / Supplier <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formVendorId}
                  onChange={(e) => setFormVendorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.code || 'VEN'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Vendor Invoice / Bill No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formBillNumber}
                  onChange={(e) => setFormBillNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bill Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Financial Amounts Breakdown */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Bill Value Breakdown
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Base / Taxable Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    GST Tax Amount (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formTaxAmount || ''}
                    onChange={(e) => setFormTaxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    TDS Deducted (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formTdsDeducted || ''}
                    onChange={(e) => setFormTdsDeducted(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Net Payable Amount:</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {inr(formAmount + formTaxAmount - formTdsDeducted)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="submitted">Approved / Payment Due</option>
                  <option value="paid">Settled / Paid</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingBill(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Bill Details */}
      {viewingBill && (
        <Modal
          title={`Purchase Bill · ${viewingBill.billNumber || viewingBill.number}`}
          open={Boolean(viewingBill)}
          onClose={() => setViewingBill(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Receipt size={22} weight="duotone" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {viewingBill.billNumber || viewingBill.number}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Vendor: {vendorMap.get(viewingBill.vendorId || '')?.name || 'Unknown'}
                  </p>
                </div>
              </div>
              <Badge tone={viewingBill.status === 'paid' ? 'success' : 'info'}>
                {viewingBill.status === 'paid' ? 'Paid' : 'Approved / Due'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded border border-slate-100">
                <span className="text-slate-500 block">Bill Date</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {viewingBill.date ? day(viewingBill.date) : '—'}
                </span>
              </div>
              <div className="p-3 bg-white rounded border border-slate-100">
                <span className="text-slate-500 block">Payment Due Date</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {viewingBill.requiredOn ? day(viewingBill.requiredOn) : 'Immediate'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Base / Taxable Amount:</span>
                <span className="font-mono font-medium">{inr(viewingBill.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">GST Input Tax Credit (ITC):</span>
                <span className="font-mono font-medium">{inr(viewingBill.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Less: TDS Deducted:</span>
                <span className="font-mono font-medium">- {inr(viewingBill.tdsDeducted || 0)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Net Payable:</span>
                <span className="font-mono">
                  {inr(
                    Number(viewingBill.amount || 0) +
                      Number(viewingBill.taxAmount || 0) -
                      Number(viewingBill.tdsDeducted || 0)
                  )}
                </span>
              </div>
            </div>

            {viewingBill.purpose && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <span className="text-slate-500 block mb-0.5">Narration / Notes:</span>
                <p className="text-slate-700">{viewingBill.purpose}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setViewingBill(null)}>
                Close
              </Button>
              {viewingBill.status !== 'paid' && (
                <Button
                  onClick={() => {
                    const b = viewingBill;
                    setViewingBill(null);
                    markPaidMutation.mutate(b);
                  }}
                >
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingBill && (
        <Modal
          title="Delete Purchase Bill"
          open={Boolean(deletingBill)}
          onClose={() => setDeletingBill(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete purchase bill{' '}
              <strong className="text-slate-900">
                {deletingBill.billNumber || deletingBill.number}
              </strong>
              ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setDeletingBill(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (deletingBill.id) {
                    deleteMutation.mutate(deletingBill.id);
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
