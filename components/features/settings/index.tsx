'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Gear,
  Sliders,
  FilePdf,
  Receipt,
  CheckSquare,
  Hash,
  Bell,
  ShieldCheck,
  User,
  LockSimple,
  ArrowRight,
  ShieldWarning,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useSession } from '../../providers';
import { PageHeader } from '../../shell';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/primitives';
import { auth } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

import { ProfileSection } from './profile';
import {
  DEFAULT_SITE_CONFIG,
  DEFAULT_DOCUMENT_SETTINGS,
  DEFAULT_GST_SETTINGS,
  DEFAULT_WORKFLOW_SETTINGS,
  DEFAULT_SEQUENCE_CONFIGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  type SiteConfig,
  type DocumentSettings,
  type GstSettings,
  type WorkflowSettings,
  type SequenceConfig,
  type NotificationSettings,
} from './types';

import { SiteConfigSection } from './site-config';
import { GstSettingsSection } from './gst-settings';
import { DocumentsInvoicesSection } from './documents-invoices';
import { WorkflowsSection } from './workflows';
import { SequencesSection } from './sequences';
import { NotificationsSection } from './notifications';
import { SystemSection } from './system';

type SettingsTab =
  | 'profile'
  | 'site-config'
  | 'gst'
  | 'documents'
  | 'workflows'
  | 'sequences'
  | 'notifications'
  | 'system';

export function Settings() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'owner' || (user?.role as string) === 'admin';

  // Determine active tab from URL path
  const getTabFromPath = (): SettingsTab => {
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/gst')) return 'gst';
    if (pathname.includes('/documents')) return 'documents';
    if (pathname.includes('/workflows')) return 'workflows';
    if (pathname.includes('/sequences')) return 'sequences';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/system')) return 'system';
    return 'site-config';
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [pathname, isAdmin]);

  // Persistent States
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG;
    try {
      const saved = localStorage.getItem('civil.siteConfig.v1');
      return saved ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(saved) } : DEFAULT_SITE_CONFIG;
    } catch {
      return DEFAULT_SITE_CONFIG;
    }
  });

  const [gstSettings, setGstSettings] = useState<GstSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_GST_SETTINGS;
    try {
      const saved = localStorage.getItem('civil.gstSettings.v1');
      return saved ? { ...DEFAULT_GST_SETTINGS, ...JSON.parse(saved) } : DEFAULT_GST_SETTINGS;
    } catch {
      return DEFAULT_GST_SETTINGS;
    }
  });

  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_DOCUMENT_SETTINGS;
    try {
      const saved = localStorage.getItem('civil.documentSettings.v1');
      return saved ? { ...DEFAULT_DOCUMENT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_DOCUMENT_SETTINGS;
    } catch {
      return DEFAULT_DOCUMENT_SETTINGS;
    }
  });

  const [workflowSettings, setWorkflowSettings] = useState<WorkflowSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_WORKFLOW_SETTINGS;
    try {
      const saved = localStorage.getItem('civil.workflowSettings.v1');
      return saved ? { ...DEFAULT_WORKFLOW_SETTINGS, ...JSON.parse(saved) } : DEFAULT_WORKFLOW_SETTINGS;
    } catch {
      return DEFAULT_WORKFLOW_SETTINGS;
    }
  });

  const [sequenceConfigs, setSequenceConfigs] = useState<SequenceConfig[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SEQUENCE_CONFIGS;
    try {
      const saved = localStorage.getItem('civil.sequenceConfigs.v1');
      return saved ? JSON.parse(saved) : DEFAULT_SEQUENCE_CONFIGS;
    } catch {
      return DEFAULT_SEQUENCE_CONFIGS;
    }
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
    try {
      const saved = localStorage.getItem('civil.notificationSettings.v1');
      return saved ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) } : DEFAULT_NOTIFICATION_SETTINGS;
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  });

  // Save Handlers
  const handleSaveSiteConfig = () => {
    try {
      localStorage.setItem('civil.siteConfig.v1', JSON.stringify(siteConfig));
      toast.success('Site & branding configuration saved');
    } catch {
      toast.error('Could not save configuration');
    }
  };

  const handleResetSiteConfig = () => {
    setSiteConfig(DEFAULT_SITE_CONFIG);
    localStorage.removeItem('civil.siteConfig.v1');
    toast.success('Site configurations reset to defaults');
  };

  const handleSaveGstSettings = () => {
    try {
      localStorage.setItem('civil.gstSettings.v1', JSON.stringify(gstSettings));
      toast.success('GST & statutory tax settings saved successfully');
    } catch {
      toast.error('Could not save GST settings');
    }
  };

  const handleResetGstSettings = () => {
    setGstSettings(DEFAULT_GST_SETTINGS);
    localStorage.removeItem('civil.gstSettings.v1');
    toast.success('GST settings reset to defaults');
  };

  const handleSaveDocumentSettings = () => {
    try {
      localStorage.setItem('civil.documentSettings.v1', JSON.stringify(documentSettings));
      toast.success('Documents & invoice customization saved');
    } catch {
      toast.error('Could not save document settings');
    }
  };

  const handleResetDocumentSettings = () => {
    setDocumentSettings(DEFAULT_DOCUMENT_SETTINGS);
    localStorage.removeItem('civil.documentSettings.v1');
    toast.success('Document settings reset to defaults');
  };

  const handleSaveWorkflowSettings = () => {
    try {
      localStorage.setItem('civil.workflowSettings.v1', JSON.stringify(workflowSettings));
      toast.success('Approval workflow rules saved');
    } catch {
      toast.error('Could not save workflows');
    }
  };

  const handleResetWorkflowSettings = () => {
    setWorkflowSettings(DEFAULT_WORKFLOW_SETTINGS);
    localStorage.removeItem('civil.workflowSettings.v1');
    toast.success('Workflow rules reset to defaults');
  };

  const handleSaveSequenceConfigs = () => {
    try {
      localStorage.setItem('civil.sequenceConfigs.v1', JSON.stringify(sequenceConfigs));
      toast.success('Numbering sequences saved');
    } catch {
      toast.error('Could not save sequences');
    }
  };

  const handleResetSequenceConfigs = () => {
    setSequenceConfigs(DEFAULT_SEQUENCE_CONFIGS);
    localStorage.removeItem('civil.sequenceConfigs.v1');
    toast.success('Numbering sequences reset to defaults');
  };

  const handleSaveNotificationSettings = () => {
    try {
      localStorage.setItem('civil.notificationSettings.v1', JSON.stringify(notificationSettings));
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Could not save notification settings');
    }
  };

  const handleResetNotificationSettings = () => {
    setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
    localStorage.removeItem('civil.notificationSettings.v1');
    toast.success('Notification preferences reset to defaults');
  };

  // Helper to switch to Admin/Owner for testing
  const handleSwitchToAdmin = async () => {
    try {
      await auth.login('admin@civil.example', 'demo');
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Switched to Administrator session');
      router.push('/settings/site-config');
    } catch {
      toast.error('Failed to switch role');
    }
  };

  // Navigation Items
  const navTabs = [
    {
      id: 'profile' as const,
      label: 'My Profile',
      href: '/settings/profile',
      icon: User,
      adminOnly: false,
    },
    {
      id: 'site-config' as const,
      label: 'Site & Branding',
      href: '/settings/site-config',
      icon: Sliders,
      adminOnly: true,
      badge: 'Identity',
    },
    {
      id: 'gst' as const,
      label: 'GST & Taxes',
      href: '/settings/gst',
      icon: Receipt,
      adminOnly: true,
      badge: 'Tax Engine',
    },
    {
      id: 'documents' as const,
      label: 'Documents & Invoices',
      href: '/settings/documents',
      icon: FilePdf,
      adminOnly: true,
      badge: 'PDF Designer',
    },
    {
      id: 'workflows' as const,
      label: 'Approval Workflows',
      href: '/settings/workflows',
      icon: CheckSquare,
      adminOnly: true,
      badge: 'Tiers & Limits',
    },
    {
      id: 'sequences' as const,
      label: 'Number Sequences',
      href: '/settings/sequences',
      icon: Hash,
      adminOnly: true,
      badge: 'Prefixes',
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      href: '/settings/notifications',
      icon: Bell,
      adminOnly: true,
      badge: 'Alerts',
    },
    {
      id: 'system' as const,
      label: 'System & Backup',
      href: '/settings/system',
      icon: ShieldCheck,
      adminOnly: true,
      badge: 'Diagnostics',
    },
  ];

  const handleTabClick = (tab: (typeof navTabs)[0]) => {
    setActiveTab(tab.id as SettingsTab);
    router.push(tab.href);
  };

  const currentTabDef = navTabs.find((t) => t.id === activeTab) || navTabs[0];

  const tabHeaderDetails: Record<SettingsTab, { eyebrow: string; title: string; desc: string }> = {
    profile: {
      eyebrow: 'USER ACCOUNT & PREFERENCES',
      title: 'My Profile & Account Settings',
      desc: 'Manage your personal user credentials, contact details, security credentials, and active permissions.',
    },
    'site-config': {
      eyebrow: 'PORTAL & STATUTORY MASTER',
      title: 'Site & Branding Configurations',
      desc: "Manage your firm's visual identity, brand mark, portal theme preferences, and legal corporate profile.",
    },
    gst: {
      eyebrow: 'STATUTORY COMPLIANCE & TAX ENGINE',
      title: 'GST & Statutory Tax Settings',
      desc: 'Configure enterprise GSTIN profiles, E-Way Bill / E-Invoice automation thresholds, works contract HSN tax slabs, TDS on GST, and input tax credit (ITC) rules.',
    },
    documents: {
      eyebrow: 'PRINT & EXPORT ENGINE',
      title: 'Documents & Invoice Designer',
      desc: 'Customize print-ready PDF invoice layouts, digital signature credentials, E-Invoice QR placements, and bank advice vouchers.',
    },
    workflows: {
      eyebrow: 'AUTHORIZATION & AUDIT ENGINE',
      title: 'Approval Workflow Rules',
      desc: 'Configure multi-tier authorization limits for contractor running bills, material indents, and mandatory site diary signoffs.',
    },
    sequences: {
      eyebrow: 'DOCUMENT NUMBERING MASTER',
      title: 'Numbering Sequences & Prefixes',
      desc: 'Standardize series prefixes and auto-incrementing numbers for purchase orders, running bills, GRNs, and vouchers.',
    },
    notifications: {
      eyebrow: 'COMMUNICATION & DISPATCH CHANNELS',
      title: 'Notification Preferences',
      desc: 'Control real-time alerts across Email, SMS, WhatsApp, and in-app site dispatch channels.',
    },
    system: {
      eyebrow: 'SYSTEM MAINTENANCE & DIAGNOSTICS',
      title: 'System & Data Diagnostics',
      desc: 'Generate downloadable JSON backup snapshots, inspect storage usage, and restore clean demo environments.',
    },
  };

  const currentHeader = tabHeaderDetails[activeTab] || tabHeaderDetails['site-config'];

  return (
    <div className="settings-page-wrapper">
      {/* Page Header */}
      <PageHeader
        eyebrow={currentHeader.eyebrow}
        title={currentHeader.title}
        description={currentHeader.desc}
        action={
          <div className="settings-user-role-badge">
            <span className="text-xs text-slate-500">Current Role:</span>
            <Badge status={user?.role} />
            {isAdmin && <span className="admin-status-indicator">● Admin Access Active</span>}
          </div>
        }
      />

      {/* Admin Access Gate for Non-Admin Roles */}
      {!isAdmin && currentTabDef.adminOnly ? (
        <div className="admin-restricted-notice panel">
          <div className="restricted-icon-wrap">
            <ShieldWarning size={36} weight="duotone" className="text-amber-500" />
          </div>
          <h3 className="restricted-title">Admin Configuration Required</h3>
          <p className="restricted-desc">
            The <strong>{currentTabDef.label}</strong> menu is restricted to Workspace Administrators
            and Directors. You are currently logged in as a <strong>{user?.role}</strong>.
          </p>
          <div className="restricted-actions">
            <Button variant="default" size="default" onClick={handleSwitchToAdmin}>
              <ArrowRight size={16} weight="bold" />
              <span>Switch to Administrator Demo Mode</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Active Tab Panel */
        <div className="settings-content-viewport">
          {activeTab === 'profile' && <ProfileSection />}

          {activeTab === 'site-config' && (
            <SiteConfigSection
              config={siteConfig}
              onChange={setSiteConfig}
              onSave={handleSaveSiteConfig}
              onReset={handleResetSiteConfig}
            />
          )}

          {activeTab === 'gst' && (
            <GstSettingsSection
              settings={gstSettings}
              onChange={setGstSettings}
              onSave={handleSaveGstSettings}
              onReset={handleResetGstSettings}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsInvoicesSection
              settings={documentSettings}
              siteConfig={siteConfig}
              onChange={setDocumentSettings}
              onSave={handleSaveDocumentSettings}
              onReset={handleResetDocumentSettings}
            />
          )}

          {activeTab === 'workflows' && (
            <WorkflowsSection
              settings={workflowSettings}
              onChange={setWorkflowSettings}
              onSave={handleSaveWorkflowSettings}
              onReset={handleResetWorkflowSettings}
            />
          )}

          {activeTab === 'sequences' && (
            <SequencesSection
              sequences={sequenceConfigs}
              onChange={setSequenceConfigs}
              onSave={handleSaveSequenceConfigs}
              onReset={handleResetSequenceConfigs}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsSection
              settings={notificationSettings}
              onChange={setNotificationSettings}
              onSave={handleSaveNotificationSettings}
              onReset={handleResetNotificationSettings}
            />
          )}

          {activeTab === 'system' && <SystemSection />}
        </div>
      )}
    </div>
  );
}
export default Settings;
