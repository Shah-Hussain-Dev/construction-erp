'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function SiteDiaryPage() {
  return (
    <ModuleScaffold
      category="Project Management"
      title="Site Diary"
      description="Daily site supervisor logs, weather conditions, manpower headcounts, equipment deployment, and roadblocks."
      moduleCode="DIR"
      searchPlaceholder="Filter diary logs by site, supervisor, date, or weather..."
      recordActionLabel="New Daily Log"
      stats={[
        { label: 'Today Logs', value: '4 / 5', sub: 'Sites reported' },
        { label: 'Total Manpower', value: '342', sub: 'Skilled + Unskilled on site' },
        { label: 'Equipment Active', value: '28', sub: 'JCB, Cranes, Mixers, Hoists' },
        { label: 'Weather Delays', value: '0 hrs', sub: 'Clear conditions today' },
      ]}
      tableColumns={['Log Date', 'Site / Location', 'Supervisor', 'Manpower Count', 'Work Executed Summary', 'GPS Status']}
      mockRows={[
        {
          'Log Date': '15 Oct 2026',
          'Site / Location': 'Site A - Green Valley',
          Supervisor: 'Suresh Kumar',
          'Manpower Count': '84 workers (42 skilled, 42 unsk.)',
          'Work Executed Summary': 'Cast 120 CUM slab concrete, bar bending on Tower 2',
          'GPS Status': 'Verified (Lucknow 26.8467° N)',
        },
        {
          'Log Date': '15 Oct 2026',
          'Site / Location': 'Site B - City Mall',
          Supervisor: 'Rakesh Patel',
          'Manpower Count': '96 workers (50 skilled, 46 unsk.)',
          'Work Executed Summary': 'Basement excavation, dewatering pump operations',
          'GPS Status': 'Verified (Kanpur 26.4499° N)',
        },
        {
          'Log Date': '15 Oct 2026',
          'Site / Location': 'Site C - Riverside',
          Supervisor: 'Amit Verma',
          'Manpower Count': '62 workers (30 skilled, 32 unsk.)',
          'Work Executed Summary': 'Brickwork 9 inch masonry on 2nd floor, curing',
          'GPS Status': 'Verified (Varanasi 25.3176° N)',
        },
      ]}
    />
  );
}
