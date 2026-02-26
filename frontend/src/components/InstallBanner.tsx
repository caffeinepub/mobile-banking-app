import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function InstallBanner() {
  const { isInstallable, isInstalled, isDismissed, installApp, dismissPrompt } = usePWAInstall();

  if (!isInstallable || isInstalled || isDismissed) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Smartphone size={18} className="text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            Install NURPAY on your device
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Android 10–16 সাপোর্ট • দ্রুত অ্যাক্সেস
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={installApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            <Download size={13} />
            Install
          </button>
          <button
            onClick={dismissPrompt}
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Dismiss install banner"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
