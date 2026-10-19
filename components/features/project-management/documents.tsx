'use client';

import React from 'react';
import { ModuleScaffold } from '../module-scaffold';

export function ProjectDocumentsPage() {
  return (
    <ModuleScaffold
      category="Project Management"
      title="Documents"
      description="Engineering drawings (GFC), structural blueprints, change orders, testing certificates, and contracts."
      moduleCode="DOC"
      searchPlaceholder="Search drawings, specs, revisions, or author..."
      recordActionLabel="Upload Document"
      stats={[
        { label: 'Total Files', value: '184', sub: 'PDF, DWG, XLSX, Images' },
        { label: 'GFC Drawings', value: '72', sub: 'Good For Construction' },
        { label: 'Pending Approvals', value: '6', sub: 'Structural consultant review' },
        { label: 'Recent Uploads', value: '12', sub: 'Last 7 days' },
      ]}
      tableColumns={['Document No', 'Title', 'Category', 'Revision', 'Associated Project', 'Uploaded By', 'Actions']}
      mockRows={[
        {
          'Document No': 'DOC-DWG-042',
          Title: 'Foundation & Pile Layout Rev 3',
          Category: 'Structural Drawing',
          Revision: 'R3 (GFC)',
          'Associated Project': 'Green Valley Residency',
          'Uploaded By': 'Ravi Sharma (Chief Draftsman)',
          Actions: 'View / Download',
        },
        {
          'Document No': 'DOC-SPEC-018',
          Title: 'M30 Concrete Mix Design Approval',
          Category: 'Quality & Testing',
          Revision: 'R1',
          'Associated Project': 'City Mall Construction',
          'Uploaded By': 'Amit Verma (Quality Eng.)',
          Actions: 'View / Download',
        },
        {
          'Document No': 'DOC-CNTR-004',
          Title: 'Subcontract Agreement - Steel Works',
          Category: 'Legal Contract',
          Revision: 'Final',
          'Associated Project': 'Riverside Apartments',
          'Uploaded By': 'Shah Hussain (Admin)',
          Actions: 'View / Download',
        },
      ]}
    />
  );
}
