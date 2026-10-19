'use client';

import { useEffect, useState } from 'react';
import { ArrowClockwise, DownloadSimple, X, Sparkle } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import { PwaInstallModal } from './pwa-install-modal';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function PwaControls() {
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [update, setUpdate] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Global listener to trigger install modal from sidebar / settings
    const openModalHandler = () => {
      setIsModalOpen(true);
    };
    window.addEventListener('open-pwa-install-modal', openModalHandler);

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          if (reg.waiting) setUpdate(reg.waiting);
          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            worker?.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdate(worker);
              }
            });
          });
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('open-pwa-install-modal', openModalHandler);
    };
  }, []);

  return (
    <>
      {/* Floating Prompt Pill (Only if installable or update ready, and not dismissed) */}
      {!dismissed && (install || update) && (
        <div className="fixed bottom-4 right-4 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 text-white rounded-2xl shadow-xl backdrop-blur-md border border-white/10 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkle size={14} className="text-amber-400" weight="fill" />
              {update
                ? 'Update available'
                : 'Install Mobile App'}
            </span>

            {update ? (
              <Button
                variant="outline"
                className="h-7 text-xs bg-white text-slate-900 hover:bg-slate-100 border-none"
                onClick={async () => {
                  if (!window.confirm('Save work before reloading?')) return;
                  update.postMessage({ type: 'SKIP_WAITING' });
                  navigator.serviceWorker.addEventListener(
                    'controllerchange',
                    () => location.reload(),
                    { once: true }
                  );
                }}
              >
                <ArrowClockwise size={14} className="mr-1" /> Reload
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold rounded-lg flex items-center gap-1 transition"
              >
                <DownloadSimple size={14} weight="bold" /> Install
              </button>
            )}

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* High-End App Install Modal */}
      <PwaInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        installPrompt={install}
        onInstalled={() => {
          setInstall(null);
          setDismissed(true);
        }}
      />
    </>
  );
}
