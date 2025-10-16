# TERO Fiscal · Production Handoff Checklist (Phase 12.3)

## 1. Deployment & Rollback
- [ ] Vercel main → production alias (confirmed green)  
- [ ] Backup retention (30 days verified)  
- [ ] Rollback path documented in RUNBOOK.md  

## 2. Observability
- [ ] SLA alerts and error monitoring enabled  
- [ ] CI/CD badges green  
- [ ] Health check page `/api/health` returns 200  

## 3. Environment & Access
- [ ] `.env.vercel` synced with Vercel dashboard  
- [ ] TERO_* vars mirror IBERITAX_* fallbacks  
- [ ] Access limited to maintainers (2FA enabled)  

## 4. DNS & Certificates
- [ ] Apex and www → `terofiscal.es` via Vercel NS  
- [ ] SSL active (Let’s Encrypt auto-renew)  

## 5. Post-Release
- [ ] Tag `v13.0-rc1` pushed  
- [ ] Artifacts zipped and archived  
- [ ] Repo-manifest updated  
