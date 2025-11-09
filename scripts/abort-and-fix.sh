#!/bin/bash

# Script to abort current deployment and prepare for new deployment
# Usage: ./scripts/abort-and-fix.sh

set -e

ENV_NAME="Movie-be-env"
APP_NAME="movie-be"

echo "========================================="
echo "Step 1: Checking current environment status"
echo "========================================="

STATUS=$(aws elasticbeanstalk describe-environments \
  --environment-names "$ENV_NAME" \
  --query 'Environments[0].Status' \
  --output text)

HEALTH=$(aws elasticbeanstalk describe-environments \
  --environment-names "$ENV_NAME" \
  --query 'Environments[0].Health' \
  --output text)

echo "Current Status: $STATUS"
echo "Current Health: $HEALTH"

if [ "$STATUS" == "Updating" ]; then
  echo ""
  echo "========================================="
  echo "Step 2: Aborting current deployment"
  echo "========================================="
  
  aws elasticbeanstalk abort-environment-update \
    --environment-name "$ENV_NAME"
  
  echo "Abort request sent. Waiting for environment to stabilize..."
  
  for i in {1..20}; do
    sleep 15
    CURRENT_STATUS=$(aws elasticbeanstalk describe-environments \
      --environment-names "$ENV_NAME" \
      --query 'Environments[0].Status' \
      --output text)
    
    echo "Attempt $i: Status = $CURRENT_STATUS"
    
    if [ "$CURRENT_STATUS" == "Ready" ]; then
      echo "Environment is ready!"
      break
    fi
  done
else
  echo "Environment is not updating. Status: $STATUS"
fi

echo ""
echo "========================================="
echo "Step 3: Fetching recent logs and events"
echo "========================================="

# Get recent events
aws elasticbeanstalk describe-events \
  --environment-name "$ENV_NAME" \
  --max-records 20 \
  --query 'Events[*].[EventDate,Severity,Message]' \
  --output table

echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo "1. Review the events above to understand what failed"
echo "2. Commit the new EB configuration files:"
echo "   git add ."
echo "   git commit -m 'fix: Add Elastic Beanstalk configuration'"
echo "   git push origin main"
echo ""
echo "3. Monitor deployment:"
echo "   make eb-logs"
echo ""
echo "4. Or use AWS EB CLI:"
echo "   eb logs $ENV_NAME --stream"
echo ""
echo "========================================="

