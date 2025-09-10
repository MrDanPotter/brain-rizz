// PWA utility functions for iOS and other platforms
import { BeforeInstallPromptEvent } from '../types/pwa';

/**
 * Detects if the user is on an iOS device
 */
export const isIOS = (): boolean => {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
};

/**
 * Detects if the app is running in standalone mode (installed as PWA)
 */
export const isInStandalone = (): boolean => {
  return window.navigator.standalone === true;
};

/**
 * Detects if the app can be installed (not already installed and not iOS)
 */
export const canInstallPWA = (): boolean => {
  return !isIOS() && !isInStandalone();
};

/**
 * Sets up the beforeinstallprompt event listener for Android/Desktop
 */
export const setupInstallPrompt = (
  onPromptAvailable: (event: BeforeInstallPromptEvent) => void
): (() => void) => {
  const handler = (e: Event) => {
    e.preventDefault();
    onPromptAvailable(e as BeforeInstallPromptEvent);
  };

  window.addEventListener('beforeinstallprompt', handler);

  return () => {
    window.removeEventListener('beforeinstallprompt', handler);
  };
};
