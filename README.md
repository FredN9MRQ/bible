# M'Cheyne Bible Reading Plan

A comprehensive Bible reading plan application with Progressive Web App, voice assistant integration (Alexa & custom), and web hosting capabilities.

## Features

### 1. Progressive Web App (PWA)
- View daily Bible readings based on M'Cheyne's plan
- Choose between 1-year (4 chapters/day), 2-year (2 chapters/day), or 4-year plans
- Click passages to open in Bible Gateway
- Track reading progress locally
- Install on mobile devices
- Works offline after first load

### 2. Voice Assistant Integration

#### Alexa Skill
- "Alexa, ask Bible Reading what's today's reading"
- "Alexa, ask Bible Reading for March 15th"
- "Alexa, ask Bible Reading to mark today complete"

#### Custom Voice Assistant
- Webhook endpoints for your home-made voice assistant
- Compatible with any voice assistant platform
- RESTful API for easy integration

### 3. REST API
- Get readings by date
- Support for all three plan types
- Bible Gateway integration
- Voice assistant endpoints

## Project Structure

```
bible-reading-plan/
├── frontend/              # React PWA
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/               # Node.js/Express API
│   ├── server.js
│   └── package.json
├── data/                  # Reading plan data
│   ├── convert_excel_to_json.py
│   └── reading_plan.json (generated)
├── voice-assistants/
│   ├── custom/           # Custom voice assistant webhook
│   └── alexa/            # Alexa skill configuration
└── deployment/           # Docker & deployment configs
    ├── docker-compose.yml
    └── nginx.conf
```

## Quick Start

### 1. Convert Excel to JSON

```bash
cd data
pip install -r requirements.txt
python convert_excel_to_json.py
```

This converts your "Scaled M'Cheyne Bible Reading Plan.xlsx" to JSON format.

### 2. Run Backend

```bash
cd backend
npm install
npm start
```

Backend runs on http://localhost:3000

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### 4. Access the App

Open http://localhost:5173 in your browser.

## Development

### Backend API Endpoints

- `GET /api/plans` - List all available plans
- `GET /api/reading/today/:planType` - Get today's reading
- `GET /api/reading/:planType/:month/:day` - Get reading for specific date
- `GET /api/bible-gateway/:passage` - Get Bible Gateway URL
- `POST /api/voice/today` - Voice assistant: get today's reading
- `POST /api/voice/date` - Voice assistant: get specific date

### Frontend Development

The PWA is built with:
- React 18
- Vite
- Progressive Web App plugin
- Responsive design

To build for production:

```bash
cd frontend
npm run build
```

## Deployment

### Docker Deployment (Recommended)

```bash
cd deployment
docker-compose up -d
```

See [deployment/README.md](deployment/README.md) for detailed instructions.

### Manual VPS Deployment

1. Install Node.js 18+ on your VPS
2. Copy project files to VPS
3. Run backend and frontend
4. Configure nginx as reverse proxy
5. Set up SSL with Let's Encrypt

## Voice Assistant Setup

### Alexa Skill

See [voice-assistants/alexa/README.md](voice-assistants/alexa/README.md) for complete setup instructions.

Quick steps:
1. Create skill in Alexa Developer Console
2. Upload interaction model
3. Deploy Lambda function
4. Connect Lambda to skill
5. Test and publish

### Custom Voice Assistant

See [voice-assistants/custom/README.md](voice-assistants/custom/README.md) for integration guide.

The webhook provides these intents:
- `today-reading` - Get today's reading
- `date-reading` - Get reading for specific date
- `read-passage` - Get passage URL
- `mark-complete` - Mark reading as complete
- `progress` - Get reading progress

## Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=production
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

For production, set to your deployed API URL.

## Reading Plan Details

The M'Cheyne Reading Plan was created by Robert Murray M'Cheyne in 1842. It provides:

- **1 Year Plan**: Read through the entire Bible in one year with 4 chapters per day
- **2 Year Plan**: More relaxed pace with 2 chapters per day
- **4 Year Plan**: Even more relaxed pace for busy schedules

The plan is designed to give you readings from different parts of Scripture each day.

## Features Roadmap

- [ ] User authentication
- [ ] Cloud progress sync
- [ ] Email reminders
- [ ] Reading streaks
- [ ] Social sharing
- [ ] Multiple Bible translations
- [ ] Offline Bible text
- [ ] Reading notes
- [ ] Prayer list integration
- [ ] Group reading plans

## Technologies Used

### Frontend
- React
- Vite
- PWA (Service Workers)
- CSS3 (Responsive Design)

### Backend
- Node.js
- Express
- Better-SQLite3 (future use)

### Voice
- Alexa Skills Kit
- AWS Lambda
- Custom webhooks

### Deployment
- Docker
- Docker Compose
- Nginx
- Let's Encrypt SSL

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for personal or church use.

## Support

For questions or issues:
- Open an issue on GitHub
- Check the documentation in each directory
- Review the deployment guide

## Acknowledgments

- Robert Murray M'Cheyne for the original reading plan
- Bible Gateway for providing Bible text access
- The open-source community

## About M'Cheyne

Robert Murray M'Cheyne (1813-1843) was a Scottish minister known for his devotion to Scripture and evangelism. His reading plan has helped millions read through the Bible systematically.

---

Built with prayer and code. May this tool help you grow in God's Word.
