'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Bank,
  Plus,
  DownloadSimple,
  ArrowsLeftRight,
  PencilSimple,
  Trash,
  CheckCircle,
  CurrencyInr,
  Clock,
  Scales,
  Printer,
  ShieldCheck,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
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

interface BankAccountRecord extends RecordData {
  name?: string;
  bankName?: string;
  accountNumber?: string;
  accountType?: 'current' | 'escrow' | 'overdraft' | 'savings';
  ifsc?: string;
  branch?: string;
  balance?: number;
  status?: string;
}

interface PettyCashRecord {
  id: string;
  siteName: string;
  custodian: string;
  imprestLimit: number;
  cashInHand: number;
  lastReimbursed: string;
  status: 'healthy' | 'replenish_needed' | 'critical';
}

interface ReconciliationItem {
  id: string;
  date: string;
  referenceNo: string;
  partyName: string;
  type: 'deposit' | 'payment';
  amount: number;
  bankClearanceDate?: string;
  status: 'cleared' | 'in_transit';
}

export function CashAndBankPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'bank_accounts' | 'petty_cash' | 'brs'>('bank_accounts');

  // Modals state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccountRecord | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<BankAccountRecord | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedSiteTopUp, setSelectedSiteTopUp] = useState<PettyCashRecord | null>(null);
  const [isAddFloatOpen, setIsAddFloatOpen] = useState(false);

  // Form State for Bank Account
  const [formName, setFormName] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formAccountType, setFormAccountType] = useState<'current' | 'escrow' | 'overdraft' | 'savings'>('current');
  const [formIfsc, setFormIfsc] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formOpeningBalance, setFormOpeningBalance] = useState<number>(0);
  const [formOdLimit, setFormOdLimit] = useState<number>(0);
  const [formUpiId, setFormUpiId] = useState('');

  // Form State for Transfer
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [transferMode, setTransferMode] = useState('NEFT');
  const [transferRef, setTransferRef] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');

  // Top-Up Form State
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [topUpBankId, setTopUpBankId] = useState('');

  // Float Form State
  const [formFloatSite, setFormFloatSite] = useState('');
  const [formFloatCustodian, setFormFloatCustodian] = useState('');
  const [formFloatLimit, setFormFloatLimit] = useState<number>(100000);
  const [formFloatCash, setFormFloatCash] = useState<number>(100000);

  // Load Bank Accounts
  const { data: bankAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      try {
        const list = await dataClient.list('bank-accounts');
        if (Array.isArray(list) && list.length > 0) return list as BankAccountRecord[];
      } catch (e) {
        // Fallback default bank accounts if table empty
      }
      return [
        {
          id: 'ba-1',
          name: 'Vardhan Infra - Current Operating',
          bankName: 'HDFC Bank',
          accountNumber: '•••• •••• 9012',
          accountType: 'current',
          ifsc: 'HDFC0001824',
          branch: 'Richmond Road, Bengaluru',
          balance: 4620000,
          status: 'active',
        },
        {
          id: 'ba-2',
          name: 'Vardhan Infra - Project Escrow (RERA)',
          bankName: 'State Bank of India',
          accountNumber: '•••• •••• 4421',
          accountType: 'escrow',
          ifsc: 'SBIN0004521',
          branch: 'Whitefield Main, Bengaluru',
          balance: 3810000,
          status: 'active',
        },
        {
          id: 'ba-3',
          name: 'Vardhan Infra - Equipment Working Capital CC',
          bankName: 'ICICI Bank',
          accountNumber: '•••• •••• 7734',
          accountType: 'overdraft',
          ifsc: 'ICIC0000892',
          branch: 'MG Road, Bengaluru',
          balance: 1540000,
          status: 'active',
        },
      ] as BankAccountRecord[];
    },
  });

  // Petty Cash Mock / State
  const [pettyCashSites, setPettyCashSites] = useState<PettyCashRecord[]>([
    {
      id: 'pc-1',
      siteName: 'Whitefield · Tower A',
      custodian: 'Rajesh Kumar (Site In-Charge)',
      imprestLimit: 150000,
      cashInHand: 112450,
      lastReimbursed: '2026-10-10',
      status: 'healthy',
    },
    {
      id: 'pc-2',
      siteName: 'Electronic City · Campus',
      custodian: 'Kiran Rao (Resident Engineer)',
      imprestLimit: 100000,
      cashInHand: 24800,
      lastReimbursed: '2026-09-28',
      status: 'replenish_needed',
    },
    {
      id: 'pc-3',
      siteName: 'Sarjapur Luxury Villas',
      custodian: 'Anil Verma (Store In-Charge)',
      imprestLimit: 75000,
      cashInHand: 62000,
      lastReimbursed: '2026-10-12',
      status: 'healthy',
    },
  ]);

  // Bank Reconciliation Items State
  const [brsItems, setBrsItems] = useState<ReconciliationItem[]>([
    {
      id: 'brs-1',
      date: '2026-10-14',
      referenceNo: 'CHQ-092144',
      partyName: 'Ultratech Cement Ltd',
      type: 'payment',
      amount: 327600,
      status: 'in_transit',
    },
    {
      id: 'brs-2',
      date: '2026-10-15',
      referenceNo: 'NEFT-0849102',
      partyName: 'Apex Urban Developers Ltd (Client RA Bill)',
      type: 'deposit',
      amount: 1450000,
      bankClearanceDate: '2026-10-15',
      status: 'cleared',
    },
    {
      id: 'brs-3',
      date: '2026-10-16',
      referenceNo: 'CHQ-092148',
      partyName: 'Precision Formwork Contractors',
      type: 'payment',
      amount: 180000,
      status: 'in_transit',
    },
  ]);

  // Calculations
  const totalBankBalance = useMemo(
    () => bankAccounts.reduce((sum, b) => sum + Number(b.balance || 0), 0),
    [bankAccounts]
  );
  const totalPettyCash = useMemo(
    () => pettyCashSites.reduce((sum, p) => sum + Number(p.cashInHand || 0), 0),
    [pettyCashSites]
  );
  const unclearedPayments = useMemo(
    () =>
      brsItems
        .filter((b) => b.status === 'in_transit' && b.type === 'payment')
        .reduce((sum, b) => sum + b.amount, 0),
    [brsItems]
  );

  // Add Bank Account Mutation
  const addAccountMutation = useMutation({
    mutationFn: (newAcc: Partial<BankAccountRecord>) =>
      dataClient.create('bank-accounts', newAcc as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setIsAddAccountOpen(false);
      toast.success('Bank account registered successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create bank account');
    },
  });

  // Edit Bank Account Mutation
  const editAccountMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BankAccountRecord> }) =>
      dataClient.update('bank-accounts', id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setEditingAccount(null);
      toast.success('Bank account updated');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update bank account');
    },
  });

  // Delete Bank Account Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => dataClient.delete('bank-accounts', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setDeletingAccount(null);
      toast.success('Bank account removed');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to remove bank account');
    },
  });

  // Handle Save New Account
  const handleSaveAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBankName.trim()) {
      toast.error('Account name and bank are required');
      return;
    }

    addAccountMutation.mutate({
      name: formName.trim(),
      bankName: formBankName.trim(),
      accountNumber: formAccountNumber.trim(),
      accountType: formAccountType,
      ifsc: formIfsc.trim().toUpperCase(),
      branch: formBranch.trim(),
      balance: Number(formOpeningBalance || 0),
      odLimit: Number(formOdLimit || 0),
      upiId: formUpiId.trim(),
      status: 'active',
    } as any);
  };

  // Handle Save Edit Account
  const handleSaveEditAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount?.id) return;

    editAccountMutation.mutate({
      id: editingAccount.id,
      data: {
        name: formName.trim(),
        bankName: formBankName.trim(),
        accountNumber: formAccountNumber.trim(),
        accountType: formAccountType,
        ifsc: formIfsc.trim().toUpperCase(),
        branch: formBranch.trim(),
        balance: Number(formOpeningBalance || 0),
        odLimit: Number(formOdLimit || 0),
        upiId: formUpiId.trim(),
      } as any,
    });
  };

  // Handle Fund Transfer (Contra entry)
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferAmount <= 0) {
      toast.error('Enter a valid transfer amount');
      return;
    }
    if (transferFrom === transferTo) {
      toast.error('Source and destination accounts must be different');
      return;
    }

    const srcAcc = bankAccounts.find((b) => b.id === transferFrom);
    if (srcAcc && Number(srcAcc.balance || 0) < transferAmount) {
      toast.error(`Transfer amount exceeds available balance in ${srcAcc.name} (${inr(srcAcc.balance || 0)})`);
      return;
    }

    // Post contra voucher
    dataClient.create('vouchers', {
      type: 'contra',
      number: `VCH-26-${Date.now().toString().slice(-4)}`,
      date: transferDate || new Date().toISOString().slice(0, 10),
      referenceNo: transferRef || `${transferMode}-${Date.now().toString().slice(-5)}`,
      purpose: `Contra Fund Transfer [${transferMode}]: ${transferRemarks || 'Internal transfer between accounts'}`,
      status: 'posted',
      lines: [
        { id: '1', accountId: transferTo, debit: transferAmount, credit: 0 },
        { id: '2', accountId: transferFrom, debit: 0, credit: transferAmount },
      ],
    } as any).then(() => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setIsTransferOpen(false);
      toast.success(`Transferred ${inr(transferAmount)} via Contra Voucher`);
    }).catch((err) => {
      toast.error(err?.message || 'Transfer failed');
    });
  };

  // Handle Save New Float
  const handleSaveFloat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFloatSite.trim() || !formFloatCustodian.trim()) {
      toast.error('Site name and custodian are required');
      return;
    }
    const newRecord: PettyCashRecord = {
      id: `pc-${Date.now()}`,
      siteName: formFloatSite.trim(),
      custodian: formFloatCustodian.trim(),
      imprestLimit: Number(formFloatLimit) || 100000,
      cashInHand: Number(formFloatCash) || Number(formFloatLimit) || 100000,
      lastReimbursed: new Date().toISOString().slice(0, 10),
      status: 'healthy',
    };
    setPettyCashSites((prev) => [newRecord, ...prev]);
    setIsAddFloatOpen(false);
    toast.success(`Petty cash float created for ${newRecord.siteName}`);
  };

  // Handle Petty Cash Top-Up
  const handleExecuteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteTopUp || topUpAmount <= 0) return;

    setPettyCashSites((prev) =>
      prev.map((p) =>
        p.id === selectedSiteTopUp.id
          ? {
              ...p,
              cashInHand: p.cashInHand + topUpAmount,
              lastReimbursed: new Date().toISOString().slice(0, 10),
              status: 'healthy',
            }
          : p
      )
    );
    setIsTopUpOpen(false);
    toast.success(`Replenished ${inr(topUpAmount)} to ${selectedSiteTopUp.siteName} petty cash`);
  };

  // Toggle BRS Clearance
  const handleToggleClearance = (id: string) => {
    setBrsItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'cleared' ? 'in_transit' : 'cleared',
              bankClearanceDate:
                item.status === 'cleared'
                  ? undefined
                  : new Date().toISOString().slice(0, 10),
            }
          : item
      )
    );
    toast.success('Reconciliation status updated');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Cash & Bank Management"
        eyebrow="FINANCE & TREASURY"
        description="Monitor company bank accounts, site petty cash imprints, inter-account contra transfers, and bank reconciliation statements (BRS)."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTransferFrom(bankAccounts[0]?.id || '');
                setTransferTo(bankAccounts[1]?.id || '');
                setTransferAmount(0);
                setTransferRef('');
                setTransferRemarks('');
                setIsTransferOpen(true);
              }}
            >
              <ArrowsLeftRight size={16} className="mr-1.5" />
              Transfer Funds (Contra)
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setFormName('');
                setFormBankName('');
                setFormAccountNumber('');
                setFormAccountType('current');
                setFormIfsc('');
                setFormBranch('');
                setFormOpeningBalance(0);
                setIsAddAccountOpen(true);
              }}
            >
              <Plus size={16} className="mr-1.5" />
              Add Bank Account
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Bank Liquidity
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bank size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {accountsLoading ? <Skeleton className="h-8 w-24" /> : inr(totalBankBalance)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Across {bankAccounts.length} company accounts</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Site Petty Cash
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CurrencyInr size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
            {inr(totalPettyCash)}
          </div>
          <p className="mt-1 text-xs text-slate-500">Active across {pettyCashSites.length} job sites</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Uncleared Cheques (BRS)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-700">
            {inr(unclearedPayments)}
          </div>
          <p className="mt-1 text-xs text-slate-500">2 cheques in clearance transit</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_20px_-5px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              RERA Escrow Account
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck size={18} weight="duotone" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-purple-700">
            ₹ 38,10,000
          </div>
          <p className="mt-1 text-xs text-slate-500">Dedicated project compliance escrow</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-sm flex items-center gap-1">
        <button
          onClick={() => setActiveTab('bank_accounts')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'bank_accounts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Company Bank Accounts ({bankAccounts.length})
        </button>
        <button
          onClick={() => setActiveTab('petty_cash')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'petty_cash'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Site Petty Cash Registers ({pettyCashSites.length})
        </button>
        <button
          onClick={() => setActiveTab('brs')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'brs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Bank Reconciliation Statement (BRS)
        </button>
      </div>

      {/* Tab 1: Bank Accounts */}
      {activeTab === 'bank_accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Bank size={20} weight="duotone" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                      {acc.bankName}
                    </h4>
                    <p className="text-xs text-slate-500 truncate max-w-[180px]">
                      {acc.name}
                    </p>
                  </div>
                </div>
                <Badge tone={acc.accountType === 'escrow' ? 'warning' : 'info'}>
                  {acc.accountType?.toUpperCase() || 'CURRENT'}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Account No:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {acc.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono text-slate-700">{acc.ifsc}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Branch:</span>
                  <span className="text-slate-700 truncate max-w-[160px]">{acc.branch}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Available Balance
                  </span>
                  <span className="font-mono font-bold text-lg text-slate-900">
                    {inr(acc.balance || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-600"
                    onClick={() => {
                      setEditingAccount(acc);
                      setFormName(acc.name || '');
                      setFormBankName(acc.bankName || '');
                      setFormAccountNumber(acc.accountNumber || '');
                      setFormAccountType(acc.accountType || 'current');
                      setFormIfsc(acc.ifsc || '');
                      setFormBranch(acc.branch || '');
                      setFormOpeningBalance(acc.balance || 0);
                    }}
                    title="Edit Account"
                  >
                    <PencilSimple size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-rose-600"
                    onClick={() => setDeletingAccount(acc)}
                    title="Delete Account"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Site Petty Cash Registers */}
      {activeTab === 'petty_cash' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Site Office Imprest & Petty Cash Funds
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical locker cash in hand managed by site supervisors for daily site purchases.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFormFloatSite('');
                setFormFloatCustodian('');
                setFormFloatLimit(100000);
                setFormFloatCash(100000);
                setIsAddFloatOpen(true);
              }}
            >
              <Plus size={16} className="mr-1.5" />
              Add Site Float
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {pettyCashSites.map((site) => (
              <div
                key={site.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{site.siteName}</span>
                    <Badge tone={site.status === 'healthy' ? 'success' : 'warning'}>
                      {site.status === 'healthy' ? 'Sufficient Fund' : 'Top-Up Due'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Custodian: <span className="font-medium text-slate-700">{site.custodian}</span>{' '}
                    • Last Reimbursed: {day(site.lastReimbursed)}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Imprest Limit</span>
                    <span className="font-mono text-sm text-slate-600">{inr(site.imprestLimit)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Current Cash In Hand</span>
                    <span className="font-mono font-bold text-base text-slate-900">
                      {inr(site.cashInHand)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSiteTopUp(site);
                      setTopUpAmount(site.imprestLimit - site.cashInHand);
                      setIsTopUpOpen(true);
                    }}
                  >
                    Top-Up Cash
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Bank Reconciliation Statement (BRS) */}
      {activeTab === 'brs' && (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Scales size={24} weight="duotone" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Reconciliation Summary (BRS)
                </h4>
                <p className="text-xs text-slate-600">
                  Balance as per ERP Books: <strong className="font-mono">{inr(totalBankBalance)}</strong>{' '}
                  • Less: Uncleared Cheques <strong className="font-mono">-{inr(unclearedPayments)}</strong>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Adjusted Bank Passbook Balance</span>
              <span className="font-mono font-bold text-xl text-emerald-700">
                {inr(totalBankBalance - unclearedPayments)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-3">Transaction Date</th>
                  <th className="p-3">Reference / Cheque No</th>
                  <th className="p-3">Party Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                  <th className="p-3 text-center">Clearance Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brsItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono text-slate-600">{day(item.date)}</td>
                    <td className="p-3 font-mono font-medium text-slate-900">{item.referenceNo}</td>
                    <td className="p-3 font-medium text-slate-800">{item.partyName}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          item.type === 'deposit' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {item.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        {item.type === 'deposit' ? 'Deposit' : 'Payment'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {inr(item.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge tone={item.status === 'cleared' ? 'success' : 'warning'}>
                        {item.status === 'cleared'
                          ? `Cleared on ${day(item.bankClearanceDate || item.date)}`
                          : 'In Transit'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleToggleClearance(item.id)}
                      >
                        {item.status === 'cleared' ? 'Mark Uncleared' : 'Mark Cleared'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Bank Account */}
      {(isAddAccountOpen || editingAccount) && (
        <Modal
          size="lg"
          title={isAddAccountOpen ? 'Register Master Bank Account' : `Edit Account · ${editingAccount?.name}`}
          open={isAddAccountOpen || Boolean(editingAccount)}
          onClose={() => {
            setIsAddAccountOpen(false);
            setEditingAccount(null);
          }}
        >
          <form onSubmit={isAddAccountOpen ? handleSaveAddAccount : handleSaveEditAccount} className="space-y-4">
            {/* Card 1: Bank Identity */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bank size={14} className="text-blue-600" />
                Bank Particulars & Identification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Institution Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank, State Bank of India"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Ledger Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Current Operating Account - Apex"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="50200089201923"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IFSC Branch Code
                  </label>
                  <input
                    type="text"
                    placeholder="HDFC0001824"
                    value={formIfsc}
                    onChange={(e) => setFormIfsc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Branch Street Address / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Richmond Road, Bengaluru"
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Card 2: Liquidity & Banking Facilities */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CurrencyInr size={14} className="text-emerald-600" />
                Liquidity & Credit Facilities
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formAccountType}
                    onChange={(e) => setFormAccountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  >
                    <option value="current">Current Operating Account</option>
                    <option value="escrow">Project Escrow (RERA Compliance)</option>
                    <option value="overdraft">Cash Credit (CC) / Overdraft Facility</option>
                    <option value="savings">Savings Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Book Balance (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formOpeningBalance || ''}
                    onChange={(e) => setFormOpeningBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sanctioned OD / CC Limit (INR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formOdLimit || ''}
                    onChange={(e) => setFormOdLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g. 50,00,000 for OD"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Virtual Payment Address (UPI ID / VPA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. vardhaninfra@hdfcbank"
                    value={formUpiId}
                    onChange={(e) => setFormUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddAccountOpen(false);
                  setEditingAccount(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isAddAccountOpen ? 'Register Bank Account' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Contra Fund Transfer */}
      {isTransferOpen && (
        <Modal
          size="lg"
          title="Inter-Account Contra Transfer"
          open={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
        >
          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            {/* Visual Transfer Pipeline */}
            <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider mb-1">
                    Source Account (Credit / Outflow) <span className="text-rose-500">*</span>
                  </span>
                  <select
                    required
                    value={transferFrom}
                    onChange={(e) => setTransferFrom(e.target.value)}
                    className="w-full p-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.name} ({inr(b.balance || 0)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider mb-1">
                    Destination Account (Debit / Inflow) <span className="text-rose-500">*</span>
                  </span>
                  <select
                    required
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full p-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.name} ({inr(b.balance || 0)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {transferFrom && transferTo && transferFrom === transferTo && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <WarningCircle size={16} weight="bold" />
                  <span>Source and Destination accounts must be different for a valid Contra transfer.</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transfer Amount (INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  step="any"
                  required
                  placeholder="0.00"
                  value={transferAmount || ''}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transfer Mode
                </label>
                <select
                  value={transferMode}
                  onChange={(e) => setTransferMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                >
                  <option value="NEFT">NEFT (National Electronic Transfer)</option>
                  <option value="RTGS">RTGS (Real-Time Gross Settlement)</option>
                  <option value="IMPS">IMPS (Immediate Payment)</option>
                  <option value="Cheque">Bank Clearing Cheque</option>
                  <option value="Cash Deposit">Bank Cash Deposit</option>
                  <option value="Cash Withdrawal">Bank Cash Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transfer Date
                </label>
                <input
                  type="date"
                  required
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cheque / UTR / Reference No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-0294821"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose / Narration
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transfer to Project Escrow account..."
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={transferFrom === transferTo || transferAmount <= 0}>
                Execute Contra Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Top-Up Site Petty Cash */}
      {isTopUpOpen && selectedSiteTopUp && (
        <Modal
          size="md"
          title={`Replenish Petty Cash · ${selectedSiteTopUp.siteName}`}
          open={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
        >
          <form onSubmit={handleExecuteTopUp} className="space-y-4">
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Site Custodian:</span>
                <span className="font-semibold text-slate-800">{selectedSiteTopUp.custodian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Imprest Maximum Limit:</span>
                <span className="font-mono font-medium">{inr(selectedSiteTopUp.imprestLimit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Locker Cash In Hand:</span>
                <span className="font-mono font-bold text-slate-900">{inr(selectedSiteTopUp.cashInHand)}</span>
              </div>
              <div className="flex justify-between text-amber-700 font-semibold pt-1 border-t border-slate-200">
                <span>Maximum Eligible Top-Up:</span>
                <span className="font-mono">
                  {inr(selectedSiteTopUp.imprestLimit - selectedSiteTopUp.cashInHand)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disbursing Bank Account
              </label>
              <select
                value={topUpBankId}
                onChange={(e) => setTopUpBankId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} - {b.name} ({inr(b.balance || 0)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Top-Up Replenishment Amount (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsTopUpOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Confirm Replenishment</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Add Site Petty Cash Float */}
      {isAddFloatOpen && (
        <Modal
          size="md"
          title="Register Site Petty Cash Float"
          open={isAddFloatOpen}
          onClose={() => setIsAddFloatOpen(false)}
        >
          <form onSubmit={handleSaveFloat} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Office / Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Line 4 · Casting Yard"
                value={formFloatSite}
                onChange={(e) => setFormFloatSite(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custodian Name & Role <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Patil (Resident Engineer)"
                value={formFloatCustodian}
                onChange={(e) => setFormFloatCustodian(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Imprest Maximum Limit (INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1000}
                  step="any"
                  required
                  value={formFloatLimit}
                  onChange={(e) => setFormFloatLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Cash Float Handover (INR)
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={formFloatCash}
                  onChange={(e) => setFormFloatCash(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsAddFloatOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Register Cash Float</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

