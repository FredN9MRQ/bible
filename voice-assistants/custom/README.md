# Custom Voice Assistant Integration

This webhook can be integrated with your home-made voice assistant to provide Bible reading plan functionality.

## Integration Guide

### 1. Add to Your Backend

Include this router in your main server:

```javascript
const voiceWebhook = require('./voice-assistants/custom/voice-webhook');
app.use('/voice', voiceWebhook);
```

### 2. Configure Your Voice Assistant

Your voice assistant should:

1. **Detect intents** from user speech
2. **Extract entities** (dates, passage references)
3. **Call the appropriate endpoint**
4. **Speak the response** using text-to-speech

## Available Intents

### Today's Reading

**User says:** "What's today's Bible reading?"

**POST to:** `/voice/intent/today-reading`

**Request body:**
```json
{
  "planType": "12_month"
}
```

**Response:**
```json
{
  "success": true,
  "speech": "Today's reading is Genesis 1, Matthew 1, Ezra 1, Acts 1",
  "displayText": "Genesis 1, Matthew 1, Ezra 1, Acts 1",
  "shouldEndSession": false
}
```

### Specific Date Reading

**User says:** "What's the reading for March 15th?"

**POST to:** `/voice/intent/date-reading`

**Request body:**
```json
{
  "month": 3,
  "day": 15,
  "planType": "12_month"
}
```

### Mark Complete

**User says:** "Mark today's reading as done"

**POST to:** `/voice/intent/mark-complete`

**Request body:**
```json
{
  "userId": "user123"
}
```

### Get Progress

**User says:** "How's my Bible reading progress?"

**POST to:** `/voice/intent/progress`

**Request body:**
```json
{
  "userId": "user123",
  "planType": "12_month"
}
```

## Example Voice Assistant Flow

```
User: "Hey assistant, what's today's Bible reading?"