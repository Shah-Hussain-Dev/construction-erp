'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function ProjectBudgetPage() {
  return (
    <ModuleScaffold
      category="Project Management"
      title="Project Budget"
      description="BOQ line allocations, sanctioned estimates, cost-to-complete (CTC), and variance tracking."
      moduleCode="BDG"
      searchPlaceholder="Search budget items, cost codes, or work packages..."
      recordActionLabel="Add Budget Line"
      stats={[
        { label: 'Sanctioned Budget', value: '₹ 14.8 Cr', sub: 'Across active projects' },
        { label: 'Committed Cost', value: '₹ 9.2 Cr', sub: 'POs & Work Orders issued' },
        { label: 'Actual Incurred', value: '₹ 6.4 Cr', sub: 'Certified bills & vouchers' },
        { label: 'Variance', value: '-3.8%', sub: 'Within approved threshold' },
      ]}
      tableColumns={['Cost Code', 'Description', 'Approved Budget', 'Committed', 'Actual Spent', 'Remaining', 'Status']}
      mockRows={[
        {
          'Cost Code': 'CC-01 Civil Works',
          Description: 'RCC, Masonry, Plastering & Foundation',
          'Approved Budget': '₹ 6,50,00,000',
          Committed: '₹ 4,80,00,000',
          'Actual Spent': '₹ 3,90,00,000',
          Remaining: '₹ 2,60,00,000',
          Status: 'Healthy',
        },
        {
          'Cost Code': 'CC-02 Steel & Rebar',
          Description: 'TMT 500D primary structural procurement',
          'Approved Budget': '₹ 3,20,00,000',
          Committed: '₹ 2,40,00,000',
          'Actual Spent': '₹ 1,75,00,000',
          Remaining: '₹ 1,45,00,000',
          Status: 'Healthy',
        },
        {
          'Cost Code': 'CC-03 Finishing',
          Description: 'Tiles, Vitrified flooring, Paint & Glass',
          'Approved Budget': '₹ 2,80,00,000',
          Committed: '₹ 90,00,000',
          'Actual Spent': '₹ 45,00,000',
          Remaining: '₹ 2,35,00,000',
          Status: 'Not Started',
        },
      ]}
    />
  );
}
