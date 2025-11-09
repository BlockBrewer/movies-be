#!/bin/bash

# Local deployment script for Elastic Beanstalk
# Builds and deploys directly from local machine

set -e

# Configuration
ENV_NAME="Movie-be-env"
APP_NAME="movie-be"
S3_BUCKET="movies-list-kamran"
REGION="ap-southeast-1"
VERSION_LABEL="local-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "Local Elastic Beanstalk Deployment"
echo "=========================================="
echo ""
echo "Environment: $ENV_NAME"
echo "Version: $VERSION_LABEL"
echo ""

# Check environment is ready
echo "Step 1: Checking environment status..."
STATUS=$(aws elasticbeanstalk describe-environments \
  --environment-names "$ENV_NAME" \
  --region "$REGION" \
  --query 'Environments[0].Status' \
  --output text)

if [ "$STATUS" != "Ready" ]; then
  echo "❌ Environment is not Ready (current: $STATUS)"
  echo "Please wait for environment to be Ready before deploying"
  exit 1
fi
echo "✅ Environment is Ready"
echo ""

# Install all dependencies for building
echo "Step 2: Installing dependencies..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Build application
echo "Step 3: Building application..."
npm run build
echo "✅ Build complete"
echo ""

# Replace with production-only dependencies
echo "Step 4: Installing production dependencies only..."
rm -rf node_modules
npm ci --omit=dev
echo "✅ Production dependencies installed"
echo ""

# Create deployment package
echo "Step 5: Creating deployment package..."
rm -f deploy-package.zip

zip -r deploy-package.zip . \
  -x ".git/*" \
  -x "src/*" \
  -x "tests/*" \
  -x ".github/*" \
  -x "coverage/*" \
  -x "*.log" \
  -x "docker-compose.yml" \
  -x "Dockerfile" \
  -x ".env*" \
  -x "dist/**/*.map" \
  -x "dist/**/*.d.ts" \
  -x "eb-logs/*" \
  -x "*.md" \
  -x "buildspec.yml" \
  -x "package-lock.json" \
  -x "scripts/*" \
  -x "charts/*" \
  -x "observability/*" \
  -x "jest*.ts" \
  -x ".prettierrc" \
  -x ".eslintrc.js" \
  -x "tsconfig*.json" \
  -x "nest-cli.json"

PACKAGE_SIZE=$(du -h deploy-package.zip | cut -f1)
echo "✅ Package created: deploy-package.zip ($PACKAGE_SIZE)"
echo ""

# Upload to S3
echo "Step 6: Uploading to S3..."
S3_KEY="deployments/movie-be-${VERSION_LABEL}.zip"
aws s3 cp deploy-package.zip "s3://${S3_BUCKET}/${S3_KEY}" --region "$REGION"
echo "✅ Uploaded to s3://${S3_BUCKET}/${S3_KEY}"
echo ""

# Create application version
echo "Step 7: Creating application version..."
aws elasticbeanstalk create-application-version \
  --application-name "$APP_NAME" \
  --version-label "$VERSION_LABEL" \
  --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${S3_KEY}" \
  --region "$REGION" \
  --no-auto-create-application
echo "✅ Application version created: $VERSION_LABEL"
echo ""

# Deploy to environment
echo "Step 8: Deploying to environment..."
aws elasticbeanstalk update-environment \
  --environment-name "$ENV_NAME" \
  --version-label "$VERSION_LABEL" \
  --region "$REGION"
echo "✅ Deployment initiated!"
echo ""

# Monitor deployment
echo "=========================================="
echo "Monitoring Deployment Progress"
echo "=========================================="
echo ""

for i in {1..40}; do
  sleep 15
  
  STATUS=$(aws elasticbeanstalk describe-environments \
    --environment-names "$ENV_NAME" \
    --region "$REGION" \
    --query 'Environments[0].[Status,Health]' \
    --output text)
  
  echo "[$i] $(date +%H:%M:%S) - Status: $STATUS"
  
  if [[ "$STATUS" == *"Ready"* ]]; then
    echo ""
    if [[ "$STATUS" == *"Green"* ]]; then
      echo "🎉 DEPLOYMENT SUCCESSFUL! 🎉"
      echo ""
      
      # Get environment URL
      ENV_URL=$(aws elasticbeanstalk describe-environments \
        --environment-names "$ENV_NAME" \
        --region "$REGION" \
        --query 'Environments[0].CNAME' \
        --output text)
      
      echo "Environment URL: http://$ENV_URL"
      echo ""
      echo "Test endpoints:"
      echo "  Health: http://$ENV_URL/v1/health"
      echo "  Docs:   http://$ENV_URL/docs"
      echo ""
      exit 0
    else
      echo "⚠️  Deployment completed but health is not Green"
      echo "Check logs for details"
      exit 1
    fi
  fi
  
  if [[ "$STATUS" == *"Red"* ]] || [[ "$STATUS" == *"Severe"* ]]; then
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Recent errors:"
    aws elasticbeanstalk describe-events \
      --environment-name "$ENV_NAME" \
      --region "$REGION" \
      --max-records 5 \
      --query 'Events[?Severity==`ERROR`].[EventDate,Message]' \
      --output table
    exit 1
  fi
done

echo ""
echo "⏱️  Deployment is taking longer than expected (10 minutes)"
echo "Check AWS Console for details: https://console.aws.amazon.com/elasticbeanstalk/"

