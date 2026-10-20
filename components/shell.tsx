'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  House,
  ClipboardText,
  Cube,
  CheckSquare,
  Buildings,
  ShoppingCart,
  HardHat,
  Wallet,
  ChartBar,
  UploadSimple,
  Bell,
  Gear,
  SignOut,
  MagnifyingGlass,
  CaretDown,
  ArrowLeft,
  SquaresFour,
  Command,
  Plus,
  MapPin,
  List,
  NotePencil,
  User,
  Users,
  UsersThree,
  FileText,
  Folder,
  BookOpen,
  CurrencyInr,
  ChartLineUp,
  Package,
  Receipt,
  Storefront,
  ArrowCircleDown,
  ArrowsLeftRight,
  ArrowsClockwise,
  ChartPie,
  Scroll,
  Ruler,
  HandCoins,
  Bank,
  Book,
  Scales,
  ChatDots,
  Briefcase,
  Kanban,
  SidebarSimple,
  DownloadSimple,
  Sliders,
  FilePdf,
  Hash,
  ShieldCheck,
  GraduationCap,
  TreeStructure,
  Key,
  Truck,
} from '@phosphor-icons/react';
import { useSession } from './providers';
import { Button } from './ui/button';
import { Modal, Skeleton } from './ui/primitives';
import { FullPageLoader } from './ui/full-page-loader';
import { BRAND_CONFIG } from '@/lib/config';
import { modules } from '@/lib/modules';
import { can } from '@/lib/domain.cjs';
import { auth, dataClient } from '@/lib/api';
import { text } from '@/lib/format';
import { PwaControls } from './features/pwa';
import { getPermittedNavSections, canAccessPath, type NavSection, type NavItem } from '@/lib/rbac';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner / Director',
  admin: 'System Administrator',
  supervisor: 'Site Supervisor',
  store: 'Store Keeper',
  purchase: 'Purchase Manager',
  manager: 'Project Manager',
  accounts: 'Accounts',
  contractor: 'Contractor',
  client: 'Client',
};

export const roleLabel = (role?: string) =>
  role ? ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1) : '';

export const initialsOf = (name?: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

const navSections: NavSection[] = [
  {
    id: 'organization',
    title: 'Organization',
    icon: Briefcase,
    items: [
      { name: 'Firms & Companies', href: '/organisation/firms', icon: Buildings },
      { name: 'Projects', href: '/organisation/projects', icon: NotePencil },
      { name: 'Sites / Locations', href: '/organisation/sites', icon: MapPin },
      { name: 'Clients', href: '/organisation/clients', icon: User },
      { name: 'Departments', href: '/organisation/departments', icon: TreeStructure },
      { name: 'Roles & Hierarchy', href: '/organisation/roles', icon: ShieldCheck },
      { name: 'User Management', href: '/organisation/users', icon: UsersThree },
      { name: 'Role Permissions', href: '/organisation/permissions', icon: Key },
      { name: 'Contractors', href: '/contractors', icon: Users },
    ],
  },
  {
    id: 'project_management',
    title: 'Project Management',
    icon: Kanban,
    items: [
      { name: 'Project Dashboard', href: '/project-management/dashboard', icon: FileText },
      { name: 'Tasks & Activities', href: '/project-management/tasks', icon: CheckSquare },
      { name: 'Documents', href: '/project-management/documents', icon: Folder },
      { name: 'Site Diary', href: '/project-management/site-diary', icon: BookOpen },
      { name: 'Project Budget', href: '/project-management/budget', icon: CurrencyInr },
      { name: 'Project Reports', href: '/project-management/reports', icon: ChartLineUp },
      { name: 'Plant & Machinery', href: '/operations/equipment', icon: Truck },
    ],
  },
  {
    id: 'procurement',
    title: 'Purchase & Procurement',
    icon: ShoppingCart,
    items: [
      { name: 'Purchase Dashboard', href: '/purchasing/dashboard', icon: ChartPie },
      { name: 'Purchase Orders', href: '/purchasing/orders', icon: ShoppingCart },
      { name: 'Purchase Indents', href: '/purchasing/requisitions', icon: FileText },
      { name: 'Material Requests', href: '/requests', icon: ClipboardText },
      { name: 'GRN / Material Inward', href: '/inventory/grn', icon: Package },
      { name: 'Purchase Bills', href: '/purchasing/bills', icon: Receipt },
      { name: 'Vendors & Suppliers', href: '/purchasing/vendors', icon: Storefront },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: Cube,
    items: [
      { name: 'Stock Dashboard', href: '/inventory/stock', icon: Cube },
      { name: 'Stock Issue', href: '/inventory/issues', icon: ArrowCircleDown },
      { name: 'Stock Transfer', href: '/inventory/transfers', icon: ArrowsLeftRight },
      { name: 'Stock Adjustment', href: '/inventory/adjustment', icon: ArrowsClockwise },
      { name: 'Stock Reports', href: '/inventory/reports', icon: ChartPie },
    ],
  },
  {
    id: 'contractor_billing',
    title: 'Contractor & Billing',
    icon: Scroll,
    items: [
      { name: 'Work Orders', href: '/contractors/work-orders', icon: Scroll },
      { name: 'Contractor Running Bills', href: '/contractors/bills', icon: Receipt },
      { name: 'Measurement Sheets', href: '/contractors/measurement-sheets', icon: Ruler },
      { name: 'Bill Approvals', href: '/contractors/bill-approvals', icon: CheckSquare },
      { name: 'Payments to Contractors', href: '/contractors/payments', icon: HandCoins },
    ],
  },
  {
    id: 'accounting_finance',
    title: 'Accounting & Finance',
    icon: Bank,
    items: [
      { name: 'Vouchers', href: '/finance/vouchers', icon: Receipt },
      { name: 'Cash & Bank', href: '/finance/cash-bank', icon: Bank },
      { name: 'Ledger & Reports', href: '/finance/ledgers', icon: Book },
      { name: 'TDS & GST', href: '/finance/tds-gst', icon: Scales },
      { name: 'Financial Statements', href: '/finance/statements', icon: ChartBar },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: ChartPie,
    items: [
      { name: 'Project Reports', href: '/reports/projects', icon: FileText },
      { name: 'Site Reports', href: '/reports/sites', icon: MapPin },
      { name: 'Management Reports', href: '/reports/management', icon: ChartPie },
    ],
  },
  {
    id: 'settings_admin',
    title: 'Settings & Admin',
    icon: Gear,
    adminOnly: true,
    items: [
      { name: 'Site & Branding', href: '/settings/site-config', icon: Sliders },
      { name: 'GST & Taxes', href: '/settings/gst', icon: Receipt },
      { name: 'Documents & Invoices', href: '/settings/documents', icon: FilePdf },
      { name: 'Approval Workflows', href: '/settings/workflows', icon: CheckSquare },
      { name: 'Number Sequences', href: '/settings/sequences', icon: Hash },
      { name: 'Notifications', href: '/settings/notifications', icon: Bell },
      { name: 'System & Backup', href: '/settings/system', icon: ShieldCheck },
    ],
  },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  const { user, siteId, setSiteId, sites, loading, online } = useSession();
  const query = useQueryClient();
  const [search, setSearch] = useState(false),
    [q, setQ] = useState(''),
    [scope, setScope] = useState(false),
    [sidebarCollapsed, setSidebarCollapsed] = useState(false),
    [profileOpen, setProfileOpen] = useState(false),
    [hydrated, setHydrated] = useState(false),
    [firmName, setFirmName] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Multi-dropdown open state for all sections (all closed by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Floating Flyout Context Menu in Collapsed State
  const [flyoutMenu, setFlyoutMenu] = useState<{
    sectionId: string;
    top: number;
  } | null>(null);

  // Floating Tooltip on Hover in Collapsed State
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    text: string;
    top: number;
  } | null>(null);

  const showTooltip = (e: React.MouseEvent<HTMLElement>, text: string) => {
    if (!sidebarCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      text,
      top: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => {
    setHoveredTooltip(null);
  };

  // Filter navigation sections based on authenticated user's role
  const permittedSections = useMemo(() => getPermittedNavSections(user, navSections), [user]);

  const handleParentClick = (e: React.MouseEvent<HTMLButtonElement>, sectionId: string) => {
    if (sidebarCollapsed) {
      e.stopPropagation();
      setHoveredTooltip(null);
      if (flyoutMenu?.sectionId === sectionId) {
        setFlyoutMenu(null);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const section = permittedSections.find((s) => s.id === sectionId);
        const estimatedHeight = 50 + (section?.items.length || 5) * 38;
        const maxTop = Math.max(16, window.innerHeight - estimatedHeight - 16);
        const idealTop = Math.max(16, Math.min(rect.top, maxTop));
        setFlyoutMenu({
          sectionId,
          top: idealTop,
        });
      }
    } else {
      toggleSection(sectionId);
    }
  };

  // Close flyout on click outside or Escape
  useEffect(() => {
    if (!flyoutMenu) return;
    const handleClose = () => setFlyoutMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFlyoutMenu(null);
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [flyoutMenu]);

  // Close flyout on path change or sidebar expand
  useEffect(() => {
    setFlyoutMenu(null);
    setHoveredTooltip(null);
  }, [path, sidebarCollapsed]);

  // Close profile menu on click outside or Escape
  useEffect(() => {
    const handleClose = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Only show the full-page loader if the user has just logged in from the login screen.
  // On all subsequent page navigations, reloads, or session restorations, we never show the full-page loader.
  const [showFirstTimeLoader, setShowFirstTimeLoader] = useState(false);

  useEffect(() => {
    try {
      const isFirstLogin = sessionStorage.getItem('civil_just_logged_in') === 'true';
      if (isFirstLogin) {
        setShowFirstTimeLoader(true);
        const timer = setTimeout(() => {
          sessionStorage.removeItem('civil_just_logged_in');
          sessionStorage.setItem('civil_login_loaded', 'true');
          setShowFirstTimeLoader(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setShowFirstTimeLoader(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) setHydrated(true);
  }, [loading, user]);

  // Resolve the logged-in user's firm name so the header shows the real
  // workspace instead of the dummy brand placeholder.
  useEffect(() => {
    let cancelled = false;
    if (user?.firmId && !cancelled) {
      dataClient
        .get('firms', user.firmId)
        .then((firm) => {
          if (!cancelled) setFirmName(firm.name ?? null);
        })
        .catch(() => setFirmName(null));
    } else {
      setFirmName(null);
    }
    return () => {
      cancelled = true;
    };
  }, [user?.firmId]);

  const isAuth = path === '/login' || path === '/reset-password' || path === '/loader-demo';
  const isChat =
    path === '/communication/discussions' || path === '/chat' || path === '/communication/chat';

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(true);
    }
  }, [path]);

  // Ensure active section is expanded on navigation
  useEffect(() => {
    const matchingSection = navSections.find((sec) =>
      sec.items.some((item) => {
        if (item.href === '/') return path === '/';
        return path === item.href || path.startsWith(item.href + '/');
      }),
    );
    if (matchingSection) {
      setOpenSections((prev) => ({
        ...prev,
        [matchingSection.id]: true,
      }));
    }
  }, [path]);

  useEffect(() => {
    if (!loading && !user && !isAuth) router.replace('/login');
  }, [loading, user, isAuth, router]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearch((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((v) => !v);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  if (isAuth) return <>{children}</>;

  if (showFirstTimeLoader) {
    return <FullPageLoader statusMessage={`Initializing ${BRAND_CONFIG.name}...`} />;
  }

  if (!hydrated || !user) {
    return (
      <div className="p-6 max-w-7xl mx-auto" aria-busy="true" aria-label="Loading workspace">
        <Skeleton variant="page" />
      </div>
    );
  }

  const portal = ['contractor', 'client'].includes(user.role);
  const portalNav = [
    { href: '/portal/projects', name: 'Projects', icon: Buildings },
    ...(user.role === 'contractor'
      ? [{ href: '/portal/work-orders', name: 'Work orders', icon: HardHat }]
      : []),
    { href: '/portal/bills', name: 'Bills', icon: ClipboardText },
    {
      href: user.role === 'contractor' ? '/portal/payments' : '/portal/statements',
      name: 'Statements',
      icon: Wallet,
    },
    { href: '/training', name: 'Training', icon: GraduationCap },
  ];

  const focused = path.endsWith('/new') || path.endsWith('/edit');
  const active = (href: string) =>
    href === '/' ? path === '/' : path === href || path.startsWith(href + '/');

  const bottom = portal
    ? portalNav.slice(0, 4)
    : [
        { href: '/', name: 'Home', icon: House },
        { href: '/requests', name: 'Requests', icon: ClipboardText },
        { href: '/inventory/stock', name: 'Stock', icon: Cube },
        { href: '/communication/discussions', name: 'Chats', icon: ChatDots },
      ].filter((item) => canAccessPath(user, item.href));

  async function logout() {
    await auth.logout();
    query.removeQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
    query.setQueryData(['session'], null);
    try {
      sessionStorage.removeItem('civil_just_logged_in');
      sessionStorage.removeItem('civil_login_loaded');
    } catch {}
    for (const k of Object.keys(localStorage))
      if (k.startsWith('civil.')) localStorage.removeItem(k);
    router.replace('/login');
  }

  return (
    <div
      className={`app-shell ${focused ? 'focused-task' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
    >
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand brand-has-h" aria-label={`${BRAND_CONFIG.name} home`}>
          <div className="brand-h-wrapper">
            <img
              src={BRAND_CONFIG.logoHorizontalUrl}
              alt={BRAND_CONFIG.name}
              className="brand-logo-h-img"
            />
          </div>
          <span className="brand-mark brand-mark-collapsed">
            <img src={BRAND_CONFIG.logoUrl} alt={BRAND_CONFIG.name} className="brand-logo-img" />
          </span>
        </Link>

        {/* Scrollable Navigation Body */}
        <nav className="sidebar-nav-scroll" aria-label="Main navigation">
          {portal ? (
            portalNav.map(({ href, name, icon: Icon }) => (
              <Link
                key={href}
                aria-label={name}
                href={href}
                className={`nav-link ${active(href) ? 'active' : ''}`}
                aria-current={active(href) ? 'page' : undefined}
              >
                <Icon size={20} weight={active(href) ? 'fill' : 'regular'} />
                <span className="nav-text">{name}</span>
              </Link>
            ))
          ) : (
            <>
              {/* Primary Active Dashboard Button */}
              {/* Primary Active Dashboard Button */}
              <div className="sidebar-primary-nav">
                <Link
                  href="/"
                  className={`nav-link ${path === '/' ? 'active' : ''}`}
                  aria-current={path === '/' ? 'page' : undefined}
                  onMouseEnter={(e) => showTooltip(e, 'Dashboard')}
                  onMouseLeave={hideTooltip}
                  title={sidebarCollapsed ? undefined : 'Dashboard'}
                >
                  <House size={20} weight={path === '/' ? 'fill' : 'regular'} />
                  <span className="nav-text">Dashboard</span>
                </Link>
              </div>

              {/* Multi-dropdown Accordion Sections */}
              <div className="sidebar-accordions-stack">
                {permittedSections.map((section) => {
                  const isOpen = !!openSections[section.id];
                  const hasActiveChild = section.items.some((item) => active(item.href));
                  const isFlyoutOpen = flyoutMenu?.sectionId === section.id;
                  const SectionIcon = section.icon;

                  return (
                    <div key={section.id} className="nav-accordion-group">
                      <button
                        type="button"
                        className={`nav-link nav-parent-btn ${isOpen ? 'is-open' : ''} ${hasActiveChild ? 'has-active-child' : ''} ${isFlyoutOpen ? 'flyout-active' : ''}`}
                        onClick={(e) => handleParentClick(e, section.id)}
                        onMouseEnter={(e) => showTooltip(e, section.title)}
                        onMouseLeave={hideTooltip}
                        aria-expanded={isOpen}
                        title={sidebarCollapsed ? undefined : section.title}
                      >
                        <SectionIcon
                          size={20}
                          weight={hasActiveChild || isFlyoutOpen ? 'fill' : 'regular'}
                        />
                        <span className="nav-parent-text">{section.title}</span>
                        <CaretDown
                          size={13}
                          weight="bold"
                          className={`nav-accordion-caret ${isOpen ? 'rotate-open' : ''}`}
                        />
                      </button>

                      {/* Smooth animated accordion collapse */}
                      <div
                        className={`nav-accordion-collapse ${isOpen && !sidebarCollapsed ? 'is-open' : 'is-closed'}`}
                      >
                        <div className="nav-accordion-collapse-inner">
                          <div className="nav-accordion-items">
                            {section.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isItemActive = active(item.href);

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`nav-link nav-child-link ${isItemActive ? 'active' : ''}`}
                                  aria-current={isItemActive ? 'page' : undefined}
                                  title={item.name}
                                >
                                  <ItemIcon size={19} weight={isItemActive ? 'fill' : 'regular'} />
                                  <span className="nav-text">{item.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Secondary Navigation: Communication & Learning (Moved to the last) */}
              <div className="sidebar-secondary-nav pt-2 mt-2 border-t border-slate-700/40 space-y-1">
                {canAccessPath(user, '/communication/discussions') && (
                  <Link
                    href="/communication/discussions"
                    className={`nav-link ${path.startsWith('/communication/discussions') ? 'active' : ''}`}
                    aria-current={
                      path.startsWith('/communication/discussions') ? 'page' : undefined
                    }
                    onMouseEnter={(e) => showTooltip(e, 'Chats')}
                    onMouseLeave={hideTooltip}
                    title={sidebarCollapsed ? undefined : 'Chats'}
                  >
                    <ChatDots
                      size={20}
                      weight={path.startsWith('/communication/discussions') ? 'fill' : 'regular'}
                      className={
                        path.startsWith('/communication/discussions')
                          ? 'text-blue-400'
                          : 'text-slate-400'
                      }
                    />
                    <span className="nav-text flex items-center justify-between flex-1">
                      <span>Chats</span>
                    </span>
                  </Link>
                )}
                {canAccessPath(user, '/training') && (
                  <Link
                    href="/training"
                    className={`nav-link ${path.startsWith('/training') ? 'active' : ''}`}
                    aria-current={path.startsWith('/training') ? 'page' : undefined}
                    onMouseEnter={(e) => showTooltip(e, 'Training Center')}
                    onMouseLeave={hideTooltip}
                    title={sidebarCollapsed ? undefined : 'Training Center'}
                  >
                    <GraduationCap
                      size={20}
                      weight={path.startsWith('/training') ? 'fill' : 'regular'}
                      className={path.startsWith('/training') ? 'text-blue-400' : 'text-slate-400'}
                    />
                    <span className="nav-text flex items-center justify-between flex-1">
                      <span>Training Center</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded-full ml-1">
                        New
                      </span>
                    </span>
                  </Link>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-bottom">
          <div className="site-card">
            <span className="site-dot" />
            <span>
              Built for the work ahead<small>{BRAND_CONFIG.name}</small>
            </span>
          </div>
          <button
            type="button"
            className="nav-link w-full text-left cursor-pointer"
            onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-modal'))}
            onMouseEnter={(e) => showTooltip(e, 'Install App')}
            onMouseLeave={hideTooltip}
            title={sidebarCollapsed ? undefined : 'Install App'}
          >
            <DownloadSimple size={20} className="text-blue-500" />
            <span className="nav-bottom-label flex items-center justify-between flex-1">
              <span>Install App</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full ml-1">
                PWA
              </span>
            </span>
          </button>
          {canAccessPath(user, '/settings') && (
            <Link
              href="/settings"
              className={`nav-link ${path.startsWith('/settings') ? 'active' : ''}`}
              onMouseEnter={(e) => showTooltip(e, 'Settings')}
              onMouseLeave={hideTooltip}
              title={sidebarCollapsed ? undefined : 'Settings'}
            >
              <Gear size={20} weight={path.startsWith('/settings') ? 'fill' : 'regular'} />
              <span className="nav-bottom-label">Settings</span>
            </Link>
          )}
          <button
            className="profile"
            onClick={logout}
            onMouseEnter={(e) => showTooltip(e, `${user.name} • Sign out`)}
            onMouseLeave={hideTooltip}
            title={sidebarCollapsed ? undefined : 'Sign out'}
          >
            <span className="avatar">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span className="profile-details">
              {user.name}
              <small>{user.role}</small>
            </span>
            <SignOut size={20} className="profile-signout-icon" />
          </button>
        </div>
      </aside>
      {!sidebarCollapsed && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}
      <div className={`workspace ${isChat ? 'chat-workspace' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-menu-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
              title={sidebarCollapsed ? 'Expand sidebar (⌘B)' : 'Collapse sidebar (⌘B)'}
            >
              <SidebarSimple size={20} weight={sidebarCollapsed ? 'regular' : 'duotone'} />
            </button>
            <div className="topbar-search-bar" onClick={() => setSearch(true)}>
              <MagnifyingGlass size={18} className="topbar-search-icon" />
              <input
                type="text"
                placeholder="Search anything... (Projects, Bills, Material, Vendors, etc.)"
                readOnly
                aria-label="Search workspace"
              />
            </div>
          </div>

          <div className="topbar-right">
            <button
              onClick={() => setScope(true)}
              className="topbar-firm-selector"
              disabled={focused}
              title="Switch company or site"
            >
              <Buildings size={18} weight="duotone" className="firm-icon" />
              <span className="firm-name-text">
                {sites.find((s) => s.id === siteId)?.name || firmName || BRAND_CONFIG.name}
              </span>
              <CaretDown size={14} weight="bold" className="dropdown-caret" />
            </button>

            <Link className="topbar-icon-action" href="/notifications" aria-label="5 notifications">
              <Bell size={20} />
              <span className="topbar-badge-count">5</span>
            </Link>

            <Link className="topbar-icon-action" href="/settings" aria-label="Settings">
              <Gear size={20} />
            </Link>

            <div className="relative group">
              <button
                type="button"
                className="topbar-user-profile"
                aria-label="User profile"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen((p) => !p);
                }}
              >
                <span className="topbar-user-avatar topbar-user-avatar-initials">
                  {initialsOf(user.name)}
                </span>
                <div className="topbar-user-info">
                  <strong className="topbar-user-name">{user.name}</strong>
                  <span className="topbar-user-role">{roleLabel(user.role)}</span>
                </div>
                <CaretDown size={12} weight="bold" className="dropdown-caret ml-1" />
              </button>

              <div
                ref={profileMenuRef}
                className={`profile-menu ${profileOpen ? 'profile-menu-open' : ''}`}
                role="menu"
              >
                <div className="profile-menu-header">
                  <span className="profile-menu-name">{user.name}</span>
                  <span className="profile-menu-email">{user.email}</span>
                </div>
                <Link
                  href="/settings/profile"
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={16} className="profile-menu-icon" />
                  <span className="profile-menu-label">My Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <Gear size={16} className="profile-menu-icon" />
                  <span className="profile-menu-label">Settings</span>
                </Link>
                <button
                  type="button"
                  className="profile-menu-item profile-menu-logout"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                >
                  <SignOut size={16} className="profile-menu-icon" />
                  <span className="profile-menu-label">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        {!online && (
          <div className="offline-banner" role="status">
            You’re offline. Saved request drafts are available; posting needs a connection.
          </div>
        )}
        <main id="main" className={`main-content ${isChat ? 'chat-main-container' : ''}`}>
          {children}
        </main>
        {!isChat && (
          <footer className="desktop-footer">
            <span>
              <span className="live-dot" /> {online ? 'Connected to workspace' : 'Offline'}
            </span>
            <span>INR · Indian Standard Time</span>
          </footer>
        )}
      </div>
      {!focused && !isChat && (
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {[...bottom, { href: '/more', name: 'More', icon: SquaresFour }]
            .slice(0, 5)
            .map(({ href, name, icon: Icon }) => (
              <Link
                key={href}
                aria-label={name}
                href={href}
                aria-current={active(href) ? 'page' : undefined}
                className={active(href) ? 'active' : ''}
              >
                <Icon size={23} weight={active(href) ? 'fill' : 'regular'} />
                <span>{name}</span>
              </Link>
            ))}
        </nav>
      )}
      <Modal
        open={scope}
        onOpenChange={setScope}
        title="Switch site"
        description="Your records and actions stay connected to the selected site."
      >
        <div className="choice-list">
          {sites.map((site) => (
            <button
              className={siteId === site.id ? 'selected' : ''}
              key={site.id}
              onClick={() => {
                setSiteId(site.id);
                setScope(false);
              }}
            >
              <MapPin size={24} />
              <span>
                {site.name}
                <small>{text(site.address) || 'Project site'}</small>
              </span>
              {siteId === site.id && <CheckSquare size={22} />}
            </button>
          ))}
        </div>
      </Modal>
      <Modal open={search} onOpenChange={setSearch} title="Search workspace">
        <div className="search-input">
          <MagnifyingGlass size={22} />
          <input
            aria-label="Find a module"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find materials, requests, accounts…"
          />
        </div>
        <div className="command-results">
          {Array.from(
            new Map(
              [
                ...modules
                  .filter((m) => canAccessPath(user, m.path))
                  .map((m) => ({ title: m.title, path: m.path, group: m.group })),
                ...permittedSections.flatMap((s) =>
                  s.items.map((i) => ({ title: i.name, path: i.href, group: s.title })),
                ),
              ].map((item) => [item.path, item]),
            ).values(),
          )
            .filter(
              (m) =>
                m.title.toLowerCase().includes(q.toLowerCase()) ||
                m.group.toLowerCase().includes(q.toLowerCase()),
            )
            .map((m) => (
              <Link href={m.path} key={m.path} onClick={() => setSearch(false)}>
                <Command size={18} />
                {m.title}
                <small>{m.group}</small>
              </Link>
            ))}
        </div>
      </Modal>
      <PwaControls />

      {/* Floating Tooltip in Collapsed Mode */}
      {sidebarCollapsed && hoveredTooltip && !flyoutMenu && (
        <div className="sidebar-floating-tooltip" style={{ top: hoveredTooltip.top }}>
          {hoveredTooltip.text}
        </div>
      )}

      {/* Floating Context Menu Flyout in Collapsed Mode */}
      {sidebarCollapsed &&
        flyoutMenu &&
        (() => {
          const activeSection = permittedSections.find((s) => s.id === flyoutMenu.sectionId);
          if (!activeSection) return null;
          const ActiveSectionIcon = activeSection.icon;

          return (
            <div
              className="sidebar-context-flyout"
              style={{ top: flyoutMenu.top }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Flyout Header */}
              <div className="flyout-header">
                <ActiveSectionIcon size={18} weight="fill" className="flyout-header-icon" />
                <span className="flyout-header-title">{activeSection.title}</span>
                <span className="flyout-badge">{activeSection.items.length} items</span>
              </div>

              <div className="flyout-divider" />

              {/* Child Menu Links */}
              <div className="flyout-list">
                {activeSection.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isItemActive = active(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flyout-item ${isItemActive ? 'active' : ''}`}
                      aria-current={isItemActive ? 'page' : undefined}
                      onClick={() => setFlyoutMenu(null)}
                    >
                      <ItemIcon size={18} weight={isItemActive ? 'fill' : 'regular'} />
                      <span className="flyout-item-name">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}
    </div>
  );
}
export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  back,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  back?: string;
}) {
  const [returnPath, setReturnPath] = useState(back);
  useEffect(() => {
    if (!back) return;
    try {
      const value = JSON.parse(sessionStorage.getItem('civil.return.' + back) || 'null');
      setReturnPath(value?.url?.startsWith(back) ? value.url : back);
    } catch {
      setReturnPath(back);
    }
  }, [back]);
  return (
    <div className="page-heading">
      <div>
        {back && (
          <Link className="back-link" href={returnPath || back}>
            <ArrowLeft size={18} />
            Back
          </Link>
        )}
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-actions">{action}</div>}
    </div>
  );
}
export function More() {
  const { user } = useSession();
  return (
    <>
      <PageHeader
        title="Your workspace"
        description="Everything you need, organised by the work you do."
      />
      <div className="module-grid">
        {[...new Set(modules.map((m) => m.group))].map((group) => (
          <section className="panel" key={group}>
            <h2>{group}</h2>
            {modules
              .filter((m) => m.group === group && can(user, m.resource))
              .map((m) => (
                <Link href={m.path} key={m.path} className="module-link">
                  {m.title}
                  <Plus size={16} />
                </Link>
              ))}
          </section>
        ))}
      </div>
      <div className="quick-links">
        <Link href="/imports">Import data</Link>
        <Link href="/reports">Reports</Link>
        <Link href="/settings/profile">Profile & settings</Link>
      </div>
    </>
  );
}
