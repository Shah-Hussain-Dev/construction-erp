'use client';

import React from 'react';
import {
  CheckSquare,
  ShieldCheck,
  FloppyDisk,
  ArrowsClockwise,
  Clock,
  Warning,
  Plus,
  Trash,
} from '@phosphor-icons/react';
import type { WorkflowSettings, WorkflowTier } from './types';
import { Button } from '../../ui/button';

interface WorkflowsProps {
  settings: WorkflowSettings;
  onChange: (settings: WorkflowSettings) => void;
  onSave: () => void;
  onReset: () => void;
}

export function WorkflowsSection({ settings, onChange, onSave, onReset }: WorkflowsProps) {
  const update = (patch: Partial<WorkflowSettings>) => {
    onChange({ ...settings, ...patch });
  };

  const handleUpdateTier = (id: string, patch: Partial<WorkflowTier>) => {
    update({
      tiers: settings.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const handleAddTier = () => {
    const newTier: WorkflowTier = {
      id: `tier-${Date.now()}`,
      name: `Custom Approver Tier ${settings.tiers.length + 1}`,
      role: 'Project Manager',
      maxAmount: 1000000,
      description: 'Custom threshold review',
    };
    update({ tiers: [...settings.tiers, newTier] });
  };

  const handleRemoveTier = (id: string) => {
    update({ tiers: settings.tiers.filter((t) => t.id !== id) });
  };

  return (
    <div className="settings-section-stack">
      {/* Top Action Toolbar */}
      <div className="settings-section-head">
        <div>
          <h2 className="settings-section-title">Workflow & Approval Rules</h2>
          <p className="settings-section-subtitle">
            Configure multi-tier approval limits for contractor bills, material requests, and mandatory audit checks.
          </p>
        </div>
        <div className="settings-head-actions">
          <Button variant="outline" size="default" onClick={onReset}>
            <ArrowsClockwise size={16} />
            <span>Reset Defaults</span>
          </Button>
          <Button variant="default" size="default" onClick={onSave}>
            <FloppyDisk size={16} weight="bold" />
            <span>Save Rules</span>
          </Button>
        </div>
      </div>

      <div className="settings-grid-layout">
        {/* Approval Tiers List */}
        <section className="settings-card col-span-2">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <CheckSquare size={20} weight="duotone" />
            </div>
            <div className="flex-1">
              <h3 className="settings-card-title">Approval Hierarchy & Delegation</h3>
              <p className="settings-card-desc">Contractor Running Bills and high-value purchase commitments</p>
            </div>
            <Button variant="outline" className="btn-sm" onClick={handleAddTier}>
              <Plus size={14} weight="bold" />
              <span>Add Approval Tier</span>
            </Button>
          </div>

          <div className="settings-form-body">
            <div className="tiers-list-stack">
              {settings.tiers.map((tier, idx) => (
                <div key={tier.id} className="tier-config-card">
                  <div className="tier-card-head">
                    <span className="tier-step-badge">Tier {idx + 1}</span>
                    <strong className="tier-name-title">{tier.name}</strong>
                    {settings.tiers.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-tier ml-auto"
                        onClick={() => handleRemoveTier(tier.id)}
                        title="Remove tier"
                        aria-label="Remove tier"
                      >
                        <Trash size={15} />
                      </button>
                    )}
                  </div>

                  <div className="form-grid-3">
                    <div className="form-group-field">
                      <label>Designated Role</label>
                      <input
                        type="text"
                        value={tier.role}
                        onChange={(e) => handleUpdateTier(tier.id, { role: e.target.value })}
                        className="settings-input"
                      />
                    </div>

                    <div className="form-group-field">
                      <label>Approval Threshold Limit (INR)</label>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-semibold">₹</span>
                        <input
                          type="number"
                          value={tier.maxAmount}
                          onChange={(e) =>
                            handleUpdateTier(tier.id, { maxAmount: Number(e.target.value) })
                          }
                          className="settings-input font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="form-group-field">
                      <label>Verification Scope</label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) =>
                          handleUpdateTier(tier.id, { description: e.target.value })
                        }
                        className="settings-input text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mandatory Policy & SLA Controls */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <ShieldCheck size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="settings-card-title">Mandatory Audit Prerequisites</h3>
              <p className="settings-card-desc">Hard checks before documents can be submitted</p>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="toggles-list">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.requireMeasurementSheetForBills}
                  onChange={(e) =>
                    update({ requireMeasurementSheetForBills: e.target.checked })
                  }
                />
                <div>
                  <strong>Mandatory Measurement Sheet (MB)</strong>
                  <p>Contractor running bills cannot be submitted without linked MB item entries</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.requireWeighbridgeSlipForGrn}
                  onChange={(e) =>
                    update({ requireWeighbridgeSlipForGrn: e.target.checked })
                  }
                />
                <div>
                  <strong>Weighbridge Slip Photo for Bulk Materials</strong>
                  <p>Cement, Steel &amp; Aggregates inward requires weighbridge slip attachment</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.requirePoForGrn}
                  onChange={(e) => update({ requirePoForGrn: e.target.checked })}
                />
                <div>
                  <strong>Strict PO Match for GRN</strong>
                  <p>Inward receipts must link to an approved Purchase Order</p>
                </div>
              </label>
            </div>

            <div className="form-group-field mt-4">
              <label htmlFor="slaDays">SLA Approval Turnaround Limit</label>
              <div className="flex items-center gap-2">
                <input
                  id="slaDays"
                  type="number"
                  min={1}
                  max={30}
                  value={settings.slaTurnaroundDays}
                  onChange={(e) => update({ slaTurnaroundDays: Number(e.target.value) })}
                  className="settings-input w-24 text-center font-bold"
                />
                <span className="text-slate-600 text-sm">Business Days (Flag overdue after SLA)</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
