'use client';

import React from 'react';
import {
  Bell,
  EnvelopeSimple,
  ChatDots,
  DeviceMobile,
  FloppyDisk,
  ArrowsClockwise,
} from '@phosphor-icons/react';
import type { NotificationSettings } from './types';
import { Button } from '../../ui/button';

interface NotificationsProps {
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onSave: () => void;
  onReset: () => void;
}

export function NotificationsSection({ settings, onChange, onSave, onReset }: NotificationsProps) {
  const update = (patch: Partial<NotificationSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <div className="settings-section-stack">
      {/* Top Action Toolbar */}
      <div className="settings-section-head">
        <div>
          <h2 className="settings-section-title">Notifications & Automated Dispatch</h2>
          <p className="settings-section-subtitle">
            Configure broadcast channels and real-time triggers for site engineering alerts and manager approvals.
          </p>
        </div>
        <div className="settings-head-actions">
          <Button variant="outline" size="default" onClick={onReset}>
            <ArrowsClockwise size={16} />
            <span>Reset Defaults</span>
          </Button>
          <Button variant="default" size="default" onClick={onSave}>
            <FloppyDisk size={16} weight="bold" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>

      <div className="settings-grid-layout">
        {/* Dispatch Channels */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <Bell size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="settings-card-title">Delivery Channels</h3>
              <p className="settings-card-desc">Active communication pathways for alerts</p>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="toggles-list">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => update({ emailAlerts: e.target.checked })}
                />
                <div>
                  <strong>Email Notifications (Transactional)</strong>
                  <p>Send PDF copies of approved bills, POs, and daily summaries via SMTP</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.whatsappAlerts}
                  onChange={(e) => update({ whatsappAlerts: e.target.checked })}
                />
                <div>
                  <strong>WhatsApp Business Dispatch</strong>
                  <p>Instant mobile alerts to site engineers and vendors for urgent dispatch</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={(e) => update({ smsAlerts: e.target.checked })}
                />
                <div>
                  <strong>SMS Fallback Gateway</strong>
                  <p>Critical OTPs, gate pass authorisations, and emergency site stops</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.inAppAlerts}
                  onChange={(e) => update({ inAppAlerts: e.target.checked })}
                />
                <div>
                  <strong>In-App Badge & Audio Ping</strong>
                  <p>Real-time notification bell update in the workspace top navigation</p>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Event Triggers */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <DeviceMobile size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="settings-card-title">Automated Event Triggers</h3>
              <p className="settings-card-desc">When should team members receive alerts</p>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="toggles-list">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.notifyOnMaterialRequestSubmit}
                  onChange={(e) =>
                    update({ notifyOnMaterialRequestSubmit: e.target.checked })
                  }
                />
                <div>
                  <strong>New Material Request Submitted</strong>
                  <p>Notify store manager and purchasing officer immediately</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.notifyOnBillApprovalRequired}
                  onChange={(e) =>
                    update({ notifyOnBillApprovalRequired: e.target.checked })
                  }
                />
                <div>
                  <strong>Contractor Bill Waiting for Approval</strong>
                  <p>Alert project manager when running bills pass MB verification</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.notifyOnLowStockAlert}
                  onChange={(e) => update({ notifyOnLowStockAlert: e.target.checked })}
                />
                <div>
                  <strong>Store Inventory Low Stock Threshold</strong>
                  <p>Trigger alert when Cement or Steel dips below minimum safety reorder mark</p>
                </div>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={settings.notifyOnDailySiteLogReminder}
                  onChange={(e) =>
                    update({ notifyOnDailySiteLogReminder: e.target.checked })
                  }
                />
                <div>
                  <strong>Daily Site Diary (DPR) End-of-Day Ping</strong>
                  <p>Automated 6:00 PM reminder to supervisors with pending daily logs</p>
                </div>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
