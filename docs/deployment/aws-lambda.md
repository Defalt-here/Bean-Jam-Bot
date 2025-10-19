# Deploy Bean Jam Transcribe Lambda to AWS

## Prerequisites
- AWS Account with CLI configured (`aws configure`)
- AWS IAM permissions to create Lambda functions, API Gateway, and IAM roles
- Google Cloud service account JSON for Speech-to-Text API

## Step 1: Create IAM Role for Lambda

1. **AWS Console**: IAM → Roles → Create role
   - **Trusted entity**: AWS service → Lambda
   - **Permissions**: Attach these policies:
     - `AWSLambdaBasicExecutionRole` (CloudWatch Logs)
     - Custom inline policy for Secrets Manager (optional, if storing credentials there)
   - **Role name**: `BeanJamTranscribeLambdaRole`
   - **Copy the Role ARN** (e.g., `arn:aws:iam::123456789012:role/BeanJamTranscribeLambdaRole`)

**Or via CLI:**
```bash
# Create trust policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Create role
aws iam create-role \
  --role-name BeanJamTranscribeLambdaRole \
  --assume-role-policy-document file://trust-policy.json

# Attach basic execution policy
aws iam attach-role-policy \
  --role-name BeanJamTranscribeLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

## Step 2: Package the Lambda Function

```powershell
# Navigate to Lambda directory
cd aws-lambda/transcribe

# Install dependencies
npm install --production

# Create deployment package (ZIP)
# Windows (PowerShell with 7-Zip or native Compress-Archive):
Compress-Archive -Path * -DestinationPath function.zip -Force

# Or use AWS SAM CLI (recommended):
# sam build && sam package
```

## Step 3: Create Lambda Function

**Option A: AWS Console**
1. Lambda → Create function
   - **Function name**: `BeanJamTranscribe`
   - **Runtime**: Node.js 20.x
   - **Architecture**: x86_64
   - **Execution role**: Use existing role → `BeanJamTranscribeLambdaRole`
2. Upload `function.zip` (Code → Upload from → .zip file)
3. Configuration → Environment variables → Add:
   - **Key**: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - **Value**: (paste entire Google service account JSON)
4. Configuration → General configuration:
   - **Timeout**: 30 seconds (STT can take time)
   - **Memory**: 512 MB

**Option B: AWS CLI**
```bash
# Create Lambda function
aws lambda create-function \
  --function-name BeanJamTranscribe \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/BeanJamTranscribeLambdaRole \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{GOOGLE_SERVICE_ACCOUNT_KEY='PASTE_JSON_HERE'}"
```

## Step 4: Create API Gateway (HTTP API)

**AWS Console:**
1. API Gateway → Create API → **HTTP API** (not REST)
2. **Integrations**: Add integration
   - **Integration type**: Lambda
   - **Lambda function**: `BeanJamTranscribe`
   - **Version**: 2.0
3. **Routes**: Configure routes
   - **Method**: POST
   - **Path**: `/transcribe`
4. **CORS**: Configure CORS
   - **Allow origins**: `*` (or your domain for production)
   - **Allow methods**: POST, OPTIONS
   - **Allow headers**: Content-Type
5. **Deploy**: Create stage
   - **Stage name**: `prod`
   - **Copy the Invoke URL** (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

**Or via CLI:**
```bash
# Create HTTP API
API_ID=$(aws apigatewayv2 create-api \
  --name BeanJamTranscribeAPI \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins='*',AllowMethods='POST,OPTIONS',AllowHeaders='Content-Type' \
  --query 'ApiId' --output text)

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:REGION:ACCOUNT_ID:function:BeanJamTranscribe \
  --payload-format-version 2.0 \
  --query 'IntegrationId' --output text)

# Create route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key 'POST /transcribe' \
  --target integrations/$INTEGRATION_ID

# Create stage and deploy
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy

# Get invoke URL
echo "https://${API_ID}.execute-api.REGION.amazonaws.com/prod"
```

## Step 5: Grant API Gateway Permission to Invoke Lambda

```bash
aws lambda add-permission \
  --function-name BeanJamTranscribe \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigatewayv2.amazonaws.com \
  --source-arn "arn:aws:execute-api:REGION:ACCOUNT_ID:API_ID/*/*"
```

## Step 6: Update Frontend Configuration

Add the API Gateway URL to your `.env`:
```
VITE_TRANSCRIBE_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod/transcribe
```

Update `src/hooks/use-audio-recorder.ts` to use the new endpoint:
```typescript
async function sendToServer(blob: Blob, languageCode = 'en-US') {
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = bufferToBase64(arrayBuffer);
  
  // Use API Gateway endpoint if available, otherwise fallback to local
  const endpoint = import.meta.env.VITE_TRANSCRIBE_API_URL || '/api/transcribe';
  
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64: base64, mimeType: blob.type, languageCode }),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}
```

## Step 7: Test the Lambda Function

**Test from AWS Console:**
1. Lambda → Functions → BeanJamTranscribe → Test
2. Create test event with sample audio base64:
```json
{
  "httpMethod": "POST",
  "body": "{\"audioBase64\":\"SAMPLE_BASE64\",\"mimeType\":\"audio/webm\",\"languageCode\":\"en-US\"}"
}
```

**Test via curl:**
```bash
curl -X POST https://YOUR_API_GATEWAY_URL/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audioBase64":"YOUR_BASE64","mimeType":"audio/webm","languageCode":"en-US"}'
```

## Cost Estimates (AWS Free Tier)
- **Lambda**: 1M requests/month free, 400,000 GB-seconds compute free
- **API Gateway**: 1M requests/month free (first 12 months)
- **CloudWatch Logs**: 5 GB ingestion, 5 GB archive free

Typical usage: ~1000 transcriptions/month = **$0-2/month** (well within free tier).

## Monitoring & Troubleshooting

**View logs:**
```bash
aws logs tail /aws/lambda/BeanJamTranscribe --follow
```

**Or in Console:**
- Lambda → Functions → BeanJamTranscribe → Monitor → View CloudWatch logs

**Common errors:**
- **Timeout**: Increase Lambda timeout to 60s for large audio files
- **Memory**: Increase to 1024 MB if processing large files
- **CORS**: Ensure API Gateway CORS is configured for your domain
- **Credentials**: Verify `GOOGLE_SERVICE_ACCOUNT_KEY` is valid JSON

## Interview Talking Points 🎤

"I migrated the transcription service to AWS Lambda with API Gateway to demonstrate serverless architecture:
- **Lambda function** handles Google Cloud STT API calls
- **API Gateway HTTP API** provides RESTful endpoint with CORS
- **IAM roles** follow least-privilege principle
- **CloudWatch Logs** for monitoring and debugging
- **Cost-effective**: within AWS Free Tier (~$0-2/month)
- **Scalable**: auto-scales to handle traffic spikes
- **Maintains compatibility** with existing Vercel deployment via fallback"
