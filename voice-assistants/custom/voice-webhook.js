/**
 * Custom Voice Assistant Integration
 *
 * This webhook can be integrated with your home-made voice assistant.
 * It provides endpoints for common voice commands related to Bible reading.
 *
 * Usage:
 * 1. Deploy this alongside your backend API
 * 2. Configure your voice assistant to call these endpoints
 * 3. Parse the speech responses for text-to-speech output
 */

const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

/**
 * Intent: Get today's reading
 * Example phrases:
 * - "What's today's Bible reading?"
 * - "What should I read today?"
 * - "Tell me today's reading"
 */
router.post('/intent/today-reading', async (req, res) => {
  try {
    const { planType = '12_month' } = req.body;

    const response = await fetch(`${API_BASE_URL}/api/voice/today`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType })
    });

    const data = await response.json();

    res.json({
      success: data.success,
      speech: data.speech,
      displayText: data.text,
      shouldEndSession: false,
      data: data.reading
    });
  } catch (error) {
    res.json({
      success: false,
      speech: "I'm having trouble accessing the reading plan right now.",
      displayText: "Error",
      shouldEndSession: true
    });
  }
});

/**
 * Intent: Get reading for specific date
 * Example phrases:
 * - "What's the reading for March 15th?"
 * - "Tell me the reading for December 25"
 */
router.post('/intent/date-reading', async (req, res) => {
  try {
    const { month, day, planType = '12_month' } = req.body;

    if (!month || !day) {
      return res.json({
        success: false,
        speech: "I need a month and day. For example, say 'What's the reading for March 15th?'",
        displayText: "Please provide a date",
        shouldEndSession: false
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/voice/date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, day, planType })
    });

    const data = await response.json();

    res.json({
      success: data.success,
      speech: data.speech,
      displayText: data.text,
      shouldEndSession: false,
      data: data.reading
    });
  } catch (error) {
    res.json({
      success: false,
      speech: "I'm having trouble accessing the reading plan right now.",
      displayText: "Error",
      shouldEndSession: true
    });
  }
});

/**
 * Intent: Read passage aloud
 * Note: This returns the Bible Gateway URL. Your voice assistant
 * would need to scrape the passage text or use a Bible API.
 */
router.post('/intent/read-passage', async (req, res) => {
  try {
    const { passage, version = 'NIV' } = req.body;

    if (!passage) {
      return res.json({
        success: false,
        speech: "I need a passage reference. For example, say 'Read John 3:16'",
        displayText: "Please provide a passage",
        shouldEndSession: false
      });
    }

    const encodedPassage = encodeURIComponent(passage);
    const url = `https://www.biblegateway.com/passage/?search=${encodedPassage}&version=${version}`;

    res.json({
      success: true,
      speech: `Opening ${passage} in the ${version} translation.`,
      displayText: passage,
      shouldEndSession: true,
      data: {
        passage,
        version,
        url
      }
    });
  } catch (error) {
    res.json({
      success: false,
      speech: "I had trouble finding that passage.",
      displayText: "Error",
      shouldEndSession: true
    });
  }
});

/**
 * Intent: Mark reading as complete
 * This would integrate with your progress tracking system
 */
router.post('/intent/mark-complete', async (req, res) => {
  try {
    const { userId, date = new Date().toISOString() } = req.body;

    // In a full implementation, save to database
    // For now, just acknowledge

    res.json({
      success: true,
      speech: "Great job! I've marked today's reading as complete.",
      displayText: "Reading marked complete",
      shouldEndSession: true
    });
  } catch (error) {
    res.json({
      success: false,
      speech: "I couldn't mark that reading as complete.",
      displayText: "Error",
      shouldEndSession: true
    });
  }
});

/**
 * Intent: Get progress statistics
 */
router.post('/intent/progress', async (req, res) => {
  try {
    const { userId, planType = '12_month' } = req.body;

    // In a full implementation, query database for user's progress
    // For now, return placeholder

    res.json({
      success: true,
      speech: "You've completed 45 out of 365 readings this year. Keep up the great work!",
      displayText: "45 / 365 readings complete",
      shouldEndSession: true,
      data: {
        completed: 45,
        total: 365,
        percentage: 12.3
      }
    });
  } catch (error) {
    res.json({
      success: false,
      speech: "I couldn't retrieve your progress right now.",
      displayText: "Error",
      shouldEndSession: true
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'voice-assistant-webhook' });
});

module.exports = router;
