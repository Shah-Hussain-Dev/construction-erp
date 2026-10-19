import type { User } from '@/schemas';
import { can } from './domain.cjs';
import { modules } from './modules';

export type Role =
  | 'owner'
  | 'admin'
  | 'supervisor'
  | 'store'
  | 'purchase'
  | 'manager'
  | 'accounts'
  | 'contractor'
  | 'client';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  adminOnly?: boolean;
  items: NavItem[];
}

/**
 * Explicit route permission map.
 * Lists the authorized roles for each top-level and sub-feature route.
 */
export const ROLE_ROUTE_PERMISSIONS: Record<string, Role[]> = {
  // Global & Common
  '/': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],
  '/training': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],
  '/notifications': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],
  '/more': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],

  // Organization
  '/organisation/firms': ['owner', 'admin', 'manager', 'purchase', 'accounts'],
  '/organisation/projects': ['owner', 'admin', 'manager', 'supervisor', 'purchase', 'accounts'],
  '/organisation/sites': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts'],
  '/organisation/stores': ['owner', 'admin', 'manager', 'store', 'purchase'],
  '/organisation/cost-codes': ['owner', 'admin', 'manager', 'accounts'],
  '/organisation/clients': ['owner', 'admin', 'manager', 'accounts'],
  '/organisation/departments': ['owner', 'admin', 'manager'],
  '/organisation/roles': ['owner', 'admin', 'manager'],
  '/organisation/users': ['owner', 'admin', 'manager'],
  '/organisation/permissions': ['owner', 'admin'],
  '/contractors': ['owner', 'admin', 'manager', 'supervisor', 'accounts'],

  // Project Management
  '/project-management/dashboard': ['owner', 'admin', 'manager'],
  '/project-management/tasks': ['owner', 'admin', 'manager', 'supervisor'],
  '/project-management/documents': ['owner', 'admin', 'manager', 'supervisor', 'purchase'],
  '/project-management/site-diary': ['owner', 'admin', 'manager', 'supervisor'],
  '/project-management/budget': ['owner', 'admin', 'manager', 'accounts'],
  '/project-management/reports': ['owner', 'admin', 'manager', 'accounts'],
  '/operations/equipment': ['owner', 'admin', 'manager', 'supervisor', 'store'],
  '/equipment': ['owner', 'admin', 'manager', 'supervisor', 'store'],

  // Procurement & Purchase
  '/requests': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase'],
  '/purchasing/requisitions': ['owner', 'admin', 'manager', 'purchase'],
  '/purchasing/orders': ['owner', 'admin', 'manager', 'store', 'purchase', 'accounts'],
  '/inventory/grn': ['owner', 'admin', 'manager', 'store', 'purchase', 'accounts'],
  '/purchasing/bills': ['owner', 'admin', 'manager', 'purchase', 'accounts'],
  '/purchasing/vendors': ['owner', 'admin', 'manager', 'store', 'purchase', 'accounts'],
  '/purchasing/dashboard': ['owner', 'admin', 'manager', 'purchase', 'accounts'],
  '/purchasing': ['owner', 'admin', 'manager', 'store', 'purchase', 'accounts'],
  '/purchase': ['owner', 'admin', 'manager', 'store', 'purchase', 'accounts'],

  // Inventory
  '/inventory/stock': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts'],
  '/inventory/issues': ['owner', 'admin', 'manager', 'store'],
  '/inventory/transfers': ['owner', 'admin', 'manager', 'store'],
  '/inventory/adjustment': ['owner', 'admin', 'manager', 'store'],
  '/inventory/reports': ['owner', 'admin', 'manager', 'store', 'purchase', 'accounts'],
  '/inventory/items': ['owner', 'admin', 'manager', 'store', 'purchase', 'accounts'],
  '/inventory/ledger': ['owner', 'admin', 'manager', 'store', 'purchase'],

  // Contractor & Billing
  '/contractors/work-orders': ['owner', 'admin', 'manager', 'accounts'],
  '/contractors/bills': ['owner', 'admin', 'manager', 'accounts'],
  '/contractors/measurement-sheets': ['owner', 'admin', 'manager', 'supervisor'],
  '/contractors/bill-approvals': ['owner', 'admin', 'manager', 'accounts'],
  '/contractors/payments': ['owner', 'admin', 'manager', 'accounts'],

  // Accounting & Finance
  '/finance/vouchers': ['owner', 'admin', 'accounts'],
  '/finance/cash-bank': ['owner', 'admin', 'accounts'],
  '/finance/ledgers': ['owner', 'admin', 'accounts'],
  '/finance/tds-gst': ['owner', 'admin', 'accounts'],
  '/finance/statements': ['owner', 'admin', 'manager', 'accounts'],
  '/finance/cash-book': ['owner', 'admin', 'accounts'],
  '/finance/bank-book': ['owner', 'admin', 'accounts'],
  '/finance/day-book': ['owner', 'admin', 'accounts'],
  '/finance/trial-balance': ['owner', 'admin', 'accounts'],

  // Communication
  '/communication/discussions': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],
  '/communication/chat': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],
  '/chat': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],
  '/communication/announcements': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts', 'contractor', 'client'],

  // Reports
  '/reports': ['owner', 'admin', 'manager', 'accounts', 'contractor', 'client'],
  '/reports/projects': ['owner', 'admin', 'manager', 'purchase', 'accounts'],
  '/reports/sites': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts'],
  '/reports/management': ['owner', 'admin', 'manager', 'accounts'],

  // Approvals & Workflow
  '/approvals': ['owner', 'admin', 'manager', 'accounts'],

  // Settings & System
  '/settings': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts'],
  '/settings/profile': ['owner', 'admin', 'manager', 'supervisor', 'store', 'purchase', 'accounts'],
  '/settings/site-config': ['owner', 'admin'],
  '/settings/gst': ['owner', 'admin', 'accounts'],
  '/settings/documents': ['owner', 'admin'],
  '/settings/workflows': ['owner', 'admin', 'manager'],
  '/settings/sequences': ['owner', 'admin'],
  '/settings/notifications': ['owner', 'admin', 'manager'],
  '/settings/system': ['owner', 'admin'],

  // Contractor & Client Portals
  '/portal/projects': ['contractor', 'client', 'owner', 'admin'],
  '/portal/work-orders': ['contractor', 'owner', 'admin'],
  '/portal/bills': ['contractor', 'client', 'owner', 'admin'],
  '/portal/payments': ['contractor', 'owner', 'admin'],
  '/portal/statements': ['client', 'owner', 'admin'],
};

/**
 * Checks if a given user can access a route path.
 */
export function canAccessPath(user: { role?: string } | null | undefined, rawPath: string): boolean {
  if (!user || !user.role) return false;
  const role = user.role as Role;

  // Superuser / Owner has unconditional access
  if (role === 'owner' || (role as string) === 'admin') {
    return true;
  }

  // Sanitize path (strip query params and trailing slash)
  const cleanPath = rawPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

  // Contractor & Client portal isolation
  const isPortalRole = ['contractor', 'client'].includes(role);
  if (isPortalRole) {
    if (cleanPath.startsWith('/portal/')) {
      const allowedRoles = ROLE_ROUTE_PERMISSIONS[cleanPath];
      if (allowedRoles) return allowedRoles.includes(role);
      // Fallback for nested portal routes (e.g. /portal/bills/123)
      const baseKey = Object.keys(ROLE_ROUTE_PERMISSIONS).find(
        (k) => k.startsWith('/portal/') && (cleanPath === k || cleanPath.startsWith(k + '/'))
      );
      return baseKey ? ROLE_ROUTE_PERMISSIONS[baseKey].includes(role) : false;
    }

    // Portal users can also access training, announcements/chat, notifications, and portal statement report
    if (
      cleanPath === '/' ||
      cleanPath.startsWith('/training') ||
      cleanPath.startsWith('/communication') ||
      cleanPath === '/chat' ||
      cleanPath === '/notifications' ||
      cleanPath === '/reports' ||
      cleanPath === '/more'
    ) {
      return true;
    }

    if (cleanPath.startsWith('/evidence/')) {
      const [, , resource] = cleanPath.split('/');
      return can(user, resource, 'view');
    }

    return false;
  }

  // Internal users should NOT access /portal/* routes directly
  if (cleanPath.startsWith('/portal/')) {
    return false;
  }

  // Evidence route check
  if (cleanPath.startsWith('/evidence/')) {
    const [, , resource] = cleanPath.split('/');
    return can(user, resource, 'view');
  }

  // Direct exact match
  if (ROLE_ROUTE_PERMISSIONS[cleanPath]) {
    return ROLE_ROUTE_PERMISSIONS[cleanPath].includes(role);
  }

  // Match closest prefix route from defined permissions (longest prefix match)
  const matchedRoute = Object.keys(ROLE_ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((k) => k !== '/' && (cleanPath === k || cleanPath.startsWith(k + '/')));

  if (matchedRoute) {
    return ROLE_ROUTE_PERMISSIONS[matchedRoute].includes(role);
  }

  // Fallback to domain resource permission check if route corresponds to a registered module
  const matchedModule = modules.find(
    (m) => cleanPath === m.path || cleanPath.startsWith(m.path + '/')
  );
  if (matchedModule) {
    return can(user, matchedModule.resource, 'view');
  }

  return false;
}

/**
 * Filters the sidebar navigation sections for a given user:
 * 1. Omit sections marked adminOnly if not owner/admin.
 * 2. Filter individual nav items according to canAccessPath.
 * 3. Omit any section that has 0 permitted items.
 */
export function getPermittedNavSections(
  user: { role?: string } | null | undefined,
  sections: NavSection[]
): NavSection[] {
  if (!user || !user.role) return [];
  const isOwnerOrAdmin = user.role === 'owner' || (user.role as string) === 'admin';

  return sections
    .map((section) => {
      if (section.adminOnly && !isOwnerOrAdmin) {
        return null;
      }

      const permittedItems = section.items.filter((item) => canAccessPath(user, item.href));
      if (permittedItems.length === 0) {
        return null;
      }

      return {
        ...section,
        items: permittedItems,
      };
    })
    .filter((section): section is NavSection => section !== null);
}
