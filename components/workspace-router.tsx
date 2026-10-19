'use client';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { moduleFor, modules, books } from '@/lib/modules';
import { can } from '@/lib/domain.cjs';
import { canAccessPath } from '@/lib/rbac';
import { useSession } from './providers';
import { More, roleLabel } from './shell';
import { AuthScreen } from './features/auth';
import { Dashboard } from './features/dashboard';
import { Register } from './features/register';
import { Detail } from './features/detail';
import { Editor } from './features/editor';
import {
  Approvals,
  ApprovalRecord,
  Book,
  Notifications,
  Reports,
  PortalStatement,
} from './features/workspace';
import { Settings } from './features/settings';
import { Empty } from './ui/primitives';
import { Button } from './ui/button';
import { Evidence } from './features/evidence';
import { ClientsPage } from './features/organization/clients';
import { SitesPage } from './features/organization/sites';
import { DepartmentsPage } from './features/organization/departments';
import { RolesPage } from './features/organization/roles';
import { UsersPage } from './features/organization/users';
import { PermissionsPage } from './features/organization/permissions';
import { EquipmentPage } from './features/operations/equipment';
import { ProjectDashboardPage } from './features/project-management/project-dashboard';
import { TasksActivitiesPage } from './features/project-management/tasks';
import { ProjectDocumentsPage } from './features/project-management/documents';
import { SiteDiaryPage } from './features/project-management/site-diary';
import { ProjectBudgetPage } from './features/project-management/budget';
import { ProjectManagementReportsPage } from './features/project-management/reports';
import { PurchaseDashboardPage } from './features/purchasing/purchase-dashboard';
import { PurchaseBillsPage } from './features/purchasing/purchase-bills';
import { StockAdjustmentPage } from './features/inventory/stock-adjustment';
import { StockReportsPage } from './features/inventory/stock-reports';
import { MeasurementSheetsPage } from './features/contractors/measurement-sheets';
import { BillApprovalsPage } from './features/contractors/bill-approvals';
import { PaymentsToContractorsPage } from './features/contractors/payments';
import { VouchersPage } from './features/finance/vouchers';
import { LedgersPage } from './features/finance/ledgers';
import { CashAndBankPage } from './features/finance/cash-bank';
import { TdsAndGstPage } from './features/finance/tds-gst';
import { FinancialStatementsPage } from './features/finance/statements';
import { DiscussionsPage } from './features/communication/discussions';
import { AnnouncementsPage } from './features/communication/announcements';
import { ProjectReportsSubPage } from './features/reports/project-reports';
import { SiteReportsPage } from './features/reports/site-reports';
import { ManagementReportsPage } from './features/reports/management-reports';
import { TrainingCenter } from './features/training/training-center';

import { FullPageLoader } from './ui/full-page-loader';

const Imports = dynamic(() => import('./features/workspace').then((m) => m.Imports));
export function WorkspaceRouter() {
  const path = usePathname();
  if (path === '/login') return <AuthScreen />;
  if (path === '/reset-password') return <AuthScreen reset />;
  if (path === '/loader-demo') return <FullPageLoader />;
  return <Content path={path} />;
}
function Content({ path }: { path: string }) {
  const { user } = useSession();
  const router = useRouter();
  if (!user) return null;

  // Global Role-Based Access Control Guard for all pages & routes
  if (!canAccessPath(user, path)) {
    const isPortal = ['contractor', 'client'].includes(user.role);
    return (
      <Empty
        title="Access restricted"
        description={`Your role (${roleLabel(user.role)}) does not have access to this page.`}
      >
        <div style={{ marginTop: '1rem' }}>
          <Button onClick={() => router.push(isPortal ? '/portal/projects' : '/')}>
            Back to {isPortal ? 'Portal' : 'Dashboard'}
          </Button>
        </div>
      </Empty>
    );
  }
  if (path === '/')
    return ['contractor', 'client'].includes(user.role) ? (
      <Register
        module={modules.find((m) => m.resource === 'projects')!}
        pathOverride="/portal/projects"
      />
    ) : (
      <Dashboard />
    );
  if (path === '/more') return <More />;
  if (path === '/training' || path.startsWith('/training')) return <TrainingCenter />;
  if (path.startsWith('/settings')) return <Settings />;
  if (path === '/notifications') return <Notifications />;
  if (path === '/approvals')
    return ['client', 'contractor'].includes(user.role) ? (
      <Empty title="Access restricted" />
    ) : (
      <Approvals />
    );
  if (path.startsWith('/approvals/')) return <ApprovalRecord id={path.split('/')[2]} />;
  if (path === '/reports')
    return ['client', 'contractor'].includes(user.role) ? <PortalStatement /> : <Reports />;
  if (path === '/imports') return <Imports />;
  if (path.startsWith('/finance/') && books.includes(path.split('/')[2]))
    return <Book kind={path.split('/')[2]} />;
  if (path.startsWith('/evidence/')) {
    const [, , resource, id] = path.split('/');
    return can(user, resource) ? (
      <Evidence resource={resource} id={id} />
    ) : (
      <Empty title="Access restricted" />
    );
  }
  if (path === '/organisation/clients') return <ClientsPage />;
  if (path === '/organisation/sites' || path === '/sites') return <SitesPage />;
  if (path === '/organisation/departments') return <DepartmentsPage />;
  if (path === '/organisation/roles') return <RolesPage />;
  if (path === '/organisation/users') return <UsersPage />;
  if (path === '/organisation/permissions') return <PermissionsPage />;
  if (path === '/operations/equipment' || path === '/equipment') return <EquipmentPage />;
  if (path === '/purchasing/dashboard' || path === '/purchasing' || path === '/purchase')
    return <PurchaseDashboardPage />;
  if (path === '/purchasing/bills') return <PurchaseBillsPage />;
  if (path === '/project-management/dashboard') return <ProjectDashboardPage />;
  if (path === '/project-management/tasks') return <TasksActivitiesPage />;
  if (path === '/project-management/documents') return <ProjectDocumentsPage />;
  if (path === '/project-management/site-diary') return <SiteDiaryPage />;
  if (path === '/project-management/budget') return <ProjectBudgetPage />;
  if (path === '/project-management/reports') return <ProjectManagementReportsPage />;
  if (path === '/inventory/adjustment') return <StockAdjustmentPage />;
  if (path === '/inventory/reports') return <StockReportsPage />;
  if (path === '/contractors/measurement-sheets') return <MeasurementSheetsPage />;
  if (path === '/contractors/bill-approvals') return <BillApprovalsPage />;
  if (path === '/contractors/payments') return <PaymentsToContractorsPage />;
  if (path === '/finance/vouchers') return <VouchersPage />;
  if (path === '/finance/ledgers') return <LedgersPage />;
  if (path === '/finance/cash-bank') return <CashAndBankPage />;
  if (path === '/finance/tds-gst') return <TdsAndGstPage />;
  if (path === '/finance/statements') return <FinancialStatementsPage />;
  if (path === '/communication/discussions' || path === '/communication/chat' || path === '/chat') return <DiscussionsPage />;
  if (path === '/communication/announcements') return <AnnouncementsPage />;
  if (path === '/reports/projects') return <ProjectReportsSubPage />;
  if (path === '/reports/sites') return <SiteReportsPage />;
  if (path === '/reports/management') return <ManagementReportsPage />;

  if (['/portal/payments', '/portal/statements'].includes(path)) return <PortalStatement />;
  const portalResource = path.startsWith('/portal/projects')
    ? 'projects'
    : path.startsWith('/portal/work-orders')
      ? 'work-orders'
      : path.startsWith('/portal/bills')
        ? 'contractor-bills'
        : undefined;
  const routeModule = portalResource
    ? modules.find((m) => m.resource === portalResource)
    : moduleFor(path);
  if (!routeModule)
    return (
      <Empty title="Page not found" description="Choose a module from your workspace navigation." />
    );
  if (!can(user, routeModule.resource))
    return (
      <Empty
        title="Access restricted"
        description="Your role does not have access to this module."
      />
    );
  const base = portalResource ? path.split('/').slice(0, 3).join('/') : routeModule.path;
  const tail = path.slice(base.length).split('/').filter(Boolean);
  if (tail[0] === 'new')
    return routeModule.readonly || !can(user, routeModule.resource, 'create') ? (
      <Empty
        title="Access restricted"
        description="Your role does not have permission to create records in this module."
      />
    ) : (
      <Editor module={routeModule} pathOverride={base} />
    );
  if (tail.length === 2 && tail[1] === 'edit')
    return !can(user, routeModule.resource, 'edit') ? (
      <Empty
        title="Access restricted"
        description="Your role does not have permission to edit records in this module."
      />
    ) : (
      <Editor module={routeModule} id={tail[0]} pathOverride={base} />
    );
  if (tail.length === 1) return <Detail module={routeModule} id={tail[0]} pathOverride={base} />;
  if (tail.length) return <Empty title="Page not found" />;
  return <Register module={routeModule} pathOverride={base} />;
}
