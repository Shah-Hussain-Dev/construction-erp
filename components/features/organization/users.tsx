'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  UsersThree,
  TreeStructure,
  ShieldCheck,
  MapPin,
  PencilSimple,
  Trash,
  Eye,
  CheckCircle,
  EnvelopeSimple,
  Phone,
  IdentificationCard,
  UserGear,
  Buildings,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader, initialsOf } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { ListToolbar } from '../../ui/list-toolbar';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import type { RecordData } from '@/schemas';

interface UserRecord extends RecordData {
  name?: string;
  email?: string;
  phone?: string;
  employeeCode?: string;
  departmentId?: string;
  roleId?: string;
  role?: string;
  designation?: string;
  siteId?: string;
  siteIds?: string[];
  status?: string;
  joinDate?: string;
}

interface DepartmentRecord extends RecordData {
  name?: string;
  code?: string;
}

interface RoleRecord extends RecordData {
  name?: string;
  code?: string;
  departmentId?: string;
  accessLevel?: string;
  systemRole?: string;
}

interface SiteRecord extends RecordData {
  name?: string;
  code?: string;
}

export function UsersPage() {
  const queryClient = useQueryClient();

  // Filters state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

  // Form State (Role dynamically depends on Department!)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmployeeCode, setFormEmployeeCode] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formRoleId, setFormRoleId] = useState('');
  const [formSiteId, setFormSiteId] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  // Load Users, Departments, Roles, Sites
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => dataClient.list('users') as Promise<UserRecord[]>,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => dataClient.list('departments') as Promise<DepartmentRecord[]>,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => dataClient.list('roles') as Promise<RoleRecord[]>,
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => dataClient.list('sites') as Promise<SiteRecord[]>,
  });

  // Maps for quick lookups
  const departmentMap = useMemo(() => {
    const map = new Map<string, DepartmentRecord>();
    departments.forEach((d) => d.id && map.set(d.id, d));
    return map;
  }, [departments]);

  const roleMap = useMemo(() => {
    const map = new Map<string, RoleRecord>();
    roles.forEach((r) => r.id && map.set(r.id, r));
    return map;
  }, [roles]);

  const siteMap = useMemo(() => {
    const map = new Map<string, SiteRecord>();
    sites.forEach((s) => s.id && map.set(s.id, s));
    return map;
  }, [sites]);

  // Roles available for the currently selected Department in Form (DEPENDENCY)
  const availableRolesForDept = useMemo(() => {
    if (!formDepartmentId) return [];
    return roles.filter((r) => r.departmentId === formDepartmentId);
  }, [roles, formDepartmentId]);

  // Open modal for Create
  const handleOpenAdd = () => {
    const firstDept = departments[0]?.id || '';
    const matchingRoles = roles.filter((r) => r.departmentId === firstDept);
    setFormName('');
    setFormEmail('');
    setFormPhone('+91 ');
    setFormEmployeeCode(`EMP-${String(users.length + 1).padStart(3, '0')}`);
    setFormDepartmentId(firstDept);
    setFormRoleId(matchingRoles[0]?.id || '');
    setFormSiteId(sites[0]?.id || '');
    setFormDesignation('');
    setFormStatus('active');
    setIsAddOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (user: UserRecord) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormEmployeeCode(user.employeeCode || '');
    setFormDepartmentId(user.departmentId || departments[0]?.id || '');
    setFormRoleId(user.roleId || '');
    setFormSiteId(user.siteId || (user.siteIds && user.siteIds[0]) || sites[0]?.id || '');
    setFormDesignation(user.designation || '');
    setFormStatus(user.status || 'active');
  };

  // When form Department changes, automatically update the Role dropdown!
  const handleDepartmentChange = (deptId: string) => {
    setFormDepartmentId(deptId);
    const matching = roles.filter((r) => r.departmentId === deptId);
    setFormRoleId(matching[0]?.id || '');
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: Record<string, unknown> }) => {
      return dataClient.save('users', payload.data, payload.id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(vars.id ? 'User updated successfully' : 'User created successfully');
      setIsAddOpen(false);
      setEditingUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save user');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return dataClient.delete('users', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User removed from system');
      setDeletingUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove user');
    },
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      toast.error('A valid email address is required');
      return;
    }
    if (!formDepartmentId) {
      toast.error('Please assign a department');
      return;
    }
    if (!formRoleId) {
      toast.error('Please select a role belonging to the department');
      return;
    }

    const selectedRole = roleMap.get(formRoleId);
    const systemRole = selectedRole?.systemRole || 'supervisor';

    const payload = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      employeeCode: formEmployeeCode.trim().toUpperCase(),
      departmentId: formDepartmentId,
      roleId: formRoleId,
      role: systemRole, // Maps to backend RBAC authorization role
      siteId: formSiteId,
      siteIds: [formSiteId],
      designation: formDesignation.trim() || selectedRole?.name || 'Staff',
      status: formStatus,
    };

    saveMutation.mutate({
      id: editingUser?.id,
      data: payload,
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!users.length) return;
    const headers = ['Employee Code', 'Full Name', 'Email', 'Phone', 'Department', 'Role Title', 'Designation', 'Assigned Site', 'Status'];
    const rows = users.map((u) => {
      const deptName = departmentMap.get(u.departmentId || '')?.name || '—';
      const roleName = roleMap.get(u.roleId || '')?.name || u.role || '—';
      const siteName = siteMap.get(u.siteId || '')?.name || '—';
      return [
        `"${u.employeeCode || ''}"`,
        `"${u.name || ''}"`,
        `"${u.email || ''}"`,
        `"${u.phone || ''}"`,
        `"${deptName}"`,
        `"${roleName}"`,
        `"${u.designation || ''}"`,
        `"${siteName}"`,
        `"${u.status || 'active'}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERP-Users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users list exported to CSV');
  };

  // KPI stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const deptsWithUsers = new Set(users.map((u) => u.departmentId).filter(Boolean)).size;
    const sitesCovered = new Set(users.map((u) => u.siteId).filter(Boolean)).size;
    return [
      { label: 'Total Team Members', value: total, sub: 'Registered accounts', icon: UsersThree, color: '#3b82f6' },
      { label: 'Active Users', value: active, sub: 'Online & authorized', icon: CheckCircle, color: '#10b981' },
      { label: 'Departments Covered', value: deptsWithUsers, sub: 'Functional divisions', icon: TreeStructure, color: '#8b5cf6' },
      { label: 'Sites Deployed', value: sitesCovered, sub: 'Active work locations', icon: MapPin, color: '#06b6d4' },
    ];
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const dept = departmentMap.get(u.departmentId || '');
      const role = roleMap.get(u.roleId || '');
      const site = siteMap.get(u.siteId || '');

      const matchesSearch =
        !search ||
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.phone || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.employeeCode || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.designation || '').toLowerCase().includes(search.toLowerCase()) ||
        (dept?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (role?.name || '').toLowerCase().includes(search.toLowerCase());

      const matchesDept = deptFilter === 'all' || u.departmentId === deptFilter;
      const matchesRole = roleFilter === 'all' || u.roleId === roleFilter || u.role === roleFilter;
      const matchesSite = siteFilter === 'all' || u.siteId === siteFilter || (u.siteIds && u.siteIds.includes(siteFilter));
      const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;

      return matchesSearch && matchesDept && matchesRole && matchesSite && matchesStatus;
    });
  }, [users, search, deptFilter, roleFilter, siteFilter, statusFilter, departmentMap, roleMap, siteMap]);

  // Filter roles dropdown based on active dept filter
  const filterableRoles = useMemo(() => {
    if (deptFilter === 'all') return roles;
    return roles.filter((r) => r.departmentId === deptFilter);
  }, [roles, deptFilter]);

  // Table Columns
  const columns = useMemo<ColumnDef<UserRecord, unknown>[]>(
    () => [
      {
        id: 'employeeCode',
        header: 'Emp ID',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {row.original.employeeCode || 'EMP-—'}
          </span>
        ),
      },
      {
        id: 'name',
        header: 'User & Designation',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
              {initialsOf(row.original.name)}
            </span>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">{row.original.name || 'Unnamed User'}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{row.original.designation || 'Staff'}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contact Information',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div className="space-y-0.5 text-xs">
            <div className="text-slate-800 font-mono text-[11px] flex items-center gap-1">
              <EnvelopeSimple size={12} className="text-slate-400" />
              {row.original.email || '—'}
            </div>
            {row.original.phone && (
              <div className="text-slate-500 text-[11px] flex items-center gap-1">
                <Phone size={12} className="text-slate-400" />
                {row.original.phone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        meta: { align: 'left' },
        cell: ({ row }) => {
          const dept = departmentMap.get(row.original.departmentId || '');
          return (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-800 font-medium">
              <TreeStructure size={13} className="text-indigo-600 shrink-0" />
              {dept?.name || 'General Org'}
            </span>
          );
        },
      },
      {
        id: 'role',
        header: 'Role (Dept Dependent)',
        meta: { align: 'left' },
        cell: ({ row }) => {
          const role = roleMap.get(row.original.roleId || '');
          const roleTitle = role?.name || row.original.role || 'Supervisor';
          return (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                <ShieldCheck size={12} />
                {roleTitle}
              </span>
              {role?.accessLevel && (
                <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                  {role.accessLevel}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'site',
        header: 'Assigned Site',
        meta: { align: 'left' },
        cell: ({ row }) => {
          const site = siteMap.get(row.original.siteId || (row.original.siteIds && row.original.siteIds[0]) || '');
          return (
            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
              <MapPin size={12} className="text-slate-400" />
              {site?.name || 'All Sites'}
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
              title="View full profile"
              onClick={() => setViewingUser(row.original)}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
              title="Edit user details"
              onClick={() => handleOpenEdit(row.original)}
            >
              <PencilSimple size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
              title="Delete user"
              onClick={() => setDeletingUser(row.original)}
            >
              <Trash size={16} />
            </button>
          </div>
        ),
      },
    ],
    [departmentMap, roleMap, siteMap],
  );

  return (
    <div className="module-page-container space-y-6">
      <PageHeader
        title="User Management"
        description="Manage organizational personnel, credentials, department memberships, and site authorizations."
        eyebrow="Organization Master"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!users.length}>
              <DownloadSimple size={16} />
              <span>Export CSV</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleOpenAdd}>
              <Plus size={16} weight="bold" />
              <span>Add User</span>
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
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users by name, email, employee code, role..."
        filters={[
          {
            id: 'department',
            label: 'Department',
            value: deptFilter,
            onChange: (value) => {
              setDeptFilter(value);
              setRoleFilter('all');
            },
            allLabel: 'All Departments',
            options: departments.map((d) => ({
              value: d.id || '',
              label: d.name || 'Unnamed Department',
            })),
          },
          {
            id: 'role',
            label: 'Role',
            value: roleFilter,
            onChange: setRoleFilter,
            allLabel: 'All Roles',
            options: filterableRoles.map((r) => ({
              value: r.id || '',
              label: r.name || 'Unnamed Role',
            })),
          },
          {
            id: 'site',
            label: 'Site',
            value: siteFilter,
            onChange: setSiteFilter,
            allLabel: 'All Sites',
            options: sites.map((s) => ({
              value: s.id || '',
              label: s.name || 'Unnamed Site',
            })),
          },
          {
            id: 'status',
            label: 'User status',
            value: statusFilter,
            onChange: setStatusFilter,
            allLabel: 'All Statuses',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setDeptFilter('all');
          setRoleFilter('all');
          setSiteFilter('all');
          setStatusFilter('all');
        }}
      />

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="py-12 px-4">
            <Skeleton variant="stack" rows={6} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Empty
            title="No users found"
            description={search || deptFilter !== 'all' ? 'No users match your active filter criteria.' : 'Add your first enterprise user to begin assigning operational duties.'}
          >
            <Button variant="default" size="sm" onClick={handleOpenAdd} className="mt-4">
              <Plus size={16} />
              Add User
            </Button>
          </Empty>
        ) : (
          <DataTable
            columns={columns}
            data={filteredUsers}
            caption="Enterprise Users & Role Authorizations"
            pageSize={10}
            hideToolbar
          />
        )}
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        open={isAddOpen || editingUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingUser(null);
          }
        }}
        title={editingUser ? 'Edit User Profile' : 'Add New Team Member'}
        description="Select a department to filter and assign matching roles. Roles strictly correspond to their parent department."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Verma"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employee Code / ID
              </label>
              <input
                type="text"
                placeholder="e.g. EMP-025"
                value={formEmployeeCode}
                onChange={(e) => setFormEmployeeCode(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="rahul@civil.example"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98450 12345"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Department Selection (Determines available roles) */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <TreeStructure size={14} className="text-indigo-600" />
                1. Select Department *
              </label>
              <select
                required
                value={formDepartmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code || 'DEPT'})
                  </option>
                ))}
              </select>
            </div>

            {/* Role Selection (Dependent on chosen Department!) */}
            <div>
              <label className="block text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-600" />
                2. Select Role * (Dependent on {departmentMap.get(formDepartmentId)?.name || 'Department'})
              </label>
              <select
                required
                value={formRoleId}
                onChange={(e) => setFormRoleId(e.target.value)}
                disabled={!formDepartmentId || availableRolesForDept.length === 0}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {!formDepartmentId ? (
                  <option value="">Select a department above first</option>
                ) : availableRolesForDept.length === 0 ? (
                  <option value="">No roles configured for this department</option>
                ) : (
                  availableRolesForDept.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code} · {r.accessLevel || 'Staff'})
                    </option>
                  ))
                )}
              </select>
              {availableRolesForDept.length > 0 && formRoleId && (
                <p className="text-[11px] text-indigo-700 mt-1">
                  Access Level:{' '}
                  <strong>{roleMap.get(formRoleId)?.accessLevel || 'Staff'}</strong> · System Authorization:{' '}
                  <strong>{roleMap.get(formRoleId)?.systemRole || 'supervisor'}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Site / Project
              </label>
              <select
                value={formSiteId}
                onChange={(e) => setFormSiteId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code || 'SITE'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation / Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Site Engineer"
                value={formDesignation}
                onChange={(e) => setFormDesignation(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="active">Active & Authorized</option>
              <option value="inactive">Inactive / On Hold</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="dialog-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingUser(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingUser ? 'Save Profile' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View User Profile Modal */}
      <Modal
        open={viewingUser !== null}
        onOpenChange={(open) => !open && setViewingUser(null)}
        title={viewingUser?.name || 'User Profile'}
        description={`Employee ID: ${viewingUser?.employeeCode || 'EMP-—'} · Status: ${viewingUser?.status || 'active'}`}
      >
        {viewingUser && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center shrink-0 border border-indigo-200">
                {initialsOf(viewingUser.name)}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{viewingUser.name}</h3>
                <p className="text-xs text-slate-500">{viewingUser.designation || 'Staff Member'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge status={viewingUser.status || 'active'} />
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                    {viewingUser.employeeCode || 'NO-ID'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                  <TreeStructure size={13} className="text-indigo-600" />
                  {departmentMap.get(viewingUser.departmentId || '')?.name || 'General'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Assigned Role</span>
                <span className="font-semibold text-indigo-700 inline-flex items-center gap-1">
                  <ShieldCheck size={13} />
                  {roleMap.get(viewingUser.roleId || '')?.name || viewingUser.role || 'Supervisor'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-mono text-slate-800">{viewingUser.email}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-mono text-slate-800">{viewingUser.phone || '—'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 col-span-2">
                <span className="text-slate-400 block mb-0.5">Assigned Site & Work Location</span>
                <span className="font-medium text-slate-800 inline-flex items-center gap-1">
                  <MapPin size={13} className="text-rose-500" />
                  {siteMap.get(viewingUser.siteId || '')?.name || 'All Sites Authorized'}
                </span>
              </div>
            </div>

            <div className="dialog-actions">
              <Button variant="default" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deletingUser !== null}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        title="Confirm User Deletion"
        description="Are you sure you want to delete this user? Their active session will be invalidated."
      >
        {deletingUser && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <p>
                You are about to delete user <strong>{deletingUser.name}</strong> ({deletingUser.email}).
                This action is irreversible and recorded in the audit log.
              </p>
            </div>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setDeletingUser(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingUser.id && deleteMutation.mutate(deletingUser.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
