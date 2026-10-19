'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function ManagementReportsPage() {
  return (
    <ModuleScaffold
      category="Reports"
      title="Management Reports"
      description="Executive C-level summaries, profit margin variances, company cash flow forecasts, and statutory compliance status."
      moduleCode="REP-MGT"
      searchPlaceholder="Filter executive reports by financial period or business unit..."
      recordActionLabel="Generate Executive Summary"
      stats={[
        { label: 'Total Turnover YTD', value: '₹ 12.25 Cr', sub: '18% above last year' },
        { label: 'EBITDA Margin', value: '16.4%', sub: 'Healthy construction margin' },
        { label: 'Working Capital Cycle', value: '42 Days', sub: 'Optimized debtor collection' },
        { label: 'Board Review Dossier', value: 'Ready', sub: 'October 2026 Edition' },
      ]}
      tableColumns={['Dossier Name', 'Scope', 'Frequency', 'Key Focus', 'Auditor Signoff', 'Actions']}
      mockRows={[
        {
          'Dossier Name': 'Executive Financial Health & Cash Flow Forecast',
          Scope: 'All Companies & Sites',
          Frequency: 'Monthly',
          'Key Focus': 'Liquidity, Working Capital & Margins',
          'Auditor Signoff': 'Certified by CFO',
          Actions: 'Download PDF / Excel',
        },
        {
          'Dossier Name': 'Vendor & Subcontractor Outstanding Exposure',
          Scope: 'Commercial & Contracting',
          Frequency: 'Bi-Weekly',
          'Key Focus': 'Aging Payables & Retention Hold',
          'Auditor Signoff': 'Certified by Billing Lead',
          Actions: 'Download PDF / Excel',
        },
      ]}
    />
  );
}
