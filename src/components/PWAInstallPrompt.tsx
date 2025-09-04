import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    onClose();
  };

  const handleDismiss = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="pwa-modal-overlay" onClick={handleDismiss}>
      <div className="pwa-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pwa-modal-header">
          <h2>Install Brain Rizz</h2>
          <button className="pwa-modal-close" onClick={handleDismiss}>
            ×
          </button>
        </div>
        <div className="pwa-modal-body">
          <div className="pwa-install-icon">📱</div>
          <p>Add this app to your home screen for quick access and offline use.</p>
        </div>
        <div className="pwa-modal-footer">
          <button 
            onClick={handleInstallClick}
            className="pwa-install-btn pwa-install-btn-primary"
            disabled={!deferredPrompt}
          >
            {deferredPrompt ? 'Install Now' : 'Installation Unavailable'}
          </button>
          <button 
            onClick={handleDismiss}
            className="pwa-install-btn pwa-install-btn-secondary"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
