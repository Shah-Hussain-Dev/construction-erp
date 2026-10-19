'use client';

import React, { useState } from 'react';
import {
  Receipt,
  FloppyDisk,
  ArrowsClockwise,
  ShieldCheck,
  Truck,
  FileText,
  Percent,
  Coins,
  Scales,
  Plus,
  Trash,
  CheckCircle,
  WarningCircle,
  BuildingOffice,
  Check,
  Info,
} from '@phosphor-icons/react';
import type { GstSettings, TaxSlab, TdsRule, GstRegistration } from './types';
import { Button } from '../../ui/button';

interface GstSettingsProps {
  settings: GstSettings;
  onChange: (settings: GstSettings) => void;
  onSave: () => void;
  onReset: () => void;
}

type GstTab = 'profile' | 'einvoice' | 'slabs' | 'tds' | 'rcm_itc';

export function GstSettingsSection({ settings, onChange, onSave, onReset }: GstSettingsProps) {
  const [activeTab, setActiveTab] = useState<GstTab>('profile');

  const update = (patch: Partial<GstSettings>) => {
    onChange({ ...settings, ...patch });
  };

  // Slabs manipulation
  const handleUpdateSlab = (id: string, patch: Partial<TaxSlab>) => {
    update({
      slabs: settings.slabs.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...patch };
        if (patch.rate !== undefined) {
          updated.igst = patch.rate;
          updated.cgst = Number((patch.rate / 2).toFixed(2));
          updated.sgst = Number((patch.rate / 2).toFixed(2));
        }
        return updated;
      }),
    });
  };

  const handleAddSlab = () => {
    const newSlab: TaxSlab = {
      id: `slab-${Date.now()}`,
      category: 'New Civil / Material Item',
      hsnSac: '9954',
      rate: 18,
      cgst: 9,
      sgst: 9,
      igst: 18,
      description: 'Works contract or construction material rate',
    };
    update({ slabs: [...settings.slabs, newSlab] });
  };

  const handleRemoveSlab = (id: string) => {
    update({ slabs: settings.slabs.filter((s) => s.id !== id) });
  };

  // TDS rules manipulation
  const handleUpdateTds = (id: string, patch: Partial<TdsRule>) => {
    update({
      tdsRules: settings.tdsRules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };

  // State registrations
  const handleAddRegistration = () => {
    const newReg: GstRegistration = {
      id: `reg-${Date.now()}`,
      state: 'New State Office',
      stateCode: '00',
      gstin: `${settings.primaryGstin.slice(2)}`,
      isPrimary: false,
      address: 'Project Site Office, Branch Location',
    };
    update({ registrations: [...settings.registrations, newReg] });
  };

  const handleRemoveRegistration = (id: string) => {
    update({ registrations: settings.registrations.filter((r) => r.id !== id) });
  };

  // Breakdown 15-digit GSTIN
  const gstinValid = settings.primaryGstin.length === 15;
  const gstinState = gstinValid ? settings.primaryGstin.slice(0, 2) : '??';
  const gstinPan = gstinValid ? settings.primaryGstin.slice(2, 12) : '??????????';
  const gstinEntity = gstinValid ? settings.primaryGstin[12] : '?';
  const gstinZ = gstinValid ? settings.primaryGstin[13] : 'Z';
  const gstinCheck = gstinValid ? settings.primaryGstin[14] : '?';

  const gstTabs = [
    {
      id: 'profile' as const,
      label: 'GSTIN & Registrations',
      icon: Receipt,
      count: settings.registrations.length,
    },
    {
      id: 'einvoice' as const,
      label: 'E-Way Bill & E-Invoicing',
      icon: Truck,
    },
    {
      id: 'slabs' as const,
      label: 'HSN & Tax Slabs',
      icon: Percent,
      count: settings.slabs.length,
    },
    {
      id: 'tds' as const,
      label: 'TDS on GST & IT Withholding',
      icon: Coins,
      count: settings.tdsRules.length,
    },
    {
      id: 'rcm_itc' as const,
      label: 'RCM & Blocked Credits',
      icon: Scales,
    },
  ];

  return (
    <div className="settings-section-stack">
      {/* Top Action Toolbar */}
      <div className="settings-section-head">
        <div>
          <span className="settings-eyebrow">STATUTORY COMPLIANCE &amp; TAX ENGINE</span>
          <h2 className="settings-section-title">GST &amp; Statutory Tax Configuration</h2>
          <p className="settings-section-subtitle">
            Configure enterprise GSTIN profiles, E-Way Bill / E-Invoice automation thresholds, works contract HSN tax slabs, and withholding taxes.
          </p>
        </div>
        <div className="settings-head-actions">
          <Button variant="outline" size="default" onClick={onReset}>
            <ArrowsClockwise size={16} />
            <span>Reset Defaults</span>
          </Button>
          <Button variant="default" size="default" onClick={onSave}>
            <FloppyDisk size={16} weight="bold" />
            <span>Save Tax Settings</span>
          </Button>
        </div>
      </div>

      {/* High-End Segmented Sub-Tabs */}
      <div className="gst-subtabs-nav" role="tablist" aria-label="GST Settings Sections">
        {gstTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`gst-subtab-btn ${isActive ? 'is-active' : ''}`}
            >
              <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="gst-tab-count-badge">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: GSTIN & State Registrations */}
      {activeTab === 'profile' && (
        <div className="settings-two-col-grid">
          {/* Card: Primary GSTIN & Tax Identity */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Receipt size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="settings-card-title">Primary GSTIN &amp; Tax Identity</h3>
                  <span className="settings-badge-pill">Head Office</span>
                </div>
                <p className="settings-card-desc">Principal Place of Business registration and central tax profile</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="form-group-field">
                <label htmlFor="primaryGstin">Primary Company GSTIN (15 Digits)</label>
                <input
                  id="primaryGstin"
                  type="text"
                  maxLength={15}
                  value={settings.primaryGstin}
                  onChange={(e) => update({ primaryGstin: e.target.value.toUpperCase() })}
                  className="settings-input font-mono uppercase tracking-wider font-bold text-blue-600"
                  placeholder="09BKZPR3924E2ZH"
                />

                {/* GSTIN Structure Decoder Bar */}
                <div className="gst-decoder-bar">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Decoder:</span>
                  <span className="gst-decoder-tag bg-blue-50 text-blue-700 border border-blue-200">
                    State: {gstinState}
                  </span>
                  <span className="gst-decoder-tag bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PAN: {gstinPan}
                  </span>
                  <span className="gst-decoder-tag bg-purple-50 text-purple-700 border border-purple-200">
                    Entity: {gstinEntity}
                  </span>
                  <span className="gst-decoder-tag bg-amber-50 text-amber-700 border border-amber-200">
                    Z: {gstinZ}
                  </span>
                  <span className="gst-decoder-tag bg-rose-50 text-rose-700 border border-rose-200">
                    Checksum: {gstinCheck}
                  </span>
                  {gstinValid ? (
                    <span className="ml-auto text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle size={13} weight="bold" /> 15-Digit Format Valid
                    </span>
                  ) : (
                    <span className="ml-auto text-[11px] text-amber-600 font-bold flex items-center gap-1">
                      <WarningCircle size={13} weight="bold" /> Incomplete
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="legalTradeName">Legal Trade Name as per GST Certificate</label>
                <input
                  id="legalTradeName"
                  type="text"
                  value={settings.legalTradeName}
                  onChange={(e) => update({ legalTradeName: e.target.value })}
                  className="settings-input font-medium"
                  placeholder="Prince Construction Private Limited"
                />
                <span className="form-field-hint">Must exactly match your GST REG-06 registration document.</span>
              </div>

              <div className="form-grid-state">
                <div className="form-group-field">
                  <label htmlFor="stateOfRegistration">State of Principal Place</label>
                  <input
                    id="stateOfRegistration"
                    type="text"
                    value={settings.stateOfRegistration}
                    onChange={(e) => update({ stateOfRegistration: e.target.value })}
                    className="settings-input"
                    placeholder="Uttar Pradesh"
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="stateCode">State Code</label>
                  <input
                    id="stateCode"
                    type="text"
                    maxLength={2}
                    value={settings.stateCode}
                    onChange={(e) => update({ stateCode: e.target.value })}
                    className="settings-input font-mono text-center font-bold"
                    placeholder="09"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group-field">
                  <label htmlFor="taxpayerType">Taxpayer Category</label>
                  <select
                    id="taxpayerType"
                    value={settings.taxpayerType}
                    onChange={(e) => update({ taxpayerType: e.target.value as any })}
                    className="settings-select"
                  >
                    <option value="regular">Regular Taxpayer (Standard Input Tax Credit)</option>
                    <option value="composition">Composition Scheme</option>
                    <option value="sez_unit">Special Economic Zone (SEZ Developer / Zero-Rated)</option>
                  </select>
                </div>

                <div className="form-group-field">
                  <label htmlFor="filingFrequency">Filing Frequency</label>
                  <select
                    id="filingFrequency"
                    value={settings.filingFrequency}
                    onChange={(e) => update({ filingFrequency: e.target.value as any })}
                    className="settings-select"
                  >
                    <option value="monthly">Monthly Filing (GSTR-1 &amp; GSTR-3B)</option>
                    <option value="quarterly_qrmp">Quarterly Filing (QRMP Scheme)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Card: Interstate Registrations Table */}
          <section className="settings-card">
            <div className="settings-card-head justify-between flex items-center">
              <div className="flex items-center gap-3">
                <div className="settings-card-icon-wrap">
                  <BuildingOffice size={20} weight="duotone" />
                </div>
                <div>
                  <h3 className="settings-card-title">Interstate State Registrations</h3>
                  <p className="settings-card-desc">State GSTINs for regional project offices and branch sites</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="default"
                onClick={handleAddRegistration}
                className="gap-1.5 text-xs py-1 h-8"
              >
                <Plus size={14} weight="bold" />
                <span>Add State GSTIN</span>
              </Button>
            </div>

            <div className="settings-form-body p-0">
              <div className="settings-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                <table className="settings-data-table">
                  <thead>
                    <tr>
                      <th>State &amp; Code</th>
                      <th>GSTIN</th>
                      <th>Site Address</th>
                      <th style={{ textAlign: 'center' }}>Scope</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>
                          <div className="font-bold text-slate-900">{reg.state}</div>
                          <span className="text-[11px] font-mono text-slate-400">Code: {reg.stateCode}</span>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-blue-600 text-xs tracking-wider">
                            {reg.gstin}
                          </span>
                        </td>
                        <td className="text-slate-600 text-xs max-w-xs truncate">
                          {reg.address}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {reg.isPrimary ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10.5px] inline-flex items-center gap-1">
                              <Check size={11} weight="bold" /> Head Office
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-medium text-[10.5px]">
                              Site Office
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {!reg.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRegistration(reg.id)}
                              className="text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition-colors"
                              title="Remove registration"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: E-Way Bill & E-Invoicing */}
      {activeTab === 'einvoice' && (
        <div className="settings-two-col-grid">
          {/* Card: E-Invoicing Parameters */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Truck size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="settings-card-title">E-Invoicing Automation (IRN &amp; QR)</h3>
                  <span className="settings-badge-pill">NIC Mandate</span>
                </div>
                <p className="settings-card-desc">Government portal integration for B2B e-invoices and credit notes</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="toggles-list">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.eInvoicingEnabled}
                    onChange={(e) => update({ eInvoicingEnabled: e.target.checked })}
                  />
                  <div>
                    <strong>Mandatory E-Invoicing (IRN &amp; Signed QR Code)</strong>
                    <p>Auto-generate 64-char IRN hash and signed QR code via GSTN portal on B2B invoices</p>
                  </div>
                </label>
              </div>

              <div className="form-group-field">
                <label htmlFor="eInvoiceTurnoverThreshold">E-Invoice Turnover Mandate Threshold</label>
                <div className="input-with-unit">
                  <input
                    id="eInvoiceTurnoverThreshold"
                    type="number"
                    value={settings.eInvoiceTurnoverThreshold}
                    onChange={(e) => update({ eInvoiceTurnoverThreshold: Number(e.target.value) })}
                    className="settings-input font-mono"
                  />
                  <span className="input-unit-label">₹ (Mandated for turnover &gt; ₹5 Crores)</span>
                </div>
                <span className="form-field-hint">Rule applies if aggregate turnover in any financial year from 2017-18 exceeds ₹5 Cr.</span>
              </div>

              <div className="form-grid-2">
                <div className="form-group-field">
                  <label htmlFor="nicApiUsername">NIC API User ID</label>
                  <input
                    id="nicApiUsername"
                    type="text"
                    value={settings.nicApiUsername}
                    onChange={(e) => update({ nicApiUsername: e.target.value })}
                    className="settings-input font-mono"
                    placeholder="PRINCE_NIC_09"
                  />
                </div>

                <div className="form-group-field">
                  <label htmlFor="nicGspProvider">GSP Integration Partner</label>
                  <select
                    id="nicGspProvider"
                    value={settings.nicGspProvider}
                    onChange={(e) => update({ nicGspProvider: e.target.value as any })}
                    className="settings-select"
                  >
                    <option value="cleartax">ClearTax Enterprise API</option>
                    <option value="reliance_jio">JioGST Gateway</option>
                    <option value="cygnet">Cygnet GSP India</option>
                    <option value="custom_direct">Direct NIC Government API</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Card: E-Way Bill Movement Rules */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Truck size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="settings-card-title">E-Way Bill Movement Controls</h3>
                  <span className="settings-badge-pill">Consignment Thresholds</span>
                </div>
                <p className="settings-card-desc">Dispatch validation rules for inter-site material transfers and outward supply</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="toggles-list">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.eWayBillEnabled}
                    onChange={(e) => update({ eWayBillEnabled: e.target.checked })}
                  />
                  <div>
                    <strong>Auto-Generate E-Way Bills on Material Dispatch</strong>
                    <p>Generate Part-A and Part-B E-Way Bill slips for site transfers and outward civil goods</p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.autoGenerateVehicleSlip}
                    onChange={(e) => update({ autoGenerateVehicleSlip: e.target.checked })}
                  />
                  <div>
                    <strong>Enforce Transporter ID &amp; Vehicle Number</strong>
                    <p>Require vehicle registration number validation before inward GRN creation</p>
                  </div>
                </label>
              </div>

              <div className="form-grid-2">
                <div className="form-group-field">
                  <label htmlFor="intraStateEwayThreshold">Intra-State E-Way Limit</label>
                  <div className="input-with-unit">
                    <input
                      id="intraStateEwayThreshold"
                      type="number"
                      value={settings.intraStateEwayThreshold}
                      onChange={(e) => update({ intraStateEwayThreshold: Number(e.target.value) })}
                      className="settings-input font-mono"
                    />
                    <span className="input-unit-label">₹ Limit</span>
                  </div>
                  <span className="form-field-hint">₹1,00,000 for UP/MH or ₹50,000</span>
                </div>

                <div className="form-group-field">
                  <label htmlFor="interStateEwayThreshold">Inter-State E-Way Limit</label>
                  <div className="input-with-unit">
                    <input
                      id="interStateEwayThreshold"
                      type="number"
                      value={settings.interStateEwayThreshold}
                      onChange={(e) => update({ interStateEwayThreshold: Number(e.target.value) })}
                      className="settings-input font-mono"
                    />
                    <span className="input-unit-label">₹ Limit</span>
                  </div>
                  <span className="form-field-hint">₹50,000 national standard</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: HSN & Tax Slabs */}
      {activeTab === 'slabs' && (
        <section className="settings-card">
          <div className="settings-card-head justify-between flex items-center">
            <div className="flex items-center gap-3">
              <div className="settings-card-icon-wrap">
                <Percent size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="settings-card-title">Construction Materials &amp; Works Contract Tax Slabs</h3>
                <p className="settings-card-desc">Standard HSN/SAC master rates for procurement, subcontractor measurements, and billing</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={handleAddSlab}
              className="gap-1.5 text-xs py-1 h-8"
            >
              <Plus size={14} weight="bold" />
              <span>Add Tax Slab</span>
            </Button>
          </div>

          <div className="settings-form-body p-0">
            <div className="settings-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="settings-data-table">
                <thead>
                  <tr>
                    <th>Category &amp; Item Scope</th>
                    <th>HSN / SAC</th>
                    <th style={{ textAlign: 'center' }}>GST Rate</th>
                    <th style={{ textAlign: 'center' }}>CGST</th>
                    <th style={{ textAlign: 'center' }}>SGST</th>
                    <th style={{ textAlign: 'center' }}>IGST</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.slabs.map((slab) => (
                    <tr key={slab.id}>
                      <td style={{ minWidth: '240px' }}>
                        <input
                          type="text"
                          value={slab.category}
                          onChange={(e) => handleUpdateSlab(slab.id, { category: e.target.value })}
                          className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 w-full focus:outline-none py-0.5"
                        />
                        <input
                          type="text"
                          value={slab.description}
                          onChange={(e) => handleUpdateSlab(slab.id, { description: e.target.value })}
                          className="text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 w-full focus:outline-none py-0.5"
                        />
                      </td>
                      <td style={{ width: '110px' }}>
                        <input
                          type="text"
                          value={slab.hsnSac}
                          onChange={(e) => handleUpdateSlab(slab.id, { hsnSac: e.target.value })}
                          className="font-mono font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 w-20 focus:outline-none"
                        />
                      </td>
                      <td style={{ textAlign: 'center', width: '100px' }}>
                        <select
                          value={slab.rate}
                          onChange={(e) => handleUpdateSlab(slab.id, { rate: Number(e.target.value) })}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded font-mono text-xs border border-blue-200 cursor-pointer"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center', width: '70px' }} className="font-mono text-slate-600 font-semibold">
                        {slab.cgst}%
                      </td>
                      <td style={{ textAlign: 'center', width: '70px' }} className="font-mono text-slate-600 font-semibold">
                        {slab.sgst}%
                      </td>
                      <td style={{ textAlign: 'center', width: '70px' }} className="font-mono font-bold text-blue-600">
                        {slab.igst}%
                      </td>
                      <td style={{ textAlign: 'right', width: '60px' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveSlab(slab.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded hover:bg-rose-50 transition-colors"
                          title="Delete tax slab"
                        >
                          <Trash size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Statutory Note on Works Contracts:</strong> Pure labor contracts for residential construction remain at 12% under HSN 9954. Commercial and industrial civil construction composite works contracts attract 18% GST.
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: TDS on GST & Income Tax Withholding */}
      {activeTab === 'tds' && (
        <div className="settings-two-col-grid">
          {/* Card: Section 51 TDS on GST */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Coins size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="settings-card-title">TDS on GST (Section 51)</h3>
                  <span className="settings-badge-pill">Government Works</span>
                </div>
                <p className="settings-card-desc">Withholding applicable when executing contracts for Govt bodies &amp; PSUs</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="toggles-list">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.tdsOnGstEnabled}
                    onChange={(e) => update({ tdsOnGstEnabled: e.target.checked })}
                  />
                  <div>
                    <strong>Enable Section 51 TDS on GST Deductions</strong>
                    <p>Apply 2% TDS (1% CGST + 1% SGST or 2% IGST) on government contract payments</p>
                  </div>
                </label>
              </div>

              <div className="form-group-field">
                <label htmlFor="tdsOnGstThreshold">GST TDS Contract Value Threshold</label>
                <div className="input-with-unit">
                  <input
                    id="tdsOnGstThreshold"
                    type="number"
                    value={settings.tdsOnGstThreshold}
                    onChange={(e) => update({ tdsOnGstThreshold: Number(e.target.value) })}
                    className="settings-input font-mono"
                  />
                  <span className="input-unit-label">₹ (Standard ₹2,50,000 per contract)</span>
                </div>
                <span className="form-field-hint">Deduction triggered when individual contract value exceeds ₹2.5 Lakhs (excluding GST).</span>
              </div>
            </div>
          </section>

          {/* Card: Income Tax TDS Directory */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <FileText size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="settings-card-title">Income Tax TDS Deduction Rules</h3>
                  <span className="settings-badge-pill">194C / 194J / 194Q</span>
                </div>
                <p className="settings-card-desc">Withholding tax rates deducted on contractor bills and consultant invoices</p>
              </div>
            </div>

            <div className="settings-form-body p-0">
              <div className="settings-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                <table className="settings-data-table">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Scope of Payment</th>
                      <th style={{ textAlign: 'center' }}>Individual</th>
                      <th style={{ textAlign: 'center' }}>Company</th>
                      <th style={{ textAlign: 'right' }}>Threshold (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.tdsRules.map((rule) => (
                      <tr key={rule.id}>
                        <td>
                          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {rule.section}
                          </span>
                        </td>
                        <td className="text-slate-600 font-medium text-xs max-w-xs">{rule.description}</td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            step="0.1"
                            value={rule.rateIndividual}
                            onChange={(e) =>
                              handleUpdateTds(rule.id, { rateIndividual: Number(e.target.value) })
                            }
                            className="settings-input font-mono font-bold text-center w-14 p-1 h-8"
                          />
                          <span className="ml-1 text-xs font-bold text-slate-500">%</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            step="0.1"
                            value={rule.rateCompany}
                            onChange={(e) =>
                              handleUpdateTds(rule.id, { rateCompany: Number(e.target.value) })
                            }
                            className="settings-input font-mono font-bold text-center w-14 p-1 h-8"
                          />
                          <span className="ml-1 text-xs font-bold text-slate-500">%</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <input
                            type="number"
                            value={rule.threshold}
                            onChange={(e) =>
                              handleUpdateTds(rule.id, { threshold: Number(e.target.value) })
                            }
                            className="settings-input font-mono font-semibold text-right w-24 p-1 h-8"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 5: RCM & Blocked Credits */}
      {activeTab === 'rcm_itc' && (
        <div className="settings-two-col-grid">
          {/* Card: Reverse Charge Mechanism (RCM) */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <Scales size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="settings-card-title">Reverse Charge Mechanism (RCM)</h3>
                  <span className="settings-badge-pill">Section 9(3)</span>
                </div>
                <p className="settings-card-desc">Tax liabilities payable directly by firm as recipient of services</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="form-group-field">
                <label htmlFor="rcmGtaRate">Goods Transport Agency (GTA) Freight RCM Rate</label>
                <div className="input-with-unit">
                  <input
                    id="rcmGtaRate"
                    type="number"
                    value={settings.rcmGtaRate}
                    onChange={(e) => update({ rcmGtaRate: Number(e.target.value) })}
                    className="settings-input font-mono"
                  />
                  <span className="input-unit-label">% (Standard 5% RCM or 12% forward charge)</span>
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="rcmLegalServicesRate">Legal &amp; Advocate Services RCM Rate</label>
                <div className="input-with-unit">
                  <input
                    id="rcmLegalServicesRate"
                    type="number"
                    value={settings.rcmLegalServicesRate}
                    onChange={(e) => update({ rcmLegalServicesRate: Number(e.target.value) })}
                    className="settings-input font-mono"
                  />
                  <span className="input-unit-label">% (100% RCM payable by recipient firm)</span>
                </div>
              </div>

              <div className="toggles-list">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.rcmUnregisteredContractorEnabled}
                    onChange={(e) => update({ rcmUnregisteredContractorEnabled: e.target.checked })}
                  />
                  <div>
                    <strong>Flag Unregistered Contractor &amp; Petty Labor Payments</strong>
                    <p>Auto-generate self-invoices and payment vouchers under Section 31(3)(f)</p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.rcmSecurityServicesRate === 18}
                    onChange={(e) => update({ rcmSecurityServicesRate: e.target.checked ? 18 : 0 })}
                  />
                  <div>
                    <strong>Security Personnel Services (18% RCM)</strong>
                    <p>Apply 18% reverse charge on security guards supplied by non-corporate entities</p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Card: Input Tax Credit (ITC) Rules */}
          <section className="settings-card">
            <div className="settings-card-head">
              <div className="settings-card-icon-wrap">
                <ShieldCheck size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="settings-card-title">Input Tax Credit (ITC) &amp; 2B Matching</h3>
                  <span className="settings-badge-pill">Section 17(5)</span>
                </div>
                <p className="settings-card-desc">GSTR-2B reconciliation tolerances and blocked construction credit rules</p>
              </div>
            </div>

            <div className="settings-form-body">
              <div className="toggles-list">
                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.autoBlockImmovablePropertyItc}
                    onChange={(e) => update({ autoBlockImmovablePropertyItc: e.target.checked })}
                  />
                  <div>
                    <strong>Enforce Section 17(5)(c) &amp; (d) Blocked Credit Filters</strong>
                    <p>
                      Automatically block ITC for goods and services received for construction of immovable property on own account
                    </p>
                  </div>
                </label>

                <label className="toggle-row">
                  <input
                    type="checkbox"
                    checked={settings.allowProvisionalItcWithout2B}
                    onChange={(e) => update({ allowProvisionalItcWithout2B: e.target.checked })}
                  />
                  <div>
                    <strong>Allow Provisional ITC Booking</strong>
                    <p>Permit temporary ITC booking before supplier invoice reflects in GSTR-2B statement</p>
                  </div>
                </label>
              </div>

              <div className="form-group-field">
                <label htmlFor="gstr2bMatchTolerance">GSTR-2B Reconciliation Match Tolerance</label>
                <div className="input-with-unit">
                  <input
                    id="gstr2bMatchTolerance"
                    type="number"
                    value={settings.gstr2bMatchTolerance}
                    onChange={(e) => update({ gstr2bMatchTolerance: Number(e.target.value) })}
                    className="settings-input font-mono"
                  />
                  <span className="input-unit-label">₹ (Permissible invoice total rounding difference)</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export default GstSettingsSection;
