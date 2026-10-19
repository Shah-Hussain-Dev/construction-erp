'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  MapPin,
  Buildings,
  Phone,
  User,
  PencilSimple,
  Trash,
  Eye,
  CheckCircle,
  Warehouse,
  Briefcase,
  Crosshair,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { ListToolbar } from '../../ui/list-toolbar';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import type { RecordData } from '@/schemas';

interface SiteRecord extends RecordData {
  name?: string;
  code?: string;
  projectId?: string;
  address?: string;
  city?: string;
  state?: string;
  inCharge?: string;
  inChargePhone?: string;
  status?: string;
  storesCount?: number;
}

interface ProjectRecord extends RecordData {
  name?: string;
  code?: string;
  clientName?: string;
}

export function SitesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteRecord | null>(null);
  const [viewingSite, setViewingSite] = useState<SiteRecord | null>(null);
  const [deletingSite, setDeletingSite] = useState<SiteRecord | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formInCharge, setFormInCharge] = useState('');
  const [formInChargePhone, setFormInChargePhone] = useState('+91 ');
  const [formStatus, setFormStatus] = useState('active');

  // Load sites
  const { data: sites = [], isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => dataClient.list('sites') as Promise<SiteRecord[]>,
  });

  // Load projects for mapping
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => dataClient.list('projects') as Promise<ProjectRecord[]>,
  });

  // Load stores for counting site stores
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => dataClient.list('stores') as Promise<RecordData[]>,
  });

  // Project lookup map
  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectRecord>();
    projects.forEach((p) => {
      if (p.id) map.set(p.id, p);
    });
    return map;
  }, [projects]);

  // Stores per site count map
  const siteStoreCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    stores.forEach((s) => {
      const sId = (s as any).siteId;
      if (sId) {
        counts.set(sId, (counts.get(sId) || 0) + 1);
      }
    });
    return counts;
  }, [stores]);

  // Handle open Add
  const handleOpenAdd = () => {
    setFormName('');
    setFormCode(`SIT-${String(sites.length + 1).padStart(3, '0')}`);
    setFormProjectId(projects[0]?.id || '');
    setFormAddress('');
    setFormCity('');
    setFormState('Karnataka');
    setFormInCharge('');
    setFormInChargePhone('+91 ');
    setFormStatus('active');
    setIsAddOpen(true);
  };

  // Handle open Edit
  const handleOpenEdit = (site: SiteRecord) => {
    setEditingSite(site);
    setFormName(site.name || '');
    setFormCode(site.code || '');
    setFormProjectId(site.projectId || projects[0]?.id || '');
    setFormAddress(site.address || '');
    setFormCity(site.city || '');
    setFormState(site.state || 'Karnataka');
    setFormInCharge(site.inCharge || '');
    setFormInChargePhone(site.inChargePhone || '+91 ');
    setFormStatus(site.status || 'active');
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (newSite: Partial<SiteRecord>) =>
      dataClient.create('sites', newSite as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsAddOpen(false);
      toast.success('Site location added successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create site');
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SiteRecord> }) =>
      dataClient.update('sites', id, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setEditingSite(null);
      toast.success('Site updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update site');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataClient.delete('sites', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setDeletingSite(null);
      toast.success('Site deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete site');
    },
  });

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Site name is required');
      return;
    }
    if (!formProjectId) {
      toast.error('Select a linked project');
      return;
    }

    createMutation.mutate({
      name: formName.trim(),
      code: formCode.trim().toUpperCase() || `SIT-${Date.now().toString().slice(-4)}`,
      projectId: formProjectId,
      address: formAddress.trim(),
      city: formCity.trim(),
      state: formState.trim(),
      inCharge: formInCharge.trim(),
      inChargePhone: formInChargePhone.trim(),
      status: formStatus,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite?.id) return;
    if (!formName.trim()) {
      toast.error('Site name is required');
      return;
    }
    if (!formProjectId) {
      toast.error('Select a linked project');
      return;
    }

    editMutation.mutate({
      id: editingSite.id,
      data: {
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        projectId: formProjectId,
        address: formAddress.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        inCharge: formInCharge.trim(),
        inChargePhone: formInChargePhone.trim(),
        status: formStatus,
      },
    });
  };

  // Filtered Sites
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchSearch =
        !search ||
        (site.name && site.name.toLowerCase().includes(search.toLowerCase())) ||
        (site.code && site.code.toLowerCase().includes(search.toLowerCase())) ||
        (site.address && site.address.toLowerCase().includes(search.toLowerCase())) ||
        (site.city && site.city.toLowerCase().includes(search.toLowerCase())) ||
        (site.inCharge && site.inCharge.toLowerCase().includes(search.toLowerCase()));

      const matchProject =
        projectFilter === 'all' || site.projectId === projectFilter;

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && site.status === 'active') ||
        (statusFilter === 'completed' && site.status === 'completed') ||
        (statusFilter === 'inactive' && site.status !== 'active' && site.status !== 'completed');

      return matchSearch && matchProject && matchStatus;
    });
  }, [sites, search, projectFilter, statusFilter]);

  // Export CSV
  const handleExportCsv = () => {
    const keys = ['Code', 'Site Name', 'Project', 'In-Charge', 'Phone', 'Address', 'City', 'State', 'Status'];
    const rows = filteredSites.map((s) => {
      const proj = projectMap.get(s.projectId || '');
      return [
        s.code || '',
        s.name || '',
        proj?.name || '',
        s.inCharge || '',
        s.inChargePhone || '',
        s.address || '',
        s.city || '',
        s.state || '',
        s.status || 'active',
      ];
    });

    const escape = (v: any) => `"${String(v).replaceAll('"', '""')}"`;
    const csvContent = [
      keys.map(escape).join(','),
      ...rows.map((r) => r.map(escape).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sites_List_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Sites exported to CSV');
  };

  // Columns definition
  const columns = useMemo<ColumnDef<SiteRecord>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Site & Code',
        cell: ({ row }) => {
          const s = row.original;
          const storeCount = siteStoreCountMap.get(s.id || '') || 0;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <MapPin size={20} weight="duotone" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <span>{s.name}</span>
                  {storeCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                      <Warehouse size={12} weight="bold" />
                      {storeCount} {storeCount === 1 ? 'store' : 'stores'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  {s.code || 'NO-CODE'}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'projectId',
        header: 'Linked Project',
        cell: ({ row }) => {
          const proj = projectMap.get(row.original.projectId || '');
          if (!proj) {
            return <span className="text-slate-400 text-xs italic">Unassigned</span>;
          }
          return (
            <div>
              <div className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                <Buildings size={14} className="text-slate-400 shrink-0" />
                <span>{proj.name}</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Client: {proj.clientName || 'Direct'}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'address',
        header: 'Location / City',
        cell: ({ row }) => {
          const s = row.original;
          const location = [s.address, s.city, s.state].filter(Boolean).join(', ');
          return (
            <div className="max-w-xs truncate text-sm text-slate-600" title={location}>
              {location || <span className="text-slate-400 italic">No address provided</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'inCharge',
        header: 'Site Engineer / In-Charge',
        cell: ({ row }) => {
          const s = row.original;
          if (!s.inCharge) {
            return <span className="text-slate-400 text-xs italic">Not Assigned</span>;
          }
          return (
            <div>
              <div className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                <User size={14} className="text-slate-400" />
                <span>{s.inCharge}</span>
              </div>
              {s.inChargePhone && (
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  {s.inChargePhone}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.status || 'active';
          if (st === 'active') {
            return <Badge tone="success">Active Site</Badge>;
          }
          if (st === 'completed') {
            return <Badge tone="neutral">Handed Over</Badge>;
          }
          return <Badge tone="warning">On Hold</Badge>;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                onClick={() => setViewingSite(s)}
                title="View Site Details"
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => handleOpenEdit(s)}
                title="Edit Site"
              >
                <PencilSimple size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                onClick={() => setDeletingSite(s)}
                title="Delete Site"
              >
                <Trash size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    [projectMap, siteStoreCountMap]
  );

  // Summary Metrics
  const activeCount = sites.filter((s) => s.status === 'active' || !s.status).length;
  const completedCount = sites.filter((s) => s.status === 'completed').length;
  const totalStores = stores.length;

  return (
    <div className="module-page-container space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Sites & Construction Locations"
        eyebrow="ORGANISATION"
        description="Physical site execution points, project allocations, site engineer in-charges, and linked store hubs."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <DownloadSimple size={16} className="mr-1.5" />
              Export CSV
            </Button>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus size={16} className="mr-1.5" />
              New Site
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sites', value: sitesLoading ? '—' : sites.length, sub: 'All registered job sites', icon: MapPin, color: '#3b82f6' },
          { label: 'Active Operations', value: sitesLoading ? '—' : activeCount, sub: 'Live work execution ongoing', icon: CheckCircle, color: '#10b981' },
          { label: 'Active Projects', value: projects.length, sub: 'Linked commercial contracts', icon: Briefcase, color: '#6366f1' },
          { label: 'Site Stores', value: totalStores, sub: 'Material receipt & issue points', icon: Warehouse, color: '#f59e0b' },
        ].map((s, idx) => {
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
        searchPlaceholder="Search by site name, code, address, or in-charge..."
        filters={[
          {
            id: 'project',
            label: 'Linked project',
            value: projectFilter,
            onChange: setProjectFilter,
            allLabel: 'All Projects',
            options: projects.map((p) => ({
              value: p.id || '',
              label: p.name || 'Unnamed Project',
            })),
          },
          {
            id: 'status',
            label: 'Site status',
            value: statusFilter,
            onChange: setStatusFilter,
            allLabel: 'All Statuses',
            options: [
              { value: 'active', label: 'Active Sites' },
              { value: 'completed', label: 'Handed Over' },
              { value: 'inactive', label: 'On Hold' },
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setProjectFilter('all');
          setStatusFilter('all');
        }}
      />

      {/* Main Table */}
      {sitesLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
          <Empty
            title="No sites found"
            description={
              search || projectFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or active filters.'
                : 'Create your first construction site location to start allocating stores and tracking work.'
            }
          >
            <div className="mt-4">
              <Button size="sm" onClick={handleOpenAdd}>
                <Plus size={16} className="mr-1.5" />
                Add New Site
              </Button>
            </div>
          </Empty>
        </div>
      ) : (
        <DataTable
          data={filteredSites}
          columns={columns}
          pageSize={10}
          totalCount={filteredSites.length}
          hideToolbar
        />
      )}

      {/* Modal: Add Site */}
      {isAddOpen && (
        <Modal
          title="Create Construction Site Location"
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
        >
          <form onSubmit={handleSaveAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Site Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whitefield · Tower A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Site Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SIT-001"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Linked Project <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="" disabled>
                    Select Project
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code || 'PRJ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Operating Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="active">Active Site</option>
                  <option value="completed">Handed Over / Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Site Address
              </label>
              <textarea
                rows={2}
                placeholder="Physical plot or street address of the construction site..."
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Site Engineer / In-Charge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar (Site In-Charge)"
                  value={formInCharge}
                  onChange={(e) => setFormInCharge(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formInChargePhone}
                  onChange={(e) => setFormInChargePhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Create Site'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Edit Site */}
      {editingSite && (
        <Modal
          title={`Edit Site · ${editingSite.name}`}
          open={Boolean(editingSite)}
          onClose={() => setEditingSite(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Site Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Site Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Linked Project <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code || 'PRJ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Operating Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="active">Active Site</option>
                  <option value="completed">Handed Over / Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Site Address
              </label>
              <textarea
                rows={2}
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formState}
                  onChange={(e) => setFormState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Site Engineer / In-Charge
                </label>
                <input
                  type="text"
                  value={formInCharge}
                  onChange={(e) => setFormInCharge(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formInChargePhone}
                  onChange={(e) => setFormInChargePhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSite(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending ? 'Updating...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: View Site */}
      {viewingSite && (
        <Modal
          title={`Site Details · ${viewingSite.name}`}
          open={Boolean(viewingSite)}
          onClose={() => setViewingSite(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin size={24} weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-base">
                  {viewingSite.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {viewingSite.code || 'NO-CODE'}
                  </span>
                  <Badge tone={viewingSite.status === 'completed' ? 'neutral' : 'success'}>
                    {viewingSite.status === 'completed' ? 'Handed Over' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-500 block">Linked Project</span>
                <span className="font-medium text-slate-800 mt-1 block">
                  {projectMap.get(viewingSite.projectId || '')?.name || 'Unassigned'}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Client: {projectMap.get(viewingSite.projectId || '')?.clientName || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-500 block">Site In-Charge</span>
                <span className="font-medium text-slate-800 mt-1 block">
                  {viewingSite.inCharge || 'Not Assigned'}
                </span>
                <span className="text-xs font-mono text-slate-500 mt-0.5 block">
                  {viewingSite.inChargePhone || 'No Phone'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-sm">
              <span className="text-xs text-slate-500 block">Site Location / Address</span>
              <p className="font-medium text-slate-800 mt-1">
                {[viewingSite.address, viewingSite.city, viewingSite.state]
                  .filter(Boolean)
                  .join(', ') || 'No physical address specified'}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Linked Stores</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {siteStoreCountMap.get(viewingSite.id || '') || 0} Stores Registered
                </span>
              </div>
              <Warehouse size={28} className="text-slate-400" weight="duotone" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setViewingSite(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const s = viewingSite;
                  setViewingSite(null);
                  handleOpenEdit(s);
                }}
              >
                <PencilSimple size={16} className="mr-1.5" />
                Edit Site
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingSite && (
        <Modal
          title="Delete Construction Site"
          open={Boolean(deletingSite)}
          onClose={() => setDeletingSite(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">{deletingSite.name}</strong> (
              <span className="font-mono text-xs">{deletingSite.code}</span>)?
            </p>
            {(siteStoreCountMap.get(deletingSite.id || '') || 0) > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <strong>Warning:</strong> This site has{' '}
                {siteStoreCountMap.get(deletingSite.id || '')} linked material stores.
                Deleting the site will leave those stores without a physical location.
              </div>
            )}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setDeletingSite(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (deletingSite.id) {
                    deleteMutation.mutate(deletingSite.id);
                  }
                }}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
