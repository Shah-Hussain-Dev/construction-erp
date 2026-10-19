import { describe, it, expect } from 'vitest';
import { canAccessPath, getPermittedNavSections, type NavSection } from '../lib/rbac';
import { can } from '../lib/domain.cjs';

const mockNavSections: NavSection[] = [
  {
    id: 'organization',
    title: 'Organization',
    icon: () => null,
    items: [
      { name: 'Firms & Companies', href: '/organisation/firms', icon: () => null },
      { name: 'Projects', href: '/organisation/projects', icon: () => null },
      { name: 'Sites / Locations', href: '/organisation/sites', icon: () => null },
      { name: 'Clients', href: '/organisation/clients', icon: () => null },
      { name: 'Contractors', href: '/contractors', icon: () => null },
      { name: 'Users & Roles', href: '/organisation/users', icon: () => null },
    ],
  },
  {
    id: 'project_management',
    title: 'Project Management',
    icon: () => null,
    items: [
      { name: 'Project Dashboard', href: '/project-management/dashboard', icon: () => null },
      { name: 'Tasks & Activities', href: '/project-management/tasks', icon: () => null },
      { name: 'Documents', href: '/project-management/documents', icon: () => null },
      { name: 'Site Diary', href: '/project-management/site-diary', icon: () => null },
      { name: 'Project Budget', href: '/project-management/budget', icon: () => null },
      { name: 'Project Reports', href: '/project-management/reports', icon: () => null },
    ],
  },
  {
    id: 'procurement',
    title: 'Procurement',
    icon: () => null,
    items: [
      { name: 'Material Requests', href: '/requests', icon: () => null },
      { name: 'Purchase Indents', href: '/purchasing/requisitions', icon: () => null },
      { name: 'Purchase Orders', href: '/purchasing/orders', icon: () => null },
      { name: 'GRN / Material Inward', href: '/inventory/grn', icon: () => null },
      { name: 'Purchase Bills', href: '/purchasing/bills', icon: () => null },
      { name: 'Vendors', href: '/purchasing/vendors', icon: () => null },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: () => null,
    items: [
      { name: 'Stock Dashboard', href: '/inventory/stock', icon: () => null },
      { name: 'Stock Issue', href: '/inventory/issues', icon: () => null },
      { name: 'Stock Transfer', href: '/inventory/transfers', icon: () => null },
      { name: 'Stock Adjustment', href: '/inventory/adjustment', icon: () => null },
      { name: 'Stock Reports', href: '/inventory/reports', icon: () => null },
    ],
  },
  {
    id: 'contractor_billing',
    title: 'Contractor & Billing',
    icon: () => null,
    items: [
      { name: 'Work Orders', href: '/contractors/work-orders', icon: () => null },
      { name: 'Contractor Running Bills', href: '/contractors/bills', icon: () => null },
      { name: 'Measurement Sheets', href: '/contractors/measurement-sheets', icon: () => null },
      { name: 'Bill Approvals', href: '/contractors/bill-approvals', icon: () => null },
      { name: 'Payments to Contractors', href: '/contractors/payments', icon: () => null },
    ],
  },
  {
    id: 'accounting_finance',
    title: 'Accounting & Finance',
    icon: () => null,
    items: [
      { name: 'Vouchers', href: '/finance/vouchers', icon: () => null },
      { name: 'Cash & Bank', href: '/finance/cash-bank', icon: () => null },
      { name: 'Ledger & Reports', href: '/finance/ledgers', icon: () => null },
      { name: 'TDS & GST', href: '/finance/tds-gst', icon: () => null },
      { name: 'Financial Statements', href: '/finance/statements', icon: () => null },
    ],
  },
  {
    id: 'settings_admin',
    title: 'Settings & Admin',
    icon: () => null,
    adminOnly: true,
    items: [
      { name: 'Site & Branding', href: '/settings/site-config', icon: () => null },
      { name: 'GST & Taxes', href: '/settings/gst', icon: () => null },
      { name: 'Documents & Invoices', href: '/settings/documents', icon: () => null },
      { name: 'Approval Workflows', href: '/settings/workflows', icon: () => null },
      { name: 'Number Sequences', href: '/settings/sequences', icon: () => null },
      { name: 'Notifications', href: '/settings/notifications', icon: () => null },
      { name: 'System & Backup', href: '/settings/system', icon: () => null },
    ],
  },
];

describe('Role-Based Access Control (RBAC)', () => {
  describe('canAccessPath route guards', () => {
    it('grants owner access to all routes', () => {
      const owner = { role: 'owner' };
      expect(canAccessPath(owner, '/')).toBe(true);
      expect(canAccessPath(owner, '/finance/vouchers')).toBe(true);
      expect(canAccessPath(owner, '/organisation/users')).toBe(true);
      expect(canAccessPath(owner, '/settings/site-config')).toBe(true);
      expect(canAccessPath(owner, '/settings/gst')).toBe(true);
      expect(canAccessPath(owner, '/inventory/stock')).toBe(true);
      expect(canAccessPath(owner, '/training')).toBe(true);
    });

    it('grants admin full access to all routes identical to owner', () => {
      const admin = { role: 'admin' };
      expect(canAccessPath(admin, '/')).toBe(true);
      expect(canAccessPath(admin, '/finance/vouchers')).toBe(true);
      expect(canAccessPath(admin, '/organisation/users')).toBe(true);
      expect(canAccessPath(admin, '/settings/site-config')).toBe(true);
      expect(canAccessPath(admin, '/settings/gst')).toBe(true);
      expect(canAccessPath(admin, '/settings/documents')).toBe(true);
      expect(canAccessPath(admin, '/inventory/stock')).toBe(true);
      expect(canAccessPath(admin, '/contractors/bills')).toBe(true);
      expect(canAccessPath(admin, '/purchasing/orders')).toBe(true);
      expect(canAccessPath(admin, '/training')).toBe(true);
    });

    it('enforces site supervisor access restrictions', () => {
      const supervisor = { role: 'supervisor' };
      // Allowed
      expect(canAccessPath(supervisor, '/')).toBe(true);
      expect(canAccessPath(supervisor, '/training')).toBe(true);
      expect(canAccessPath(supervisor, '/project-management/tasks')).toBe(true);
      expect(canAccessPath(supervisor, '/project-management/site-diary')).toBe(true);
      expect(canAccessPath(supervisor, '/requests')).toBe(true);
      expect(canAccessPath(supervisor, '/inventory/stock')).toBe(true);
      expect(canAccessPath(supervisor, '/contractors/measurement-sheets')).toBe(true);
      expect(canAccessPath(supervisor, '/reports/sites')).toBe(true);
      expect(canAccessPath(supervisor, '/settings/profile')).toBe(true);

      // Restricted
      expect(canAccessPath(supervisor, '/finance/vouchers')).toBe(false);
      expect(canAccessPath(supervisor, '/finance/cash-bank')).toBe(false);
      expect(canAccessPath(supervisor, '/finance/ledgers')).toBe(false);
      expect(canAccessPath(supervisor, '/contractors/bills')).toBe(false);
      expect(canAccessPath(supervisor, '/contractors/work-orders')).toBe(false);
      expect(canAccessPath(supervisor, '/purchasing/orders')).toBe(false);
      expect(canAccessPath(supervisor, '/inventory/issues')).toBe(false);
      expect(canAccessPath(supervisor, '/inventory/transfers')).toBe(false);
      expect(canAccessPath(supervisor, '/organisation/users')).toBe(false);
      expect(canAccessPath(supervisor, '/settings/site-config')).toBe(false);
    });

    it('enforces store keeper access restrictions', () => {
      const store = { role: 'store' };
      // Allowed
      expect(canAccessPath(store, '/')).toBe(true);
      expect(canAccessPath(store, '/requests')).toBe(true);
      expect(canAccessPath(store, '/inventory/stock')).toBe(true);
      expect(canAccessPath(store, '/inventory/issues')).toBe(true);
      expect(canAccessPath(store, '/inventory/transfers')).toBe(true);
      expect(canAccessPath(store, '/inventory/adjustment')).toBe(true);
      expect(canAccessPath(store, '/inventory/reports')).toBe(true);
      expect(canAccessPath(store, '/inventory/grn')).toBe(true);
      expect(canAccessPath(store, '/purchasing/orders')).toBe(true);

      // Restricted
      expect(canAccessPath(store, '/finance/vouchers')).toBe(false);
      expect(canAccessPath(store, '/contractors/bills')).toBe(false);
      expect(canAccessPath(store, '/contractors/work-orders')).toBe(false);
      expect(canAccessPath(store, '/project-management/dashboard')).toBe(false);
      expect(canAccessPath(store, '/project-management/site-diary')).toBe(false);
      expect(canAccessPath(store, '/organisation/users')).toBe(false);
      expect(canAccessPath(store, '/settings/site-config')).toBe(false);
    });

    it('enforces accounts manager access permissions', () => {
      const accounts = { role: 'accounts' };
      // Allowed
      expect(canAccessPath(accounts, '/finance/vouchers')).toBe(true);
      expect(canAccessPath(accounts, '/finance/cash-bank')).toBe(true);
      expect(canAccessPath(accounts, '/finance/ledgers')).toBe(true);
      expect(canAccessPath(accounts, '/finance/tds-gst')).toBe(true);
      expect(canAccessPath(accounts, '/finance/statements')).toBe(true);
      expect(canAccessPath(accounts, '/contractors/bills')).toBe(true);
      expect(canAccessPath(accounts, '/contractors/bill-approvals')).toBe(true);
      expect(canAccessPath(accounts, '/contractors/payments')).toBe(true);
      expect(canAccessPath(accounts, '/purchasing/bills')).toBe(true);
      expect(canAccessPath(accounts, '/inventory/stock')).toBe(true);

      // Restricted
      expect(canAccessPath(accounts, '/project-management/site-diary')).toBe(false);
      expect(canAccessPath(accounts, '/inventory/issues')).toBe(false);
      expect(canAccessPath(accounts, '/inventory/transfers')).toBe(false);
      expect(canAccessPath(accounts, '/organisation/users')).toBe(false);
      expect(canAccessPath(accounts, '/settings/site-config')).toBe(false);
    });

    it('isolates contractor portal routes', () => {
      const contractor = { role: 'contractor' };
      expect(canAccessPath(contractor, '/portal/projects')).toBe(true);
      expect(canAccessPath(contractor, '/portal/work-orders')).toBe(true);
      expect(canAccessPath(contractor, '/portal/bills')).toBe(true);
      expect(canAccessPath(contractor, '/portal/payments')).toBe(true);
      expect(canAccessPath(contractor, '/training')).toBe(true);

      // Blocked from internal ERP routes
      expect(canAccessPath(contractor, '/finance/vouchers')).toBe(false);
      expect(canAccessPath(contractor, '/inventory/stock')).toBe(false);
      expect(canAccessPath(contractor, '/organisation/users')).toBe(false);
      expect(canAccessPath(contractor, '/settings')).toBe(false);
    });

    it('isolates client portal routes', () => {
      const client = { role: 'client' };
      expect(canAccessPath(client, '/portal/projects')).toBe(true);
      expect(canAccessPath(client, '/portal/bills')).toBe(true);
      expect(canAccessPath(client, '/portal/statements')).toBe(true);
      expect(canAccessPath(client, '/training')).toBe(true);

      // Blocked from contractor work-orders and internal finance
      expect(canAccessPath(client, '/portal/work-orders')).toBe(false);
      expect(canAccessPath(client, '/finance/vouchers')).toBe(false);
      expect(canAccessPath(client, '/inventory/stock')).toBe(false);
    });

    it('ensures dashboard (/) is accessible to every authenticated role on login', () => {
      const allRoles = [
        'owner',
        'manager',
        'supervisor',
        'store',
        'purchase',
        'accounts',
        'contractor',
        'client',
      ];
      for (const role of allRoles) {
        expect(canAccessPath({ role }, '/')).toBe(true);
      }
    });
  });

  describe('getPermittedNavSections sidebar filtering', () => {
    it('completely hides empty sections and filters unauthorized subitems for supervisor', () => {
      const supervisor = { role: 'supervisor' };
      const filtered = getPermittedNavSections(supervisor, mockNavSections);

      const sectionIds = filtered.map((s) => s.id);
      // Accounting & Finance and Settings & Admin must be completely hidden (omitted)
      expect(sectionIds).not.toContain('accounting_finance');
      expect(sectionIds).not.toContain('settings_admin');

      // Procurement section must only contain Material Requests
      const procurement = filtered.find((s) => s.id === 'procurement');
      expect(procurement).toBeDefined();
      expect(procurement?.items.map((i) => i.href)).toEqual(['/requests']);

      // Inventory section must only contain Stock Dashboard
      const inventory = filtered.find((s) => s.id === 'inventory');
      expect(inventory).toBeDefined();
      expect(inventory?.items.map((i) => i.href)).toEqual(['/inventory/stock']);

      // Contractor & Billing section must only contain Measurement Sheets
      const contractor = filtered.find((s) => s.id === 'contractor_billing');
      expect(contractor).toBeDefined();
      expect(contractor?.items.map((i) => i.href)).toEqual([
        '/contractors/measurement-sheets',
      ]);
    });

    it('omits project management, contractor billing, and accounting for store keeper', () => {
      const store = { role: 'store' };
      const filtered = getPermittedNavSections(store, mockNavSections);

      const sectionIds = filtered.map((s) => s.id);
      expect(sectionIds).not.toContain('project_management');
      expect(sectionIds).not.toContain('contractor_billing');
      expect(sectionIds).not.toContain('accounting_finance');
      expect(sectionIds).not.toContain('settings_admin');

      // Inventory section retains all stock operations
      const inventory = filtered.find((s) => s.id === 'inventory');
      expect(inventory?.items.length).toBe(5);
    });

    it('shows full access for owner including settings_admin', () => {
      const owner = { role: 'owner' };
      const filtered = getPermittedNavSections(owner, mockNavSections);

      expect(filtered.length).toBe(mockNavSections.length);
      const settings = filtered.find((s) => s.id === 'settings_admin');
      expect(settings).toBeDefined();
      expect(settings?.items.length).toBe(7);
    });

    it('shows full access for admin across all sections including settings_admin', () => {
      const admin = { role: 'admin' };
      const filtered = getPermittedNavSections(admin, mockNavSections);

      expect(filtered.length).toBe(mockNavSections.length);
      const settings = filtered.find((s) => s.id === 'settings_admin');
      expect(settings).toBeDefined();
      expect(settings?.items.length).toBe(7);
      // All items in all sections accessible
      for (const section of filtered) {
        const original = mockNavSections.find((s) => s.id === section.id);
        expect(section.items.length).toBe(original?.items.length);
      }
    });
  });

  describe('domain can() resource permissions alignment', () => {
    it('grants admin unrestricted permissions across all resources and actions', () => {
      const admin = { role: 'admin' };
      expect(can(admin, 'vouchers', 'view')).toBe(true);
      expect(can(admin, 'vouchers', 'create')).toBe(true);
      expect(can(admin, 'vouchers', 'edit')).toBe(true);
      expect(can(admin, 'contractor-bills', 'view')).toBe(true);
      expect(can(admin, 'contractor-bills', 'approve')).toBe(true);
      expect(can(admin, 'users', 'create')).toBe(true);
      expect(can(admin, 'firms', 'edit')).toBe(true);
      expect(can(admin, 'stock-balances', 'view')).toBe(true);
    });

    it('restricts view rights for supervisor', () => {
      expect(can({ role: 'supervisor' }, 'contractor-bills', 'view')).toBe(false);
      expect(can({ role: 'supervisor' }, 'vouchers', 'view')).toBe(false);
      expect(can({ role: 'supervisor' }, 'material-requests', 'view')).toBe(true);
      expect(can({ role: 'supervisor' }, 'stock-balances', 'view')).toBe(true);
    });

    it('restricts view rights for store keeper', () => {
      expect(can({ role: 'store' }, 'vouchers', 'view')).toBe(false);
      expect(can({ role: 'store' }, 'contractor-bills', 'view')).toBe(false);
      expect(can({ role: 'store' }, 'material-issues', 'view')).toBe(true);
      expect(can({ role: 'store' }, 'grn', 'view')).toBe(true);
    });
  });
});
