# Phase 0: Landing Page Deployment

**Epic:** 4 - Feature Enhancement
**Status:** Not Started
**Estimated Time:** 2-4 hours
**Prerequisites:** VPS access via cPanel, domain ownership (saborspin.com)

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

## Infrastructure (Same as Saberloop)

```
┌─────────────────────────────────────────────────────────────┐
│                    VPS (cPanel)                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Domain: saberloop.com (existing)                           │
│  └── /              Landing Page                            │
│  └── /app           Frontend PWA                            │
│  └── /party         Party Backend (PHP)                     │
│  └── /telemetry     Telemetry (PHP)                         │
│                                                              │
│  Domain: saborspin.com (NEW)                                │
│  └── /              Landing Page (this phase)               │
│  └── /api           Backend API (Phase 3.5)                 │
│  └── /downloads     APK hosting                             │
│                                                              │
│  MySQL: saberloop (existing), saborspin (Phase 3.5)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

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

**Goal:** Configure cPanel to serve saborspin.com

**Where:** cPanel on your VPS

**Tasks:**
1. Log into cPanel
2. Go to **Domains** → **Addon Domains** (or **Domains** in newer cPanel)
3. Add new addon domain:
   - **New Domain Name:** `saborspin.com`
   - **Subdomain:** `saborspin` (auto-filled)
   - **Document Root:** `public_html/saborspin.com` (or just `saborspin.com`)
4. Click **Add Domain**

**Result:** cPanel creates:
- Directory: `~/public_html/saborspin.com/` (or `~/saborspin.com/`)
- This is where landing page files will be uploaded

**Note:** Wait for DNS propagation before SSL setup (next step).

---

### Step 0.3: Create FTP User in cPanel

**Goal:** Create FTP credentials for deployment

**Where:** cPanel on your VPS

**Tasks:**
1. Log into cPanel
2. Go to **Files** → **FTP Accounts**
3. Create new FTP account:
   - **Log In:** `saborspin` (or similar)
   - **Domain:** Select `saborspin.com`
   - **Password:** Generate strong password
   - **Directory:** Leave as default (should point to saborspin.com folder)
   - **Quota:** Unlimited (or set a limit)
4. Click **Create FTP Account**

**Note credentials:**
```
FTP Host: ftp.saborspin.com (or your VPS hostname)
FTP User: saborspin@saborspin.com (full username)
FTP Password: (the password you created)
FTP Port: 21
```

**Alternative:** You can also use your main cPanel FTP account if preferred.

---

### Step 0.4: SSL Certificate Setup (Let's Encrypt)

**Goal:** Enable HTTPS for saborspin.com

**Where:** cPanel on your VPS

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
- `landing/index.html` → `~/saborspin.com/index.html`
- `landing/images/*` → `~/saborspin.com/images/*`

**Troubleshooting:**
- If FTP fails, verify credentials in `.env`
- Check that cPanel FTP account has access to the domain folder
- Try connecting with FileZilla to test credentials manually

---

### Step 0.8: Create .htaccess

**Goal:** Configure Apache for HTTPS redirect and caching

**Where:** Upload to `~/saborspin.com/.htaccess` via FTP or cPanel File Manager

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
   - Navigate to `saborspin.com/`
   - Create new folder: `downloads`

2. Upload APK:
   - Via cPanel File Manager: Upload to `saborspin.com/downloads/`
   - Or via FTP: Upload to `~/saborspin.com/downloads/`
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
// Same pattern as Saberloop's deploy-landing.cjs
const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    forcePasv: true,
    secure: true,
    secureOptions: { rejectUnauthorized: false },
    localRoot: './landing',
    remoteRoot: '/',  // Root of saborspin.com domain
    include: ['*', '**/*'],
    deleteRemote: false
};
```

**npm scripts:**
- `npm run deploy:landing` - Deploy to production
- `npm run preview:landing` - Local preview on port 3333

---

## Comparison with Saberloop Setup

| Aspect | Saberloop | SaborSpin |
|--------|-----------|-----------|
| Domain | saberloop.com | saborspin.com |
| VPS | Same cPanel VPS | Same cPanel VPS |
| Landing | `landing/` → `/` | `landing/` → `/` |
| FTP Script | `deploy-landing.cjs` | `deploy-landing.cjs` (same pattern) |
| SSL | Let's Encrypt via cPanel | Let's Encrypt via cPanel |
| DNS | A records at registrar | A records at registrar |

**Reference:** Saberloop's deployment docs at `demo-pwa-app/docs/architecture/DEPLOYMENT.md`

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
