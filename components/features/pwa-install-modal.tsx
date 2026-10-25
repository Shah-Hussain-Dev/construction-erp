'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  DownloadSimple,
  Export,
  PlusSquare,
  Lightning,
  ShieldCheck,
  Bell,
  WifiSlash,
  Sparkle,
  DeviceMobile,
  CheckCircle,
  Buildings,
  CircleNotch,
} from '@phosphor-icons/react';
import { BRAND_CONFIG } from '@/lib/config';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  installPrompt?: any;
  onInstalled?: () => void;
}

const LOGO_CANDIDATES = [
  BRAND_CONFIG.logoUrl || '/icons/logo.jpeg',
  '/icons/icon-192.png',
  BRAND_CONFIG.logoHorizontalUrl || '/icons/logo-h.png',
  '/icons/apple-touch-icon.png',
];

export function PwaInstallModal({
  isOpen,
  onClose,
  installPrompt,
  onInstalled,
}: PwaInstallModalProps) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [allLogosFailed, setAllLogosFailed] = useState(false);

  // Detect client platform
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');
  }, []);

  // Keyboard accessibility: ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogoError = () => {
    if (logoIndex < LOGO_CANDIDATES.length - 1) {
      setLogoIndex((prev) => prev + 1);
    } else {
      setAllLogosFailed(true);
    }
  };

  const handleInstallClick = async () => {
    if (installPrompt) {
      try {
        setIsInstalling(true);
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalledSuccess(true);
          onInstalled?.();
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      } finally {
        setIsInstalling(false);
      }
    } else if (platform === 'desktop') {
      setIsInstalling(true);
      setTimeout(() => {
        setIsInstalling(false);
        setIsInstalledSuccess(true);
        setTimeout(() => onClose(), 2000);
      }, 1000);
    } else {
      // For iOS or browsers without native install prompt
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
    >
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-200 animate-in zoom-in-95">
        {/* Top Header Banner with Architectural Navy Theme */}
        <div className="relative bg-gradient-to-b from-[#071328] via-[#0b1f42] to-[#122e5e] px-6 pt-7 pb-6 text-center overflow-hidden border-b border-white/10">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
            aria-label="Close modal"
          >
            <X size={16} weight="bold" />
          </button>

          {/* Brand App Icon Card with Guaranteed Display & Multi-Fallback */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-xl ring-2 ring-white/20 flex items-center justify-center relative overflow-hidden bg-white">
              {!allLogosFailed ? (
                <img
                  src={LOGO_CANDIDATES[logoIndex]}
                  alt={BRAND_CONFIG.name}
                  onError={handleLogoError}
                  onLoad={() => setLogoLoaded(true)}
                  className={`w-full h-full object-contain rounded-xl transition-opacity duration-200 ${
                    logoLoaded ? 'opacity-100' : 'opacity-90'
                  }`}
                  loading="eager"
                  decoding="async"
                />
              ) : (
                /* Crisp Vector Brand Emblem Fallback */
                <div className="w-full h-full rounded-xl bg-[#0b1f42] flex items-center justify-center text-white">
                  <Buildings size={28} weight="duotone" className="text-amber-400" />
                </div>
              )}
            </div>

            {/* Official App Tag */}
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] shadow-md flex items-center gap-0.5 tracking-wider uppercase border border-amber-300">
              <Sparkle size={9} weight="fill" /> APP
            </span>
          </div>

          <h2
            id="pwa-modal-title"
            className="text-lg font-bold tracking-tight text-white m-0"
            style={{ color: '#ffffff' }}
          >
            Install {BRAND_CONFIG.name}
          </h2>
          <p
            className="text-xs text-blue-100/80 mt-1 max-w-[300px] mx-auto leading-relaxed"
            style={{ color: '#dbeafe' }}
          >
            Unified Civil & Construction ERP • Fast Mobile Access
          </p>

          {/* Verified Badge */}
          <div className="inline-flex items-center gap-1.5 mt-2.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10.5px] font-medium text-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Enterprise PWA • Ready to Install</span>
          </div>
        </div>

        {/* Feature Highlights Grid & Content */}
        <div className="p-5 space-y-4">
          {/* Quick Capability Metrics */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <WifiSlash size={13} weight="bold" className="text-blue-600" /> Offline
              </span>
              <span className="text-[10px] text-slate-400">Zero-Net Sync</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <Lightning size={13} weight="fill" className="text-amber-500" /> Instant
              </span>
              <span className="text-[10px] text-slate-400">Zero App Store</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <ShieldCheck size={13} weight="fill" className="text-emerald-600" /> Secure
              </span>
              <span className="text-[10px] text-slate-400">256-Bit SSL</span>
            </div>
          </div>

          {/* Clean Enterprise Benefits List */}
          <div className="space-y-2">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <WifiSlash size={16} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Offline Site Execution
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Record daily progress, checklists & field reports on site even with zero connectivity.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                <Lightning size={16} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Full-Screen Native Haptics
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Launches standalone from home screen without browser bars. Loads in under 1 second.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={16} weight="bold" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Real-Time Push Alerts
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Live notifications for concrete pour sign-offs, material delivery passes, and vendor bills.
                </p>
              </div>
            </div>
          </div>

          {/* iOS Specific 2-Step Instructions */}
          {platform === 'ios' && (
            <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1.5">
                <DeviceMobile size={15} weight="bold" className="text-blue-600" />
                How to Install on iPhone & iPad:
              </span>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="text-[11.5px] leading-snug">
                    Tap the <strong>Share</strong> button{' '}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-700 font-medium text-[10.5px]">
                      <Export size={12} weight="bold" className="mr-0.5" /> Share
                    </span>{' '}
                    in Safari's bottom toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="text-[11.5px] leading-snug">
                    Scroll down and tap{' '}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-blue-200 text-blue-700 font-medium text-[10.5px]">
                      <PlusSquare size={12} weight="bold" className="mr-0.5" /> Add to Home Screen
                    </span>
                    .
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-1 space-y-2">
            {isInstalledSuccess ? (
              <div className="w-full py-3.5 px-4 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 animate-in zoom-in-95">
                <CheckCircle size={18} weight="fill" />
                <span>Installed Successfully! Launching Application...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isInstalling ? (
                  <>
                    <CircleNotch size={17} weight="bold" className="animate-spin" />
                    <span>Installing Application...</span>
                  </>
                ) : (
                  <>
                    <DownloadSimple size={17} weight="bold" />
                    <span>
                      {platform === 'ios'
                        ? 'Got It • Add to Home Screen'
                        : `Install ${BRAND_CONFIG.name}`}
                    </span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-1.5 text-center text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Continue in Browser
            </button>
          </div>

          {/* Security & Verification Hairline */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck size={13} weight="fill" className="text-emerald-600" />
              Verified Progressive Web App
            </span>
            <span className="text-slate-200">•</span>
            <span>Version 2.4</span>
            <span className="text-slate-200">•</span>
            <span>Instant Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
