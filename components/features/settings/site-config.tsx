'use client';

import React from 'react';
import {
  Buildings,
  Palette,
  Globe,
  Check,
  FloppyDisk,
  ArrowsClockwise,
  IdentificationCard,
  Phone,
  EnvelopeSimple,
  MapPin,
  CheckCircle,
} from '@phosphor-icons/react';
import type { SiteConfig } from './types';
import { Button } from '../../ui/button';

interface SiteConfigProps {
  config: SiteConfig;
  onChange: (config: SiteConfig) => void;
  onSave: () => void;
  onReset: () => void;
}

const COLOR_PRESETS = [
  { name: 'Deep Blueprint', value: '#0b1f42' },
  { name: 'Infrastructure Blue', value: '#2563eb' },
  { name: 'Steel Navy', value: '#1e293b' },
  { name: 'Safety Amber', value: '#d97706' },
  { name: 'Forest Emerald', value: '#059669' },
  { name: 'Crimson Earth', value: '#b91c1c' },
];

const LOGO_PRESETS = [
  { id: 'monogram', label: 'Geometric Monogram', icon: '🏛️' },
  { id: 'crane', label: 'Heavy Civil Crane', icon: '🏗️' },
  { id: 'tower', label: 'Infrastructure Tower', icon: '🏢' },
  { id: 'shield', label: 'Contractor Shield', icon: '🛡️' },
];

export function SiteConfigSection({ config, onChange, onSave, onReset }: SiteConfigProps) {
  const update = (patch: Partial<SiteConfig>) => {
    onChange({ ...config, ...patch });
  };

  return (
    <div className="settings-section-stack">
      {/* Top action toolbar */}
      <div className="settings-section-head">
        <div>
          <span className="settings-eyebrow">PORTAL &amp; STATUTORY MASTER</span>
          <h2 className="settings-section-title">Site &amp; Branding Configurations</h2>
          <p className="settings-section-subtitle">
            Manage your firm's visual identity, portal theme preferences, legal tax master profiles, and regional fiscal standards.
          </p>
        </div>
        <div className="settings-head-actions">
          <Button variant="outline" size="default" onClick={onReset}>
            <ArrowsClockwise size={16} />
            <span>Reset Defaults</span>
          </Button>
          <Button variant="default" size="default" onClick={onSave}>
            <FloppyDisk size={16} weight="bold" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="settings-two-col-grid">
        {/* Left Column: Brand Identity & Appearance */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <Palette size={20} weight="duotone" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="settings-card-title">Brand Identity &amp; Portal Theme</h3>
                <span className="settings-badge-pill">Theme &amp; UI</span>
              </div>
              <p className="settings-card-desc">Visual identity reflected across sidebar, headers, and exports</p>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="form-group-field">
              <label htmlFor="companyName">Company Display Name</label>
              <input
                id="companyName"
                type="text"
                value={config.companyName}
                onChange={(e) => update({ companyName: e.target.value })}
                placeholder="e.g. PRINCE CONSTRUCTION"
                className="settings-input"
              />
              <span className="form-field-hint">Used in portal navigation, browser tab title, and system headers.</span>
            </div>

            <div className="form-group-field">
              <label htmlFor="brandTagline">Brand Tagline / Slogan</label>
              <input
                id="brandTagline"
                type="text"
                value={config.brandTagline}
                onChange={(e) => update({ brandTagline: e.target.value })}
                placeholder="e.g. Civil Engineering, EPC & Infrastructure Development"
                className="settings-input"
              />
              <span className="form-field-hint">Displayed below company name on login and executive dashboards.</span>
            </div>

            {/* Logo Presets */}
            <div className="form-group-field">
              <label>App Brand Mark Style</label>
              <div className="logo-presets-grid">
                {LOGO_PRESETS.map((p) => {
                  const selected = config.logoPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`logo-preset-btn ${selected ? 'is-selected' : ''}`}
                      onClick={() => update({ logoPreset: p.id })}
                    >
                      <span className="preset-emoji">{p.icon}</span>
                      <span className="preset-name">{p.label}</span>
                      {selected && <Check size={14} weight="bold" className="preset-check" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Palette */}
            <div className="form-group-field">
              <label>Primary Brand Accent Color</label>
              <div className="color-presets-row">
                {COLOR_PRESETS.map((cp) => {
                  const selected = config.primaryColor.toLowerCase() === cp.value.toLowerCase();
                  return (
                    <button
                      key={cp.value}
                      type="button"
                      className={`color-chip ${selected ? 'is-selected' : ''}`}
                      style={{ backgroundColor: cp.value }}
                      onClick={() => update({ primaryColor: cp.value })}
                      title={cp.name}
                      aria-label={cp.name}
                    >
                      {selected && <Check size={14} weight="bold" color="#ffffff" />}
                    </button>
                  );
                })}
                <div className="custom-color-picker-wrap">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => update({ primaryColor: e.target.value })}
                    className="color-picker-input"
                    title="Custom hex color"
                  />
                  <span className="custom-color-hex">{config.primaryColor.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Appearance Mode & Table Density */}
            <div className="form-grid-2">
              <div className="form-group-field">
                <label htmlFor="themeMode">Theme Appearance</label>
                <select
                  id="themeMode"
                  value={config.themeMode}
                  onChange={(e) => update({ themeMode: e.target.value as any })}
                  className="settings-select"
                >
                  <option value="light">Light Mode (Construction White)</option>
                  <option value="dark">Dark Mode (Midnight Navy)</option>
                  <option value="system">Follow System Preferences</option>
                </select>
              </div>

              <div className="form-group-field">
                <label htmlFor="tableDensity">Default Table Density</label>
                <select
                  id="tableDensity"
                  value={config.tableDensity}
                  onChange={(e) => update({ tableDensity: e.target.value as any })}
                  className="settings-select"
                >
                  <option value="comfortable">Comfortable (60px row)</option>
                  <option value="compact">Compact (42px row)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Legal Entity & Tax Profile Panel */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <Buildings size={20} weight="duotone" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="settings-card-title">Legal Entity &amp; GST Profile</h3>
                <span className="settings-badge-pill">Statutory Master</span>
              </div>
              <p className="settings-card-desc">Official company information printed on Tax Invoices and POs</p>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="form-group-field">
              <label htmlFor="legalName">Registered Business Legal Name</label>
              <input
                id="legalName"
                type="text"
                value={config.legalName}
                onChange={(e) => update({ legalName: e.target.value })}
                className="settings-input"
                placeholder="e.g. Prince Construction Private Limited"
              />
              <span className="form-field-hint">Exact statutory name as registered on Ministry of Corporate Affairs / GST portal.</span>
            </div>

            {/* Tax IDs: GSTIN and PAN in a balanced 2-column grid */}
            <div className="form-grid-2">
              <div className="form-group-field">
                <div className="flex items-center justify-between">
                  <label htmlFor="gstin">GSTIN (15 Digits)</label>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} weight="fill" /> Active
                  </span>
                </div>
                <input
                  id="gstin"
                  type="text"
                  maxLength={15}
                  value={config.gstin}
                  onChange={(e) => update({ gstin: e.target.value.toUpperCase() })}
                  className="settings-input font-mono tracking-wider font-semibold"
                  placeholder="09BKZPR3924E2ZH"
                />
              </div>

              <div className="form-group-field">
                <label htmlFor="pan">PAN (10 Digits)</label>
                <input
                  id="pan"
                  type="text"
                  maxLength={10}
                  value={config.pan}
                  onChange={(e) => update({ pan: e.target.value.toUpperCase() })}
                  className="settings-input font-mono tracking-wider font-semibold"
                  placeholder="BKZPR3924E"
                />
              </div>
            </div>

            {/* TAN and CIN in a 2-column grid */}
            <div className="form-grid-2">
              <div className="form-group-field">
                <label htmlFor="tan">TAN (Tax Deduction No)</label>
                <input
                  id="tan"
                  type="text"
                  maxLength={10}
                  value={config.tan}
                  onChange={(e) => update({ tan: e.target.value.toUpperCase() })}
                  className="settings-input font-mono tracking-wider"
                  placeholder="MUMR23337G"
                />
              </div>

              <div className="form-group-field">
                <label htmlFor="cin">CIN (Corporate Identity No)</label>
                <input
                  id="cin"
                  type="text"
                  maxLength={21}
                  value={config.cin}
                  onChange={(e) => update({ cin: e.target.value.toUpperCase() })}
                  className="settings-input font-mono text-xs tracking-wide"
                  placeholder="U26940WB2007PTC271147"
                />
              </div>
            </div>

            {/* State and State Code */}
            <div className="form-grid-state">
              <div className="form-group-field">
                <label htmlFor="state">State / Union Territory</label>
                <input
                  id="state"
                  type="text"
                  value={config.state}
                  onChange={(e) => update({ state: e.target.value })}
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
                  value={config.stateCode}
                  onChange={(e) => update({ stateCode: e.target.value })}
                  className="settings-input font-mono text-center font-bold"
                  placeholder="09"
                  title="2-digit State Code"
                />
              </div>
            </div>

            {/* Registered Office Address */}
            <div className="form-group-field">
              <label htmlFor="registeredAddress">Registered Office Address</label>
              <textarea
                id="registeredAddress"
                rows={2}
                value={config.registeredAddress}
                onChange={(e) => update({ registeredAddress: e.target.value })}
                className="settings-textarea"
                placeholder="0, SHALLAHPUR, BHATNI, Deoria - 274501, Uttar Pradesh"
              />
            </div>

            {/* Contact Details: Billing Email and Phone */}
            <div className="form-grid-2">
              <div className="form-group-field">
                <label htmlFor="email">Official Billing Email</label>
                <div className="input-with-icon-wrap">
                  <EnvelopeSimple size={16} className="input-icon-lead" />
                  <input
                    id="email"
                    type="email"
                    value={config.email}
                    onChange={(e) => update({ email: e.target.value })}
                    className="settings-input has-lead-icon"
                    placeholder="princeconstructionmust@gmail.com"
                  />
                </div>
              </div>

              <div className="form-group-field">
                <label htmlFor="phone">Official Telephone / Mobile</label>
                <div className="input-with-icon-wrap">
                  <Phone size={16} className="input-icon-lead" />
                  <input
                    id="phone"
                    type="text"
                    value={config.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className="settings-input has-lead-icon"
                    placeholder="+91 88880 83403"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Full-Width Bottom Card: Regional & Currency Standards */}
      <section className="settings-card">
        <div className="settings-card-head">
          <div className="settings-card-icon-wrap">
            <Globe size={20} weight="duotone" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="settings-card-title">Regional Standards &amp; Fiscal Formats</h3>
              <span className="settings-badge-pill">Accounting Formats</span>
            </div>
            <p className="settings-card-desc">Indian currency symbol, financial year cycle, and numbering standards</p>
          </div>
        </div>

        <div className="settings-form-body">
          <div className="settings-four-col-grid">
            <div className="form-group-field">
              <label htmlFor="currencySymbol">Currency Symbol</label>
              <input
                id="currencySymbol"
                type="text"
                value={config.currencySymbol}
                onChange={(e) => update({ currencySymbol: e.target.value })}
                className="settings-input text-center font-bold text-base"
                placeholder="₹"
              />
              <span className="form-field-hint">Indian Rupee (INR - ₹)</span>
            </div>

            <div className="form-group-field">
              <label htmlFor="numberFormat">Numbering System</label>
              <select
                id="numberFormat"
                value={config.numberFormat}
                onChange={(e) => update({ numberFormat: e.target.value as any })}
                className="settings-select"
              >
                <option value="indian">Indian (Lakhs &amp; Crores: ₹ 38,35,147)</option>
                <option value="international">International (Millions: ₹ 3,835,147)</option>
              </select>
              <span className="form-field-hint">Grouping format for amounts &amp; BOQ</span>
            </div>

            <div className="form-group-field">
              <label htmlFor="financialYear">Financial Year Cycle</label>
              <select
                id="financialYear"
                value={config.financialYearStart}
                onChange={(e) => update({ financialYearStart: e.target.value })}
                className="settings-select"
              >
                <option value="April">April – March (Indian FY)</option>
                <option value="January">January – December (Calendar)</option>
              </select>
              <span className="form-field-hint">Indian statutory tax year</span>
            </div>

            <div className="form-group-field">
              <label>Standard Timezone &amp; Format</label>
              <div className="settings-readonly-field">
                <span className="font-semibold text-slate-800">IST (UTC+05:30)</span>
                <span className="text-xs text-slate-500">DD/MM/YYYY</span>
              </div>
              <span className="form-field-hint">Synchronized with GST servers</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
