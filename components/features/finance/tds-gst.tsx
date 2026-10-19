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
  PencilSimple,
  Trash,
  Bank,
  FileText,
  CreditCard,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { PageHeader } from '../../shell';
import { Badge, Modal } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr, day } from '@/lib/format';

export interface TDSRecord {
  id: string;
  deducteeName: string;
  pan: string;
  section: '194C' | '194J' | '194I' | '194Q';
  deducteeType?: 'corporate' | 'individual';
  natureOfPayment?: string;
  assessmentYear?: string;
  invoiceNumber: string;
  invoiceDate: string;
  grossAmount: number;
  tdsRate: number;
  tdsAmount: number;
  status: 'pending' | 'paid';
  challanNumber?: string;
  bsrCode?: string;
  paidOn?: string;
  paymentBank?: string;
  minorHead?: '200' | '400';
  paymentMode?: string;
}

export interface GSTSummary {
  period: string;
  outwardTaxable: number;
  outputGst: number;
  inwardTaxable: number;
  eligibleItc: number;
  netPayable: number;
  status: 'filed' | 'ready_for_filing' | 'draft';
  dueDate: string;
  arn?: string;
  pmt06Ref?: string;
  filingDate?: string;
}

export function TdsAndGstPage() {
  const [activeTab, setActiveTab] = useState<'tds' | 'gst'>('tds');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddTdsOpen, setIsAddTdsOpen] = useState(false);
  const [editingTds, setEditingTds] = useState<TDSRecord | null>(null);
  const [deletingTds, setDeletingTds] = useState<TDSRecord | null>(null);
  const [payingChallan, setPayingChallan] = useState<TDSRecord | null>(null);

  // GST Modal State
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);
  const [editingGst, setEditingGst] = useState<GSTSummary | null>(null);

  // TDS Form State
  const [formDeductee, setFormDeductee] = useState('');
  const [formPan, setFormPan] = useState('');
  const [formDeducteeType, setFormDeducteeType] = useState<'corporate' | 'individual'>('corporate');
  const [formSection, setFormSection] = useState<'194C' | '194J' | '194I' | '194Q'>('194C');
  const [formNature, setFormNature] = useState('Civil Subcontract Works');
  const [formAssessmentYear, setFormAssessmentYear] = useState('AY 2026-27 (FY 2025-26)');
  const [formInvoice, setFormInvoice] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formGross, setFormGross] = useState<number>(0);
  const [formRate, setFormRate] = useState<number>(2); // 2% for 194C corporate

  // Challan Payment Form State
  const [formBank, setFormBank] = useState('HDFC Bank - Current A/c (Escrow)');
  const [formPaymentMode, setFormPaymentMode] = useState('Corporate NetBanking');
  const [formPaymentDate, setFormPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [formMinorHead, setFormMinorHead] = useState<'200' | '400'>('200');
  const [formBSR, setFormBSR] = useState('');
  const [formChallanNo, setFormChallanNo] = useState('');
  const [formUtr, setFormUtr] = useState('');

  // GST Form State
  const [formGstPeriod, setFormGstPeriod] = useState('October 2026');
  const [formGstStatus, setFormGstStatus] = useState<'draft' | 'ready_for_filing' | 'filed'>('ready_for_filing');
  const [formOutwardTaxable, setFormOutwardTaxable] = useState<number>(14500000);
  const [formOutputGst, setFormOutputGst] = useState<number>(2610000);
  const [formInwardTaxable, setFormInwardTaxable] = useState<number>(11200000);
  const [formEligibleItc, setFormEligibleItc] = useState<number>(2016000);
  const [formGstDueDate, setFormGstDueDate] = useState('2026-11-20');
  const [formGstArn, setFormGstArn] = useState('');
  const [formPmt06Ref, setFormPmt06Ref] = useState('');

  // TDS Records State
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>([
    {
      id: 'tds-1',
      deducteeName: 'Precision Formwork Contractors',
      pan: 'AABCP8902M',
      section: '194C',
      deducteeType: 'corporate',
      natureOfPayment: 'RCC Shuttering & Scaffolding Works',
      assessmentYear: 'AY 2026-27 (FY 2025-26)',
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
      deducteeType: 'individual',
      natureOfPayment: 'HVAC & Electrical Engineering Audit',
      assessmentYear: 'AY 2026-27 (FY 2025-26)',
      invoiceNumber: 'INV-2026-081',
      invoiceDate: '2026-10-10',
      grossAmount: 60000,
      tdsRate: 10,
      tdsAmount: 6000,
      status: 'paid',
      challanNumber: 'CHL-2026-09281',
      bsrCode: '0291048',
      paidOn: '2026-10-12',
      paymentBank: 'HDFC Bank - Current A/c (Escrow)',
      minorHead: '200',
      paymentMode: 'Corporate NetBanking',
    },
    {
      id: 'tds-3',
      deducteeName: 'HeavyLift Crane Services',
      pan: 'CCDPK5512L',
      section: '194I',
      deducteeType: 'corporate',
      natureOfPayment: 'Tower Crane Monthly Hire Charges',
      assessmentYear: 'AY 2026-27 (FY 2025-26)',
      invoiceNumber: 'INV-CRANE-901',
      invoiceDate: '2026-10-08',
      grossAmount: 185000,
      tdsRate: 2,
      tdsAmount: 3700,
      status: 'paid',
      challanNumber: 'CHL-2026-09280',
      bsrCode: '0291048',
      paidOn: '2026-10-12',
      paymentBank: 'SBI Cash Credit Account',
      minorHead: '200',
      paymentMode: 'RTGS Electronic Remittance',
    },
  ]);

  // GST Returns Summary State
  const [gstSummaries, setGstSummaries] = useState<GSTSummary[]>([
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
      pmt06Ref: 'PMT-2026-091482',
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
      pmt06Ref: 'PMT-2026-088192',
      filingDate: '2026-09-18',
    },
  ]);

  // Section Rate Presets based on section and deductee type
  const updatePresetRate = (sec: '194C' | '194J' | '194I' | '194Q', entityType: 'corporate' | 'individual') => {
    if (sec === '194C') {
      setFormRate(entityType === 'corporate' ? 2 : 1);
    } else if (sec === '194J') {
      setFormRate(10);
    } else if (sec === '194I') {
      setFormRate(2); // Machinery hire (2%), Plant/Land is 10%
    } else if (sec === '194Q') {
      setFormRate(0.1);
    }
  };

  const handleSectionChange = (sec: '194C' | '194J' | '194I' | '194Q') => {
    setFormSection(sec);
    updatePresetRate(sec, formDeducteeType);
    if (sec === '194C') setFormNature('Civil & Structural Subcontract Works');
    else if (sec === '194J') setFormNature('Architectural / Technical Consulting');
    else if (sec === '194I') setFormNature('Plant, Shuttering & Machinery Hire');
    else if (sec === '194Q') setFormNature('Procurement of Bulk Steel / Cement (> ₹50L)');
  };

  const handleDeducteeTypeChange = (type: 'corporate' | 'individual') => {
    setFormDeducteeType(type);
    updatePresetRate(formSection, type);
  };

  const openAddTds = () => {
    setEditingTds(null);
    setFormDeductee('');
    setFormPan('');
    setFormDeducteeType('corporate');
    setFormSection('194C');
    setFormNature('Civil & Structural Subcontract Works');
    setFormAssessmentYear('AY 2026-27 (FY 2025-26)');
    setFormInvoice('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormGross(0);
    setFormRate(2);
    setIsAddTdsOpen(true);
  };

  const openEditTds = (t: TDSRecord) => {
    setEditingTds(t);
    setFormDeductee(t.deducteeName);
    setFormPan(t.pan);
    setFormDeducteeType(t.deducteeType || 'corporate');
    setFormSection(t.section);
    setFormNature(t.natureOfPayment || 'Subcontract Works');
    setFormAssessmentYear(t.assessmentYear || 'AY 2026-27 (FY 2025-26)');
    setFormInvoice(t.invoiceNumber);
    setFormDate(t.invoiceDate);
    setFormGross(t.grossAmount);
    setFormRate(t.tdsRate);
    setIsAddTdsOpen(true);
  };

  // Add / Update TDS Mutation Handler
  const handleSaveTds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeductee.trim() || formGross <= 0) {
      toast.error('Enter a valid deductee and gross amount');
      return;
    }

    const calculatedTds = Math.round((formGross * formRate) / 100);

    if (editingTds) {
      setTdsRecords((prev) =>
        prev.map((t) =>
          t.id === editingTds.id
            ? {
                ...t,
                deducteeName: formDeductee.trim(),
                pan: formPan.trim().toUpperCase(),
                section: formSection,
                deducteeType: formDeducteeType,
                natureOfPayment: formNature.trim(),
                assessmentYear: formAssessmentYear,
                invoiceNumber: formInvoice.trim() || t.invoiceNumber,
                invoiceDate: formDate,
                grossAmount: formGross,
                tdsRate: formRate,
                tdsAmount: calculatedTds,
              }
            : t
        )
      );
      toast.success(`TDS record for ${formDeductee} updated`);
    } else {
      const newRecord: TDSRecord = {
        id: `tds-${Date.now()}`,
        deducteeName: formDeductee.trim(),
        pan: formPan.trim().toUpperCase() || 'PANNOTREQ1',
        section: formSection,
        deducteeType: formDeducteeType,
        natureOfPayment: formNature.trim(),
        assessmentYear: formAssessmentYear,
        invoiceNumber: formInvoice.trim() || `RA-26-${Date.now().toString().slice(-4)}`,
        invoiceDate: formDate,
        grossAmount: formGross,
        tdsRate: formRate,
        tdsAmount: calculatedTds,
        status: 'pending',
      };
      setTdsRecords((prev) => [newRecord, ...prev]);
      toast.success(`TDS deduction of ${inr(calculatedTds)} recorded under Sec ${formSection}`);
    }

    setIsAddTdsOpen(false);
    setEditingTds(null);
  };

  // Delete TDS Handler
  const handleDeleteTds = () => {
    if (!deletingTds) return;
    setTdsRecords((prev) => prev.filter((t) => t.id !== deletingTds.id));
    toast.success(`TDS record for ${deletingTds.deducteeName} deleted`);
    setDeletingTds(null);
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
              challanNumber: formChallanNo || `CHL-2026-${Date.now().toString().slice(-5)}`,
              bsrCode: formBSR || '0291048',
              paidOn: formPaymentDate,
              paymentBank: formBank,
              minorHead: formMinorHead,
              paymentMode: formPaymentMode,
            }
          : t
      )
    );
    toast.success(`Challan 281 deposited for ${payingChallan.deducteeName}`);
    setPayingChallan(null);
  };

  // GST Return Handlers
  const openAddGst = () => {
    setEditingGst(null);
    setFormGstPeriod('October 2026');
    setFormGstStatus('ready_for_filing');
    setFormOutwardTaxable(14500000);
    setFormOutputGst(2610000);
    setFormInwardTaxable(11200000);
    setFormEligibleItc(2016000);
    setFormGstDueDate('2026-11-20');
    setFormGstArn(`AA29102600${Date.now().toString().slice(-5)}`);
    setFormPmt06Ref(`PMT-2026-10${Date.now().toString().slice(-4)}`);
    setIsGstModalOpen(true);
  };

  const openEditGst = (gst: GSTSummary) => {
    setEditingGst(gst);
    setFormGstPeriod(gst.period);
    setFormGstStatus(gst.status);
    setFormOutwardTaxable(gst.outwardTaxable);
    setFormOutputGst(gst.outputGst);
    setFormInwardTaxable(gst.inwardTaxable);
    setFormEligibleItc(gst.eligibleItc);
    setFormGstDueDate(gst.dueDate);
    setFormGstArn(gst.arn || '');
    setFormPmt06Ref(gst.pmt06Ref || '');
    setIsGstModalOpen(true);
  };

  const handleSaveGst = (e: React.FormEvent) => {
    e.preventDefault();
    const netPayable = Math.max(0, formOutputGst - formEligibleItc);

    if (editingGst) {
      setGstSummaries((prev) =>
        prev.map((g) =>
          g.period === editingGst.period
            ? {
                ...g,
                period: formGstPeriod,
                status: formGstStatus,
                outwardTaxable: formOutwardTaxable,
                outputGst: formOutputGst,
                inwardTaxable: formInwardTaxable,
                eligibleItc: formEligibleItc,
                netPayable,
                dueDate: formGstDueDate,
                arn: formGstArn,
                pmt06Ref: formPmt06Ref,
                filingDate: formGstStatus === 'filed' ? (g.filingDate || new Date().toISOString().slice(0, 10)) : undefined,
              }
            : g
        )
      );
      toast.success(`GSTR-3B for ${formGstPeriod} updated successfully`);
    } else {
      const newGst: GSTSummary = {
        period: formGstPeriod,
        status: formGstStatus,
        outwardTaxable: formOutwardTaxable,
        outputGst: formOutputGst,
        inwardTaxable: formInwardTaxable,
        eligibleItc: formEligibleItc,
        netPayable,
        dueDate: formGstDueDate,
        arn: formGstArn,
        pmt06Ref: formPmt06Ref,
        filingDate: formGstStatus === 'filed' ? new Date().toISOString().slice(0, 10) : undefined,
      };
      setGstSummaries((prev) => [newGst, ...prev]);
      toast.success(`GSTR-3B for ${formGstPeriod} recorded successfully`);
    }

    setIsGstModalOpen(false);
    setEditingGst(null);
  };

  // Filtered TDS records
  const filteredTds = useMemo(() => {
    return tdsRecords.filter((t) => {
      const matchesSection = sectionFilter === 'all' || t.section === sectionFilter;
      const matchesSearch =
        !searchQuery ||
        t.deducteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.pan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [tdsRecords, sectionFilter, searchQuery]);

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

  const currentGstSummary = gstSummaries[0] || {
    eligibleItc: 1820000,
    netPayable: 385000,
  };

  // Export CSV
  const handleExportCsv = () => {
    if (activeTab === 'tds') {
      const keys = [
        'Deductee Name',
        'Entity Type',
        'PAN',
        'Section',
        'Nature of Payment',
        'Assessment Year',
        'Invoice No',
        'Invoice Date',
        'Gross Amount (INR)',
        'TDS Rate (%)',
        'TDS Deducted (INR)',
        'Status',
        'Challan No',
        'BSR Code',
        'Payment Date',
      ];
      const rows = filteredTds.map((t) => [
        t.deducteeName,
        t.deducteeType || 'corporate',
        t.pan,
        t.section,
        t.natureOfPayment || 'Works Contract',
        t.assessmentYear || 'AY 2026-27',
        t.invoiceNumber,
        t.invoiceDate,
        t.grossAmount,
        t.tdsRate,
        t.tdsAmount,
        t.status.toUpperCase(),
        t.challanNumber || '',
        t.bsrCode || '',
        t.paidOn || '',
      ]);

      const escape = (val: any) => `"${String(val).replaceAll('"', '""')}"`;
      const csvContent = [keys.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TDS_Statutory_Register_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('TDS register exported to CSV');
    } else {
      const keys = [
        'Return Period',
        'Status',
        'Outward Taxable Value',
        'Output GST Liability',
        'Inward Taxable Value',
        'Eligible ITC',
        'Net Cash Payable (PMT-06)',
        'Due Date',
        'ARN',
      ];
      const rows = gstSummaries.map((g) => [
        g.period,
        g.status.toUpperCase(),
        g.outwardTaxable,
        g.outputGst,
        g.inwardTaxable,
        g.eligibleItc,
        g.netPayable,
        g.dueDate,
        g.arn || '',
      ]);
      const escape = (val: any) => `"${String(val).replaceAll('"', '""')}"`;
      const csvContent = [keys.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GSTR3B_Returns_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('GST return summary exported to CSV');
    }
  };

  // PAN validation helper
  const isPanValid = useMemo(() => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formPan.trim().toUpperCase());
  }, [formPan]);

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
              {activeTab === 'tds' ? 'Export TDS Register' : 'Export GSTR-3B'}
            </Button>
            {activeTab === 'tds' ? (
              <Button size="sm" onClick={openAddTds}>
                <Plus size={16} className="mr-1.5" />
                Record TDS Deduction
              </Button>
            ) : (
              <Button size="sm" onClick={openAddGst}>
                <Plus size={16} className="mr-1.5" />
                Record Monthly GSTR-3B
              </Button>
            )}
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
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-700 font-mono">
            {inr(pendingTdsTotal)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Challan 281 deposit due by 7th Nov</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              TDS Deposited (YTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700 font-mono">
            {inr(paidTdsTotal)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Form 26Q e-filed with ITD</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Input Tax Credit (ITC)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {inr(currentGstSummary.eligibleItc)}
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
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {inr(currentGstSummary.netPayable)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Net monthly PMT-06 cash payable</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1">
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
      </div>

      {/* Tab 1: TDS Register */}
      {activeTab === 'tds' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlass size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search party, PAN, invoice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 focus:outline-none font-medium"
              >
                <option value="all">All Sections (194C, 194J, 194I, 194Q)</option>
                <option value="194C">Section 194C (Contractors 1%/2%)</option>
                <option value="194J">Section 194J (Consultants / Tech 10%)</option>
                <option value="194I">Section 194I (Equipment Hire 2%)</option>
                <option value="194Q">Section 194Q (Goods Purchase 0.1%)</option>
              </select>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredTds.length}</strong> statutory entries
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Deductee & Legal Entity</th>
                  <th className="p-3">Section & Nature</th>
                  <th className="p-3">Invoice & Date</th>
                  <th className="p-3 text-right">Gross Amount</th>
                  <th className="p-3 text-right">TDS Rate</th>
                  <th className="p-3 text-right">TDS Deducted</th>
                  <th className="p-3 text-center">Challan Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTds.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{t.deducteeName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold">
                          {t.pan}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          · {t.deducteeType || 'Corporate'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-blue-700">Sec {t.section}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {t.natureOfPayment || 'Contract Works'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-medium text-slate-800">{t.invoiceNumber}</div>
                      <div className="text-slate-400 mt-0.5">{day(t.invoiceDate)}</div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">{inr(t.grossAmount)}</td>
                    <td className="p-3 text-right font-mono font-semibold text-slate-800">{t.tdsRate}%</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-700">
                      {inr(t.tdsAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge tone={t.status === 'paid' ? 'success' : 'warning'}>
                        {t.status === 'paid' ? 'Challan 281 Paid' : 'Challan Due'}
                      </Badge>
                      {t.challanNumber && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {t.challanNumber} · BSR: {t.bsrCode}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.status === 'pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              onClick={() => {
                                setPayingChallan(t);
                                setFormBank('HDFC Bank - Current A/c (Escrow)');
                                setFormPaymentMode('Corporate NetBanking');
                                setFormPaymentDate(new Date().toISOString().slice(0, 10));
                                setFormMinorHead('200');
                                setFormBSR('0291048');
                                setFormChallanNo(`CHL-2026-${Date.now().toString().slice(-5)}`);
                                setFormUtr(`UTR-HDFC-${Date.now().toString().slice(-6)}`);
                              }}
                            >
                              Pay Challan
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                              title="Edit Entry"
                              onClick={() => openEditTds(t)}
                            >
                              <PencilSimple size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete Entry"
                              onClick={() => setDeletingTds(t)}
                            >
                              <Trash size={14} />
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-100 flex items-center gap-1">
                              <CheckCircle size={12} weight="bold" /> Deposited
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                              title="View / Edit Details"
                              onClick={() => openEditTds(t)}
                            >
                              <PencilSimple size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
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
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <FileText size={16} className="text-blue-600" />
                      GSTR-3B · {gst.period}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Statutory Due Date: {day(gst.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={gst.status === 'filed' ? 'success' : gst.status === 'ready_for_filing' ? 'info' : 'neutral'}>
                      {gst.status === 'filed'
                        ? 'Filed & Accepted'
                        : gst.status === 'ready_for_filing'
                        ? 'Ready for Filing'
                        : 'Draft Computation'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                      onClick={() => openEditGst(gst)}
                      title="Adjust / Update Return"
                    >
                      <PencilSimple size={14} />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Outward Taxable Value (Sales & RA Bills):</span>
                    <span className="font-mono font-bold text-slate-900">{inr(gst.outwardTaxable)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>Output GST Liability (CGST + SGST + IGST):</span>
                    <span className="font-mono text-indigo-700">{inr(gst.outputGst)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between text-emerald-700">
                    <span className="font-medium">Less: Eligible ITC (Purchases & Subcontracts):</span>
                    <span className="font-mono font-bold">- {inr(gst.eligibleItc)}</span>
                  </div>
                  {gst.arn && (
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between text-[11px] text-slate-500">
                      <span>Filing ARN:</span>
                      <span className="font-mono font-semibold text-slate-800">{gst.arn}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">
                      Net Tax Payable in Cash (PMT-06)
                    </span>
                    <span className="font-mono font-bold text-xl text-slate-900">
                      {inr(gst.netPayable)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success(`GSTR-3B JSON for ${gst.period} exported for GSTN Portal upload`)}
                    >
                      Export JSON
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openEditGst(gst)}
                    >
                      {gst.status === 'filed' ? 'View Slip' : 'File & Settle'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Record / Edit TDS Deduction */}
      {(isAddTdsOpen || editingTds) && (
        <Modal
          size="lg"
          title={editingTds ? `Edit Statutory TDS Deduction · ${editingTds.deducteeName}` : 'Record Statutory TDS Deduction'}
          open={isAddTdsOpen || Boolean(editingTds)}
          onClose={() => {
            setIsAddTdsOpen(false);
            setEditingTds(null);
          }}
        >
          <form onSubmit={handleSaveTds} className="space-y-4">
            {/* Card 1: Deductee Identity */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-blue-600" />
                Deductee Particulars & Tax Identity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deductee Entity Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Precision Formwork Contractors Pvt Ltd"
                    value={formDeductee}
                    onChange={(e) => setFormDeductee(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deductee Legal Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDeducteeType}
                    onChange={(e) => handleDeducteeTypeChange(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="corporate">Domestic Company / LLP / Partnership Firm (2%)</option>
                    <option value="individual">Individual / Proprietorship / HUF (1%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Permanent Account Number (PAN) <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                      formPan.length === 10
                        ? isPanValid
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                        : 'text-slate-400'
                    }`}>
                      {formPan.length === 10 ? (isPanValid ? 'Valid PAN' : 'Invalid PAN') : `${formPan.length}/10 chars`}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. AABCP8902M"
                    value={formPan}
                    onChange={(e) => setFormPan(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statutory Assessment Year
                  </label>
                  <select
                    value={formAssessmentYear}
                    onChange={(e) => setFormAssessmentYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="AY 2026-27 (FY 2025-26)">AY 2026-27 (Financial Year 2025-26)</option>
                    <option value="AY 2027-28 (FY 2026-27)">AY 2027-28 (Financial Year 2026-27)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Section & Invoice Particulars */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-blue-600" />
                Income Tax Section & Bill Particulars
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    TDS Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSection}
                    onChange={(e) => handleSectionChange(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="194C">Section 194C - Contractor (2% Co / 1% Indiv)</option>
                    <option value="194J">Section 194J - Technical / Professional (10%)</option>
                    <option value="194I">Section 194I - Plant & Machinery Rent (2%)</option>
                    <option value="194Q">Section 194Q - Purchase of Goods &gt; ₹50L (0.1%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nature / Description of Work
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RCC Subcontract Works"
                    value={formNature}
                    onChange={(e) => setFormNature(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Source Invoice / RA Bill Ref <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RA-26-0028"
                    value={formInvoice}
                    onChange={(e) => setFormInvoice(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Computation & Live Tax Breakdown */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CurrencyInr size={14} className="text-blue-600" />
                Financial Valuation & Withholding Computation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gross Invoice Taxable Value (INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    required
                    value={formGross || ''}
                    onChange={(e) => setFormGross(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Withholding Rate (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Live breakdown panel */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200/80 text-xs text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Gross Bill</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{inr(formGross)}</span>
                </div>
                <div className="border-x border-slate-100">
                  <span className="text-[10px] text-rose-600 uppercase font-semibold block">TDS Withheld</span>
                  <span className="font-mono font-bold text-rose-700 text-sm">
                    {inr(Math.round((formGross * formRate) / 100))}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 uppercase font-semibold block">Net Disbursable</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {inr(Math.max(0, formGross - Math.round((formGross * formRate) / 100)))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddTdsOpen(false);
                  setEditingTds(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTds ? 'Save Changes' : 'Record TDS Deduction'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Pay Challan 281 */}
      {payingChallan && (
        <Modal
          size="lg"
          title={`Deposit Challan 281 · ${payingChallan.deducteeName}`}
          open={Boolean(payingChallan)}
          onClose={() => setPayingChallan(null)}
        >
          <form onSubmit={handlePayChallan} className="space-y-4">
            {/* Header Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Deductee PAN & Name:</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {payingChallan.pan}
                  </span>
                  {payingChallan.deducteeName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tax Head & Assessment:</span>
                <span className="font-medium text-slate-800">
                  Section {payingChallan.section} · AY 2026-27 (FY 2025-26)
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Challan 281 Tax Deposit Amount:</span>
                <span className="font-mono text-base text-rose-700">{inr(payingChallan.tdsAmount)}</span>
              </div>
            </div>

            {/* Banking Particulars */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bank size={14} className="text-blue-600" />
                Disbursing Bank Account & Minor Head
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disbursing Bank Account <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="HDFC Bank - Current A/c (Escrow)">HDFC Bank - Current A/c (Escrow 502000...)</option>
                    <option value="SBI Cash Credit Account">SBI Cash Credit Account (384910...)</option>
                    <option value="ICICI Bank - Operating Current A/c">ICICI Bank - Operating Current A/c (0049...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="Corporate NetBanking">Corporate NetBanking (e-Tax portal)</option>
                    <option value="RTGS Electronic Remittance">RTGS Electronic Remittance</option>
                    <option value="NEFT Clearing">NEFT Clearing</option>
                    <option value="Over-the-counter Cheque">Over-the-counter Cheque at Authorised Branch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minor Head Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formMinorHead}
                    onChange={(e) => setFormMinorHead(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="200">(200) TDS / TCS Payable by Taxpayer (Standard Regular Monthly)</option>
                    <option value="400">(400) TDS / TCS Regular Assessment (Under Notice)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment / Challan Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formPaymentDate}
                    onChange={(e) => setFormPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Government CIN & Bank Reference */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-blue-600" />
                Statutory Bank Acknowledgment & CIN
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    BSR Code (7 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    placeholder="0291048"
                    value={formBSR}
                    onChange={(e) => setFormBSR(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Challan Serial No. / CIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CHL-2026-90412"
                    value={formChallanNo}
                    onChange={(e) => setFormChallanNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank UTR Reference
                  </label>
                  <input
                    type="text"
                    placeholder="UTR-HDFC-992140"
                    value={formUtr}
                    onChange={(e) => setFormUtr(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setPayingChallan(null)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Challan Deposit</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Add / Adjust GSTR-3B Return */}
      {(isGstModalOpen || editingGst) && (
        <Modal
          size="lg"
          title={editingGst ? `Update GSTR-3B Return · ${editingGst.period}` : 'Record Monthly GSTR-3B Computation'}
          open={isGstModalOpen || Boolean(editingGst)}
          onClose={() => {
            setIsGstModalOpen(false);
            setEditingGst(null);
          }}
        >
          <form onSubmit={handleSaveGst} className="space-y-4">
            {/* Period & Status */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={14} className="text-blue-600" />
                Tax Period & Statutory Filing Status
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax Period (Month & Year) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026"
                    value={formGstPeriod}
                    onChange={(e) => setFormGstPeriod(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Filing Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formGstStatus}
                    onChange={(e) => setFormGstStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="draft">Draft Computation (Unconfirmed)</option>
                    <option value="ready_for_filing">Ready for Filing (Matched with 2B)</option>
                    <option value="filed">Filed & Tax Paid via PMT-06</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Filing Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formGstDueDate}
                    onChange={(e) => setFormGstDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Outward Taxable (Sales) */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-blue-600" />
                Table 3.1: Outward Supplies & Output Tax Liability
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Outward Taxable Value (Turnover / RA Bills) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formOutwardTaxable || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormOutwardTaxable(val);
                      setFormOutputGst(Math.round(val * 0.18)); // Default 18% GST in construction
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Output GST (CGST + SGST + IGST) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formOutputGst || ''}
                    onChange={(e) => setFormOutputGst(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-indigo-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Inward Taxable (ITC) */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-600" />
                Table 4: Inward Supplies & Eligible Input Tax Credit (ITC)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Inward Taxable Purchases (Cement, Steel, Subcontracts)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formInwardTaxable || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormInwardTaxable(val);
                      setFormEligibleItc(Math.round(val * 0.18));
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-medium text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Eligible ITC Reconciled with GSTR-2B <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formEligibleItc || ''}
                    onChange={(e) => setFormEligibleItc(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-emerald-700 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Net Cash Settlement Indicator */}
              <div className="p-3 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Calculated Net Cash Liability (PMT-06 Challan)
                  </span>
                  <span className="text-slate-600 text-[11px]">Output GST ({inr(formOutputGst)}) - Eligible ITC ({inr(formEligibleItc)})</span>
                </div>
                <div className="font-mono font-bold text-lg text-slate-900">
                  {inr(Math.max(0, formOutputGst - formEligibleItc))}
                </div>
              </div>
            </div>

            {/* ARN & Challan Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GST Portal ARN (Application Ref No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AA2910260012948"
                  value={formGstArn}
                  onChange={(e) => setFormGstArn(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PMT-06 Payment Challan Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. PMT-2026-102941"
                  value={formPmt06Ref}
                  onChange={(e) => setFormPmt06Ref(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsGstModalOpen(false);
                  setEditingGst(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingGst ? 'Save GSTR-3B Changes' : 'Record GSTR-3B Return'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Delete TDS Confirmation */}
      {deletingTds && (
        <Modal
          size="sm"
          title="Delete TDS Record"
          open={Boolean(deletingTds)}
          onClose={() => setDeletingTds(null)}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to delete the statutory TDS record for{' '}
              <strong className="text-slate-900">{deletingTds.deducteeName}</strong> (Invoice:{' '}
              <span className="font-mono">{deletingTds.invoiceNumber}</span>)?
            </p>
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <strong>Note:</strong> This will remove the ₹{deletingTds.tdsAmount.toLocaleString('en-IN')} deduction from your pending Challan 281 deposit queue.
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDeletingTds(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteTds}>
                Delete Entry
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
