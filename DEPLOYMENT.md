# Deployment Guide for Brain Rizz

## Netlify Deployment

This app is configured to deploy automatically to Netlify. The following files ensure proper deployment:

### Configuration Files

1. **`netlify.toml`** - Main Netlify configuration
   - Sets build command to `npm run build`
   - Configures SPA routing with redirects
   - Sets Node.js version to 18

2. **`public/_redirects`** - Fallback for SPA routing
   - Redirects all routes to `index.html` for client-side routing

3. **`package.json`** - Contains homepage field
   - Sets correct base URL for asset paths

### Deployment Steps

1. **Push to your repository** - Netlify will automatically detect changes
2. **Check build logs** - Ensure the build completes successfully
3. **Verify deployment** - Check that all assets load correctly

### Troubleshooting

If you see 404 errors for static assets:

1. **Clear Netlify cache** - Go to Site Settings > Build & Deploy > Post processing
2. **Redeploy** - Trigger a new deployment
3. **Check build output** - Ensure `build/` folder contains all assets

### Local Testing

To test the production build locally:

```bash
npm run build
npx serve -s build
```

This will serve the built files exactly as they would appear on Netlify.
