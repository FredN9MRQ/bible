/**
 * Alexa Skill Lambda Function
 * For M'Cheyne Bible Reading Plan
 */

const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_BASE_URL || 'https://yourdomain.com';

// Helper function to convert month name to number
function monthNameToNumber(monthName) {
  const months = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
  };
  return months[monthName.toLowerCase()] || null;
}

// Helper to convert plan type from Alexa to API format
function convertPlanType(alexaPlanType) {
  const planMap = {
    'one year': '12_month',
    'two year': '24_month',
    'four year': '48_month'
  };
  return planMap[alexaPlanType] || '12_month';
}

// Launch Request Handler
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = "Welcome to the M'Cheyne Bible Reading Plan! " +
      "You can ask me for today's reading, a reading for a specific date, " +
      "or to mark your reading as complete. What would you like to know?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// Get Today's Reading Intent Handler
const GetTodayReadingIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetTodayReadingIntent';
  },
  async handle(handlerInput) {
    try {
      // Get user's plan preference from session attributes (default to 12_month)
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      const planType = sessionAttributes.planType || '12_month';

      const response = await fetch(`${API_BASE_URL}/api/voice/today`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType })
      });

      const data = await response.json();

      if (data.success) {
        const speakOutput = data.speech + ". Would you like me to mark it as complete?";

        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt("Would you like to mark today's reading as complete?")
          .getResponse();
      } else {
        const speakOutput = "I couldn't find today's reading. Please try again later.";
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }
    } catch (error) {
      console.error('Error fetching today\'s reading:', error);
      const speakOutput = "Sorry, I'm having trouble accessing the reading plan right now.";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

// Get Date Reading Intent Handler
const GetDateReadingIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetDateReadingIntent';
  },
  async handle(handlerInput) {
    try {
      const slots = handlerInput.requestEnvelope.request.intent.slots;
      const monthName = slots.month.value;
      const day = slots.day.value;

      if (!monthName || !day) {
        const speakOutput = "I need both a month and day. For example, say 'What's the reading for March 15th?'";
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt("Please tell me the month and day you'd like to know about.")
          .getResponse();
      }

      const month = monthNameToNumber(monthName);
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      const planType = sessionAttributes.planType || '12_month';

      const response = await fetch(`${API_BASE_URL}/api/voice/date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, day, planType })
      });

      const data = await response.json();

      if (data.success) {
        return handlerInput.responseBuilder
          .speak(data.speech)
          .getResponse();
      } else {
        const speakOutput = `I couldn't find a reading for ${monthName} ${day}.`;
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }
    } catch (error) {
      console.error('Error fetching date reading:', error);
      const speakOutput = "Sorry, I had trouble finding that reading.";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

// Mark Complete Intent Handler
const MarkCompleteIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarkCompleteIntent';
  },
  handle(handlerInput) {
    // In a full implementation, save to persistent storage
    // For now, just acknowledge

    const speakOutput = "Great job! I've marked today's reading as complete. Keep up the good work!";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

// Get Progress Intent Handler
const GetProgressIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetProgressIntent';
  },
  handle(handlerInput) {
    // In a full implementation, query persistent storage
    // For now, return placeholder

    const speakOutput = "You've completed 45 out of 365 readings this year. That's about 12 percent. Keep up the great work!";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

// Change Plan Intent Handler
const ChangePlanIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChangePlanIntent';
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const planType = slots.planType.value;

    if (planType) {
      const apiPlanType = convertPlanType(planType);
      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.planType = apiPlanType;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      const speakOutput = `Okay, I've switched you to the ${planType} plan. What would you like to know?`;
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("What would you like to know?")
        .getResponse();
    } else {
      const speakOutput = "I didn't catch which plan you want. You can choose from one year, two year, or four year plans.";
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt("Which plan would you like?")
        .getResponse();
    }
  }
};

// Help Intent Handler
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = "I can help you with the M'Cheyne Bible Reading Plan. " +
      "You can ask me for today's reading, a reading for a specific date, " +
      "mark your reading as complete, or check your progress. " +
      "What would you like to do?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// Cancel and Stop Intent Handler
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
        || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Happy reading! Goodbye!';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

// Session Ended Request Handler
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

// Error Handler
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${JSON.stringify(error)}`);
    const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// Lambda Handler
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    GetTodayReadingIntentHandler,
    GetDateReadingIntentHandler,
    MarkCompleteIntentHandler,
    GetProgressIntentHandler,
    ChangePlanIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
