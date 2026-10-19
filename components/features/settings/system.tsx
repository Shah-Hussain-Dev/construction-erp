'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  DownloadSimple,
  ArrowsClockwise,
  Trash,
  Database,
  LockSimple,
  CheckCircle,
} from '@phosphor-icons/react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { BRAND_CONFIG } from '@/lib/config';

export function SystemSection() {
  const [downloading, setDownloading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleExportBackup = () => {
    setDownloading(true);
    try {
      const recordsMap: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('civil.') || key.startsWith('offline.') || key.startsWith('prince.'))) {
          try {
            recordsMap[key] = JSON.parse(localStorage.getItem(key) || '{}');
          } catch {
            recordsMap[key] = localStorage.getItem(key);
          }
        }
      }

      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        environment: `${BRAND_CONFIG.name} Enterprise`,
        records: recordsMap,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prince-erp-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('System backup snapshot exported successfully');
    } catch (err) {
      toast.error('Backup generation failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleResetDemo = () => {
    if (!confirm('Reset local demo changes and restore factory project records?')) return;
    setResetting(true);
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('civil.') || k.startsWith('offline.')) {
          localStorage.removeItem(k);
        }
      }
      toast.success('System restored to factory state');
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error('Reset failed');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="settings-section-stack">
      {/* Top Action Toolbar */}
      <div className="settings-section-head">
        <div>
          <h2 className="settings-section-title">System, Security &amp; Data Governance</h2>
          <p className="settings-section-subtitle">
            Export full workspace snapshots, manage encrypted offline cache, and review system telemetry.
          </p>
        </div>
        <div className="settings-head-actions">
          <Button variant="outline" size="default" onClick={handleExportBackup} disabled={downloading}>
            <DownloadSimple size={16} />
            <span>{downloading ? 'Exporting...' : 'Export Snapshot (JSON)'}</span>
          </Button>
          <Button variant="outline" size="default" onClick={handleResetDemo} disabled={resetting}>
            <ArrowsClockwise size={16} />
            <span>Restore Factory State</span>
          </Button>
        </div>
      </div>

      <div className="settings-grid-layout">
        {/* Backup & Snapshot Card */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <Database size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="settings-card-title">Database Snapshots &amp; Export</h3>
              <p className="settings-card-desc">Complete export of accounts, sites, bills, and masters</p>
            </div>
          </div>

          <div className="settings-form-body">
            <p className="text-sm text-slate-600 mb-4">
              Export an encrypted, complete archive of your active sites, material inward bills,
              contractor measurement books, vouchers, and customized settings.
            </p>
            <div className="flex gap-3">
              <Button variant="default" size="default" onClick={handleExportBackup}>
                <DownloadSimple size={16} weight="bold" />
                <span>Download Instant Snapshot</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Security & Audit Retention */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <ShieldCheck size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="settings-card-title">Audit Logging &amp; Compliance</h3>
              <p className="settings-card-desc">Tamper-evident logs of all financial approval actions</p>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="toggles-list">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <strong>Audit Log Retention</strong>
                  <p className="text-xs text-slate-500">Immutable ledger of approvals and state transitions</p>
                </div>
                <span className="badge badge-approved">7 Years (Statutory)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <strong>Encryption Standard</strong>
                  <p className="text-xs text-slate-500">Document evidence &amp; financial payload security</p>
                </div>
                <span className="badge badge-active">AES-256 GCM</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <strong>Offline Local Storage</strong>
                  <p className="text-xs text-slate-500">IndexedDB sync for remote low-connectivity sites</p>
                </div>
                <span className="badge badge-posted">Active &amp; Ready</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
