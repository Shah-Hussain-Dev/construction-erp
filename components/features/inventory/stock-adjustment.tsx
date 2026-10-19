'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function StockAdjustmentPage() {
  return (
    <ModuleScaffold
      category="Inventory"
      title="Stock Adjustment"
      description="Physical inventory audits, cycle counting reconciliation, scrap write-offs, and stock correction journals."
      moduleCode="ADJ"
      searchPlaceholder="Search adjustments by voucher, material, store, or reason..."
      recordActionLabel="New Adjustment"
      stats={[
        { label: 'Audits This Month', value: '6', sub: 'Quarterly cycle check' },
        { label: 'Items Adjusted', value: '14', sub: 'Variances recorded' },
        { label: 'Net Variance Value', value: '-₹ 18,400', sub: '0.06% of store stock' },
        { label: 'Pending Store Signoff', value: '1', sub: 'Store keeper review' },
      ]}
      tableColumns={['Voucher No', 'Store Location', 'Material', 'Book Qty', 'Physical Count', 'Variance', 'Reason', 'Status']}
      mockRows={[
        {
          'Voucher No': 'ADJ-2026-008',
          'Store Location': 'Central Yard Store (Site A)',
          Material: 'OPC 53 Cement Bags',
          'Book Qty': '850 Bags',
          'Physical Count': '842 Bags',
          Variance: '-8 Bags',
          Reason: 'Moisture damage during monsoon storage',
          Status: 'Approved',
        },
        {
          'Voucher No': 'ADJ-2026-009',
          'Store Location': 'Sub-store B (City Mall)',
          Material: '12mm TMT Steel Rebar',
          'Book Qty': '14.20 MT',
          'Physical Count': '14.15 MT',
          Variance: '-0.05 MT',
          Reason: 'Cutting and end trimming wastage',
          Status: 'Approved',
        },
        {
          'Voucher No': 'ADJ-2026-010',
          'Store Location': 'Riverside Site Store',
          Material: 'Fly Ash Red Bricks',
          'Book Qty': '12,000 Pcs',
          'Physical Count': '12,050 Pcs',
          Variance: '+50 Pcs',
          Reason: 'Surplus vendor delivery count reconciliation',
          Status: 'Pending',
        },
      ]}
    />
  );
}
