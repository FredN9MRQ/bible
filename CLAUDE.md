# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

M'Cheyne Bible Reading Plan - A multi-platform Bible reading application serving daily reading plans via PWA, REST API, and voice assistants (Alexa + custom webhooks). Deployed to bible.nianticbooks.com via Docker.

## Essential Commands

### Development
```bash
# Backend (Express API on port 3000)
cd backend && npm install && npm run dev

# Frontend (React+Vite PWA on port 5173)
cd frontend && npm install && npm run dev

# Convert Excel data to JSON
cd data && python convert_excel_final.py
```

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend build (validates before deployment)
cd frontend && npm run build
```

### Deployment
```bash
# Deploy to VPS (bible.nianticbooks.com)
# From local machine with SSH key configured
git add . && git commit -m "message" && git push origin main
ssh fred@66.63.182.168 "cd ~/bible-reading-plan && git pull && docker compose build && docker compose up -d"

# View logs
ssh fred@66.63.182.168 "cd ~/bible-reading-plan && docker compose logs -f"

# Restart specific service
ssh fred@66.63.182.168 "cd ~/bible-reading-plan && docker compose restart frontend"
```

## Architecture

### Multi-Container Docker Setup
- **nginx** (port 8081): Routes `/api/*` → backend, `/*` → frontend
- **backend** (internal 3000): Express API serving reading data from `/app/data/reading_plan.json`
- **frontend** (internal 80): Static React build served via nginx:alpine

### Critical Path Issues
1. **API_URL Configuration**: Frontend uses `API_URL = '/api'` (not empty string, not full URL)
   - In production: `${API_URL}/reading/today/...` → `/api/reading/today/...` → nginx proxies to backend
   - **DO NOT** use `${API_URL}/api/...` (creates double `/api/api/` path)

2. **Data File Paths**: Backend checks Docker path first, then dev path
   ```javascript
   const dockerPath = '/app/data/reading_plan.json';
   const devPath = path.join(__dirname, '../data/reading_plan.json');
   ```

3. **Port Conflicts**: VPS uses 8081 (not 8080) - check docker-compose.yml before changing

### Data Pipeline
1. Excel file: `Scaled M'Cheyne Bible Reading Plan.xlsx`
   - Structure: columns=months, rows=days (1-31), tabs=plan types (48/24/12_month)
   - Format: `"1: Genesis 1, Genesis 2"` (day number: passage list)

2. Converter: `data/convert_excel_final.py`
   - Regex: `(\d+):\s*(.+)` to parse day and readings
   - Output: `data/reading_plan.json` with 2,555 total readings (365+730+1460)

3. Backend loads JSON at startup - restart required after data changes

### Frontend State Management
- Uses localStorage for:
  - `selectedPlan` (default: '24_month')
  - `theme` (auto-detected from system, toggleable)
  - `completedReadings` (object keyed by `${plan}-${month}-${day}`)
- No backend auth/sync - all progress is client-side only

### VPS Deployment Details
- Domain: bible.nianticbooks.com
- VPS: fred@66.63.182.168
- Path: `~/bible-reading-plan` (NOT `/opt/bible-reading-plan`)
- Reverse proxy: Caddy (handles HTTPS) → nginx container (port 8081) → backend/frontend
- GitHub: https://github.com/FredN9MRQ/bible.git (branch: main)

## Common Issues and Fixes

### "Failed to load reading" Error
- **Cause**: API URL misconfiguration creating `/api/api/...` paths
- **Check**: Browser DevTools Network tab for 404s
- **Fix**: Ensure `App.jsx` has `API_URL = '/api'` and fetch uses `${API_URL}/reading/...` (not `/api/reading/...`)

### Backend Container Restarts
- **Cause**: Cannot find `/app/data/reading_plan.json`
- **Fix**: Verify `docker-compose.yml` mounts `./data/reading_plan.json:/app/data/reading_plan.json:ro`

### Excel Conversion Returns 0 Readings
- **Cause**: Using wrong converter script or Excel format changed
- **Fix**: Use `convert_excel_final.py` (not `convert_excel_to_json.py` or `convert_excel_simple.py`)
- **Verify**: Output should show 365 + 730 + 1460 = 2,555 readings

### Cache Issues After Deploy
- Users must hard refresh (Ctrl+Shift+R) to get new JavaScript
- Asset hashes change in `index.html`: `index-{HASH}.js`

## TBC Decatur Customizations

The app includes church-specific branding:
- Subtitle: "A TBC Decatur study together, Love God, Love People, and Make Disciples"
- Default translation: CSB (Christian Standard Bible)
- Default plan: 2-year (24_month)
- Auto dark mode with manual toggle

When making changes, preserve these customizations in `frontend/src/App.jsx` and `frontend/src/index.css`.
