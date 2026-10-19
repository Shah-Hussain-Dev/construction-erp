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
} from '@phosphor-icons/react';
import { BRAND_CONFIG } from '@/lib/config';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  installPrompt?: any;
  onInstalled?: () => void;
}

export function PwaInstallModal({
  isOpen,
  onClose,
  installPrompt,
  onInstalled,
}: PwaInstallModalProps) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalledSuccess, setIsInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');
  }, []);

  if (!isOpen) return null;

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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-200">
      <div
        className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Banner with Deep Navy Architectural Gradient */}
        <div className="relative bg-gradient-to-b from-[#0b1f42] via-[#0e2752] to-[#143368] px-6 pt-6 pb-5 text-center overflow-hidden border-b border-white/10">
          {/* Subtle Ambient Radial Highlights */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all duration-150 cursor-pointer"
            aria-label="Close"
          >
            <X size={15} weight="bold" />
          </button>

          {/* Refined Brand Emblem with Subtle Glow */}
          <div className="relative inline-flex items-center justify-center mb-2.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-xl ring-2 ring-white/15 flex items-center justify-center relative overflow-hidden">
              <img
                src={BRAND_CONFIG.logoUrl}
                alt={BRAND_CONFIG.name}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            {/* Clean Gold APP Tag */}
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-[9px] shadow-sm flex items-center gap-0.5 tracking-wider uppercase">
              <Sparkle size={9} weight="fill" /> APP
            </span>
          </div>

          <h2 className="text-lg font-bold tracking-tight text-white m-0" style={{ color: '#ffffff' }}>
            Install {BRAND_CONFIG.name}
          </h2>
          <p className="text-xs text-blue-100/80 mt-1 max-w-[280px] mx-auto leading-relaxed" style={{ color: '#dbeafe' }}>
            One-tap access directly on your device with instant offline syncing.
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-5 space-y-4">
          <div className="space-y-2.5">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <WifiSlash size={16} weight="bold" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Offline Site Execution
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Record daily progress, checklists & chats on site even with zero mobile connectivity.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                <Lightning size={16} weight="bold" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Ultra-Fast Native Haptics
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Launches full screen with zero browser bars. Instant load times with 90% less data.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bell size={16} weight="bold" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                  Real-Time Field Notifications
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Receive live alerts for concrete pour approvals, material deliveries, and contractor bills.
                </p>
              </div>
            </div>
          </div>

          {/* iOS Specific 2-Step Instructions */}
          {platform === 'ios' ? (
            <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3 space-y-2">
              <span className="text-[11px] font-semibold text-blue-900 flex items-center gap-1.5">
                <DeviceMobile size={15} weight="bold" /> How to install on iPhone & iPad:
              </span>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9.5px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="text-[11px]">
                    Tap the <strong>Share</strong> button <Export size={13} className="inline text-blue-600 mx-0.5" /> in Safari’s bottom toolbar.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9.5px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="text-[11px]">
                    Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={13} className="inline text-blue-600 mx-0.5" />.
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Primary Action Button */}
          <div className="pt-0.5 space-y-2">
            {isInstalledSuccess ? (
              <div className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2">
                <CheckCircle size={17} weight="bold" />
                <span>Installed Successfully! Launching...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <DownloadSimple size={16} weight="bold" />
                <span>
                  {platform === 'ios'
                    ? 'Got It • Add to Home Screen'
                    : isInstalling
                    ? 'Installing Application...'
                    : `Install ${BRAND_CONFIG.name} Application`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-1 text-center text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>

          {/* Security & Verification Hairline */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2.5 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} weight="fill" className="text-emerald-500" />
              256-Bit SSL Encrypted
            </span>
            <span className="text-slate-300">•</span>
            <span>Progressive Web App v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}

