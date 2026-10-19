'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  FileText,
  Package,
  Receipt,
  Storefront,
  ArrowRight,
  Plus,
  CurrencyInr,
  Clock,
  CheckCircle,
  Truck,
  ClipboardText,
  WarningCircle,
  ChartPie,
} from '@phosphor-icons/react';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { Badge, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr, day } from '@/lib/format';
import type { RecordData } from '@/schemas';

interface PurchaseOrder extends RecordData {
  vendorId?: string;
  requiredOn?: string;
}

interface VendorRecord extends RecordData {
  name?: string;
  code?: string;
  contact?: string;
  phone?: string;
  email?: string;
  gstin?: string;
}

export function PurchaseDashboardPage() {
  // Load Purchase Orders
  const { data: purchaseOrders = [], isLoading: poLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: () => dataClient.list('purchase-orders') as Promise<PurchaseOrder[]>,
  });

  // Load Purchase Requisitions
  const { data: requisitions = [], isLoading: reqLoading } = useQuery({
    queryKey: ['purchase-requisitions'],
    queryFn: () => dataClient.list('purchase-requisitions') as Promise<RecordData[]>,
  });

  // Load GRNs
  const { data: grns = [], isLoading: grnLoading } = useQuery({
    queryKey: ['grn'],
    queryFn: () => dataClient.list('grn') as Promise<RecordData[]>,
  });

  // Load Purchase Bills
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['purchase-bills'],
    queryFn: () => dataClient.list('purchase-bills') as Promise<RecordData[]>,
  });

  // Load Vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => dataClient.list('vendors') as Promise<VendorRecord[]>,
  });

  // Load Material Requests
  const { data: requests = [] } = useQuery({
    queryKey: ['material-requests'],
    queryFn: () => dataClient.list('material-requests') as Promise<RecordData[]>,
  });

  // Vendor Lookup Map
  const vendorMap = useMemo(() => {
    const map = new Map<string, VendorRecord>();
    vendors.forEach((v) => {
      if (v.id) map.set(v.id, v);
    });
    return map;
  }, [vendors]);

  // Calculations
  const totalPOValue = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => {
      const poTotal = (po.lines || []).reduce(
        (lSum, l) => lSum + Number(l.qty || 0) * Number(l.rate || 0),
        0
      );
      return sum + poTotal;
    }, 0);
  }, [purchaseOrders]);

  const totalBillsAmount = useMemo(() => {
    return bills.reduce((sum, b) => sum + Number((b as any).amount || 0), 0);
  }, [bills]);

  const pendingRequisitions = requisitions.filter(
    (r) => r.status === 'draft' || r.status === 'submitted'
  ).length;

  const activeOrdersCount = purchaseOrders.filter(
    (po) => po.status === 'approved' || po.status === 'submitted'
  ).length;

  // Vendor Spend Breakdown
  const vendorSpend = useMemo(() => {
    const spendMap = new Map<string, number>();
    purchaseOrders.forEach((po) => {
      const vId = po.vendorId || 'unknown';
      const poTotal = (po.lines || []).reduce(
        (lSum, l) => lSum + Number(l.qty || 0) * Number(l.rate || 0),
        0
      );
      spendMap.set(vId, (spendMap.get(vId) || 0) + poTotal);
    });

    const entries = Array.from(spendMap.entries()).map(([vendorId, amount]) => ({
      vendorId,
      vendorName: vendorMap.get(vendorId)?.name || 'Direct / Miscellaneous Supplier',
      amount,
      percentage: totalPOValue > 0 ? (amount / totalPOValue) * 100 : 0,
    }));

    return entries.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [purchaseOrders, vendorMap, totalPOValue]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Purchase & Procurement Hub"
        eyebrow="PROCUREMENT & SUPPLY CHAIN"
        description="End-to-end purchasing lifecycle: site material requisitions, purchase orders, goods receipt verification (GRN), and supplier bills."
        action={
          <div className="flex items-center gap-2">
            <Link href="/purchasing/orders/new">
              <Button size="sm">
                <Plus size={16} className="mr-1.5" />
                New Purchase Order
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards - Double Bezel Agency Polish */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Purchase Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {poLoading ? <Skeleton className="h-8 w-24" /> : inr(totalPOValue)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Across {purchaseOrders.length} purchase commitments
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Indents
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-700">
            {reqLoading ? <Skeleton className="h-8 w-16" /> : pendingRequisitions}
          </div>
          <p className="mt-1 text-xs text-slate-500">Awaiting purchase manager review</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Material Inwards (GRN)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {grnLoading ? <Skeleton className="h-8 w-16" /> : grns.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Verified site receipts</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Supplier Bills
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {billsLoading ? <Skeleton className="h-8 w-24" /> : inr(totalBillsAmount)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {bills.length} vendor invoices processed
          </p>
        </div>
      </div>

      {/* Procurement Flow Pipeline Visualizer */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Procurement Workflow & 3-Way Matching Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard civil construction purchase cycle from site request to supplier payment.
            </p>
          </div>
          <Badge tone="info">Live ERP Sync</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {/* Step 1: Site Request */}
          <Link
            href="/requests"
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600">
                Stage 1
              </span>
              <ClipboardText size={18} className="text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="mt-2 font-semibold text-sm text-slate-900 group-hover:text-blue-700">
              Material Requests
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {requests.length} site requests
            </div>
            <div className="mt-3 flex items-center text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>View Requests</span>
              <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>

          {/* Step 2: Indent */}
          <Link
            href="/purchasing/requisitions"
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600">
                Stage 2
              </span>
              <FileText size={18} className="text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="mt-2 font-semibold text-sm text-slate-900 group-hover:text-blue-700">
              Purchase Indents
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {requisitions.length} requisitions
            </div>
            <div className="mt-3 flex items-center text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Manage Indents</span>
              <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>

          {/* Step 3: PO */}
          <Link
            href="/purchasing/orders"
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600">
                Stage 3
              </span>
              <ShoppingCart size={18} className="text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="mt-2 font-semibold text-sm text-slate-900 group-hover:text-blue-700">
              Purchase Orders
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {purchaseOrders.length} orders issued
            </div>
            <div className="mt-3 flex items-center text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>View Orders</span>
              <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>

          {/* Step 4: GRN */}
          <Link
            href="/inventory/grn"
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600">
                Stage 4
              </span>
              <Package size={18} className="text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="mt-2 font-semibold text-sm text-slate-900 group-hover:text-blue-700">
              GRN Verification
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {grns.length} delivery receipts
            </div>
            <div className="mt-3 flex items-center text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Inspect Deliveries</span>
              <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>

          {/* Step 5: Purchase Bills */}
          <Link
            href="/purchasing/bills"
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600">
                Stage 5
              </span>
              <Receipt size={18} className="text-slate-400 group-hover:text-blue-600" />
            </div>
            <div className="mt-2 font-semibold text-sm text-slate-900 group-hover:text-blue-700">
              Purchase Bills
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {bills.length} vendor bills
            </div>
            <div className="mt-3 flex items-center text-xs font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Process Bills</span>
              <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Top Vendor Spend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Purchase Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Recent Purchase Commitments
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active orders placed with verified vendor partners.
              </p>
            </div>
            <Link href="/purchasing/orders">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800">
                View All Orders
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {poLoading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No purchase orders created yet.
              </div>
            ) : (
              purchaseOrders.slice(0, 5).map((po) => {
                const vendor = vendorMap.get(po.vendorId || '');
                const total = (po.lines || []).reduce(
                  (s, l) => s + Number(l.qty || 0) * Number(l.rate || 0),
                  0
                );
                return (
                  <div
                    key={po.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <ShoppingCart size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/purchasing/orders/${po.id}`}
                            className="font-semibold text-sm text-slate-900 hover:text-blue-600"
                          >
                            {po.number || 'PO-26-XXXX'}
                          </Link>
                          <Badge
                            tone={
                              po.status === 'approved'
                                ? 'success'
                                : po.status === 'submitted'
                                  ? 'info'
                                  : 'neutral'
                            }
                          >
                            {po.status || 'Draft'}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{vendor?.name || 'Direct Supplier'}</span>
                          <span>•</span>
                          <span>Delivery by {po.requiredOn ? day(po.requiredOn) : 'Immediate'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold text-sm text-slate-900">
                        {inr(total)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {(po.lines || []).length} items
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Vendor Spend Analysis (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Top Vendor Exposure
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cumulative PO commitments by vendor.
              </p>
            </div>
            <Link href="/purchasing/vendors">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                Vendors ({vendors.length})
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {vendorSpend.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No vendor commitments recorded yet.
              </div>
            ) : (
              vendorSpend.map((item) => (
                <div key={item.vendorId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[160px]" title={item.vendorName}>
                      {item.vendorName}
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {inr(item.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(5, item.percentage))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link href="/purchasing/vendors">
              <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100/80 transition-colors flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Storefront size={16} className="text-slate-500" />
                  <span>Onboard New Vendor Partner</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
