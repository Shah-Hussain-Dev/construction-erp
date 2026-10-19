'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function ProjectReportsSubPage() {
  return (
    <ModuleScaffold
      category="Reports"
      title="Project Reports"
      description="Cross-project comparison, planned vs actual variance analysis, stage gate milestones, and client progress dossiers."
      moduleCode="REP-PRJ"
      searchPlaceholder="Filter project reports by project name, code, or quarter..."
      recordActionLabel="Generate Project Report"
      stats={[
        { label: 'Available Reports', value: '18', sub: 'Updated daily' },
        { label: 'Scheduled Exports', value: '4 Monthly', sub: 'Sent to clients' },
        { label: 'Data Accuracy', value: '100%', sub: 'Audited against ERP ledgers' },
        { label: 'Supported Formats', value: 'PDF, XLSX', sub: 'Formatted for print' },
      ]}
      tableColumns={['Report Title', 'Target Project', 'Frequency', 'Last Generated', 'Primary Metric', 'Actions']}
      mockRows={[
        {
          'Report Title': 'Master Project Progress & Milestone Summary',
          'Target Project': 'All Ongoing Projects (5)',
          Frequency: 'Weekly',
          'Last Generated': '14 Oct 2026',
          'Primary Metric': 'Milestone % vs Timeline',
          Actions: 'Download PDF / Excel',
        },
        {
          'Report Title': 'Contractual Delay & Extension of Time (EOT) Log',
          'Target Project': 'City Mall Construction',
          Frequency: 'Monthly',
          'Last Generated': '10 Oct 2026',
          'Primary Metric': 'Client Variation Orders',
          Actions: 'Download PDF / Excel',
        },
      ]}
    />
  );
}
