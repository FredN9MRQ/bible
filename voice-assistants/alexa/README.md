# Alexa Skill for M'Cheyne Bible Reading Plan

This directory contains everything needed to deploy the M'Cheyne Bible Reading Plan as an Alexa skill.

## Files

- `skill.json` - Skill manifest configuration
- `interactionModel.json` - Voice interaction model (intents, utterances)
- `lambda/` - AWS Lambda function code

## Setup Instructions

### 1. Create Alexa Skill

1. Go to [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Click "Create Skill"
3. Name: "M'Cheyne Bible Reading Plan"
4. Choose "Custom" model and "Provision your own" backend
5. Click "Create skill"

### 2. Configure Interaction Model

1. In the Alexa Developer Console, go to "Build" > "JSON Editor"
2. Copy the contents of `interactionModel.json` and paste it
3. Click "Save Model"
4. Click "Build Model"

### 3. Deploy Lambda Function

#### Option A: AWS Console

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Create new function:
   - Name: `BibleReadingPlan`
   - Runtime: Node.js 18.x
   - Create new execution role with basic Lambda permissions
3. Upload code:
   ```bash
   cd lambda
   npm install
   zip -r function.zip .
   ```
4. Upload `function.zip` in Lambda console
5. Add Alexa Skills Kit trigger
6. Set environment variable: `API_BASE_URL` = your backend API URL
7. Copy the Lambda ARN

#### Option B: AWS CLI

```bash
cd lambda
npm install
zip -r function.zip .

aws lambda create-function \
  --function-name BibleReadingPlan \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --environment Variables={API_BASE_URL=https://yourdomain.com}
```

### 4. Connect Lambda to Skill

1. In Alexa Developer Console, go to "Build" > "Endpoint"
2. Select "AWS Lambda ARN"
3. Paste your Lambda function ARN
4. Click "Save Endpoints"

### 5. Test Your Skill

1. Go to "Test" tab
2. Enable testing for "Development"
3. Try these phrases:
   - "Open Bible Reading"
   - "Ask Bible Reading what's today's reading"
   - "Ask Bible Reading for March fifteenth"
   - "Ask Bible Reading to mark today complete"

## Example Interactions

**User:** "Alexa, open Bible Reading"
**Alexa:** "Welcome to the M'Cheyne Bible Reading Plan! You can ask me for today's reading..."

**User:** "What's today's reading?"
**Alexa:** "Today's reading is Genesis 1, Matthew 1, Ezra 1, Acts 1. Would you like me to mark it as complete?"

**User:** "Yes"
**Alexa:** "Great job! I've marked today's reading as complete."

**User:** "What's the reading for December 25th?"
**Alexa:** "The reading for December 25 is..."

## Updating the Skill

When you make changes:

1. Update `interactionModel.json` if adding new intents
2. Rebuild the model in Alexa Console
3. Update Lambda code and redeploy
4. Test in the Test tab

## Publishing (Optional)

To make your skill available to others:

1. Complete all required fields in "Distribution" tab
2. Add privacy policy URL
3. Add icons (108x108 and 512x512 PNG)
4. Complete testing requirements
5. Submit for certification

## Environment Variables

Set these in your Lambda function:

- `API_BASE_URL` - Your backend API URL (e.g., https://yourdomain.com)

## Troubleshooting

### Skill doesn't respond
- Check Lambda CloudWatch logs
- Verify API_BASE_URL is correct
- Ensure your backend API is accessible

### "I don't know that one"
- Rebuild the interaction model
- Check that utterances match what you're saying
- View CloudWatch logs for intent matching

### API calls fail
- Verify backend is running
- Check CORS settings
- Review Lambda execution role permissions
