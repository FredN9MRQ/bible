const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Load reading plan data
let readingPlanData;
try {
  // Try Docker path first, then fall back to development path
  const dockerPath = '/app/data/reading_plan.json';
  const devPath = path.join(__dirname, '../data/reading_plan.json');
  const dataPath = fs.existsSync(dockerPath) ? dockerPath : devPath;

  readingPlanData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Reading plan data loaded successfully from ${dataPath}`);
} catch (error) {
  console.error('Error loading reading plan data:', error);
  process.exit(1);
}

// Helper function to get today's date info
function getTodayInfo() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    year: now.getFullYear(),
    dayOfYear: getDayOfYear(now)
  };
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Helper function to calculate start date based on plan
function getReadingForDate(planType, targetDate) {
  const plan = readingPlanData.plans[planType];
  if (!plan) return null;

  // For simplicity, we'll cycle through the year
  const month = targetDate.month;
  const day = targetDate.day;

  const reading = plan.readings.find(r => r.month === month && r.day === day);
  return reading;
}

// Routes

// Get all available plans
app.get('/api/plans', (req, res) => {
  const plans = Object.keys(readingPlanData.plans).map(key => ({
    id: key,
    name: readingPlanData.plans[key].name,
    description: readingPlanData.plans[key].description,
    totalDays: readingPlanData.plans[key].total_days
  }));

  res.json({
    success: true,
    plans
  });
});

// Get today's reading for a specific plan
app.get('/api/reading/today/:planType', (req, res) => {
  const { planType } = req.params;
  const today = getTodayInfo();

  const reading = getReadingForDate(planType, today);

  if (!reading) {
    return res.status(404).json({
      success: false,
      message: 'No reading found for today'
    });
  }

  res.json({
    success: true,
    date: {
      month: today.month,
      day: today.day,
      year: today.year
    },
    reading
  });
});

// Get reading for specific date
app.get('/api/reading/:planType/:month/:day', (req, res) => {
  const { planType, month, day } = req.params;
  const dateInfo = {
    month: parseInt(month),
    day: parseInt(day)
  };

  const reading = getReadingForDate(planType, dateInfo);

  if (!reading) {
    return res.status(404).json({
      success: false,
      message: 'No reading found for this date'
    });
  }

  res.json({
    success: true,
    date: dateInfo,
    reading
  });
});

// Get Bible Gateway URL for passage
app.get('/api/bible-gateway/:passage', (req, res) => {
  const { passage } = req.params;
  const version = req.query.version || 'NIV';

  // Encode passage for URL
  const encodedPassage = encodeURIComponent(passage);
  const url = `https://www.biblegateway.com/passage/?search=${encodedPassage}&version=${version}`;

  res.json({
    success: true,
    passage,
    version,
    url
  });
});

// Get passage text from Bible Gateway (basic scraping alternative or use API)
app.get('/api/passage/:passage', async (req, res) => {
  const { passage } = req.params;
  const version = req.query.version || 'NIV';

  // For now, just return the URL
  // In production, you could use Bible Gateway API or other Bible API
  const encodedPassage = encodeURIComponent(passage);
  const url = `https://www.biblegateway.com/passage/?search=${encodedPassage}&version=${version}`;

  res.json({
    success: true,
    passage,
    version,
    url,
    note: 'Use the URL to read the passage. Future versions may include full text.'
  });
});

// Voice assistant endpoint - get today's reading
app.post('/api/voice/today', (req, res) => {
  const { planType = '12_month' } = req.body;
  const today = getTodayInfo();
  const reading = getReadingForDate(planType, today);

  if (!reading) {
    return res.json({
      success: false,
      speech: 'I could not find a reading for today.',
      text: 'No reading available'
    });
  }

  // Format for voice output
  const speech = `Today's reading is ${reading.reading}`;

  res.json({
    success: true,
    speech,
    text: reading.reading,
    reading,
    date: today
  });
});

// Voice assistant endpoint - get specific date
app.post('/api/voice/date', (req, res) => {
  const { month, day, planType = '12_month' } = req.body;

  if (!month || !day) {
    return res.json({
      success: false,
      speech: 'Please provide both month and day.',
      text: 'Invalid date'
    });
  }

  const dateInfo = {
    month: parseInt(month),
    day: parseInt(day)
  };

  const reading = getReadingForDate(planType, dateInfo);

  if (!reading) {
    return res.json({
      success: false,
      speech: `I could not find a reading for ${reading.month_name} ${day}.`,
      text: 'No reading available'
    });
  }

  const speech = `The reading for ${reading.month_name} ${day} is ${reading.reading}`;

  res.json({
    success: true,
    speech,
    text: reading.reading,
    reading,
    date: dateInfo
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bible Reading Plan API running on port ${PORT}`);
  console.log(`Available plans: ${Object.keys(readingPlanData.plans).join(', ')}`);
});

module.exports = app;
