'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  DownloadSimple,
  User,
  Buildings,
  Phone,
  EnvelopeSimple,
  PencilSimple,
  Trash,
  Eye,
  MagnifyingGlass,
  CheckCircle,
  CurrencyInr,
  FileText,
  MapPin,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dataClient } from '@/lib/api';
import { PageHeader } from '../../shell';
import { DataTable } from '../../ui/data-table';
import { Badge, Modal, Empty, Skeleton } from '../../ui/primitives';
import { Button } from '../../ui/button';
import { inr } from '@/lib/format';
import type { RecordData } from '@/schemas';

interface ClientRecord extends RecordData {
  name?: string;
  code?: string;
  contact?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  contractValueInr?: number;
  activeSites?: string;
  status?: string;
}

export function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [viewingClient, setViewingClient] = useState<ClientRecord | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientRecord | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formGstin, setFormGstin] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formContractValue, setFormContractValue] = useState<number>(0);
  const [formActiveSites, setFormActiveSites] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  // Load clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => dataClient.list('clients') as Promise<ClientRecord[]>,
  });

  // Open modal for Create
  const handleOpenAdd = () => {
    setFormName('');
    setFormCode(`CLI-${String(clients.length + 1).padStart(3, '0')}`);
    setFormContact('');
    setFormEmail('');
    setFormPhone('+91 ');
    setFormGstin('');
    setFormAddress('');
    setFormContractValue(0);
    setFormActiveSites('');
    setFormStatus('active');
    setIsAddOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (client: ClientRecord) => {
    setEditingClient(client);
    setFormName(client.name || '');
    setFormCode(client.code || '');
    setFormContact(client.contact || '');
    setFormEmail(client.email || '');
    setFormPhone(client.phone || '+91 ');
    setFormGstin(client.gstin || '');
    setFormAddress(client.address || '');
    setFormContractValue(client.contractValueInr || 0);
    setFormActiveSites(client.activeSites || '');
    setFormStatus(client.status || 'active');
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: { id?: string; data: Record<string, unknown> }) => {
      return dataClient.save('clients', payload.data, payload.id);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(vars.id ? 'Client updated successfully' : 'Client registered successfully');
      setIsAddOpen(false);
      setEditingClient(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save client');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return dataClient.delete('clients', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client removed');
      setDeletingClient(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete client');
    },
  });

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Client company name is required');
      return;
    }
    if (!formCode.trim()) {
      toast.error('Client code is required');
      return;
    }

    const payload = {
      name: formName.trim(),
      code: formCode.trim().toUpperCase(),
      contact: formContact.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      gstin: formGstin.trim().toUpperCase(),
      address: formAddress.trim(),
      contractValueInr: Number(formContractValue) || 0,
      activeSites: formActiveSites.trim(),
      status: formStatus,
    };

    saveMutation.mutate({
      id: editingClient?.id,
      data: payload,
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    if (!clients.length) return;
    const headers = ['Client Code', 'Company Name', 'Contact Person', 'Email', 'Phone', 'GSTIN', 'Contract Value (INR)', 'Active Sites', 'Status'];
    const rows = clients.map((c) => [
      `"${c.code || ''}"`,
      `"${c.name || ''}"`,
      `"${c.contact || ''}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.gstin || ''}"`,
      c.contractValueInr || 0,
      `"${c.activeSites || ''}"`,
      `"${c.status || 'active'}"`,
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ERP-Clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Clients exported to CSV');
  };

  // KPI Stats
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === 'active').length;
    const totalContractValue = clients.reduce((sum, c) => sum + (Number(c.contractValueInr) || 0), 0);
    return [
      { label: 'Total Clients', value: total, sub: 'Developer & enterprise accounts', icon: User, color: '#3b82f6' },
      { label: 'Active Contracts', value: active, sub: 'Operational project ties', icon: CheckCircle, color: '#10b981' },
      { label: 'Total Contract Value', value: inr(totalContractValue), sub: 'Cumulative order pipeline', icon: CurrencyInr, color: '#8b5cf6' },
      { label: 'GST Compliant', value: `${clients.filter((c) => !!c.gstin).length}/${total}`, sub: 'Verified legal entities', icon: FileText, color: '#06b6d4' },
    ];
  }, [clients]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        !search ||
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.contact || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.gstin || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.activeSites || '').toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || (c.status || 'active') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  // Columns definition
  const columns = useMemo<ColumnDef<ClientRecord, unknown>[]>(
    () => [
      {
        id: 'code',
        header: 'Client Code',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            {row.original.code || '—'}
          </span>
        ),
      },
      {
        id: 'name',
        header: 'Client / Company Name',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div>
            <div className="font-semibold text-slate-900">{row.original.name || 'Unnamed Client'}</div>
            {row.original.gstin && (
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                GSTIN: {row.original.gstin}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contact Person & Info',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <div className="text-xs space-y-0.5">
            <div className="font-medium text-slate-800">{row.original.contact || '—'}</div>
            <div className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
              <EnvelopeSimple size={12} className="text-slate-400" />
              {row.original.email || '—'}
            </div>
            {row.original.phone && (
              <div className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
                <Phone size={12} className="text-slate-400" />
                {row.original.phone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'contractValue',
        header: 'Contract Value',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-semibold text-slate-800">
            {inr(row.original.contractValueInr || 0)}
          </span>
        ),
      },
      {
        id: 'activeSites',
        header: 'Active Sites',
        meta: { align: 'left' },
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 inline-flex items-center gap-1">
            <MapPin size={12} className="text-rose-500 shrink-0" />
            {row.original.activeSites || 'All Sites'}
          </span>
        ),
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
              title="View client details"
              onClick={() => setViewingClient(row.original)}
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
              title="Edit client"
              onClick={() => handleOpenEdit(row.original)}
            >
              <PencilSimple size={16} />
            </button>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
              title="Delete client"
              onClick={() => setDeletingClient(row.original)}
            >
              <Trash size={16} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="module-page-container space-y-6">
      <PageHeader
        title="Clients"
        description="Manage project clients, real estate developer accounts, legal contracts, and statutory billing details."
        eyebrow="Organization Master"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={!clients.length}>
              <DownloadSimple size={16} />
              <span>Export CSV</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleOpenAdd}>
              <Plus size={16} weight="bold" />
              <span>Add Client</span>
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
              placeholder="Search clients by company name, code, contact, GSTIN..."
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
        ) : filteredClients.length === 0 ? (
          <Empty
            title="No clients found"
            description={search ? 'No client accounts match your current search.' : 'Add your first enterprise client contract to get started.'}
          >
            <Button variant="default" size="sm" onClick={handleOpenAdd} className="mt-4">
              <Plus size={16} />
              Add Client
            </Button>
          </Empty>
        ) : (
          <DataTable
            columns={columns}
            data={filteredClients}
            caption="Enterprise Clients Master"
            pageSize={10}
          />
        )}
      </div>

      {/* Add / Edit Client Modal */}
      <Modal
        open={isAddOpen || editingClient !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingClient(null);
          }
        }}
        title={editingClient ? 'Edit Client Account' : 'Register New Enterprise Client'}
        description="Enter corporate details, GSTIN identification, contract value, and contact person credentials."
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CLI-001"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                placeholder="29AABCV1234F1Z5"
                value={formGstin}
                onChange={(e) => setFormGstin(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client / Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Urban Developers Ltd"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Mehra"
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="vikram@apexurban.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98201 44552"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contract Value (INR)
              </label>
              <input
                type="number"
                min="0"
                placeholder="186500000"
                value={formContractValue}
                onChange={(e) => setFormContractValue(Number(e.target.value))}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Active Sites
              </label>
              <input
                type="text"
                placeholder="e.g. Green Valley, City Mall"
                value={formActiveSites}
                onChange={(e) => setFormActiveSites(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Corporate Address
            </label>
            <input
              type="text"
              placeholder="e.g. MG Road, Bengaluru, Karnataka"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
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
              <option value="active">Active Client</option>
              <option value="inactive">Inactive / Project Concluded</option>
            </select>
          </div>

          <div className="dialog-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingClient(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingClient ? 'Save Changes' : 'Register Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Client Details Modal */}
      <Modal
        open={viewingClient !== null}
        onOpenChange={(open) => !open && setViewingClient(null)}
        title={viewingClient?.name || 'Client Details'}
        description={`Client Code: ${viewingClient?.code || '—'} · Status: ${viewingClient?.status || 'active'}`}
      >
        {viewingClient && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900 text-sm">{viewingClient.name}</span>
                <Badge status={viewingClient.status || 'active'} />
              </div>
              <p className="text-xs text-slate-500">
                {viewingClient.address || 'No registered corporate address specified.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Contact Person</span>
                <span className="font-medium text-slate-900">{viewingClient.contact || '—'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">GSTIN</span>
                <span className="font-mono font-semibold text-slate-900">{viewingClient.gstin || 'Not Provided'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-mono text-slate-800">{viewingClient.email || '—'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Phone</span>
                <span className="font-mono text-slate-800">{viewingClient.phone || '—'}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Total Contract Value</span>
                <span className="font-mono font-bold text-emerald-700">
                  {inr(viewingClient.contractValueInr || 0)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Active Sites</span>
                <span className="font-medium text-slate-800 inline-flex items-center gap-1">
                  <MapPin size={12} className="text-rose-500" />
                  {viewingClient.activeSites || 'All Sites'}
                </span>
              </div>
            </div>

            <div className="dialog-actions">
              <Button variant="default" onClick={() => setViewingClient(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deletingClient !== null}
        onOpenChange={(open) => !open && setDeletingClient(null)}
        title="Confirm Client Removal"
        description="Are you sure you want to delete this client account? Any linked project contracts will be affected."
      >
        {deletingClient && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <p>
                You are about to delete client <strong>{deletingClient.name}</strong> ({deletingClient.code}).
                This operation is recorded in the system audit log.
              </p>
            </div>
            <div className="dialog-actions">
              <Button variant="outline" onClick={() => setDeletingClient(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deletingClient.id && deleteMutation.mutate(deletingClient.id)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Client'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
