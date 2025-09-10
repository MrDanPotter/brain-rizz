import React from 'react';
import './PWAInstallPrompt.css';

interface IOSInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const IOSInstallPrompt: React.FC<IOSInstallPromptProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="pwa-modal-overlay" onClick={onClose}>
      <div className="pwa-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pwa-modal-header">
          <h2>Install Brain Rizz on iOS</h2>
          <button className="pwa-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="pwa-modal-body">
          <div className="pwa-install-icon">📱</div>
          <p>To install this app on your iOS device, follow these steps:</p>
          
          <div className="ios-install-steps">
            <div className="ios-step">
              <div className="ios-step-number">1</div>
              <div className="ios-step-content">
                <strong>Tap the Share button</strong>
                <p>Look for the share icon (📤) in the bottom toolbar of Safari</p>
              </div>
            </div>
            
            <div className="ios-step">
              <div className="ios-step-number">2</div>
              <div className="ios-step-content">
                <strong>Select "Add to Home Screen"</strong>
                <p>Scroll down and tap "Add to Home Screen" from the share menu</p>
              </div>
            </div>
            
            <div className="ios-step">
              <div className="ios-step-number">3</div>
              <div className="ios-step-content">
                <strong>Confirm installation</strong>
                <p>Tap "Add" to confirm and the app will be installed on your home screen</p>
              </div>
            </div>
          </div>
          
          <div className="ios-install-note">
            <p><strong>Note:</strong> Once installed, you can access the app directly from your home screen, even when offline!</p>
          </div>
        </div>
        <div className="pwa-modal-footer">
          <button 
            onClick={onClose}
            className="pwa-install-btn pwa-install-btn-primary"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;
