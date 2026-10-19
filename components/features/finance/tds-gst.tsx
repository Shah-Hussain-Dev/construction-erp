'use client';

import React, { useMemo, useState } from 'react';
import {
  Scales,
  Plus,
  DownloadSimple,
  CheckCircle,
  CurrencyInr,
  Clock,
  ShieldCheck,
  Receipt,
  Printer,
  Calendar,
  WarningCircle,
  Buildings,
  User,
  ArrowRight,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { PageHeader } from '../../shell';
import { Badge, Modal } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr, day } from '@/lib/format';

interface TDSRecord {
  id: string;
  deducteeName: string;
  pan: string;
  section: '194C' | '194J' | '194I' | '194Q';
  invoiceNumber: string;
  invoiceDate: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  status: 'pending' | 'paid';
  challanNumber?: string;
  bsrCode?: string;
  paidOn?: string;
}

interface GSTSummary {
  period: string;
  outwardTaxable: number;
  outputGst: number;
  inwardTaxable: number;
  eligibleItc: number;
  netPayable: number;
  status: 'filed' | 'ready_for_filing' | 'draft';
  dueDate: string;
  arn?: string;
}

export function TdsAndGstPage() {
  const [activeTab, setActiveTab] = useState<'tds' | 'gst'>('tds');
  const [sectionFilter, setSectionFilter] = useState('all');

  // Modals state
  const [isAddTdsOpen, setIsAddTdsOpen] = useState(false);
  const [payingChallan, setPayingChallan] = useState<TDSRecord | null>(null);

  // TDS Form State
  const [formDeductee, setFormDeductee] = useState('');
  const [formPan, setFormPan] = useState('');
  const [formSection, setFormSection] = useState<'194C' | '194J' | '194I' | '194Q'>('194C');
  const [formInvoice, setFormInvoice] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formGross, setFormGross] = useState<number>(0);
  const [formRate, setFormRate] = useState<number>(2); // 2% for 194C corporate

  // Challan Payment Form State
  const [formBSR, setFormBSR] = useState('');
  const [formChallanNo, setFormChallanNo] = useState('');

  // TDS Records State
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>([
    {
      id: 'tds-1',
      deducteeName: 'Precision Formwork Contractors',
      pan: 'AABCP8902M',
      section: '194C',
      invoiceNumber: 'RA-26-0028',
      invoiceDate: '2026-10-15',
      grossAmount: 324000,
      tdsRate: 2,
      tdsAmount: 6480,
      status: 'pending',
    },
    {
      id: 'tds-2',
      deducteeName: 'StrucDesign MEP Consultants',
      pan: 'BBZPA1294K',
      section: '194J',
      invoiceNumber: 'INV-2026-081',
      invoiceDate: '2026-10-10',
      grossAmount: 60000,
      tdsRate: 10,
      tdsAmount: 6000,
      status: 'paid',
      challanNumber: 'CHL-2026-09281',
      bsrCode: '0291048',
      paidOn: '2026-10-12',
    },
    {
      id: 'tds-3',
      deducteeName: 'HeavyLift Crane Services',
      pan: 'CCDPK5512L',
      section: '194I',
      invoiceNumber: 'INV-CRANE-901',
      invoiceDate: '2026-10-08',
      grossAmount: 185000,
      tdsRate: 2,
      tdsAmount: 3700,
      status: 'paid',
      challanNumber: 'CHL-2026-09280',
      bsrCode: '0291048',
      paidOn: '2026-10-12',
    },
  ]);

  // GST Returns Summary State
  const [gstSummaries] = useState<GSTSummary[]>([
    {
      period: 'September 2026',
      outwardTaxable: 12250000,
      outputGst: 2205000,
      inwardTaxable: 10111111,
      eligibleItc: 1820000,
      netPayable: 385000,
      status: 'ready_for_filing',
      dueDate: '2026-10-20',
      arn: 'AA2909260012948',
    },
    {
      period: 'August 2026',
      outwardTaxable: 9800000,
      outputGst: 1764000,
      inwardTaxable: 8200000,
      eligibleItc: 1476000,
      netPayable: 288000,
      status: 'filed',
      dueDate: '2026-09-20',
      arn: 'AA2908260098124',
    },
  ]);

  // Section Rate Presets
  const handleSectionChange = (sec: '194C' | '194J' | '194I' | '194Q') => {
    setFormSection(sec);
    if (sec === '194C') setFormRate(2);
    else if (sec === '194J') setFormRate(10);
    else if (sec === '194I') setFormRate(2);
    else if (sec === '194Q') setFormRate(0.1);
  };

  // Add TDS Mutation / Handler
  const handleSaveTds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeductee.trim() || formGross <= 0) {
      toast.error('Enter a valid deductee and gross amount');
      return;
    }

    const calculatedTds = Math.round((formGross * formRate) / 100);
    const newRecord: TDSRecord = {
      id: `tds-${Date.now()}`,
      deducteeName: formDeductee.trim(),
      pan: formPan.trim().toUpperCase() || 'PANNOTREQ1',
      section: formSection,
      invoiceNumber: formInvoice.trim() || `INV-${Date.now().toString().slice(-4)}`,
      invoiceDate: formDate,
      grossAmount: formGross,
      tdsRate: formRate,
      tdsAmount: calculatedTds,
      status: 'pending',
    };

    setTdsRecords((prev) => [newRecord, ...prev]);
    setIsAddTdsOpen(false);
    toast.success(`TDS deduction of ${inr(calculatedTds)} recorded under Sec ${formSection}`);
  };

  // Pay Challan Handler
  const handlePayChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingChallan) return;

    setTdsRecords((prev) =>
      prev.map((t) =>
        t.id === payingChallan.id
          ? {
              ...t,
              status: 'paid',
              challanNumber: formChallanNo || `CHL-${Date.now().toString().slice(-6)}`,
              bsrCode: formBSR || '0291048',
              paidOn: new Date().toISOString().slice(0, 10),
            }
          : t
      )
    );
    setPayingChallan(null);
    toast.success(`Challan 281 deposited for ${payingChallan.deducteeName}`);
  };

  // Filtered TDS records
  const filteredTds = useMemo(() => {
    return tdsRecords.filter((t) => {
      return sectionFilter === 'all' || t.section === sectionFilter;
    });
  }, [tdsRecords, sectionFilter]);

  // Calculations
  const pendingTdsTotal = useMemo(
    () =>
      tdsRecords
        .filter((t) => t.status === 'pending')
        .reduce((sum, t) => sum + t.tdsAmount, 0),
    [tdsRecords]
  );
  const paidTdsTotal = useMemo(
    () =>
      tdsRecords
        .filter((t) => t.status === 'paid')
        .reduce((sum, t) => sum + t.tdsAmount, 0),
    [tdsRecords]
  );

  // Export CSV
  const handleExportCsv = () => {
    const keys = [
      'Deductee Name',
      'PAN',
      'Section',
      'Invoice No',
      'Invoice Date',
      'Gross Amount (INR)',
      'TDS Rate (%)',
      'TDS Deducted (INR)',
      'Status',
      'Challan No',
      'BSR Code',
    ];
    const rows = filteredTds.map((t) => [
      t.deducteeName,
      t.pan,
      t.section,
      t.invoiceNumber,
      t.invoiceDate,
      t.grossAmount,
      t.tdsRate,
      t.tdsAmount,
      t.status.toUpperCase(),
      t.challanNumber || '',
      t.bsrCode || '',
    ]);

    const escape = (val: any) => `"${String(val).replaceAll('"', '""')}"`;
    const csvContent = [keys.map(escape).join(','), ...rows.map((r) => r.map(escape).join(',')),].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TDS_Register_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('TDS register exported to CSV');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Statutory Tax Compliance: TDS & GST"
        eyebrow="FINANCE & TAXATION"
        description="Comprehensive statutory direct & indirect tax management: Section 194C/194J/194I contractor TDS deductions and GSTR-3B Input Tax Credit (ITC)."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <DownloadSimple size={16} className="mr-1.5" />
              Export Register
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setFormDeductee('');
                setFormPan('');
                handleSectionChange('194C');
                setFormInvoice('');
                setFormDate(new Date().toISOString().slice(0, 10));
                setFormGross(0);
                setIsAddTdsOpen(true);
              }}
            >
              <Plus size={16} className="mr-1.5" />
              Record TDS Deduction
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              TDS Due This Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-700">
            {inr(pendingTdsTotal)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Challan 281 deposit due by 7th Nov</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              TDS Paid (FY YTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            {inr(paidTdsTotal)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Form 26Q compliant deposits</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Eligible Input Tax Credit (ITC)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ₹ 18,20,000
          </div>
          <p className="mt-1 text-xs text-slate-500">Matched with GSTR-2B vendor bills</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net GST Cash Liability
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scales size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            ₹ 3,85,000
          </div>
          <p className="mt-1 text-xs text-slate-500">Net monthly PMT-06 cash payable</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-sm flex items-center gap-1">
        <button
          onClick={() => setActiveTab('tds')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'tds'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          TDS Register (Sec 194C / 194J / 194I)
        </button>
        <button
          onClick={() => setActiveTab('gst')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'gst'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          GST Returns & Input Tax Credit (GSTR-3B)
        </button>
      </div>

      {/* Tab 1: TDS Register */}
      {activeTab === 'tds' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Filter by Section:</span>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none"
              >
                <option value="all">All Sections</option>
                <option value="194C">Section 194C (Contractors 1%/2%)</option>
                <option value="194J">Section 194J (Consultants / Tech 10%)</option>
                <option value="194I">Section 194I (Equipment Hire 2%)</option>
                <option value="194Q">Section 194Q (Goods Purchase 0.1%)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Deductee & PAN</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Invoice & Date</th>
                  <th className="p-3 text-right">Gross Amount</th>
                  <th className="p-3 text-right">TDS Rate</th>
                  <th className="p-3 text-right">TDS Deducted</th>
                  <th className="p-3 text-center">Challan Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTds.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{t.deducteeName}</div>
                      <div className="font-mono text-slate-500 mt-0.5">{t.pan}</div>
                    </td>
                    <td className="p-3 font-semibold text-blue-700">Sec {t.section}</td>
                    <td className="p-3">
                      <div className="font-mono text-slate-800">{t.invoiceNumber}</div>
                      <div className="text-slate-400 mt-0.5">{day(t.invoiceDate)}</div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">{inr(t.grossAmount)}</td>
                    <td className="p-3 text-right font-mono font-semibold">{t.tdsRate}%</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">
                      {inr(t.tdsAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge tone={t.status === 'paid' ? 'success' : 'warning'}>
                        {t.status === 'paid' ? 'Challan Paid' : 'Challan Due'}
                      </Badge>
                      {t.challanNumber && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {t.challanNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {t.status === 'pending' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            setPayingChallan(t);
                            setFormBSR('0291048');
                            setFormChallanNo(`CHL-${Date.now().toString().slice(-5)}`);
                          }}
                        >
                          Pay Challan
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Deposited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: GST Summary */}
      {activeTab === 'gst' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gstSummaries.map((gst) => (
              <div
                key={gst.period}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">GSTR-3B · {gst.period}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Due: {day(gst.dueDate)}</p>
                  </div>
                  <Badge tone={gst.status === 'filed' ? 'success' : 'info'}>
                    {gst.status === 'filed' ? 'Filed & Accepted' : 'Ready for Filing'}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Outward Taxable Value (Sales):</span>
                    <span className="font-mono font-medium">{inr(gst.outwardTaxable)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Output GST Liability:</span>
                    <span className="font-mono">{inr(gst.outputGst)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1 flex justify-between text-emerald-700">
                    <span>Less: Eligible ITC (Purchases & Subcontracts):</span>
                    <span className="font-mono font-semibold">- {inr(gst.eligibleItc)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-semibold">
                      Net Tax Payable in Cash (PMT-06)
                    </span>
                    <span className="font-mono font-bold text-lg text-slate-900">
                      {inr(gst.netPayable)}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.success('GSTR-3B JSON exported')}>
                    Export JSON
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Record TDS Deduction */}
      {isAddTdsOpen && (
        <Modal
          title="Record Statutory TDS Deduction"
          open={isAddTdsOpen}
          onClose={() => setIsAddTdsOpen(false)}
        >
          <form onSubmit={handleSaveTds} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Deductee Name (Contractor / Professional) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Precision Formwork Ltd"
                  value={formDeductee}
                  onChange={(e) => setFormDeductee(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Permanent Account Number (PAN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AABCP8902M"
                  value={formPan}
                  onChange={(e) => setFormPan(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Income Tax Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formSection}
                  onChange={(e) => handleSectionChange(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
                >
                  <option value="194C">Section 194C - Contractor (2% Co / 1% Indiv)</option>
                  <option value="194J">Section 194J - Technical / Professional (10%)</option>
                  <option value="194I">Section 194I - Plant & Machinery Rent (2%)</option>
                  <option value="194Q">Section 194Q - Purchase of Goods (0.1%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Source Invoice / RA Bill Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. RA-26-0028"
                  value={formInvoice}
                  onChange={(e) => setFormInvoice(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gross Bill Amount (INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step="any"
                  required
                  value={formGross || ''}
                  onChange={(e) => setFormGross(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  TDS Rate (%)
                </label>
                <input
                  type="number"
                  min={0.1}
                  step="any"
                  value={formRate}
                  onChange={(e) => setFormRate(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Calculated TDS Deduction:</span>
              <span className="font-mono font-bold text-base text-rose-700">
                {inr(Math.round((formGross * formRate) / 100))}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddTdsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Record TDS</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Pay Challan 281 */}
      {payingChallan && (
        <Modal
          title={`Pay Challan 281 · ${payingChallan.deducteeName}`}
          open={Boolean(payingChallan)}
          onClose={() => setPayingChallan(null)}
        >
          <form onSubmit={handlePayChallan} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Deductee PAN:</span>
                <span className="font-mono font-medium">{payingChallan.pan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TDS Head:</span>
                <span>Section {payingChallan.section}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>Challan Tax Amount:</span>
                <span className="font-mono">{inr(payingChallan.tdsAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  BSR Code (7 Digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0291048"
                  value={formBSR}
                  onChange={(e) => setFormBSR(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Challan Identification No. (CIN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="CHL-2026-90412"
                  value={formChallanNo}
                  onChange={(e) => setFormChallanNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setPayingChallan(null)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Challan Deposit</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
