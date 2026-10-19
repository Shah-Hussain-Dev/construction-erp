'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  Truck,
  Wrench,
  Gauge,
  MapPin,
  PencilSimple,
  Trash,
  Eye,
  MagnifyingGlass,
  CheckCircle,
  WarningCircle,
  CurrencyInr,
  User,
  Phone,
  Calendar,
  Lightning,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr } from '@/lib/format';
import type { RecordData } from '@/schemas';

interface EquipmentRecord extends RecordData {
  name?: string;
  code?: string;
  category?: string;
  makeModel?: string;
  regNumber?: string;
  serialNumber?: string;
  siteId?: string;
  operator?: string;
  operatorPhone?: string;
  meterReading?: number;
  meterUnit?: string;
  dailyRate?: number;
  nextService?: string;
  status?: string;
  notes?: string;
}

interface SiteRecord extends RecordData {
  name?: string;
  code?: string;
}

const CATEGORIES = [
  'Heavy Earthmoving',
  'Lifting & Cranes',
  'Concreting',
  'Power & Generation',
  'Compaction & Paving',
  'Survey & Testing',
];

const OPERATIONAL_STATUSES = [
  { value: 'operational', label: 'Operational' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'breakdown', label: 'Breakdown' },
  { value: 'standby', label: 'Standby / Idle' },
];

export function EquipmentPage() {
  const queryClient = useQueryClient();

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentRecord | null>(null);
  const [viewingEquipment, setViewingEquipment] = useState<EquipmentRecord | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<EquipmentRecord | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formMakeModel, setFormMakeModel] = useState('');
  const [formRegNumber, setFormRegNumber] = useState('');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formSiteId, setFormSiteId] = useState('');
  const [formOperator, setFormOperator] = useState('');
  const [formOperatorPhone, setFormOperatorPhone] = useState('+91 ');
  const [formMeterReading, setFormMeterReading] = useState<number>(0);
  const [formMeterUnit, setFormMeterUnit] = useState('Hours');
  const [formDailyRate, setFormDailyRate] = useState<number>(0);
  const [formNextService, setFormNextService] = useState('');
  const [formStatus, setFormStatus] = useState('operational');
  const [formNotes, setFormNotes] = useState('');

  // Queries
  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => dataClient.list('equipment') as Promise<EquipmentRecord[]>,
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => dataClient.list('sites') as Promise<SiteRecord[]>,
  });

  const siteMap = useMemo(() => {
    const map = new Map<string, SiteRecord>();
    sites.forEach((s) => s.id && map.set(s.id, s));
    return map;
  }, [sites]);

  // Open modal for Create
  const handleOpenAdd = () => {
    setFormName('');
    setFormCode(`EQP-${String(equipment.length + 1).padStart(3, '0')}`);
    setFormCategory(CATEGORIES[0]);
    setFormMakeModel('');
    setFormRegNumber('');
    setFormSerialNumber('');
    setFormSiteId(sites[0]?.id || '');
    setFormOperator('');
    setFormOperatorPhone('+91 ');
    setFormMeterReading(0);
    setFormMeterUnit('Hours');
    setFormDailyRate(10000);
    setFormNextService(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setFormStatus('operational');
    setFormNotes('');
    setIsAddOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: EquipmentRecord) => {
    setEditingEquipment(item);
    setFormName(item.name || '');
    setFormCode(item.code || '');
    setFormCategory(item.category || CATEGORIES[0]);
    setFormMakeModel(item.makeModel || '');
    setFormRegNumber(item.regNumber || '');
    setFormSerialNumber(item.serialNumber || '');
    setFormSiteId(item.siteId || sites[0]?.id || '');
    setFormOperator(item.operator || '');
    setFormOperatorPhone(item.operatorPhone || '+91 ');
    setFormMeterReading(item.meterReading || 0);
    setFormMeterUnit(item.meterUnit || 'Hours');
    setFormDailyRate(item.dailyRate || 0);
    setFormNextService(item.nextService || '');
    setFormStatus(item.status || 'operational');
    setFormNotes(item.notes || '');
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: Record<string, unknown> }) => {
      return dataClient.save('equipment', payload.data, payload.id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success(vars.id ? 'Equipment updated successfully' : 'Equipment added to fleet');
      setIsAddOpen(false);
      setEditingEquipment(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save equipment');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return dataClient.delete('equipment', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment removed from fleet');
      setDeletingEquipment(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete equipment');
    },
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Equipment name is required');
      return;
    }
    if (!formCode.trim()) {
      toast.error('Equipment code is required');
      return;
    }

    const payload = {
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      category: formCategory,
      makeModel: formMakeModel.trim(),
      regNumber: formRegNumber.trim().toUpperCase(),
      serialNumber: formSerialNumber.trim().toUpperCase(),
      siteId: formSiteId,
      operator: formOperator.trim(),
      operatorPhone: formOperatorPhone.trim(),
      meterReading: Number(formMeterReading) || 0,
      meterUnit: formMeterUnit,
      dailyRate: Number(formDailyRate) || 0,
      nextService: formNextService,
      status: formStatus,
      notes: formNotes.trim(),
    };

    saveMutation.mutate({
      id: editingEquipment?.id,
      data: payload,
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!equipment.length) return;
    const headers = ['Asset Code', 'Equipment Name', 'Category', 'Make & Model', 'Registration No', 'Assigned Site', 'Operator', 'Meter Reading', 'Daily Rate (INR)', 'Status', 'Next Service'];
    const rows = equipment.map((eq) => {
      const siteName = siteMap.get(eq.siteId || '')?.name || '—';
      return [
        `"${eq.code || ''}"`,
        `"${eq.name || ''}"`,
        `"${eq.category || ''}"`,
        `"${eq.makeModel || ''}"`,
        `"${eq.regNumber || ''}"`,
        `"${siteName}"`,
        `"${eq.operator || ''}"`,
        `"${eq.meterReading || 0} ${eq.meterUnit || 'Hours'}"`,
        eq.dailyRate || 0,
        `"${eq.status || 'operational'}"`,
        `"${eq.nextService || ''}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERP-Equipment-Fleet-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Equipment fleet exported to CSV');
  };

  // KPI Stats
  const stats = useMemo(() => {
    const total = equipment.length;
    const operational = equipment.filter((e) => e.status === 'operational').length;
    const maintenance = equipment.filter((e) => ['maintenance', 'breakdown'].includes(e.status || '')).length;
    const totalDailyVal = equipment.reduce((sum, e) => sum + (Number(e.dailyRate) || 0), 0);
    return [
      { label: 'Fleet Assets', value: total, sub: 'Total plant & machinery', icon: Truck, color: '#3b82f6' },
      { label: 'Operational Units', value: operational, sub: 'Active site deployment', icon: CheckCircle, color: '#10b981' },
      { label: 'Service & Downtime', value: maintenance, sub: 'Under maintenance / repair', icon: Wrench, color: '#f59e0b' },
      { label: 'Daily Deployment Value', value: inr(totalDailyVal), sub: 'Internal hiring rate', icon: CurrencyInr, color: '#8b5cf6' },
    ];
  }, [equipment]);

  // Status Badge Helper
  const renderStatusBadge = (status?: string) => {
    const st = status || 'operational';
    let color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let label = 'Operational';
    if (st === 'maintenance') {
      color = 'bg-amber-50 text-amber-700 border-amber-200';
      label = 'In Maintenance';
    } else if (st === 'breakdown') {
      color = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      label = 'Breakdown';
    } else if (st === 'standby') {
      color = 'bg-sky-50 text-sky-700 border-sky-200';
      label = 'Standby';
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${color}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {label}
      </span>
    );
  };

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const site = siteMap.get(eq.siteId || '');
      const matchesSearch =
        !search ||
        (eq.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (eq.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (eq.makeModel || '').toLowerCase().includes(search.toLowerCase()) ||
        (eq.regNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (eq.operator || '').toLowerCase().includes(search.toLowerCase()) ||
        (eq.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (site?.name || '').toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || eq.category === categoryFilter;
      const matchesSite = siteFilter === 'all' || eq.siteId === siteFilter;
      const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;

      return matchesSearch && matchesCategory && matchesSite && matchesStatus;
    });
  }, [equipment, search, categoryFilter, siteFilter, statusFilter, siteMap]);

  // Columns definition
  const columns = useMemo<ColumnDef<EquipmentRecord, unknown>[]>(
    () => [
      {
        id: 'code',
        header: 'Asset Code',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {row.original.code || '—'}
          </span>
        ),
      },
      {
        id: 'name',
        header: 'Equipment Name & Specs',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">{row.original.name || 'Unnamed Machine'}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {row.original.makeModel || '—'} {row.original.regNumber && `· ${row.original.regNumber}`}
            </div>
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
            {row.original.category || 'General'}
          </span>
        ),
      },
      {
        id: 'site',
        header: 'Deployed Site',
        meta: { align: 'left' },
        cell: ({ row }) => {
          const site = siteMap.get(row.original.siteId || '');
          return (
            <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              {site?.name || 'Central Yard'}
            </span>
          );
        },
      },
      {
        id: 'operator',
        header: 'In-Charge / Operator',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div className="text-xs">
            <div className="font-medium text-slate-800">{row.original.operator || 'Unassigned'}</div>
            {row.original.operatorPhone && (
              <div className="text-[10px] text-slate-400 font-mono">{row.original.operatorPhone}</div>
            )}
          </div>
        ),
      },
      {
        id: 'meter',
        header: 'Meter Reading',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-800">
            {row.original.meterReading?.toLocaleString('en-IN') || 0}{' '}
            <span className="text-[10px] text-slate-400">{row.original.meterUnit || 'Hrs'}</span>
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        meta: { align: 'center' },
        cell: ({ row }) => renderStatusBadge(row.original.status),
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
              title="View equipment details"
              onClick={() => setViewingEquipment(row.original)}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
              title="Edit equipment details"
              onClick={() => handleOpenEdit(row.original)}
            >
              <PencilSimple size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
              title="Delete equipment"
              onClick={() => setDeletingEquipment(row.original)}
            >
              <Trash size={16} />
            </button>
          </div>
        ),
      },
    ],
    [siteMap],
  );

  return (
    <div className="module-page-container space-y-6">
      <PageHeader
        title="Plant & Machinery"
        description="Comprehensive management of construction equipment, cranes, earthmoving machines, concrete batching plants, and site machinery fleet."
        eyebrow="Operations Master"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!equipment.length}>
              <DownloadSimple size={16} />
              <span>Export CSV</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleOpenAdd}>
              <Plus size={16} weight="bold" />
              <span>Add Equipment</span>
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
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search machinery by name, code, model, reg no, operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Site Filter */}
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Sites</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Operational Statuses</option>
              {OPERATIONAL_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>

            {(search || categoryFilter !== 'all' || siteFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('all');
                  setSiteFilter('all');
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
        ) : filteredEquipment.length === 0 ? (
          <Empty
            title="No equipment found"
            description={search ? 'No machinery matches your filter criteria.' : 'Add your first plant asset to monitor deployment and meter logs.'}
          >
            <Button variant="default" size="sm" onClick={handleOpenAdd} className="mt-4">
              <Plus size={16} />
              Add Equipment
            </Button>
          </Empty>
        ) : (
          <DataTable
            columns={columns}
            data={filteredEquipment}
            caption="Plant & Machinery Fleet"
            pageSize={10}
          />
        )}
      </div>

      {/* Add / Edit Equipment Modal */}
      <Modal
        open={isAddOpen || editingEquipment !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingEquipment(null);
          }
        }}
        title={editingEquipment ? 'Edit Equipment Details' : 'Register New Equipment Asset'}
        description="Enter machinery specifications, serial/chassis number, deployment site, and maintenance intervals."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Asset Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. EQP-EXC-01"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Machinery Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Equipment / Machine Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. JCB 3DX Super Backhoe Loader"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Make & Model
              </label>
              <input
                type="text"
                placeholder="e.g. JCB 3DX Super (2024)"
                value={formMakeModel}
                onChange={(e) => setFormMakeModel(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration / Chassis Number
              </label>
              <input
                type="text"
                placeholder="e.g. KA-04-ME-4412"
                value={formRegNumber}
                onChange={(e) => setFormRegNumber(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Site *
              </label>
              <select
                required
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
                Operational Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {OPERATIONAL_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Operator / Driver
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Yadav"
                value={formOperator}
                onChange={(e) => setFormOperator(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operator Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98451 22331"
                value={formOperatorPhone}
                onChange={(e) => setFormOperatorPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meter Reading
              </label>
              <input
                type="number"
                min="0"
                value={formMeterReading}
                onChange={(e) => setFormMeterReading(Number(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meter Unit
              </label>
              <select
                value={formMeterUnit}
                onChange={(e) => setFormMeterUnit(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Hours">Hours (HM)</option>
                <option value="KM">Kilometers (KM)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Rate (INR)
              </label>
              <input
                type="number"
                min="0"
                placeholder="14000"
                value={formDailyRate}
                onChange={(e) => setFormDailyRate(Number(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Scheduled Maintenance Service Date
            </label>
            <input
              type="date"
              value={formNextService}
              onChange={(e) => setFormNextService(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Operational Notes & Maintenance History
            </label>
            <textarea
              rows={2}
              placeholder="Note active working location, hydraulic condition, fuel consumption notes..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="dialog-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingEquipment(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingEquipment ? 'Save Changes' : 'Register Equipment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Equipment Details Modal */}
      <Modal
        open={viewingEquipment !== null}
        onOpenChange={(open) => !open && setViewingEquipment(null)}
        title={viewingEquipment?.name || 'Equipment Specifications'}
        description={`Asset Tag: ${viewingEquipment?.code || '—'} · Category: ${viewingEquipment?.category || 'General'}`}
      >
        {viewingEquipment && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 text-sm">{viewingEquipment.name}</span>
                {renderStatusBadge(viewingEquipment.status)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {viewingEquipment.notes || 'No specific operational notes recorded.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Make & Model</span>
                <span className="font-semibold text-slate-900">{viewingEquipment.makeModel || '—'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Registration No.</span>
                <span className="font-mono font-semibold text-slate-900">{viewingEquipment.regNumber || '—'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Assigned Site</span>
                <span className="font-medium text-slate-800 inline-flex items-center gap-1">
                  <MapPin size={13} className="text-rose-500" />
                  {siteMap.get(viewingEquipment.siteId || '')?.name || 'Central Yard'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Current Meter</span>
                <span className="font-mono font-bold text-slate-900">
                  {viewingEquipment.meterReading?.toLocaleString('en-IN') || 0} {viewingEquipment.meterUnit || 'Hours'}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">In-Charge / Operator</span>
                <span className="font-medium text-slate-800">{viewingEquipment.operator || 'Unassigned'}</span>
                {viewingEquipment.operatorPhone && (
                  <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                    {viewingEquipment.operatorPhone}
                  </span>
                )}
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Daily Rental Value</span>
                <span className="font-mono font-bold text-emerald-700">
                  {inr(viewingEquipment.dailyRate || 0)} / day
                </span>
              </div>
            </div>

            {viewingEquipment.nextService && (
              <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                <span>Next Scheduled Maintenance:</span>
                <span className="font-semibold font-mono">{viewingEquipment.nextService}</span>
              </div>
            )}

            <div className="dialog-actions">
              <Button variant="default" onClick={() => setViewingEquipment(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deletingEquipment !== null}
        onOpenChange={(open) => !open && setDeletingEquipment(null)}
        title="Confirm Equipment Asset Deletion"
        description="Are you sure you want to remove this equipment from the system? Deployment history will be archived."
      >
        {deletingEquipment && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <p>
                You are about to delete <strong>{deletingEquipment.name}</strong> ({deletingEquipment.code}).
                This machinery record will be purged from the active fleet database.
              </p>
            </div>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setDeletingEquipment(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingEquipment.id && deleteMutation.mutate(deletingEquipment.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Equipment'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
