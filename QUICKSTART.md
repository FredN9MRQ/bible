# Quick Start Guide

Get the M'Cheyne Bible Reading Plan running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Python 3 installed
- Your "Scaled M'Cheyne Bible Reading Plan.xlsx" file

## Setup (Windows)

### 1. Run Setup Script

```bash
setup.bat
```

This will:
- Convert your Excel file to JSON
- Install all dependencies
- Create environment files

### 2. Start Development Servers

```bash
start-dev.bat
```

Or manually:

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 3. Open Your Browser

Visit: http://localhost:5173

## Setup (Linux/Mac)

### 1. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

### 2. Start Development Servers

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 3. Open Your Browser

Visit: http://localhost:5173

## What You Get

### 1. Web App (http://localhost:5173)
- View today's Bible reading
- Choose between 1-year, 2-year, or 4-year plans
- Click passages to open in Bible Gateway
- Track your progress
- Install as mobile app (PWA)

### 2. REST API (http://localhost:3000)
- `/api/plans` - List all plans
- `/api/reading/today/12_month` - Today's reading
- `/api/voice/today` - Voice assistant endpoint

### 3. Voice Assistant Integration
- Custom webhook at `/voice/*`
- Alexa skill (see setup guide)

## Next Steps

### Deploy to VPS

```bash
cd deployment
docker-compose up -d
```

See [deployment/README.md](deployment/README.md) for details.

### Set Up Alexa Skill

See [voice-assistants/alexa/README.md](voice-assistants/alexa/README.md)

### Integrate Custom Voice Assistant

See [voice-assistants/custom/README.md](voice-assistants/custom/README.md)

## Troubleshooting

### Excel Conversion Failed

Make sure you have:
```bash
pip install pandas openpyxl
```

Then run:
```bash
cd data
python convert_excel_to_json.py
```

### Backend Won't Start

Check that port 3000 is not in use:
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Frontend Won't Start

Check that port 5173 is not in use.

Or specify a different port:
```bash
cd frontend
npm run dev -- --port 3001
```

### No Reading Data Shows

Verify the JSON file exists:
```bash
ls -l data/reading_plan.json
```

If not, run the conversion script again.

## Testing Voice Endpoints

### Get Today's Reading

```bash
curl -X POST http://localhost:3000/api/voice/today \
  -H "Content-Type: application/json" \
  -d '{"planType":"12_month"}'
```

### Get Specific Date

```bash
curl -X POST http://localhost:3000/api/voice/date \
  -H "Content-Type: application/json" \
  -d '{"month":3,"day":15,"planType":"12_month"}'
```

## Customization

### Change Bible Translation

Edit `frontend/src/App.jsx`:

```javascript
const openBibleGateway = (passage, version = 'ESV') => {
  // Changed from NIV to ESV
  ...
}
```

### Change Port Numbers

Backend - Edit `backend/.env`:
```
PORT=3001
```

Frontend - Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
```

### Add Your Domain

For deployment, edit:
- `deployment/nginx.conf` - Replace `yourdomain.com`
- `deployment/docker-compose.yml` - Update environment variables

## Features

### Progressive Web App
- Install on home screen (mobile)
- Works offline
- Fast loading
- Responsive design

### Reading Plans
- **1 Year**: 4 chapters/day
- **2 Year**: 2 chapters/day
- **4 Year**: Relaxed pace

### Progress Tracking
- Mark readings complete
- Stored locally (no account needed)
- Syncs across browser tabs

### Voice Commands (with setup)
- "What's today's reading?"
- "What's the reading for March 15th?"
- "Mark today complete"

## Support

Need help?
- Check main [README.md](README.md)
- Review deployment guides
- Check individual component READMEs

## Happy Bible Reading!

May this tool help you grow in God's Word daily.

---

*Based on the M'Cheyne reading plan by Robert Murray M'Cheyne (1813-1843)*
