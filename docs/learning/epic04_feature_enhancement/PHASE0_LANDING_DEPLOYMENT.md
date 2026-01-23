# Phase 0: Landing Page Deployment

**Epic:** 4 - Feature Enhancement
**Status:** Not Started
**Estimated Time:** 2-4 hours
**Prerequisites:** cPanel access (mdemaria account), domain ownership (saborspin.com)

---

## Overview

Deploy the SaborSpin landing page to production at saborspin.com. This follows the same model used for Saberloop (saberloop.com).

**What already exists:**
- Landing page: `landing/index.html` (complete, production-ready)
- Deployment script: `scripts/deploy-landing.cjs` (FTP-based, same pattern as Saberloop)
- npm scripts: `deploy:landing`, `preview:landing`
- Images: `landing/images/` (icon, favicon, screenshots)

**What needs to be done:**
1. Configure DNS at domain registrar (point to VPS)
2. Add domain in cPanel (addon domain)
3. Create FTP user in cPanel
4. Set up SSL certificate via cPanel
5. Configure `.env` with FTP credentials
6. Deploy landing page
7. Set up APK hosting

---

## Infrastructure (Shared Hosting)

**Hosting Model:** Shared VPS with a single cPanel account (`mdemaria`). Both saberloop.com and saborspin.com are **addon domains** under this account.

```
┌─────────────────────────────────────────────────────────────┐
│              Shared VPS - cPanel Account: mdemaria          │
├─────────────────────────────────────────────────────────────┤
│  Home Directory: /home/mdemaria/                            │
│                                                              │
│  Addon Domain: saberloop.com (existing)                     │
│  └── /home/mdemaria/saberloop.com/                          │
│      ├── /              Landing Page                        │
│      ├── /app           Frontend PWA                        │
│      ├── /party         Party Backend (PHP)                 │
│      └── /telemetry     Telemetry (PHP)                     │
│                                                              │
│  Addon Domain: saborspin.com (NEW)                          │
│  └── /home/mdemaria/saborspin.com/                          │
│      ├── /              Landing Page (this phase)           │
│      ├── /api           Backend API (Phase 3.5)             │
│      └── /downloads     APK hosting                         │
│                                                              │
│  MySQL Databases (under mdemaria account):                  │
│  └── mdemaria_saberloop (existing)                          │
│  └── mdemaria_saborspin (Phase 3.5)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Note:** On shared hosting, MySQL database names are prefixed with the cPanel username (e.g., `mdemaria_saborspin`).

---

## Step-by-Step Plan

### Step 0.1: DNS Configuration at Domain Registrar

**Goal:** Point saborspin.com to the VPS

**Where:** Domain registrar where you bought saborspin.com (NOT cPanel)

**Tasks:**
1. Log into your domain registrar
2. Go to DNS management for saborspin.com
3. Get your VPS IP address (same as saberloop.com)
4. Create/update DNS records:

```
Type    Host    Value               TTL
A       @       YOUR_VPS_IP         3600
A       www     YOUR_VPS_IP         3600
```

**Note:** You only need to configure the A records. The VPS (cPanel) handles everything else.

**Verification:**
```bash
# Check DNS resolution (may take 5 min - 48 hours)
nslookup saborspin.com
ping saborspin.com

# Should return your VPS IP address
```

**Tools:**
- [dnschecker.org](https://dnschecker.org) - Check global DNS propagation

---

### Step 0.2: Add Domain in cPanel (Addon Domain)

**Goal:** Configure cPanel to serve saborspin.com as an addon domain under the mdemaria account

**Where:** cPanel (log in as `mdemaria`)

**Tasks:**
1. Log into cPanel as the `mdemaria` account
2. Go to **Domains** → **Addon Domains** (or **Domains** in newer cPanel)
3. Add new addon domain:
   - **New Domain Name:** `saborspin.com`
   - **Subdomain:** `saborspin` (auto-filled)
   - **Document Root:** `saborspin.com` (cPanel will create `/home/mdemaria/saborspin.com/`)
4. Click **Add Domain**

**Result:** cPanel creates:
- Directory: `/home/mdemaria/saborspin.com/`
- This is where landing page files will be uploaded
- The domain is now an addon domain under the `mdemaria` account (same as saberloop.com)

**Note:** Wait for DNS propagation before SSL setup (next step).

---

### Step 0.3: Create Dedicated FTP User in cPanel

**Goal:** Create a dedicated FTP user for SaborSpin deployment (same pattern as Saberloop)

**Where:** cPanel (log in as `mdemaria`)

**Tasks:**
1. Log into cPanel as `mdemaria`
2. Go to **Files** → **FTP Accounts**
3. Create new FTP account:
   - **Log In:** `saborspin`
   - **Domain:** Select the server hostname (or `saborspin.com` if available)
   - **Password:** Generate strong password (save this!)
   - **Directory:** `/home/mdemaria/saborspin.com` (restrict to this folder only)
   - **Quota:** Unlimited (or set a limit)
4. Click **Create FTP Account**

**Note your credentials:**
```
FTP Host: (your VPS hostname - same as Saberloop)
FTP User: saborspin@[hostname] (full username shown in cPanel)
FTP Password: (the password you created)
FTP Port: 21
```

**Why a dedicated FTP user?**
- **Security:** User can only access `/home/mdemaria/saborspin.com/`, not other domains
- **Simplicity:** Deploy script uses `remoteRoot: '/'` which maps to the domain folder
- **Consistency:** Same pattern used for Saberloop

**Important:** The FTP user's root directory is `/home/mdemaria/saborspin.com/`, so when the deploy script uses `remoteRoot: '/'`, files upload to the correct location.

---

### Step 0.4: SSL Certificate Setup (Let's Encrypt)

**Goal:** Enable HTTPS for saborspin.com

**Where:** cPanel (log in as `mdemaria`)

**Prerequisites:** DNS must be propagated (Step 0.1 complete)

**Tasks:**
1. Log into cPanel
2. Go to **Security** → **SSL/TLS Status**
3. Find `saborspin.com` in the list
4. Click **Run AutoSSL** or **Issue Certificate**
5. Wait for certificate to be issued (usually < 5 minutes)

**Alternative path:**
1. Go to **Security** → **Let's Encrypt SSL**
2. Select `saborspin.com`
3. Click **Issue**

**Verification:**
- Visit https://saborspin.com in browser
- Check for padlock icon (may show error until files are uploaded)
- Use [SSL Labs](https://www.ssllabs.com/ssltest/) to verify certificate

**Note:** AutoSSL will auto-renew the certificate.

---

### Step 0.5: Configure Local Environment

**Goal:** Set up FTP credentials for deployment

**Where:** Local machine, in the `demo-react-native-app` folder

**Tasks:**
1. Create or update `.env` file in project root:

```bash
# SaborSpin Landing Page Deployment
FTP_HOST=ftp.saborspin.com
FTP_USER=saborspin@saborspin.com
FTP_PASSWORD=your-password-here
```

2. Verify `.env` is in `.gitignore`:
```bash
# Check if .env is ignored
git status
# .env should NOT appear in the list
```

**Security:** Never commit `.env` files to git!

---

### Step 0.6: Local Preview & Validation

**Goal:** Verify landing page before deployment

**Tasks:**
1. Preview locally:
```bash
cd demo-react-native-app
npm run preview:landing
# Opens at http://localhost:3333
```

2. Checklist:
- [ ] All sections render correctly
- [ ] Images load properly
- [ ] Links work (navigation, social)
- [ ] Mobile responsive (test at different widths)
- [ ] Download button present
- [ ] No console errors

---

### Step 0.7: Deploy Landing Page

**Goal:** Upload landing page to production

**Command:**
```bash
cd demo-react-native-app
npm run deploy:landing
```

**Expected output:**
```
📦 Deploying landing page to saborspin.com/...
✅ Landing page deployed!
🌐 Visit: https://saborspin.com/
```

**What gets deployed:**
- `landing/index.html` → `/home/mdemaria/saborspin.com/index.html`
- `landing/images/*` → `/home/mdemaria/saborspin.com/images/*`

**Troubleshooting:**
- If FTP fails, verify credentials in `.env`
- Check that cPanel FTP account has access to the domain folder
- Try connecting with FileZilla to test credentials manually

---

### Step 0.8: Create .htaccess

**Goal:** Configure Apache for HTTPS redirect and caching

**Where:** Upload to `/home/mdemaria/saborspin.com/.htaccess` via FTP or cPanel File Manager

**Content:**
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

**Option:** Add `.htaccess` to `landing/` folder so it deploys automatically with `deploy:landing`.

---

### Step 0.9: APK Hosting Setup

**Goal:** Make the Android APK downloadable from the landing page

**Tasks:**
1. Create downloads directory via cPanel File Manager:
   - Navigate to `/home/mdemaria/saborspin.com/`
   - Create new folder: `downloads`

2. Upload APK:
   - Via cPanel File Manager: Upload to `/home/mdemaria/saborspin.com/downloads/`
   - Or via FTP: Upload to `/downloads/` (if using dedicated FTP user)
   - Name it: `saborspin-latest.apk` (or with version number)

3. Update landing page (if needed):
```html
<a href="/downloads/saborspin-latest.apk" class="btn btn-primary" download>
    Download for Android
</a>
```

4. Re-deploy if HTML was changed:
```bash
npm run deploy:landing
```

---

### Step 0.10: Post-Deployment Verification

**Goal:** Verify everything works in production

**Checklist:**
- [ ] https://saborspin.com loads correctly
- [ ] SSL certificate valid (padlock icon)
- [ ] HTTP redirects to HTTPS
- [ ] All images load
- [ ] Navigation links work
- [ ] Download button downloads APK
- [ ] Mobile version looks good
- [ ] No console errors in browser

**Test tools:**
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance check
- [Facebook Debugger](https://developers.facebook.com/tools/debug/) - Open Graph preview
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL verification

---

## Deployment Script Reference

**Script:** `scripts/deploy-landing.cjs`

```javascript
require('dotenv').config();
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

// FTP configuration for saborspin.com landing page
// Uses dedicated FTP user restricted to /home/mdemaria/saborspin.com/
const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,                              // Use passive mode
    secure: true,                                 // REQUIRED: Enable FTPS
    secureOptions: { rejectUnauthorized: false }, // Accept self-signed certs
    localRoot: './landing',
    remoteRoot: '/',  // FTP user's root = /home/mdemaria/saborspin.com/
    include: ['*', '**/*'],
    exclude: [],
    deleteRemote: false  // Don't delete existing files
};

async function deploy() {
    try {
        console.log('📦 Deploying landing page to saborspin.com/...');
        await ftpDeploy.deploy(config);
        console.log('✅ Landing page deployed!');
        console.log('🌐 Visit: https://saborspin.com/');
    } catch (err) {
        console.error('❌ Deployment failed:', err);
        process.exit(1);
    }
}

deploy();
```

**Dependencies:** `ftp-deploy`, `dotenv`

**npm scripts:**
- `npm run deploy:landing` - Deploy to production
- `npm run preview:landing` - Local preview on port 3333

---

## Comparison with Saberloop Setup

| Aspect | Saberloop | SaborSpin |
|--------|-----------|-----------|
| Domain | saberloop.com | saborspin.com |
| cPanel Account | mdemaria (addon domain) | mdemaria (addon domain) |
| Document Root | `/home/mdemaria/saberloop.com/` | `/home/mdemaria/saborspin.com/` |
| Landing | `landing/` → document root | `landing/` → document root |
| FTP Script | `deploy-landing.cjs` | `deploy-landing.cjs` (same pattern) |
| SSL | Let's Encrypt via cPanel | Let's Encrypt via cPanel |
| DNS | A records at registrar | A records at registrar |

**Key Point:** Both domains are **addon domains** under the same `mdemaria` cPanel account on the shared VPS. They share the same server resources but have separate document roots.

**Reference:** Saberloop's deployment docs at `demo-pwa-app/docs/architecture/DEPLOYMENT.md`

---

## Known Issues from Saberloop

These issues were encountered during Saberloop deployment. Anticipate and avoid them for SaborSpin.

### Issue 1: FTP Authentication Fails

**Problem:** `npm run deploy:landing` fails with "Login authentication failed"

**Cause:** The server requires **FTPS** (FTP over TLS), not plain FTP.

**Solution:** The deploy script must include these settings:
```javascript
const config = {
    // ... other settings
    secure: true,  // REQUIRED: Enable FTPS
    secureOptions: { rejectUnauthorized: false },  // Accept self-signed certs
    forcePasv: true,  // Use passive mode
};
```

**Reference:** Saberloop's `scripts/deploy-ftp.cjs` already has this configured.

### Issue 2: FTP Deploy to Wrong Directory

**Problem:** Files deploy to wrong location on server.

**Cause:** `remoteRoot` doesn't match FTP user's directory structure.

**Solution:**
- With dedicated FTP user restricted to `/home/mdemaria/saborspin.com/`: use `remoteRoot: '/'`
- The FTP user's root IS the domain folder, so `/` = `/home/mdemaria/saborspin.com/`

### Issue 3: .env Not Found After Git Clone

**Problem:** Deploy script fails because `.env` file is missing.

**Cause:** `.env` is gitignored (correctly), so it doesn't exist after fresh clone.

**Solution:** Create `.env` manually with FTP credentials before deploying:
```bash
# In demo-react-native-app/
echo "FTP_HOST=your-host" > .env
echo "FTP_USER=saborspin@hostname" >> .env
echo "FTP_PASSWORD=your-password" >> .env
```

### Issue 4: ES Module vs CommonJS

**Problem:** Deploy script fails with "require is not defined" or similar.

**Cause:** Project uses ES modules (`"type": "module"` in package.json), but deploy script uses `require()`.

**Solution:** Name the deploy script with `.cjs` extension to force CommonJS mode:
- ✅ `scripts/deploy-landing.cjs`
- ❌ `scripts/deploy-landing.js`

---

## Troubleshooting

### DNS Not Propagating
- Wait up to 48 hours (usually faster)
- Check with [dnschecker.org](https://dnschecker.org)
- Verify A records are correct at registrar

### FTP Connection Failed
- Verify credentials in `.env`
- Check FTP account exists in cPanel
- Try connecting with FileZilla to test
- Ensure FTP directory points to saborspin.com folder

### SSL Certificate Issues
- DNS must be propagated first
- Run AutoSSL again in cPanel
- Check domain is added as addon domain

### 404 Errors After Deploy
- Verify files uploaded to correct folder
- Check `remoteRoot` in deploy script
- Look at folder in cPanel File Manager

### Images Not Loading
- Check `landing/images/` was uploaded
- Verify paths in HTML are relative (`images/icon.png`)
- Check file permissions (should be 644)

---

## Success Criteria

**Phase 0 complete when:**
- [ ] https://saborspin.com loads with valid SSL
- [ ] Landing page displays correctly on desktop and mobile
- [ ] All images and assets load
- [ ] APK download works
- [ ] Page speed score > 80 on PageSpeed Insights
- [ ] No console errors in browser

---

## Learning Notes

Document unexpected errors, workarounds, and fixes encountered during implementation:

**[Phase 0 Learning Notes →](./PHASE0_LEARNING_NOTES.md)**

---

## Reference

### Saberloop Reference
- [Saberloop DEPLOYMENT.md](C:\Users\omeue\source\repos\demo-pwa-app\docs\architecture\DEPLOYMENT.md)
- [Saberloop deploy-landing.cjs](C:\Users\omeue\source\repos\demo-pwa-app\scripts\deploy-landing.cjs)

### Developer Guides
- [Testing Guide](../../developer-guide/TESTING.md)
- [Telemetry Guide](../../developer-guide/TELEMETRY.md)

---

*Phase 0: The First Step to Going Live*
