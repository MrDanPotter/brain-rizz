# Brain Rizz - Progressive Web App (PWA)

## What is a PWA?

A Progressive Web App (PWA) is a web application that can be installed on a user's device and provides a native app-like experience. PWAs offer:

- **Installability**: Can be added to home screen
- **Offline functionality**: Works without internet connection
- **Fast loading**: Cached resources for better performance
- **Responsive design**: Works on all devices
- **Push notifications**: (Future enhancement)

## PWA Features Implemented

### 1. Web App Manifest
- **Location**: `public/manifest.json`
- **Features**:
  - App name and description
  - Icons for different sizes
  - Theme colors
  - Display mode (standalone)
  - Orientation preferences

### 2. Service Worker
- **Location**: `public/sw.js`
- **Features**:
  - Caches app resources
  - Enables offline functionality
  - Handles app updates
  - Improves loading performance

### 3. Service Worker Registration
- **Location**: `src/serviceWorkerRegistration.ts`
- **Features**:
  - Automatic service worker registration
  - Update notifications
  - Development vs production handling

### 4. Install Prompt
- **Location**: `src/components/PWAInstallPrompt.tsx`
- **Features**:
  - Automatic install prompt detection
  - User-friendly installation interface
  - Responsive design for mobile

## How to Use

### For Users

1. **Install the App**:
   - Visit the app in a supported browser (Chrome, Edge, Safari)
   - Look for the install prompt or use the browser's install option
   - The app will be added to your home screen

2. **Offline Usage**:
   - Once installed, the app works offline
   - Cached content loads faster
   - Updates are automatically downloaded in the background

### For Developers

1. **Build and Test**:
   ```bash
   npm run build
   npm run pwa:build  # Builds and analyzes PWA performance
   ```

2. **PWA Analysis**:
   ```bash
   npm run pwa:analyze  # Runs Lighthouse PWA audit
   ```

3. **Service Worker Updates**:
   - The service worker automatically handles updates
   - Users are notified when new versions are available
   - Updates are applied after all tabs are closed

## PWA Requirements Met

- ✅ **Installable**: Web app manifest with proper icons
- ✅ **Offline Capable**: Service worker with caching strategy
- ✅ **Responsive**: Mobile-first design approach
- ✅ **Fast**: Cached resources and optimized loading
- ✅ **Engaging**: Install prompt and smooth user experience

## Browser Support

- **Chrome/Edge**: Full PWA support
- **Firefox**: Full PWA support
- **Safari**: Limited PWA support (iOS 11.3+)
- **Mobile Browsers**: Full support on Android, limited on iOS

## Future Enhancements

- [ ] Push notifications
- [ ] Background sync
- [ ] Advanced caching strategies
- [ ] Offline-first data handling
- [ ] App shortcuts
- [ ] Share API integration

## Testing PWA Features

1. **Installation Test**:
   - Open Chrome DevTools
   - Go to Application tab
   - Check Manifest and Service Workers sections

2. **Offline Test**:
   - Install the app
   - Turn off network
   - Verify app still works

3. **Performance Test**:
   - Use Lighthouse in Chrome DevTools
   - Run PWA audit
   - Check performance scores

## Troubleshooting

### Service Worker Not Working
- Ensure HTTPS (required for service workers)
- Check browser console for errors
- Verify service worker file is accessible

### Install Prompt Not Showing
- Check if app meets installability criteria
- Verify manifest.json is valid
- Ensure service worker is registered

### Offline Functionality Issues
- Check service worker cache
- Verify resources are being cached
- Check network tab for failed requests

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
