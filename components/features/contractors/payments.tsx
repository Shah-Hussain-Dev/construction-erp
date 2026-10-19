'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function PaymentsToContractorsPage() {
  return (
    <ModuleScaffold
      category="Contractor & Billing"
      title="Payments to Contractors"
      description="Disbursement vouchers, RTGS/NEFT payment certificates, advance releases, retention releases, and ledger settlements."
      moduleCode="PAY-CON"
      searchPlaceholder="Filter payment records by contractor, voucher, UTR, or bank..."
      recordActionLabel="Record Payment"
      stats={[
        { label: 'Disbursed This Month', value: '₹ 65,20,000', sub: '18 RTGS transactions' },
        { label: 'Pending Disbursal', value: '₹ 14,30,000', sub: 'Approved for payment' },
        { label: 'Retention Held', value: '₹ 38,10,000', sub: 'Defect liability period' },
        { label: 'Active Contractors', value: '14', sub: 'Verified bank accounts' },
      ]}
      tableColumns={['Voucher / Advice', 'Contractor', 'Against Bill', 'Paid Amount', 'Mode / UTR', 'Bank Account', 'Payment Date', 'Status']}
      mockRows={[
        {
          'Voucher / Advice': 'PAY-2026-114',
          Contractor: 'Sharma Infra',
          'Against Bill': 'RB-002',
          'Paid Amount': '₹ 8,75,000',
          'Mode / UTR': 'NEFT / HDFC8829104',
          'Bank Account': 'HDFC Bank - 0021',
          'Payment Date': '14 Oct 2026',
          Status: 'Settled',
        },
        {
          'Voucher / Advice': 'PAY-2026-115',
          Contractor: 'Khan Builders',
          'Against Bill': 'RB-001',
          'Paid Amount': '₹ 5,20,000',
          'Mode / UTR': 'RTGS / SBIN0091823',
          'Bank Account': 'State Bank of India',
          'Payment Date': '12 Oct 2026',
          Status: 'Settled',
        },
      ]}
    />
  );
}
