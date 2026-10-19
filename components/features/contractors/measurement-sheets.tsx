'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function MeasurementSheetsPage() {
  return (
    <ModuleScaffold
      category="Contractor & Billing"
      title="Measurement Sheets"
      description="Measurement Book (MB) recordings, joint site inspections, dimensions (L × B × D), and quantified progress entries."
      moduleCode="MB"
      searchPlaceholder="Search MB entries by work order, contractor, site, or item..."
      recordActionLabel="New Measurement Entry"
      stats={[
        { label: 'Active MB Sheets', value: '38', sub: 'Across ongoing contracts' },
        { label: 'Verified This Month', value: '₹ 34.2 L', sub: 'Site engineer certified' },
        { label: 'Pending Joint Check', value: '4', sub: 'Awaiting contractor signoff' },
        { label: 'Linked Running Bills', value: '12', sub: 'Processed in billing' },
      ]}
      tableColumns={['MB Entry No', 'Work Order Ref', 'Contractor', 'Work Package / Scope', 'Total Quantity', 'Certified Date', 'Status']}
      mockRows={[
        {
          'MB Entry No': 'MB-2026-081',
          'Work Order Ref': 'WO-2026-012',
          Contractor: 'ABC Constructions',
          'Work Package / Scope': 'RCC M25 Column Concreting 4th Floor',
          'Total Quantity': '145.50 CUM',
          'Certified Date': '14 Oct 2026',
          Status: 'Certified',
        },
        {
          'MB Entry No': 'MB-2026-082',
          'Work Order Ref': 'WO-2026-014',
          Contractor: 'Sharma Infra',
          'Work Package / Scope': 'Brick Masonry 1:6 in Superstructure',
          'Total Quantity': '82.00 CUM',
          'Certified Date': '13 Oct 2026',
          Status: 'Certified',
        },
        {
          'MB Entry No': 'MB-2026-083',
          'Work Order Ref': 'WO-2026-018',
          Contractor: 'Khan Builders',
          'Work Package / Scope': 'Internal Wall Plastering 12mm thickness',
          'Total Quantity': '1,240.00 SQM',
          'Certified Date': '11 Oct 2026',
          Status: 'Pending Joint Sign',
        },
      ]}
    />
  );
}
