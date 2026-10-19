'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function TasksActivitiesPage() {
  return (
    <ModuleScaffold
      category="Project Management"
      title="Tasks & Activities"
      description="Work breakdown structure (WBS), daily task schedules, subcontractor allocations, and dependencies."
      moduleCode="TSK"
      searchPlaceholder="Search tasks by title, code, site, or assignee..."
      recordActionLabel="New Task"
      stats={[
        { label: 'Total Tasks', value: '48', sub: 'Across 5 projects' },
        { label: 'In Progress', value: '19', sub: 'Active work packages' },
        { label: 'Completed This Week', value: '14', sub: 'Verified by supervisor' },
        { label: 'Overdue / Blocked', value: '2', sub: 'Material dependency' },
      ]}
      tableColumns={['Task ID', 'Activity Name', 'Site / Zone', 'Assignee / Contractor', 'Target Date', 'Completion', 'Status']}
      mockRows={[
        {
          'Task ID': 'TSK-104',
          'Activity Name': 'Column Reinforcement & Shuttering',
          'Site / Zone': 'Site A - Tower 2, 4th Floor',
          'Assignee / Contractor': 'ABC Constructions',
          'Target Date': '18 Oct 2026',
          Completion: '85%',
          Status: 'In Progress',
        },
        {
          'Task ID': 'TSK-105',
          'Activity Name': 'Ready-Mix Concrete Slab Pouring',
          'Site / Zone': 'Site A - Podium Deck B',
          'Assignee / Contractor': 'Sharma Infra',
          'Target Date': '20 Oct 2026',
          Completion: '40%',
          Status: 'Scheduled',
        },
        {
          'Task ID': 'TSK-106',
          'Activity Name': 'Plumbing & Conduit Concealing',
          'Site / Zone': 'Site C - Block 1',
          'Assignee / Contractor': 'Khan Builders',
          'Target Date': '16 Oct 2026',
          Completion: '100%',
          Status: 'Completed',
        },
      ]}
    />
  );
}
