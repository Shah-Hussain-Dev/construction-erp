'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  TreeStructure,
  FloppyDisk,
  ArrowsClockwise,
  MagnifyingGlass,
  Check,
  X,
  Sparkle,
  LockKey,
  Key,
  UsersThree,
  CheckCircle,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { Badge, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import type { RecordData } from '@/schemas';

interface PermissionActionMap {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  approve?: boolean;
  export?: boolean;
}

interface RoleRecord extends RecordData {
  name?: string;
  code?: string;
  departmentId?: string;
  departmentName?: string;
  accessLevel?: string;
  systemRole?: string;
}

interface DepartmentRecord extends RecordData {
  name?: string;
  code?: string;
}

interface PermissionRecord extends RecordData {
  roleId?: string;
  roleCode?: string;
  roleName?: string;
  isPreset?: boolean;
  permissions?: Record<string, PermissionActionMap | boolean>;
}

// Logical ERP Modules Grouped by Category
const ERP_MODULE_GROUPS = [
  {
    category: 'Organization & Core Masters',
    modules: [
      { id: 'firms', label: 'Firms & Companies' },
      { id: 'projects', label: 'Projects' },
      { id: 'sites', label: 'Sites & Locations' },
      { id: 'stores', label: 'Stores & Warehouses' },
      { id: 'cost-codes', label: 'Cost Codes' },
      { id: 'clients', label: 'Clients' },
      { id: 'contractors', label: 'Contractors' },
      { id: 'departments', label: 'Departments' },
      { id: 'roles', label: 'Roles & Hierarchy' },
      { id: 'users', label: 'User Management' },
    ],
  },
  {
    category: 'Project Management & Site Execution',
    modules: [
      { id: 'project-dashboard', label: 'Project Dashboard' },
      { id: 'tasks', label: 'Tasks & Activities' },
      { id: 'documents', label: 'Project Documents' },
      { id: 'site-diary', label: 'Site Diary & DPR' },
      { id: 'budget', label: 'Project Budget' },
      { id: 'project-reports', label: 'Project Reports' },
    ],
  },
  {
    category: 'Procurement & Supply Chain',
    modules: [
      { id: 'material-requests', label: 'Material Requests (Site)' },
      { id: 'purchase-requisitions', label: 'Purchase Indents' },
      { id: 'purchase-orders', label: 'Purchase Orders (PO)' },
      { id: 'grn', label: 'GRN / Inward Material' },
      { id: 'purchase-bills', label: 'Purchase Bills & Invoices' },
      { id: 'vendors', label: 'Vendors Master' },
    ],
  },
  {
    category: 'Inventory & Store Control',
    modules: [
      { id: 'stock-balances', label: 'Stock Overview' },
      { id: 'material-issues', label: 'Material Issues' },
      { id: 'stock-transfers', label: 'Stock Transfers' },
      { id: 'stock-adjustments', label: 'Stock Adjustments' },
      { id: 'items', label: 'Material Library (SKUs)' },
      { id: 'stock-ledger', label: 'Stock Movement Ledger' },
    ],
  },
  {
    category: 'Plant & Machinery (P&M)',
    modules: [
      { id: 'equipment', label: 'Equipment & Machinery Fleet' },
      { id: 'equipment-maintenance', label: 'Maintenance & Service' },
      { id: 'equipment-logbook', label: 'Fuel & Meter Logbook' },
    ],
  },
  {
    category: 'Contractors & Subcontract Billing',
    modules: [
      { id: 'work-orders', label: 'Work Orders' },
      { id: 'contractor-bills', label: 'Running RA Bills' },
      { id: 'measurement-sheets', label: 'Measurement Sheets' },
      { id: 'bill-approvals', label: 'Bill Approvals' },
      { id: 'contractor-payments', label: 'Contractor Payments' },
    ],
  },
  {
    category: 'Accounting & Corporate Finance',
    modules: [
      { id: 'vouchers', label: 'Accounting Vouchers' },
      { id: 'ledgers', label: 'Account Ledgers' },
      { id: 'cash-bank', label: 'Cash & Bank Books' },
      { id: 'tds-gst', label: 'TDS & GST Returns' },
      { id: 'financial-statements', label: 'Financial Statements' },
    ],
  },
  {
    category: 'Communication & Collaboration',
    modules: [
      { id: 'discussions', label: 'Discussions & Channels' },
      { id: 'announcements', label: 'Corporate Announcements' },
    ],
  },
  {
    category: 'Administration & System Settings',
    modules: [
      { id: 'site-config', label: 'Site & Branding Master' },
      { id: 'gst-settings', label: 'Statutory Taxes & GST' },
      { id: 'document-templates', label: 'Document Templates' },
      { id: 'approval-workflows', label: 'Approval Workflows' },
      { id: 'system-backup', label: 'System Backup & Audit' },
    ],
  },
];

const PERMISSION_ACTIONS: { id: keyof PermissionActionMap; label: string }[] = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'approve', label: 'Approve' },
  { id: 'export', label: 'Export' },
];

export function PermissionsPage() {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [moduleSearch, setModuleSearch] = useState('');
  const [matrixState, setMatrixState] = useState<Record<string, PermissionActionMap>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Load Roles, Departments, and Permissions
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => dataClient.list('roles') as Promise<RoleRecord[]>,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => dataClient.list('departments') as Promise<DepartmentRecord[]>,
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => dataClient.list('permissions') as Promise<PermissionRecord[]>,
  });

  // Department lookup map
  const departmentMap = useMemo(() => {
    const map = new Map<string, DepartmentRecord>();
    departments.forEach((d) => d.id && map.set(d.id, d));
    return map;
  }, [departments]);

  // Set default selected role when roles load
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id || '');
    }
  }, [roles, selectedRoleId]);

  const activeRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId);
  }, [roles, selectedRoleId]);

  // Load permissions when selected role changes
  useEffect(() => {
    if (!selectedRoleId) return;
    const existing = permissions.find((p) => p.roleId === selectedRoleId);
    const newMatrix: Record<string, PermissionActionMap> = {};

    ERP_MODULE_GROUPS.forEach((group) => {
      group.modules.forEach((mod) => {
        if (existing?.permissions) {
          const modPerm = (existing.permissions as Record<string, any>)[mod.id];
          if (existing.permissions.all === true) {
            newMatrix[mod.id] = { view: true, create: true, edit: true, delete: true, approve: true, export: true };
          } else if (typeof modPerm === 'object' && modPerm !== null) {
            newMatrix[mod.id] = {
              view: !!modPerm.view,
              create: !!modPerm.create,
              edit: !!modPerm.edit,
              delete: !!modPerm.delete,
              approve: !!modPerm.approve,
              export: !!modPerm.export,
            };
          } else {
            newMatrix[mod.id] = { view: false, create: false, edit: false, delete: false, approve: false, export: false };
          }
        } else {
          // Default baseline based on role accessLevel
          const isManagerOrExec = ['Executive', 'Manager'].includes(activeRole?.accessLevel || '');
          newMatrix[mod.id] = {
            view: isManagerOrExec || ['tasks', 'site-diary', 'material-requests'].includes(mod.id),
            create: isManagerOrExec,
            edit: isManagerOrExec,
            delete: activeRole?.accessLevel === 'Executive',
            approve: isManagerOrExec,
            export: isManagerOrExec,
          };
        }
      });
    });

    setMatrixState(newMatrix);
    setIsDirty(false);
  }, [selectedRoleId, permissions, activeRole]);

  // Toggle individual cell
  const handleToggleCell = (moduleId: string, action: keyof PermissionActionMap) => {
    setMatrixState((prev) => {
      const current = prev[moduleId] || {};
      const next = {
        ...prev,
        [moduleId]: {
          ...current,
          [action]: !current[action],
        },
      };
      return next;
    });
    setIsDirty(true);
  };

  // Toggle entire row (All actions for module)
  const handleToggleRow = (moduleId: string) => {
    setMatrixState((prev) => {
      const current = prev[moduleId] || {};
      const allActive = PERMISSION_ACTIONS.every((a) => current[a.id]);
      const nextVal = !allActive;
      const updatedRow: PermissionActionMap = {};
      PERMISSION_ACTIONS.forEach((a) => {
        updatedRow[a.id] = nextVal;
      });
      return {
        ...prev,
        [moduleId]: updatedRow,
      };
    });
    setIsDirty(true);
  };

  // Toggle column for a group
  const handleToggleGroupColumn = (moduleIds: string[], action: keyof PermissionActionMap) => {
    setMatrixState((prev) => {
      const allActive = moduleIds.every((mId) => prev[mId]?.[action]);
      const nextVal = !allActive;
      const next = { ...prev };
      moduleIds.forEach((mId) => {
        next[mId] = {
          ...(next[mId] || {}),
          [action]: nextVal,
        };
      });
      return next;
    });
    setIsDirty(true);
  };

  // Apply Quick Preset
  const handleApplyPreset = (presetName: string) => {
    const next: Record<string, PermissionActionMap> = {};
    ERP_MODULE_GROUPS.forEach((group) => {
      group.modules.forEach((mod) => {
        if (presetName === 'admin') {
          next[mod.id] = { view: true, create: true, edit: true, delete: true, approve: true, export: true };
        } else if (presetName === 'manager') {
          const isSystem = group.category.includes('Administration');
          next[mod.id] = {
            view: true,
            create: !isSystem,
            edit: !isSystem,
            delete: !isSystem && mod.id !== 'users',
            approve: true,
            export: true,
          };
        } else if (presetName === 'supervisor') {
          const isSite =
            group.category.includes('Execution') ||
            group.category.includes('Machinery') ||
            ['material-requests', 'stock-balances'].includes(mod.id);
          next[mod.id] = {
            view: isSite,
            create: isSite && mod.id !== 'equipment',
            edit: isSite,
            delete: false,
            approve: false,
            export: isSite,
          };
        } else if (presetName === 'store') {
          const isInv = group.category.includes('Inventory') || ['grn', 'equipment'].includes(mod.id);
          next[mod.id] = {
            view: isInv,
            create: isInv && mod.id !== 'equipment',
            edit: isInv,
            delete: false,
            approve: false,
            export: isInv,
          };
        } else if (presetName === 'accounts') {
          const isFin = group.category.includes('Accounting') || group.category.includes('Contractors') || mod.id === 'purchase-bills';
          next[mod.id] = {
            view: isFin,
            create: isFin,
            edit: isFin,
            delete: false,
            approve: isFin,
            export: true,
          };
        } else if (presetName === 'readonly') {
          next[mod.id] = { view: true, create: false, edit: false, delete: false, approve: false, export: true };
        }
      });
    });
    setMatrixState(next);
    setIsDirty(true);
    toast.info(`Applied ${presetName.toUpperCase()} permission template`);
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRoleId || !activeRole) throw new Error('No role selected');
      const existing = permissions.find((p) => p.roleId === selectedRoleId);

      const payload = {
        name: `${activeRole.name} Permissions`,
        roleId: selectedRoleId,
        roleCode: activeRole.code || '',
        roleName: activeRole.name || '',
        permissions: matrixState,
      };

      return dataClient.save('permissions', payload, existing?.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      setIsDirty(false);
      toast.success(`Permissions for ${activeRole?.name} saved successfully`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save permissions');
    },
  });

  // Filter modules by search query
  const filteredGroups = useMemo(() => {
    if (!moduleSearch.trim()) return ERP_MODULE_GROUPS;
    const q = moduleSearch.toLowerCase();
    return ERP_MODULE_GROUPS.map((g) => ({
      ...g,
      modules: g.modules.filter((m) => m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)),
    })).filter((g) => g.modules.length > 0);
  }, [moduleSearch]);

  // Statistics
  const grantStats = useMemo(() => {
    let totalGrants = 0;
    let possibleGrants = 0;
    Object.values(matrixState).forEach((row) => {
      PERMISSION_ACTIONS.forEach((act) => {
        possibleGrants++;
        if (row[act.id]) totalGrants++;
      });
    });
    const percentage = possibleGrants ? Math.round((totalGrants / possibleGrants) * 100) : 0;
    return { totalGrants, possibleGrants, percentage };
  }, [matrixState]);

  return (
    <div className="module-page-container space-y-6">
      <PageHeader
        title="Role-Based Permissions"
        description="Fine-grained security matrix configuring View, Create, Edit, Delete, Approval, and Export authorizations per role."
        eyebrow="Access Control Master"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // re-trigger load effect
                const existing = permissions.find((p) => p.roleId === selectedRoleId);
                if (existing?.permissions) {
                  setMatrixState(existing.permissions as any);
                  setIsDirty(false);
                  toast.info('Reverted to saved permissions');
                }
              }}
              disabled={!isDirty}
            >
              <ArrowsClockwise size={16} />
              <span>Reset</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !selectedRoleId}
            >
              <FloppyDisk size={16} weight="bold" />
              <span>{saveMutation.isPending ? 'Saving...' : 'Save Permissions'}</span>
            </Button>
          </div>
        }
      />

      {/* Role Selection & Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key size={16} className="text-indigo-600" />
              Select Role to Configure Permissions
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {departments.map((dept) => {
                const deptRoles = roles.filter((r) => r.departmentId === dept.id);
                if (deptRoles.length === 0) return null;
                return (
                  <optgroup key={dept.id} label={`${dept.name} (${dept.code || 'DEPT'})`}>
                    {deptRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} · {r.accessLevel || 'Staff'} ({r.code})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {activeRole && (
            <div className="flex items-center gap-4 text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg flex-wrap">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
                  <TreeStructure size={13} className="text-indigo-600" />
                  {activeRole.departmentName || departmentMap.get(activeRole.departmentId || '')?.name || 'General'}
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hierarchy Tier</span>
                <span className="font-semibold text-purple-700">{activeRole.accessLevel || 'Staff'}</span>
              </div>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Access Coverage</span>
                <span className="font-semibold text-emerald-700">{grantStats.percentage}% granted</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Presets Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkle size={13} className="text-amber-500" />
              Quick Templates:
            </span>
            <Button variant="ghost" size="sm" onClick={() => handleApplyPreset('admin')}>
              Super Admin (Full)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleApplyPreset('manager')}>
              Project Manager
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleApplyPreset('supervisor')}>
              Site Supervisor
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleApplyPreset('store')}>
              Store Keeper
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleApplyPreset('accounts')}>
              Finance & Accounts
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleApplyPreset('readonly')}>
              Read Only
            </Button>
          </div>

          <div className="relative w-48">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={moduleSearch}
              onChange={(e) => setModuleSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Permission Matrix Table */}
      {rolesLoading ? (
        <Skeleton variant="page" />
      ) : filteredGroups.length === 0 ? (
        <Empty title="No modules match search" description="Try a different module keyword." />
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => {
            const groupModuleIds = group.modules.map((m) => m.id);
            return (
              <div key={group.category} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {/* Category Header */}
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                    {group.category}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {group.modules.length} {group.modules.length === 1 ? 'Module' : 'Modules'}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500 bg-white">
                        <th className="py-2.5 px-4 w-72">Module / Resource</th>
                        <th className="py-2.5 px-3 text-center w-24">Row Actions</th>
                        {PERMISSION_ACTIONS.map((action) => (
                          <th key={action.id} className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleGroupColumn(groupModuleIds, action.id)}
                              className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors"
                              title={`Toggle all ${action.label} in ${group.category}`}
                            >
                              {action.label}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {group.modules.map((mod) => {
                        const rowPerm = matrixState[mod.id] || {};
                        const allRowActive = PERMISSION_ACTIONS.every((a) => rowPerm[a.id]);
                        return (
                          <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-4 font-medium text-slate-800">
                              <span className="block">{mod.label}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{mod.id}</span>
                            </td>

                            {/* Quick Row Toggle */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleRow(mod.id)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                  allRowActive
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {allRowActive ? 'All On' : 'Toggle'}
                              </button>
                            </td>

                            {/* Individual Action Checkboxes */}
                            {PERMISSION_ACTIONS.map((action) => {
                              const isActive = !!rowPerm[action.id];
                              return (
                                <td key={action.id} className="py-2.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCell(mod.id, action.id)}
                                    aria-label={`Toggle ${action.label} for ${mod.label}`}
                                    className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all ${
                                      isActive
                                        ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                                        : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                                    }`}
                                  >
                                    {isActive ? <Check size={14} weight="bold" /> : <X size={12} />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Save Bar */}
      {isDirty && (
        <div className="fixed bottom-4 right-8 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 z-40 border border-slate-700 animate-slide-up">
          <div className="text-xs">
            <span className="font-bold text-amber-400">Unsaved Changes:</span> Permissions updated for{' '}
            <strong>{activeRole?.name}</strong>.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const existing = permissions.find((p) => p.roleId === selectedRoleId);
                if (existing?.permissions) setMatrixState(existing.permissions as any);
                setIsDirty(false);
              }}
              className="text-white border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
            >
              <FloppyDisk size={14} />
              Save Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
