'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function BillApprovalsPage() {
  return (
    <ModuleScaffold
      category="Contractor & Billing"
      title="Bill Approvals"
      description="Multi-tier contractor running bill scrutiny: MB check, material recovery deductions, retention hold, and manager signoff."
      moduleCode="BL-APPR"
      searchPlaceholder="Filter bills by bill no, contractor, site, or amount..."
      recordActionLabel="Review Pending Queue"
      stats={[
        { label: 'Pending Certification', value: '4 Bills', sub: '₹ 28,45,000 total' },
        { label: 'Approved This Week', value: '6 Bills', sub: 'Forwarded to Accounts' },
        { label: 'Rejected / Returned', value: '1 Bill', sub: 'Measurement dispute' },
        { label: 'Avg Turnaround', value: '2.4 Days', sub: 'Within 3-day SLA' },
      ]}
      tableColumns={['Bill No', 'Contractor', 'Work Order Ref', 'Gross Amount', 'Deductions (TDS/Ret)', 'Net Payable', 'Approver Tier', 'Status']}
      mockRows={[
        {
          'Bill No': 'RB-003',
          Contractor: 'ABC Constructions',
          'Work Order Ref': 'WO-2026-012',
          'Gross Amount': '₹ 14,80,000',
          'Deductions (TDS/Ret)': '₹ 2,30,000',
          'Net Payable': '₹ 12,50,000',
          'Approver Tier': 'Project Manager (Tier 2)',
          Status: 'Pending',
        },
        {
          'Bill No': 'RB-004',
          Contractor: 'Metro Works',
          'Work Order Ref': 'WO-2026-015',
          'Gross Amount': '₹ 17,50,000',
          'Deductions (TDS/Ret)': '₹ 2,50,000',
          'Net Payable': '₹ 15,00,000',
          'Approver Tier': 'Billing Engineer (Tier 1)',
          Status: 'In Review',
        },
        {
          'Bill No': 'RB-002',
          Contractor: 'Sharma Infra',
          'Work Order Ref': 'WO-2026-014',
          'Gross Amount': '₹ 10,25,000',
          'Deductions (TDS/Ret)': '₹ 1,50,000',
          'Net Payable': '₹ 8,75,000',
          'Approver Tier': 'Accounts (Tier 3)',
          Status: 'Approved',
        },
      ]}
    />
  );
}
