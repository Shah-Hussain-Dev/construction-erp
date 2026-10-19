'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function StockReportsPage() {
  return (
    <ModuleScaffold
      category="Inventory"
      title="Stock Reports"
      description="Store valuation statements, aging analysis, fast/slow moving material diagnostics, and site consumption audits."
      moduleCode="STK-REP"
      searchPlaceholder="Filter stock reports by store, material category, or date..."
      recordActionLabel="Run Stock Report"
      stats={[
        { label: 'Total Stock Value', value: '₹ 28,40,000', sub: 'Current store inventory' },
        { label: 'Reorder Alerts', value: '3 Items', sub: 'Below minimum safety level' },
        { label: 'Active Materials', value: '62 SKUs', sub: 'Cement, steel, aggregates' },
        { label: 'Stores Covered', value: '6 Yards', sub: 'All regional sites' },
      ]}
      tableColumns={['Report Type', 'Target Stores', 'Valuation Basis', 'Generated Date', 'Status', 'Actions']}
      mockRows={[
        {
          'Report Type': 'Store-wise Stock Valuation & Balance Register',
          'Target Stores': 'All Sites (A, B, C, Central Yard)',
          'Valuation Basis': 'Weighted Average Cost (WAC)',
          'Generated Date': '15 Oct 2026',
          Status: 'Ready',
          Actions: 'Download Excel / PDF',
        },
        {
          'Report Type': 'Material Consumption vs Theoretical Estimate',
          'Target Stores': 'Site A - Green Valley',
          'Valuation Basis': 'BOQ Standard Ratio',
          'Generated Date': '14 Oct 2026',
          Status: 'Ready',
          Actions: 'Download Excel / PDF',
        },
        {
          'Report Type': 'Aging & Dead Stock Analysis',
          'Target Stores': 'All Yards',
          'Valuation Basis': 'FIFO (>90 Days)',
          'Generated Date': '10 Oct 2026',
          Status: 'Ready',
          Actions: 'Download Excel / PDF',
        },
      ]}
    />
  );
}
