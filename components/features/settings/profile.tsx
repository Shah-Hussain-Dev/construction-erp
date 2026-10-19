'use client';

import React from 'react';
import {
  User,
  ShieldCheck,
  DeviceMobile,
  Buildings,
  CheckCircle,
  DownloadSimple,
} from '@phosphor-icons/react';
import { useSession } from '../../providers';
import { Badge } from '../../ui/primitives';
import { Button } from '../../ui/button';

export function ProfileSection() {
  const { user, sites, siteId, online } = useSession();

  return (
    <div className="settings-section-stack">
      <div className="settings-section-head">
        <div>
          <h2 className="settings-section-title">My Account &amp; Workspace Access</h2>
          <p className="settings-section-subtitle">
            Your login identity, assigned roles, security credentials, and mobile PWA sync status.
          </p>
        </div>
      </div>

      <div className="settings-grid-layout">
        {/* User Profile Card */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <User size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="settings-card-title">{user?.name}</h3>
              <p className="settings-card-desc">{user?.email}</p>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
                Assigned Role:
              </span>
              <Badge status={user?.role} />
            </div>

            <dl className="detail-fields">
              <div>
                <dt>Current Active Site</dt>
                <dd>{sites.find((s) => s.id === siteId)?.name || 'All Sites'}</dd>
              </div>
              <div>
                <dt>Language / Currency</dt>
                <dd>English · INR (₹)</dd>
              </div>
              <div>
                <dt>Time Zone</dt>
                <dd>Asia/Kolkata (IST +05:30)</dd>
              </div>
              <div>
                <dt>Network Connection</dt>
                <dd className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                  <span>{online ? 'Online (Realtime Sync)' : 'Offline (Local Cache)'}</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Mobile Device PWA Installation Card */}
        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-icon-wrap">
              <DeviceMobile size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="settings-card-title">Install on Phone or Tablet</h3>
              <p className="settings-card-desc">Full offline support for construction site engineers</p>
            </div>
          </div>

          <div className="settings-form-body">
            <p className="text-sm text-slate-600 mb-4">
              Open this workspace on your phone or tablet browser to work with offline DPRs and stock checks.
            </p>
            <ol className="install-steps">
              <li>
                <strong>iPhone &amp; iPad (iOS Safari)</strong>
                <p>Tap the Share button at bottom → select <em>Add to Home Screen</em>.</p>
              </li>
              <li>
                <strong>Android (Google Chrome)</strong>
                <p>Tap the three-dot menu at top-right → select <em>Install App</em> or <em>Add to Home Screen</em>.</p>
              </li>
            </ol>
            <div className="mt-4">
              <Button
                variant="outline"
                size="default"
                onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install-modal'))}
              >
                <DownloadSimple size={16} />
                <span>Open PWA Installation Guide</span>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
