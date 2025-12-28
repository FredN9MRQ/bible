# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Web Browser  │  │   Alexa      │  │  Custom Voice       │  │
│  │    (PWA)     │  │   Device     │  │   Assistant         │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                  │                      │               │
└─────────┼──────────────────┼──────────────────────┼──────────────┘
          │                  │                      │
          │                  │                      │
┌─────────▼──────────────────▼──────────────────────▼──────────────┐
│                      NGINX REVERSE PROXY                          │
│                      (Port 80/443)                                │
│                                                                   │
│  • SSL Termination                                               │
│  • Rate Limiting                                                 │
│  • Compression                                                   │
│  • Static File Serving                                           │
└─────────┬─────────────────┬──────────────────────────────────────┘
          │                  │
    /*    │                  │  /api/*  /voice/*
          │                  │
┌─────────▼─────────┐  ┌────▼──────────────────────────────────────┐
│                   │  │                                            │
│  Frontend PWA     │  │         Backend API Server                │
│  (React + Vite)   │  │        (Node.js + Express)                │
│                   │  │                                            │
│  • React 18       │  │  • REST API Endpoints                     │
│  • Vite Build     │  │  • Voice Assistant Webhooks               │
│  • Service Worker │  │  • Bible Gateway Integration              │
│  • Offline Cache  │  │  • Reading Plan Logic                     │
│  • LocalStorage   │  │                                            │
│                   │  │                                            │
│  Port: 5173/8080  │  │  Port: 3000                               │
└───────────────────┘  └────────────┬───────────────────────────────┘
                                    │
                                    │
                        ┌───────────▼───────────┐
                        │   Reading Plan Data   │
                        │   (reading_plan.json) │
                        │                       │
                        │ • 12-month plan       │
                        │ • 24-month plan       │
                        │ • 48-month plan       │
                        └───────────────────────┘
```

## Component Details

### 1. Frontend PWA (Progressive Web App)

**Technology:** React 18 + Vite + PWA Plugin

**Features:**
- Responsive design (mobile, tablet, desktop)
- Installable (Add to Home Screen)
- Offline capable via Service Workers
- Local progress tracking (localStorage)
- Direct Bible Gateway integration

**Key Files:**
- `frontend/src/App.jsx` - Main application
- `frontend/vite.config.js` - PWA configuration
- `frontend/src/App.css` - Styling

### 2. Backend API Server

**Technology:** Node.js + Express

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/plans` | GET | List all reading plans |
| `/api/reading/today/:planType` | GET | Get today's reading |
| `/api/reading/:planType/:month/:day` | GET | Get specific date reading |
| `/api/bible-gateway/:passage` | GET | Get Bible Gateway URL |
| `/api/voice/today` | POST | Voice: today's reading |
| `/api/voice/date` | POST | Voice: specific date |
| `/voice/intent/*` | POST | Custom voice assistant |

**Key Files:**
- `backend/server.js` - Main server
- `backend/server-with-voice.js` - Server with voice integration

### 3. Voice Assistants

#### Alexa Skill

**Components:**
- Interaction Model (intents, utterances)
- AWS Lambda Function
- Skill Manifest

**Intents:**
- GetTodayReadingIntent
- GetDateReadingIntent
- MarkCompleteIntent
- GetProgressIntent
- ChangePlanIntent

**Files:**
- `voice-assistants/alexa/skill.json`
- `voice-assistants/alexa/interactionModel.json`
- `voice-assistants/alexa/lambda/index.js`

#### Custom Voice Assistant

**Webhook Endpoints:**

| Intent | Purpose |
|--------|---------|
| `/voice/intent/today-reading` | Get today's reading |
| `/voice/intent/date-reading` | Get specific date |
| `/voice/intent/read-passage` | Get passage URL |
| `/voice/intent/mark-complete` | Mark complete |
| `/voice/intent/progress` | Get progress |

**Files:**
- `voice-assistants/custom/voice-webhook.js`

### 4. Data Layer

**Source:** Excel spreadsheet (Scaled M'Cheyne Bible Reading Plan.xlsx)

**Conversion:** Python script converts to JSON

**Structure:**
```json
{
  "plans": {
    "12_month": {
      "name": "1 Year Plan",
      "readings": [
        {
          "month": 1,
          "day": 1,
          "reading": "Genesis 1, Matthew 1, Ezra 1, Acts 1"
        }
      ]
    }
  }
}
```

**Files:**
- `data/convert_excel_to_json.py`
- `data/reading_plan.json` (generated)

### 5. Deployment

**Docker Containers:**

```
┌─────────────────────┐
│  nginx:alpine       │  ← Reverse proxy
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    │           │
┌───▼───┐  ┌───▼───────┐
│ Frontend│  │ Backend  │
│ Container│  │ Container│
└─────────┘  └──────────┘
```

**Docker Compose Services:**
- `nginx` - Reverse proxy (ports 80, 443)
- `frontend` - React PWA (port 8080)
- `backend` - API server (port 3000)

**Files:**
- `deployment/docker-compose.yml`
- `deployment/Dockerfile.backend`
- `deployment/Dockerfile.frontend`
- `deployment/nginx.conf`

## Data Flow

### Web App Flow

```
User Opens App
     │
     ▼
Frontend loads (React)
     │
     ▼
Check localStorage for plan preference
     │
     ▼
Call API: GET /api/reading/today/12_month
     │
     ▼
Backend reads reading_plan.json
     │
     ▼
Calculate today's date (month/day)
     │
     ▼
Find matching reading
     │
     ▼
Return reading data
     │
     ▼
Frontend displays passages
     │
     ▼
User clicks "Read"
     │
     ▼
Open Bible Gateway in new tab
```

### Voice Assistant Flow

```
User: "Alexa, ask Bible Reading what's today's reading"
     │
     ▼
Alexa captures intent: GetTodayReadingIntent
     │
     ▼
Calls AWS Lambda function
     │
     ▼
Lambda calls: POST /api/voice/today
     │
     ▼
Backend processes request
     │
     ▼
Returns speech response
     │
     ▼
Lambda formats for Alexa
     │
     ▼
Alexa speaks: "Today's reading is Genesis 1, Matthew 1..."
```

### Custom Voice Assistant Flow

```
User: "What's today's reading?"
     │
     ▼
Voice assistant detects intent
     │
     ▼
Calls: POST /voice/intent/today-reading
     │
     ▼
Webhook processes request
     │
     ▼
Calls internal API
     │
     ▼
Returns JSON with speech text
     │
     ▼
Voice assistant speaks response
```

## Security Layers

### 1. Network Security
- HTTPS/SSL encryption
- Nginx reverse proxy
- Rate limiting (10 req/s for API)
- Security headers (HSTS, X-Frame-Options, etc.)

### 2. Application Security
- Helmet.js (Express security)
- CORS configuration
- Input validation
- No SQL injection risk (JSON data store)

### 3. Container Security
- Run as non-root user
- Minimal base images (Alpine)
- Health checks
- Resource limits

## Scalability

### Current Setup
- Single server
- JSON file data store
- No database required
- Suitable for personal/church use

### Future Scaling Options

1. **Add Database**
   - User accounts
   - Progress tracking
   - Reading history
   - PostgreSQL or MongoDB

2. **Add Caching**
   - Redis for API responses
   - Reduce file reads
   - Session management

3. **Load Balancing**
   - Multiple backend instances
   - Nginx upstream
   - Health checks

4. **CDN**
   - CloudFlare for frontend
   - Edge caching
   - Global distribution

## Development Workflow

```
1. Local Development
   ├── Backend: npm start (port 3000)
   ├── Frontend: npm run dev (port 5173)
   └── Hot reload enabled

2. Testing
   ├── Frontend: Vite dev server
   ├── Backend: Manual API testing
   └── Voice: curl/Postman

3. Build
   ├── Frontend: npm run build → dist/
   └── Backend: No build needed (Node.js)

4. Deploy
   ├── Copy files to VPS
   ├── docker-compose up -d
   └── Configure SSL

5. Monitor
   ├── docker-compose logs
   ├── Health endpoints
   └── Nginx access logs
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Build Tool | Vite | Fast builds, HMR |
| PWA | Workbox | Service workers |
| Styling | CSS3 | Responsive design |
| Backend | Express | REST API |
| Runtime | Node.js 18 | Server runtime |
| Proxy | Nginx | Reverse proxy |
| Containers | Docker | Deployment |
| Voice (Alexa) | ASK SDK | Alexa integration |
| Voice (Lambda) | AWS Lambda | Serverless |
| Data | JSON | Reading plans |
| Conversion | Python + Pandas | Excel → JSON |

## Performance Characteristics

### Frontend
- First Load: ~500ms
- Route Changes: <100ms
- Offline: Instant (Service Worker)
- Bundle Size: ~200KB (gzipped)

### Backend
- API Response: <50ms
- JSON Parse: <10ms
- No database queries

### Voice
- Alexa Response: ~200-500ms
- Custom Webhook: ~100-200ms

## Maintenance

### Regular Tasks
- SSL certificate renewal (90 days)
- Docker image updates (monthly)
- Dependency updates (monthly)
- Log rotation (weekly)

### Monitoring Points
- `/health` endpoint (backend)
- Container health checks
- Nginx access logs
- Error logs (both frontend & backend)

---

This architecture provides:
- ✓ Fast, responsive web app
- ✓ Voice assistant integration
- ✓ Easy deployment
- ✓ Low maintenance
- ✓ Scalable foundation
