# Specification

## Summary
**Goal:** Add Progressive Web App (PWA) support so BDT NURPAY WALLET can be installed on Android devices (Android 10–16) and ensure the full app including the admin panel works correctly in standalone PWA mode.

**Planned changes:**
- Create `manifest.json` in `frontend/public` with app name "BDT NURPAY WALLET", short_name "NURPAY", theme_color `#1E3A8A`, background_color `#ffffff`, display `standalone`, portrait orientation, and 192x192 / 512x512 icon entries
- Register a service worker (`sw.js`) in `frontend/public` that caches the app shell for offline capability without breaking existing routing
- Add `<link rel="manifest">`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `theme-color`, and viewport meta tags to `frontend/index.html`
- Add PWA icon assets: `nurpay-icon-192.png` and `nurpay-icon-512.png` in `frontend/public/assets/generated/`
- Add an "Install App" banner on the Home page that appears when the `beforeinstallprompt` event fires, styled in primary blue (`#1E3A8A`), with a dismiss option and an "Install" button that triggers the native install prompt
- Ensure the Admin Panel (`/admin`) and all its tabs and actions (login, dashboard tabs, data export, etc.) work correctly inside the installed PWA on Android

**User-visible outcome:** Users on Android 10–16 can install BDT NURPAY WALLET to their home screen via a Chrome install prompt or the in-app install banner. The app opens in standalone mode with no browser chrome, displays the NURPAY icon, and all features including the admin panel remain fully functional.
