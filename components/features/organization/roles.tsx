'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  ShieldCheck,
  TreeStructure,
  Users,
  PencilSimple,
  Trash,
  Eye,
  MagnifyingGlass,
  CheckCircle,
  Crown,
  Briefcase,
  HardHat,
  Key,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader, initialsOf } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import type { RecordData } from '@/schemas';

interface RoleRecord extends RecordData {
  name?: string;
  code?: string;
  departmentId?: string;
  departmentName?: string;
  accessLevel?: string;
  description?: string;
  systemRole?: string;
  status?: string;
}

interface DepartmentRecord extends RecordData {
  name?: string;
  code?: string;
}

const ACCESS_LEVELS = ['Executive', 'Manager', 'Supervisor', 'Staff', 'Field', 'External'];

const SYSTEM_ROLES = [
  { value: 'admin', label: 'Administrator (Full System Access)' },
  { value: 'manager', label: 'Project / Department Manager' },
  { value: 'supervisor', label: 'Site Execution Supervisor' },
  { value: 'store', label: 'Store Keeper / Inventory' },
  { value: 'purchase', label: 'Procurement / SCM' },
  { value: 'accounts', label: 'Finance & Accounts' },
  { value: 'contractor', label: 'External Contractor' },
  { value: 'client', label: 'External Client Representative' },
];

export function RolesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [viewingRole, setViewingRole] = useState<RoleRecord | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleRecord | null>(null);

  // Form State (Department dependency is required!)
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formAccessLevel, setFormAccessLevel] = useState('Supervisor');
  const [formSystemRole, setFormSystemRole] = useState('supervisor');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  // Queries
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => dataClient.list('roles') as Promise<RoleRecord[]>,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => dataClient.list('departments') as Promise<DepartmentRecord[]>,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => dataClient.list('users'),
  });

  // Department lookup map
  const departmentMap = useMemo(() => {
    const map = new Map<string, DepartmentRecord>();
    departments.forEach((d) => {
      if (d.id) map.set(d.id, d);
    });
    return map;
  }, [departments]);

  // Open modal for Create
  const handleOpenAdd = () => {
    const defaultDept = departments[0]?.id || '';
    setFormName('');
    setFormCode(`ROLE-${String(roles.length + 1).padStart(3, '0')}`);
    setFormDepartmentId(defaultDept);
    setFormAccessLevel('Supervisor');
    setFormSystemRole('supervisor');
    setFormDescription('');
    setFormStatus('active');
    setIsAddOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (role: RoleRecord) => {
    setEditingRole(role);
    setFormName(role.name || '');
    setFormCode(role.code || '');
    setFormDepartmentId(role.departmentId || departments[0]?.id || '');
    setFormAccessLevel(role.accessLevel || 'Supervisor');
    setFormSystemRole(role.systemRole || 'supervisor');
    setFormDescription(role.description || '');
    setFormStatus(role.status || 'active');
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: Record<string, unknown> }) => {
      return dataClient.save('roles', payload.data, payload.id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(vars.id ? 'Role updated successfully' : 'Role created successfully');
      setIsAddOpen(false);
      setEditingRole(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save role');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return dataClient.delete('roles', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted');
      setDeletingRole(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete role');
    },
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDepartmentId) {
      toast.error('Role must be assigned to a department');
      return;
    }
    if (!formName.trim()) {
      toast.error('Role title is required');
      return;
    }
    if (!formCode.trim()) {
      toast.error('Role code is required');
      return;
    }

    const dept = departmentMap.get(formDepartmentId);

    const payload = {
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      departmentId: formDepartmentId,
      departmentName: dept?.name || 'Department',
      accessLevel: formAccessLevel,
      systemRole: formSystemRole,
      description: formDescription.trim(),
      status: formStatus,
    };

    saveMutation.mutate({
      id: editingRole?.id,
      data: payload,
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!roles.length) return;
    const headers = ['Role Code', 'Role Title', 'Department', 'Access Level', 'Base Role', 'Users Count', 'Status', 'Description'];
    const rows = roles.map((r) => {
      const deptName = r.departmentName || departmentMap.get(r.departmentId || '')?.name || 'Unassigned';
      const userCount = users.filter((u) => u.roleId === r.id || u.role === r.systemRole).length;
      return [
        `"${r.code || ''}"`,
        `"${r.name || ''}"`,
        `"${deptName}"`,
        `"${r.accessLevel || 'Staff'}"`,
        `"${r.systemRole || ''}"`,
        userCount,
        `"${r.status || 'active'}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERP-Roles-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Roles exported to CSV');
  };

  // KPI stats
  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((r) => r.status === 'active').length;
    const executiveCount = roles.filter((r) => ['Executive', 'Manager'].includes(r.accessLevel || '')).length;
    const fieldCount = roles.filter((r) => ['Supervisor', 'Field'].includes(r.accessLevel || '')).length;
    return [
      { label: 'Total Roles', value: total, sub: 'Across all departments', icon: ShieldCheck, color: '#3b82f6' },
      { label: 'Executive & Managers', value: executiveCount, sub: 'Strategic & approval tier', icon: Crown, color: '#8b5cf6' },
      { label: 'Site Execution & Field', value: fieldCount, sub: 'On-site supervisors & staff', icon: HardHat, color: '#f59e0b' },
      { label: 'Active Roles', value: `${active}/${total}`, sub: 'Ready for assignment', icon: CheckCircle, color: '#10b981' },
    ];
  }, [roles]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const deptName = role.departmentName || departmentMap.get(role.departmentId || '')?.name || '';
      const matchesSearch =
        !search ||
        (role.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (role.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (role.description || '').toLowerCase().includes(search.toLowerCase()) ||
        deptName.toLowerCase().includes(search.toLowerCase());

      const matchesDept = deptFilter === 'all' || role.departmentId === deptFilter;
      const matchesLevel = levelFilter === 'all' || role.accessLevel === levelFilter;
      const matchesStatus = statusFilter === 'all' || (role.status || 'active') === statusFilter;

      return matchesSearch && matchesDept && matchesLevel && matchesStatus;
    });
  }, [roles, search, deptFilter, levelFilter, statusFilter, departmentMap]);

  // Level Badge Helper
  const renderLevelBadge = (level?: string) => {
    const lvl = level || 'Staff';
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (lvl === 'Executive') color = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
    if (lvl === 'Manager') color = 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
    if (lvl === 'Supervisor') color = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    if (lvl === 'Field') color = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    return (
      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${color}`}>
        {lvl}
      </span>
    );
  };

  // Table Columns
  const columns = useMemo<ColumnDef<RoleRecord, unknown>[]>(
    () => [
      {
        id: 'code',
        header: 'Role Code',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {row.original.code || '—'}
          </span>
        ),
      },
      {
        id: 'name',
        header: 'Role Title & Responsibilities',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">{row.original.name || 'Unnamed Role'}</div>
            {row.original.description && (
              <div className="text-xs text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'department',
        header: 'Department (Parent)',
        meta: { align: 'left' },
        cell: ({ row }) => {
          const dept = departmentMap.get(row.original.departmentId || '');
          const deptName = dept?.name || row.original.departmentName || 'General';
          return (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-medium">
              <TreeStructure size={14} className="text-indigo-600 shrink-0" />
              {deptName}
            </span>
          );
        },
      },
      {
        id: 'accessLevel',
        header: 'Hierarchy / Level',
        meta: { align: 'center' },
        cell: ({ row }) => renderLevelBadge(row.original.accessLevel),
      },
      {
        id: 'assignedUsers',
        header: 'Assigned Users',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const count = users.filter(
            (u) => u.roleId === row.original.id || u.role === row.original.systemRole,
          ).length;
          return (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              <Users size={12} />
              {count} {count === 1 ? 'User' : 'Users'}
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        meta: { align: 'center' },
        cell: ({ row }) => <Badge status={row.original.status || 'active'} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
              title="View role details and assigned users"
              onClick={() => setViewingRole(row.original)}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
              title="Edit role"
              onClick={() => handleOpenEdit(row.original)}
            >
              <PencilSimple size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
              title="Delete role"
              onClick={() => setDeletingRole(row.original)}
            >
              <Trash size={16} />
            </button>
          </div>
        ),
      },
    ],
    [departmentMap, users],
  );

  return (
    <div className="module-page-container space-y-6">
      <PageHeader
        title="Roles & Hierarchy"
        description="Department-linked access roles, hierarchy tiers, and organizational permissions structure."
        eyebrow="Access Control Master"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!roles.length}>
              <DownloadSimple size={16} />
              <span>Export CSV</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleOpenAdd}>
              <Plus size={16} weight="bold" />
              <span>Add Role</span>
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const IconComponent = s.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: s.color }}
              >
                <IconComponent size={20} weight="bold" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar & Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles by title, code, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Department Filter (Role depends on Department!) */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Levels</option>
              {ACCESS_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {(search || deptFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setDeptFilter('all');
                  setLevelFilter('all');
                  setStatusFilter('all');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Skeleton variant="stack" rows={5} />
          </div>
        ) : filteredRoles.length === 0 ? (
          <Empty
            title="No roles found"
            description={search || deptFilter !== 'all' ? 'No roles match the selected department or filter criteria.' : 'Create department roles to assign access privileges.'}
          >
            <Button variant="default" size="sm" onClick={handleOpenAdd} className="mt-4">
              <Plus size={16} />
              Add Role
            </Button>
          </Empty>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRoles}
            caption="Department Roles & Permissions Hierarchy"
            pageSize={10}
          />
        )}
      </div>

      {/* Add / Edit Role Modal */}
      <Modal
        open={isAddOpen || editingRole !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingRole(null);
          }
        }}
        title={editingRole ? 'Edit Role' : 'Create New Department Role'}
        description="Roles must be tied to a parent department. Choose the department to which this role belongs."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
          {/* Department Selection (Mandatory Dependency) */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
              <TreeStructure size={14} className="text-indigo-600" />
              Parent Department * (Role Depends on Department)
            </label>
            <select
              required
              value={formDepartmentId}
              onChange={(e) => setFormDepartmentId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code || 'DEPT'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-indigo-700 mt-1">
              Users in this department will be restricted to roles belonging to this division.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Site Supervisor"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ROLE-ENG-SUP"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Access Hierarchy Level
              </label>
              <select
                value={formAccessLevel}
                onChange={(e) => setFormAccessLevel(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {ACCESS_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base System Role & Permissions
              </label>
              <select
                value={formSystemRole}
                onChange={(e) => setFormSystemRole(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {SYSTEM_ROLES.map((sr) => (
                  <option key={sr.value} value={sr.value}>
                    {sr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Description & Key Responsibilities
            </label>
            <textarea
              rows={3}
              placeholder="Outline specific responsibilities, approval thresholds, and document duties for this role..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="dialog-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingRole(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Role Modal */}
      <Modal
        open={viewingRole !== null}
        onOpenChange={(open) => !open && setViewingRole(null)}
        title={viewingRole?.name || 'Role Overview'}
        description={`Code: ${viewingRole?.code || '—'} · Level: ${viewingRole?.accessLevel || 'Staff'}`}
      >
        {viewingRole && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Parent Department:</span>
                <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                  <TreeStructure size={14} className="text-indigo-600" />
                  {viewingRole.departmentName || departmentMap.get(viewingRole.departmentId || '')?.name || 'Unassigned'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Hierarchy Tier:</span>
                {renderLevelBadge(viewingRole.accessLevel)}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">System Role Map:</span>
                <span className="font-mono text-slate-800">{viewingRole.systemRole || 'custom'}</span>
              </div>
              {viewingRole.description && (
                <p className="text-xs text-slate-600 border-t border-slate-200 pt-2 mt-2 leading-relaxed">
                  {viewingRole.description}
                </p>
              )}
            </div>

            {/* Users with this role */}
            <div>
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                <Users size={16} className="text-blue-600" />
                Users Assigned to this Role ({users.filter((u) => u.roleId === viewingRole.id || u.role === viewingRole.systemRole).length})
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {users.filter((u) => u.roleId === viewingRole.id || u.role === viewingRole.systemRole).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No users currently assigned to this role.</p>
                ) : (
                  users
                    .filter((u) => u.roleId === viewingRole.id || u.role === viewingRole.systemRole)
                    .map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 rounded bg-slate-50 text-xs border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold flex items-center justify-center">
                            {initialsOf(u.name)}
                          </span>
                          <span className="font-medium text-slate-900">{u.name}</span>
                        </div>
                        <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="dialog-actions">
              <Button variant="default" onClick={() => setViewingRole(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deletingRole !== null}
        onOpenChange={(open) => !open && setDeletingRole(null)}
        title="Confirm Role Deletion"
        description="Are you sure you want to delete this role? Any users assigned to this role will need to be reallocated."
      >
        {deletingRole && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <p>
                You are about to delete <strong>{deletingRole.name}</strong> ({deletingRole.code}) from department{' '}
                <strong>{deletingRole.departmentName || departmentMap.get(deletingRole.departmentId || '')?.name}</strong>.
              </p>
            </div>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setDeletingRole(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingRole.id && deleteMutation.mutate(deletingRole.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Role'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
