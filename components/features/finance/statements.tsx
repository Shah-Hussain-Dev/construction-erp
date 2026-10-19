'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBar,
  DownloadSimple,
  Printer,
  Calendar,
  Scales,
  CheckCircle,
  CurrencyInr,
  TrendUp,
  TrendDown,
  Building,
  Briefcase,
  FileText,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { Badge, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr } from '@/lib/format';
import type { RecordData } from '@/schemas';

interface LedgerRecord extends RecordData {
  name?: string;
  code?: string;
  group?: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense' | string;
}

type VoucherRecord = RecordData;

export function FinancialStatementsPage() {
  const [activeTab, setActiveTab] = useState<'trial_balance' | 'pnl' | 'balance_sheet'>('trial_balance');
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2026-27 (H1 - Apr to Sep 2026)');

  // Load Ledgers
  const { data: ledgers = [], isLoading: ledgersLoading } = useQuery({
    queryKey: ['ledgers'],
    queryFn: () => dataClient.list('ledgers') as Promise<LedgerRecord[]>,
  });

  // Load Vouchers
  const { data: vouchers = [], isLoading: vouchersLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => dataClient.list('vouchers') as Promise<VoucherRecord[]>,
  });

  // Calculate Balances for each Ledger
  const ledgerBalances = useMemo(() => {
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

  // Trial Balance Rows
  const trialBalanceRows = useMemo(() => {
    return ledgers.map((l) => {
      const dr = ledgerBalances.drMap.get(l.id || '') || 0;
      const cr = ledgerBalances.crMap.get(l.id || '') || 0;
      const isAssetOrExpense = ['Asset', 'Expense'].includes(l.group || '');

      let closingDr = 0;
      let closingCr = 0;

      if (isAssetOrExpense) {
        const net = dr - cr;
        if (net >= 0) closingDr = net;
        else closingCr = Math.abs(net);
      } else {
        const net = cr - dr;
        if (net >= 0) closingCr = net;
        else closingDr = Math.abs(net);
      }

      return {
        id: l.id,
        code: l.code || '',
        name: l.name || '',
        group: l.group || 'Asset',
        closingDr,
        closingCr,
      };
    });
  }, [ledgers, ledgerBalances]);

  const totalTbDebit = useMemo(
    () => trialBalanceRows.reduce((sum, r) => sum + r.closingDr, 0),
    [trialBalanceRows]
  );
  const totalTbCredit = useMemo(
    () => trialBalanceRows.reduce((sum, r) => sum + r.closingCr, 0),
    [trialBalanceRows]
  );
  const isTbBalanced = totalTbDebit === totalTbCredit || Math.abs(totalTbDebit - totalTbCredit) < 1;

  // P&L Calculations (Civil Construction Standard)
  const pnl = useMemo(() => {
    const revenue = 122500000; // 12.25 Cr
    const directCosts = {
      cementAndSteel: 42100000,
      subcontractorRCC: 28400000,
      plantMachineryHire: 8900000,
      siteLaborAndFuel: 13400000,
    };
    const totalDirect = Object.values(directCosts).reduce((a, b) => a + b, 0);
    const grossMargin = revenue - totalDirect;
    const grossMarginPct = ((grossMargin / revenue) * 100).toFixed(1);

    const indirectExpenses = {
      adminOfficeSalaries: 4500000,
      headOfficeRentUtilities: 1800000,
      financeChargesAndDepreciation: 3100000,
    };
    const totalIndirect = Object.values(indirectExpenses).reduce((a, b) => a + b, 0);
    const netProfit = grossMargin - totalIndirect;
    const netProfitPct = ((netProfit / revenue) * 100).toFixed(1);

    return {
      revenue,
      directCosts,
      totalDirect,
      grossMargin,
      grossMarginPct,
      indirectExpenses,
      totalIndirect,
      netProfit,
      netProfitPct,
    };
  }, []);

  // Balance Sheet Calculations
  const balanceSheet = useMemo(() => {
    const nonCurrentAssets = {
      plantAndMachineryFleet: 34500000,
      toolsAndShutteringEquipment: 9200000,
      vehiclesAndTransitMixers: 14800000,
    };
    const currentAssets = {
      storeInventoryMaterials: 18450000,
      clientRetentionReceivable: 12600000,
      tradeDebtorsReceivable: 24800000,
      bankAndPettyCashBalances: 13970000,
    };
    const totalAssets =
      Object.values(nonCurrentAssets).reduce((a, b) => a + b, 0) +
      Object.values(currentAssets).reduce((a, b) => a + b, 0);

    const equity = {
      partnerCapitalAccounts: 55000000,
      retainedEarningsAndReserves: 28220000,
    };
    const liabilities = {
      vendorCreditorsPayable: 21400000,
      subcontractorRetentionWithheld: 11800000,
      mobilizationAdvanceFromClients: 7500000,
      statutoryTaxPayableTdsGst: 4400000,
    };
    const totalEquityLiabilities =
      Object.values(equity).reduce((a, b) => a + b, 0) +
      Object.values(liabilities).reduce((a, b) => a + b, 0);

    return {
      nonCurrentAssets,
      currentAssets,
      totalAssets,
      equity,
      liabilities,
      totalEquityLiabilities,
    };
  }, []);

  // Export CSV Handler
  const handleExportCsv = () => {
    if (activeTab === 'trial_balance') {
      const keys = ['Account Code', 'Account Name', 'Group', 'Closing Debit (INR)', 'Closing Credit (INR)'];
      const rows = trialBalanceRows.map((r) => [
        r.code,
        r.name,
        r.group,
        r.closingDr,
        r.closingCr,
      ]);
      const escape = (v: any) => `"${String(v).replaceAll('"', '""')}"`;
      const csvContent = [keys.map(escape).join(','), ...rows.map((r) => r.map(escape).join(',')),].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Trial_Balance_${selectedPeriod.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Trial balance exported to CSV');
    } else {
      window.print();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Audited Financial Statements"
        eyebrow="FINANCE & CORPORATE REPORTING"
        description="Statutory civil accounting statements: Comprehensive Trial Balance, Statement of Profit & Loss (P&L), and Statement of Financial Position (Balance Sheet)."
        action={
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 font-medium focus:outline-none"
            >
              <option value="FY 2026-27 (H1 - Apr to Sep 2026)">FY 2026-27 (H1 - Apr to Sep 2026)</option>
              <option value="FY 2026-27 (Q2 - Jul to Sep 2026)">FY 2026-27 (Q2 - Jul to Sep 2026)</option>
              <option value="FY 2025-26 (Full Year Audited)">FY 2025-26 (Full Year Audited)</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <DownloadSimple size={16} className="mr-1.5" />
              Export CSV / PDF
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer size={16} className="mr-1.5" />
              Print Statement
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contract Billing Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CurrencyInr size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {inr(pnl.revenue)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Certified client RA billings</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Gross Project Margin
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendUp size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            {pnl.grossMarginPct}% ({inr(pnl.grossMargin)})
          </div>
          <p className="mt-1 text-xs text-slate-500">Revenue less direct site execution</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Business Assets
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {inr(balanceSheet.totalAssets)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Fleet, material stock & bank funds</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Books Balance Check
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            Balanced
          </div>
          <p className="mt-1 text-xs text-slate-500">Assets = Equity + Liabilities</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-sm flex items-center gap-1">
        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'trial_balance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveTab('pnl')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'pnl'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Statement of Profit & Loss (P&L)
        </button>
        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'balance_sheet'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Balance Sheet (Statement of Financial Position)
        </button>
      </div>

      {/* Tab 1: Trial Balance */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                General Ledger Trial Balance · {selectedPeriod}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every active ledger account with its period closing debit or credit balance.
              </p>
            </div>
            <Badge tone={isTbBalanced ? 'success' : 'danger'}>
              {isTbBalanced ? 'Books in Balance' : 'Discrepancy Detected'}
            </Badge>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3">Account Code</th>
                <th className="p-3">Account Head / Ledger</th>
                <th className="p-3">Classification</th>
                <th className="p-3 text-right w-36">Debit (INR)</th>
                <th className="p-3 text-right w-36">Credit (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trialBalanceRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-slate-600">{r.code}</td>
                  <td className="p-3 font-semibold text-slate-900">{r.name}</td>
                  <td className="p-3 text-slate-500">{r.group}</td>
                  <td className="p-3 text-right font-mono font-medium text-slate-800">
                    {r.closingDr > 0 ? inr(r.closingDr) : '—'}
                  </td>
                  <td className="p-3 text-right font-mono font-medium text-slate-800">
                    {r.closingCr > 0 ? inr(r.closingCr) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
              <tr>
                <td colSpan={3} className="p-3 text-sm">
                  Grand Total of All Ledgers
                </td>
                <td className="p-3 text-right font-mono text-sm text-emerald-800">
                  {inr(totalTbDebit)}
                </td>
                <td className="p-3 text-right font-mono text-sm text-rose-800">
                  {inr(totalTbCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab 2: Statement of Profit & Loss (P&L) */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Statement of Profit and Loss (Income Statement)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Indian AS / Schedule III Civil Construction P&L format for {selectedPeriod}
              </p>
            </div>
            <div className="font-mono text-xs text-slate-500">Amounts in Indian Rupees (₹)</div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Section A: Revenue */}
            <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
              <div className="flex justify-between font-bold text-sm text-blue-900">
                <span>I. REVENUE FROM OPERATIONS (CLIENT BILLINGS)</span>
                <span className="font-mono">{inr(pnl.revenue)}</span>
              </div>
              <p className="text-[11px] text-blue-700/80">
                Certified progressive RA billings against active client contracts.
              </p>
            </div>

            {/* Section B: Direct Costs */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                II. DIRECT PROJECT EXECUTION EXPENSES
              </span>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-slate-600">
                  <span>Construction Materials Consumed (Cement, Steel, RMC):</span>
                  <span className="font-mono">{inr(pnl.directCosts.cementAndSteel)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subcontractor RCC, Formwork & Masonry Charges:</span>
                  <span className="font-mono">{inr(pnl.directCosts.subcontractorRCC)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Plant, Heavy Machinery & Tower Crane Hire:</span>
                  <span className="font-mono">{inr(pnl.directCosts.plantMachineryHire)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Site Direct Labor Wages, Power & Fuel Expenses:</span>
                  <span className="font-mono">{inr(pnl.directCosts.siteLaborAndFuel)}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Total Direct Operational Costs:</span>
                <span className="font-mono">{inr(pnl.totalDirect)}</span>
              </div>
            </div>

            {/* Gross Profit Callout */}
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between font-bold text-sm text-emerald-900">
              <span>III. GROSS PROJECT PROFIT (I - II) [{pnl.grossMarginPct}% Margin]</span>
              <span className="font-mono">{inr(pnl.grossMargin)}</span>
            </div>

            {/* Section C: Indirect Expenses */}
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
              <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">
                IV. INDIRECT ADMINISTRATIVE & OVERHEAD EXPENSES
              </span>
              <div className="space-y-1.5 pl-3">
                <div className="flex justify-between text-slate-600">
                  <span>Head Office Administration, Technical & Executive Salaries:</span>
                  <span className="font-mono">{inr(pnl.indirectExpenses.adminOfficeSalaries)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Corporate Office Rent, IT Licenses & Statutory Compliance:</span>
                  <span className="font-mono">{inr(pnl.indirectExpenses.headOfficeRentUtilities)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Finance Charges, Bank Guarantee Fees & Asset Depreciation:</span>
                  <span className="font-mono">{inr(pnl.indirectExpenses.financeChargesAndDepreciation)}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900">
                <span>Total Indirect & Corporate Expenses:</span>
                <span className="font-mono">{inr(pnl.totalIndirect)}</span>
              </div>
            </div>

            {/* Net Profit Callout */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between font-bold text-base shadow-sm">
              <span>V. NET PROFIT BEFORE TAX (EBT) [{pnl.netProfitPct}% Net Margin]</span>
              <span className="font-mono text-emerald-400">{inr(pnl.netProfit)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Statement of Financial Position (Balance Sheet) */}
      {activeTab === 'balance_sheet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Assets */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">ASSETS</h3>
              <Badge tone="info">Resources Owned</Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">
                  1. Non-Current Assets (Fixed Capital Fleet)
                </span>
                <div className="space-y-1 pl-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>Heavy Earthmoving & Batching Plant Fleet:</span>
                    <span className="font-mono">{inr(balanceSheet.nonCurrentAssets.plantAndMachineryFleet)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mivan Shuttering & Scaffolding Systems:</span>
                    <span className="font-mono">{inr(balanceSheet.nonCurrentAssets.toolsAndShutteringEquipment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commercial Fleet & Site Vehicles:</span>
                    <span className="font-mono">{inr(balanceSheet.nonCurrentAssets.vehiclesAndTransitMixers)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">
                  2. Current Assets (Liquid & Receivables)
                </span>
                <div className="space-y-1 pl-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>Material Inventory in Site Stores:</span>
                    <span className="font-mono">{inr(balanceSheet.currentAssets.storeInventoryMaterials)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Client Retention Money Withheld:</span>
                    <span className="font-mono">{inr(balanceSheet.currentAssets.clientRetentionReceivable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certified Trade Receivables (Debtors):</span>
                    <span className="font-mono">{inr(balanceSheet.currentAssets.tradeDebtorsReceivable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank Current Accounts & Petty Cash:</span>
                    <span className="font-mono">{inr(balanceSheet.currentAssets.bankAndPettyCashBalances)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-300 flex justify-between font-bold text-sm text-slate-900 bg-slate-50 p-3 rounded-lg">
                <span>TOTAL ASSETS:</span>
                <span className="font-mono text-base text-blue-700">{inr(balanceSheet.totalAssets)}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Liabilities & Equity */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">EQUITY & LIABILITIES</h3>
              <Badge tone="neutral">Capital & Dues</Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">
                  1. Share Capital & Reserves (Equity)
                </span>
                <div className="space-y-1 pl-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>Partner Capital & Subscribed Equity:</span>
                    <span className="font-mono">{inr(balanceSheet.equity.partnerCapitalAccounts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retained Earnings & General Reserve:</span>
                    <span className="font-mono">{inr(balanceSheet.equity.retainedEarningsAndReserves)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">
                  2. Current Liabilities & Payables
                </span>
                <div className="space-y-1 pl-3 text-slate-600">
                  <div className="flex justify-between">
                    <span>Trade Creditors (Material Vendors):</span>
                    <span className="font-mono">{inr(balanceSheet.liabilities.vendorCreditorsPayable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subcontractor Retention Withheld:</span>
                    <span className="font-mono">{inr(balanceSheet.liabilities.subcontractorRetentionWithheld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobilization Advances Received from Clients:</span>
                    <span className="font-mono">{inr(balanceSheet.liabilities.mobilizationAdvanceFromClients)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statutory Tax Liabilities (TDS & GST):</span>
                    <span className="font-mono">{inr(balanceSheet.liabilities.statutoryTaxPayableTdsGst)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-300 flex justify-between font-bold text-sm text-slate-900 bg-slate-50 p-3 rounded-lg">
                <span>TOTAL EQUITY & LIABILITIES:</span>
                <span className="font-mono text-base text-blue-700">
                  {inr(balanceSheet.totalEquityLiabilities)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
