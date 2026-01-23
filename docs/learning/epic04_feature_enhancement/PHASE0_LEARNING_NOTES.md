# Phase 0 Learning Notes: Landing Page Deployment

**Status:** Complete
**Date:** 2026-01-23
**Duration:** ~1 hour

---

## Summary

Successfully deployed SaborSpin landing page to https://saborspin.com/ using the same infrastructure pattern as Saberloop. The deployment was smooth thanks to lessons learned from Saberloop being pre-documented in the phase plan.

---

## Unexpected Issues & Solutions

### Issue 1: CNAME Record Pointing to IP Address

**Context:** Setting up DNS records for saborspin.com at dominios.pt registrar
**Error:** SSL certificate failed for www.saborspin.com with "does not resolve to any IP addresses"
**Root Cause:** The www record was created as a CNAME pointing to an IP address (185.118.115.114). CNAMEs must point to domain names, not IP addresses.
**Solution:** Changed www.saborspin.com from CNAME to A record (keeping same IP)
**Time Lost:** ~5 minutes
**Prevention:** Remember: CNAME → domain name, A record → IP address

### Issue 2: cPanel "Share Document Root" Checkbox

**Context:** Adding saborspin.com as addon domain in cPanel
**Error:** Almost created domain with shared document root (would have served same content as mdemaria.com)
**Root Cause:** cPanel's "Share document root" checkbox was checked by default
**Solution:** Unchecked the checkbox before submitting, which revealed the document root field
**Time Lost:** 0 (caught before submission)
**Prevention:** Always uncheck "Share document root" when creating addon domains that need isolated folders

---

## What Went Smoothly

Thanks to pre-documenting Saberloop's lessons in the phase plan, these potential issues were avoided:

1. **FTPS Authentication** - Deploy script already had `secure: true` and `secureOptions`
2. **Passive Mode** - `forcePasv: true` was already configured
3. **ES Module vs CommonJS** - Deploy script already named `.cjs`
4. **FTP Directory Mapping** - `remoteRoot: '/'` correctly configured for restricted FTP user

---

## Configuration Details

### DNS Records (dominios.pt)
| Type | Name | Value |
|------|------|-------|
| A | saborspin.com | 185.118.115.114 |
| A | www.saborspin.com | 185.118.115.114 |
| A | ftp.saborspin.com | 185.118.115.114 |

### cPanel Setup
- **Account:** mdemaria
- **Addon Domain:** saborspin.com
- **Document Root:** /home/mdemaria/saborspin.com/
- **FTP User:** saborspin@saborspin.com (restricted to domain folder)
- **SSL:** AutoSSL (Let's Encrypt, expires 2026-04-23, auto-renews)

### Local Configuration
- **FTP Host:** saborspin.com
- **Deploy Script:** scripts/deploy-landing.cjs
- **npm Scripts:** `deploy:landing`, `preview:landing`

---

## Files Created/Modified

| File | Change |
|------|--------|
| `.env` | Created with FTP credentials |
| `landing/.htaccess` | Created with HTTPS redirect, security headers, caching |
| `landing/index.html` | Updated download link to `/downloads/saborspin-latest.apk` |
| `PHASE0_LANDING_DEPLOYMENT.md` | Updated with progress checklist and completion status |

---

## Key Learnings

1. **CNAME vs A Record:** CNAMEs point to domain names, A records point to IP addresses. Using CNAME with an IP may appear to work in some DNS interfaces but will fail for SSL validation.

2. **Pre-documenting Known Issues Saves Time:** Having Saberloop's deployment issues documented in the phase plan meant zero time wasted on FTP authentication, passive mode, or module format issues.

3. **cPanel Addon Domains:** Always uncheck "Share document root" unless you specifically want multiple domains serving the same content.

4. **APK Hosting:** Large files (~94MB) should be uploaded via cPanel File Manager rather than FTP deploy script to avoid timeouts.

5. **Dedicated FTP Users:** Creating a dedicated FTP user restricted to the domain folder is cleaner and more secure than using the main account.

---

## Deployment Checklist (For Future Reference)

1. [ ] DNS: Create A records (not CNAME) for @ and www pointing to VPS IP
2. [ ] cPanel: Add addon domain with separate document root
3. [ ] cPanel: Create dedicated FTP user restricted to domain folder
4. [ ] cPanel: Issue SSL certificate via AutoSSL
5. [ ] Local: Create .env with FTP credentials
6. [ ] Local: Preview with `npm run preview:landing`
7. [ ] Deploy: Run `npm run deploy:landing`
8. [ ] cPanel: Upload APK via File Manager (if needed)
9. [ ] Verify: Check HTTPS, APK download, all links work

---

## Final URLs

- **Landing Page:** https://saborspin.com/
- **APK Download:** https://saborspin.com/downloads/saborspin-latest.apk

---

## Reference Links

- [Saberloop DEPLOYMENT.md](../../demo-pwa-app/docs/architecture/DEPLOYMENT.md)
- [Saberloop Phase 3.4 Learning Notes](../../demo-pwa-app/docs/learning/epic03_quizmaster_v2/PHASE3.4_LEARNING_NOTES.md)
- [cPanel Documentation](https://docs.cpanel.net/)
- [ftp-deploy npm package](https://www.npmjs.com/package/ftp-deploy)

---

*Last Updated: 2026-01-23*
