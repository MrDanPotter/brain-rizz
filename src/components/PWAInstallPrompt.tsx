import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';
import { isIOS, isInStandalone, setupInstallPrompt } from '../utils/pwaUtils';
import { BeforeInstallPromptEvent } from '../types/pwa';
import IOSInstallPrompt from './IOSInstallPrompt';

interface PWAInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Only set up the install prompt for non-iOS devices
    if (!isIOS()) {
      const cleanup = setupInstallPrompt((event) => {
        setDeferredPrompt(event);
      });
      return cleanup;
    }
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

  // Show iOS-specific install prompt for iOS devices
  if (isIOS() && !isInStandalone()) {
    return <IOSInstallPrompt isOpen={isOpen} onClose={onClose} />;
  }

  // Show standard PWA install prompt for Android/Desktop
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
