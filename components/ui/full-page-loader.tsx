'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Buildings,
  ArrowsClockwise,
  ShieldCheck,
  Sparkle,
  Cpu,
  WifiHigh,
  Lightbulb,
  ArrowRight,
  SignOut,
} from '@phosphor-icons/react';
import { BRAND_CONFIG } from '@/lib/config';

export interface FullPageLoaderProps {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  statusMessage?: string;
  tip?: string;
  showTips?: boolean;
  showProgress?: boolean;
  timeoutSeconds?: number;
  className?: string;
}

const DEFAULT_STAGES = [
  'Connecting to Prince Constructions engine...',
  'Verifying session credentials & site permissions...',
  'Synchronizing local cache & offline ledgers...',
  'Calibrating site telemetry & workspace dashboards...',
];

const CIVIL_TIPS = [
  'Prince Constructions DPR site diaries work fully offline and sync automatically.',
  'Press ⌘K or Ctrl+K anywhere to instantly search sites, bills, and purchase orders.',
  'Measurement sheets auto-calculate deductions and net quantities against contractor BOQs.',
  'Geotagged site photos record tamper-evident GPS coordinates and server timestamps.',
  'Cash & bank registers maintain real-time double-entry reconciliation across all sites.',
  'Export any filtered register directly to CSV or Excel for audit and client billing.',
];

export function FullPageLoader({
  title = BRAND_CONFIG.title,
  subtitle = BRAND_CONFIG.subtitle,
  logoUrl = BRAND_CONFIG.logoUrl,
  statusMessage,
  tip,
  showTips = true,
  showProgress = true,
  timeoutSeconds = 7,
  className = '',
}: FullPageLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(18);

  // Cycle through stages
  useEffect(() => {
    if (statusMessage) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % DEFAULT_STAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [statusMessage]);

  // Cycle through tips
  useEffect(() => {
    if (!showTips || tip) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CIVIL_TIPS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [showTips, tip]);

  // Simulated progressive load bar & elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);

    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p < 55) return p + Math.floor(Math.random() * 12 + 6);
        if (p < 85) return p + Math.floor(Math.random() * 6 + 2);
        if (p < 96) return p + 1;
        return p;
      });
    }, 400);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, []);

  const activeStage = statusMessage || DEFAULT_STAGES[stageIndex];
  const activeTip = tip || CIVIL_TIPS[tipIndex];
  const isDelayed = elapsed >= timeoutSeconds;

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Civil Workspace"
      className={`civil-full-page-loader ${className}`}
    >
      {/* Background Architectural Blueprint Aesthetics */}
      <div className="loader-bg-ambient" aria-hidden="true" />
      <div className="loader-blueprint-grid" aria-hidden="true" />
      <div className="loader-vignette" aria-hidden="true" />

      {/* Engineering Blueprint Coordinates Overlay */}
      <div className="loader-blueprint-corner top-left" aria-hidden="true">
        <span>SYS.ENG · CW-CORE-v1</span>
        <span>NODE: 01-PROD</span>
      </div>
      <div className="loader-blueprint-corner top-right" aria-hidden="true">
        <span>SEC: 256-BIT TLS</span>
        <span>GEO: 28°36&apos;N 77°12&apos;E</span>
      </div>

      <div className="loader-content-card">
        {/* Central Branded Emblem with Pulsing Blueprint Ring */}
        <div className="loader-emblem-wrap">
          <svg className="loader-compass-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle
              className="loader-ring-track"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              className="loader-ring-pulse"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray="40 160"
            />
            <circle
              className="loader-ring-inner-dash"
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
          </svg>

          {/* Glowing Aura Behind Badge */}
          <div className="loader-emblem-glow" aria-hidden="true" />

          {/* Glassmorphic Brand Core */}
          <div className="loader-emblem-core">
            <img
              src={logoUrl}
              alt={title}
              className="loader-brand-logo-img"
            />
            <div className="loader-orbit-dot" aria-hidden="true" />
          </div>
        </div>

        {/* Brand Typography */}
        <div className="loader-brand-block">
          <div className="loader-brand-pill">
            <Sparkle size={12} weight="fill" className="text-amber-400" />
            <span>BUILDING DREAMS • CREATING SPACES</span>
          </div>

          <h1 className="loader-brand-title">
            {title}<span className="loader-brand-title-accent">{subtitle}</span>
          </h1>

          <p className="loader-brand-subtitle">{BRAND_CONFIG.tagline}</p>
        </div>

        {/* Active Stage & Progress Feedback */}
        <div className="loader-stage-container">
          <div className="loader-stage-header">
            <div className="loader-stage-indicator">
              <span className="loader-pulse-dot" />
              <span className="loader-stage-text" key={activeStage}>
                {activeStage}
              </span>
            </div>
            {showProgress && (
              <span className="loader-percentage" aria-hidden="true">
                {Math.min(progress, 99)}%
              </span>
            )}
          </div>

          {showProgress && (
            <div
              className="loader-progress-track"
              role="progressbar"
              aria-valuenow={Math.min(progress, 99)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="loader-progress-fill"
                style={{ width: `${Math.min(progress, 99)}%` }}
              >
                <div className="loader-progress-light-sweep" />
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Status Badges */}
        <div className="loader-telemetry-row">
          <div className="loader-telemetry-pill">
            <span className="telemetry-dot live" />
            <WifiHigh size={13} weight="bold" />
            <span>Cloud Network</span>
          </div>
          <div className="loader-telemetry-pill">
            <ShieldCheck size={14} weight="fill" className="text-emerald-400" />
            <span>Encrypted Ledger</span>
          </div>
          <div className="loader-telemetry-pill">
            <Cpu size={14} weight="bold" />
            <span>Offline Sync Engine</span>
          </div>
        </div>

        {/* Rotating Civil Pro-Tips */}
        {showTips && (
          <div className="loader-tip-card">
            <div className="loader-tip-badge">
              <Lightbulb size={14} weight="fill" className="text-amber-400" />
              <span>CIVIL PRO TIP</span>
            </div>
            <p className="loader-tip-text" key={activeTip}>
              {activeTip}
            </p>
          </div>
        )}

        {/* Intelligent Resiliency Escape Hatch if delayed */}
        {isDelayed && (
          <div className="loader-delay-alert" role="alert">
            <div className="delay-alert-info">
              <span className="delay-alert-icon">⏱️</span>
              <div>
                <p className="delay-alert-title">Connection taking longer than usual?</p>
                <p className="delay-alert-desc">
                  Your network might be slow or reconnecting to server sync.
                </p>
              </div>
            </div>
            <div className="delay-alert-actions">
              <button
                type="button"
                onClick={handleReload}
                className="delay-btn delay-btn-reload"
              >
                <ArrowsClockwise size={15} weight="bold" />
                <span>Reload Application</span>
              </button>
              <Link href="/login" className="delay-btn delay-btn-login">
                <SignOut size={15} weight="bold" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Screen Reader Announcements */}
      <span className="sr-only">
        {BRAND_CONFIG.name} is loading. Please wait while your sites and records are being prepared.
      </span>
    </div>
  );
}

export default FullPageLoader;
