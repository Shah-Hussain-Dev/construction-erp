'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function AnnouncementsPage() {
  return (
    <ModuleScaffold
      category="Communication"
      title="Announcements"
      description="Company-wide circulars, site safety protocols, holiday schedules, executive memos, and EHS compliance broadcasts."
      moduleCode="COMM-ANN"
      searchPlaceholder="Filter announcements by headline, circular no, or target audience..."
      recordActionLabel="Publish Announcement"
      stats={[
        { label: 'Active Broadcasts', value: '5', sub: 'Visible to staff & sites' },
        { label: 'Safety Circulars', value: '12', sub: 'Mandatory PPE & EHS' },
        { label: 'Acknowledge Rate', value: '98%', sub: 'Field staff confirmation' },
        { label: 'Target Audience', value: 'All Sites', sub: 'Employees & Contractors' },
      ]}
      tableColumns={['Circular No', 'Headline', 'Priority / Tag', 'Target Audience', 'Published Date', 'Author', 'Status']}
      mockRows={[
        {
          'Circular No': 'CIR-2026-018',
          Headline: 'Mandatory Full-Body Harness Rule for Heights Exceeding 2m',
          'Priority / Tag': 'High Priority · Safety',
          'Target Audience': 'All Site Supervisors & Contractors',
          'Published Date': '12 Oct 2026',
          Author: 'EHS Safety Directorate',
          Status: 'Active Broadcast',
        },
        {
          'Circular No': 'CIR-2026-017',
          Headline: 'Diwali Site Holiday Schedule & Concrete Pour Planning',
          'Priority / Tag': 'General Notice',
          'Target Audience': 'All Staff & Subcontractors',
          'Published Date': '10 Oct 2026',
          Author: 'HR & Operations',
          Status: 'Active Broadcast',
        },
      ]}
    />
  );
}
