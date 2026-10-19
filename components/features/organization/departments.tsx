'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  TreeStructure,
  Users,
  ShieldCheck,
  Buildings,
  PencilSimple,
  Trash,
  Eye,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Hash,
  IdentificationBadge,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader, initialsOf } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import type { RecordData } from '@/schemas';

interface DepartmentRecord extends RecordData {
  name?: string;
  code?: string;
  headId?: string;
  headName?: string;
  costCenter?: string;
  description?: string;
  status?: string;
}

export function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [viewingDept, setViewingDept] = useState<DepartmentRecord | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentRecord | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formHeadName, setFormHeadName] = useState('');
  const [formCostCenter, setFormCostCenter] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  // Load departments, roles, and users
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => dataClient.list('departments') as Promise<DepartmentRecord[]>,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => dataClient.list('roles'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => dataClient.list('users'),
  });

  // Open modal for Create
  const handleOpenAdd = () => {
    setFormName('');
    setFormCode(`DEPT-${String(departments.length + 1).padStart(3, '0')}`);
    setFormHeadName(users[0]?.name || '');
    setFormCostCenter('CC-GENERAL');
    setFormDescription('');
    setFormStatus('active');
    setIsAddOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (dept: DepartmentRecord) => {
    setEditingDept(dept);
    setFormName(dept.name || '');
    setFormCode(dept.code || '');
    setFormHeadName(dept.headName || '');
    setFormCostCenter(dept.costCenter || '');
    setFormDescription(dept.description || '');
    setFormStatus(dept.status || 'active');
  };

  // Mutation for Save (Create & Edit)
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: Record<string, unknown> }) => {
      return dataClient.save('departments', payload.data, payload.id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success(vars.id ? 'Department updated successfully' : 'Department created successfully');
      setIsAddOpen(false);
      setEditingDept(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save department');
    },
  });

  // Mutation for Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return dataClient.delete('departments', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted');
      setDeletingDept(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete department');
    },
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Department name is required');
      return;
    }
    if (!formCode.trim()) {
      toast.error('Department code is required');
      return;
    }

    const payload = {
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      headName: formHeadName.trim(),
      costCenter: formCostCenter.trim().toUpperCase(),
      description: formDescription.trim(),
      status: formStatus,
    };

    saveMutation.mutate({
      id: editingDept?.id,
      data: payload,
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!departments.length) return;
    const headers = ['Code', 'Department Name', 'Head of Department', 'Cost Center', 'Roles Count', 'Staff Count', 'Status', 'Description'];
    const rows = departments.map((d) => {
      const linkedRolesCount = roles.filter((r) => r.departmentId === d.id).length;
      const linkedUsersCount = users.filter((u) => u.departmentId === d.id).length;
      return [
        `"${d.code || ''}"`,
        `"${d.name || ''}"`,
        `"${d.headName || ''}"`,
        `"${d.costCenter || ''}"`,
        linkedRolesCount,
        linkedUsersCount,
        `"${d.status || 'active'}"`,
        `"${(d.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERP-Departments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Departments exported to CSV');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = departments.length;
    const active = departments.filter((d) => d.status === 'active').length;
    const totalRoles = roles.length;
    const totalUsers = users.length;
    return [
      { label: 'Total Departments', value: total, sub: 'Active functional units', icon: TreeStructure, color: '#3b82f6' },
      { label: 'Active Roles', value: totalRoles, sub: 'Department roles defined', icon: ShieldCheck, color: '#10b981' },
      { label: 'Assigned Staff', value: totalUsers, sub: 'Team members mapped', icon: Users, color: '#8b5cf6' },
      { label: 'Operational Status', value: `${active}/${total}`, sub: 'Divisions online', icon: CheckCircle, color: '#06b6d4' },
    ];
  }, [departments, roles, users]);

  // Filtered rows
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        !search ||
        (dept.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (dept.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (dept.headName || '').toLowerCase().includes(search.toLowerCase()) ||
        (dept.costCenter || '').toLowerCase().includes(search.toLowerCase()) ||
        (dept.description || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || (dept.status || 'active') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  // Table Columns Definition
  const columns = useMemo<ColumnDef<DepartmentRecord, unknown>[]>(
    () => [
      {
        id: 'code',
        header: 'Code',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {row.original.code || '—'}
          </span>
        ),
      },
      {
        id: 'name',
        header: 'Department Name & Scope',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">{row.original.name || 'Unnamed Department'}</div>
            {row.original.description && (
              <div className="text-xs text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'headName',
        header: 'Head of Department',
        meta: { align: 'left' },
        cell: ({ row }) => {
          const head = row.original.headName || 'Not Assigned';
          return (
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                {initialsOf(head)}
              </span>
              <span className="text-xs font-medium text-slate-700">{head}</span>
            </div>
          );
        },
      },
      {
        id: 'costCenter',
        header: 'Cost Center',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono font-medium">
            {row.original.costCenter || 'CC-GEN'}
          </span>
        ),
      },
      {
        id: 'rolesCount',
        header: 'Linked Roles',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const count = roles.filter((r) => r.departmentId === row.original.id).length;
          return (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              <ShieldCheck size={13} />
              {count} {count === 1 ? 'Role' : 'Roles'}
            </span>
          );
        },
      },
      {
        id: 'staffCount',
        header: 'Team Members',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const count = users.filter((u) => u.departmentId === row.original.id).length;
          return (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
              <Users size={13} />
              {count} {count === 1 ? 'Member' : 'Members'}
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
              title="View department details and linked roles"
              onClick={() => setViewingDept(row.original)}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
              title="Edit department"
              onClick={() => handleOpenEdit(row.original)}
            >
              <PencilSimple size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
              title="Delete department"
              onClick={() => setDeletingDept(row.original)}
            >
              <Trash size={16} />
            </button>
          </div>
        ),
      },
    ],
    [roles, users],
  );

  return (
    <div className="module-page-container space-y-6">
      <PageHeader
        title="Departments"
        description="Organize functional business units, project engineering teams, procurement divisions, and cost centers."
        eyebrow="Organization Master"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!departments.length}>
              <DownloadSimple size={16} />
              <span>Export CSV</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleOpenAdd}>
              <Plus size={16} weight="bold" />
              <span>Add Department</span>
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
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search departments by code, name, head, cost center..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            {(search || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
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
        ) : filteredDepartments.length === 0 ? (
          <Empty
            title="No departments found"
            description={search ? 'No departments match your current search criteria.' : 'Create your first organizational department to get started.'}
          >
            <Button variant="default" size="sm" onClick={handleOpenAdd} className="mt-4">
              <Plus size={16} />
              Add Department
            </Button>
          </Empty>
        ) : (
          <DataTable
            columns={columns}
            data={filteredDepartments}
            caption="Organization Departments"
            pageSize={10}
          />
        )}
      </div>

      {/* Add / Edit Department Modal */}
      <Modal
        open={isAddOpen || editingDept !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingDept(null);
          }
        }}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        description="Configure organizational division details, operational mandate, cost center, and leadership."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. DEPT-ENG"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Center Code
              </label>
              <input
                type="text"
                placeholder="e.g. CC-STRUCT"
                value={formCostCenter}
                onChange={(e) => setFormCostCenter(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Civil & Project Engineering"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Head of Department
              </label>
              <input
                type="text"
                placeholder="e.g. Kavitha Rao"
                value={formHeadName}
                onChange={(e) => setFormHeadName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
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
              Description & Scope of Responsibilities
            </label>
            <textarea
              rows={3}
              placeholder="Describe the operational mandate and work activities managed by this department..."
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
                setEditingDept(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Department Details Modal */}
      <Modal
        open={viewingDept !== null}
        onOpenChange={(open) => !open && setViewingDept(null)}
        title={viewingDept?.name || 'Department Details'}
        description={`Code: ${viewingDept?.code || '—'} · Cost Center: ${viewingDept?.costCenter || '—'}`}
      >
        {viewingDept && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 leading-relaxed">
                {viewingDept.description || 'No detailed scope description provided for this department.'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span>Head: <strong>{viewingDept.headName || 'Not Assigned'}</strong></span>
                <span>Status: <Badge status={viewingDept.status} /></span>
              </div>
            </div>

            {/* Linked Roles */}
            <div>
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                <ShieldCheck size={16} className="text-indigo-600" />
                Roles Dependent on this Department ({roles.filter((r) => r.departmentId === viewingDept.id).length})
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {roles.filter((r) => r.departmentId === viewingDept.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No roles currently configured under this department.</p>
                ) : (
                  roles
                    .filter((r) => r.departmentId === viewingDept.id)
                    .map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-2 rounded bg-slate-50 text-xs border border-slate-200">
                        <span className="font-medium text-slate-800">{String(r.name || '')}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{String(r.code || '')}</span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">{String(r.accessLevel || 'Staff')}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Linked Team Members */}
            <div>
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                <Users size={16} className="text-purple-600" />
                Assigned Team Members ({users.filter((u) => u.departmentId === viewingDept.id).length})
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {users.filter((u) => u.departmentId === viewingDept.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No team members assigned to this department yet.</p>
                ) : (
                  users
                    .filter((u) => u.departmentId === viewingDept.id)
                    .map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 rounded bg-slate-50 text-xs border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center">
                            {initialsOf(String(u.name || ''))}
                          </span>
                          <span className="font-medium text-slate-800">{String(u.name || '')}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">{String(u.email || '')}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="dialog-actions">
              <Button variant="default" onClick={() => setViewingDept(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deletingDept !== null}
        onOpenChange={(open) => !open && setDeletingDept(null)}
        title="Confirm Department Deletion"
        description="Are you sure you want to delete this department? Any linked roles and users will lose this department mapping."
      >
        {deletingDept && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <p>
                You are about to delete <strong>{deletingDept.name}</strong> ({deletingDept.code}). This action is logged to the system audit trail.
              </p>
            </div>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setDeletingDept(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingDept.id && deleteMutation.mutate(deletingDept.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Department'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
