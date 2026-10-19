'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function ProjectDashboardPage() {
  return (
    <ModuleScaffold
      category="Project Management"
      title="Project Dashboard"
      description="High-level milestones, critical path tracking, project health, and cross-site execution metrics."
      moduleCode="PM-DASH"
      searchPlaceholder="Filter project milestones or active work packages..."
      recordActionLabel="Create Milestone"
      stats={[
        { label: 'Active Projects', value: '5', sub: 'In physical progress' },
        { label: 'Overall Completion', value: '64.2%', sub: 'Weighted milestone avg' },
        { label: 'Schedule Variance', value: '+4 Days', sub: 'Ahead of master schedule' },
        { label: 'Open Critical Issues', value: '3', sub: 'Requires PM signoff' },
      ]}
      tableColumns={['Project', 'Location', 'Planned Completion', 'Actual Progress', 'Critical Path Status', 'Project Manager']}
      mockRows={[
        {
          Project: 'Green Valley Residency (PRJ-001)',
          Location: 'Lucknow, UP',
          'Planned Completion': '31 Dec 2026',
          'Actual Progress': '78%',
          'Critical Path Status': 'On Track',
          'Project Manager': 'Er. Rajesh Mishra',
        },
        {
          Project: 'City Mall Construction (PRJ-002)',
          Location: 'Kanpur, UP',
          'Planned Completion': '15 Feb 2027',
          'Actual Progress': '45%',
          'Critical Path Status': 'Delayed (Steel procurement)',
          'Project Manager': 'Er. Manoj Bajpai',
        },
        {
          Project: 'Riverside Apartments (PRJ-003)',
          Location: 'Varanasi, UP',
          'Planned Completion': '30 Oct 2027',
          'Actual Progress': '62%',
          'Critical Path Status': 'On Track',
          'Project Manager': 'Er. Abhishek Shukla',
        },
      ]}
    />
  );
}
