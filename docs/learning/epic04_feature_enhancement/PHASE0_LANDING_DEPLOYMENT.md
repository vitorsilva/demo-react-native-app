# Phase 0: Landing Page Deployment

**Epic:** 4 - Feature Enhancement
**Status:** Not Started
**Estimated Time:** 2-4 hours
**Prerequisites:** VPS access, domain ownership (saborspin.com)

---

## Overview

Deploy the SaborSpin landing page to production at saborspin.com. The landing page is already built and the deployment script exists - this phase focuses on infrastructure setup and execution.

**What already exists:**
- Landing page: `landing/index.html` (complete, production-ready)
- Deployment script: `scripts/deploy-landing.cjs` (FTP-based)
- npm scripts: `deploy:landing`, `preview:landing`
- Images: `landing/images/` (icon, favicon, screenshots)

**What needs to be done:**
- Configure DNS to point to VPS
- Set up SSL certificate (HTTPS)
- Configure FTP credentials
- Deploy landing page
- Set up APK hosting (direct download)
- Verify everything works

---

## Infrastructure Requirements

### VPS Requirements
- Apache or Nginx web server
- PHP support (optional, for future backend)
- FTP/SFTP access
- SSL certificate support (Let's Encrypt)
- cPanel or similar management (recommended)

### Domain Requirements
- saborspin.com registered and accessible
- DNS management access

---

## Step-by-Step Plan

### Step 0.1: DNS Configuration

**Goal:** Point saborspin.com to the VPS

**Tasks:**
1. Get VPS IP address from hosting provider
2. Log into domain registrar DNS management
3. Create/update DNS records:
   ```
   Type    Host    Value               TTL
   A       @       YOUR_VPS_IP         3600
   A       www     YOUR_VPS_IP         3600
   ```
4. Wait for DNS propagation (5 min - 48 hours)

**Verification:**
```bash
# Check DNS resolution
nslookup saborspin.com
ping saborspin.com
```

**Notes:**
- DNS propagation can take time; be patient
- Use [dnschecker.org](https://dnschecker.org) to verify global propagation

---

### Step 0.2: SSL Certificate Setup

**Goal:** Enable HTTPS for saborspin.com

**Option A: cPanel with Let's Encrypt (Recommended)**
1. Log into cPanel
2. Go to "SSL/TLS Status" or "Let's Encrypt SSL"
3. Select saborspin.com domain
4. Click "Issue" or "Install"
5. Enable AutoSSL for automatic renewal

**Option B: Certbot (Manual)**
```bash
# SSH into VPS
ssh user@your-vps-ip

# Install certbot if not present
sudo apt install certbot python3-certbot-apache  # For Apache
# OR
sudo apt install certbot python3-certbot-nginx   # For Nginx

# Obtain certificate
sudo certbot --apache -d saborspin.com -d www.saborspin.com
# OR
sudo certbot --nginx -d saborspin.com -d www.saborspin.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

**Verification:**
- Visit https://saborspin.com in browser
- Check for padlock icon
- Use [SSL Labs](https://www.ssllabs.com/ssltest/) to verify

---

### Step 0.3: Web Server Configuration

**Goal:** Configure web server to serve static files

**For Apache (with cPanel):**

Create/edit `.htaccess` in the domain's root directory:
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

**For Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name saborspin.com www.saborspin.com;

    ssl_certificate /etc/letsencrypt/live/saborspin.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saborspin.com/privkey.pem;

    root /var/www/saborspin.com;
    index index.html;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(png|jpg|jpeg|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/javascript;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name saborspin.com www.saborspin.com;
    return 301 https://$server_name$request_uri;
}
```

---

### Step 0.4: FTP Credentials Configuration

**Goal:** Set up deployment credentials

**Tasks:**
1. Get FTP credentials from hosting provider:
   - FTP Host (e.g., `ftp.saborspin.com` or VPS IP)
   - FTP Username
   - FTP Password
   - FTP Port (usually 21)

2. Create `.env` file in project root (if not exists):
   ```env
   # Landing page deployment
   FTP_HOST=ftp.saborspin.com
   FTP_USER=your-ftp-username
   FTP_PASSWORD=your-ftp-password
   ```

3. Verify `.env` is in `.gitignore` (should already be)

**Security Note:** Never commit `.env` files to git!

---

### Step 0.5: Local Preview & Validation

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
   - [ ] Download button present (will link to APK)
   - [ ] Contact/email links correct
   - [ ] No console errors

3. Fix any issues before deploying

---

### Step 0.6: Deploy Landing Page

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
- `landing/index.html` → `/index.html`
- `landing/images/*` → `/images/*`

---

### Step 0.7: APK Hosting Setup

**Goal:** Make the Android APK downloadable from the landing page

**Option A: Direct hosting on VPS (Recommended)**
1. Create `/downloads` directory on VPS
2. Upload APK file:
   ```bash
   # Via FTP or SCP
   scp saborspin-v1.0.0.apk user@vps:/path/to/public_html/downloads/
   ```
3. Update landing page download link to:
   ```html
   <a href="/downloads/saborspin-v1.0.0.apk" download>Download for Android</a>
   ```

**Option B: Use EAS Build URL**
1. Get the APK URL from EAS Build dashboard
2. Link directly to EAS-hosted APK
3. Note: URLs may expire

**Option C: GitHub Releases**
1. Create a release on GitHub
2. Upload APK as release asset
3. Link to GitHub release page

**Recommended approach:** Option A (direct hosting) for reliability and branding.

**Update landing page:**
Edit `landing/index.html` to include actual download link:
```html
<!-- Find the download button and update href -->
<a href="/downloads/saborspin-latest.apk" class="btn btn-primary" download>
    Download for Android
</a>
```

---

### Step 0.8: Post-Deployment Verification

**Goal:** Verify everything works in production

**Checklist:**
- [ ] https://saborspin.com loads correctly
- [ ] SSL certificate valid (padlock icon)
- [ ] All images load
- [ ] Navigation links work
- [ ] Download button works (downloads APK)
- [ ] Mobile version looks good
- [ ] Page speed acceptable (use [PageSpeed Insights](https://pagespeed.web.dev/))
- [ ] Open Graph works (test with [Facebook Debugger](https://developers.facebook.com/tools/debug/))

**Test on multiple devices:**
- Desktop browser (Chrome, Firefox)
- Mobile browser (Android Chrome, iOS Safari)
- Different screen sizes

---

### Step 0.9: Documentation Update

**Goal:** Document the deployment for future reference

**Tasks:**
1. Update `docs/developer-guide/` with deployment instructions
2. Document FTP credentials location (not the actual credentials!)
3. Add deployment checklist for future updates
4. Update README.md if needed

---

## Deployment Script Reference

**Existing script:** `scripts/deploy-landing.cjs`

```javascript
// Configuration used:
{
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    port: 21,
    forcePasv: true,
    secure: true,
    localRoot: './landing',
    remoteRoot: '/',
    include: ['*', '**/*'],
    deleteRemote: false
}
```

**npm scripts:**
- `npm run deploy:landing` - Deploy to production
- `npm run preview:landing` - Local preview on port 3333

---

## Troubleshooting

### FTP Connection Failed
- Verify credentials in `.env`
- Check if FTP is enabled on hosting
- Try passive mode (already enabled in script)
- Check firewall/port 21 access

### SSL Certificate Issues
- Ensure DNS is fully propagated before requesting cert
- Check certificate paths in web server config
- Verify domain ownership

### 404 Errors After Deploy
- Check `remoteRoot` in deploy script matches domain's document root
- Verify files were uploaded (check via FTP client)
- Check web server configuration

### Images Not Loading
- Verify `landing/images/` directory uploaded
- Check image paths in HTML (should be relative: `images/icon.png`)
- Check file permissions on server

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

## Future Improvements (Parking Lot)

- Analytics integration (Google Analytics, Plausible)
- Email signup functionality (Mailchimp, ConvertKit)
- Blog section for updates
- PWA manifest for installability
- Automated deployment via GitHub Actions

---

## Related Documentation

- Saberloop deployment reference: `C:\Users\omeue\source\repos\demo-pwa-app\docs\architecture\DEPLOYMENT.md`
- Landing page source: `landing/index.html`
- Deployment script: `scripts/deploy-landing.cjs`
