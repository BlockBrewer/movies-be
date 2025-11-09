#!/bin/bash

# Script to fetch Elastic Beanstalk logs
# Usage: ./scripts/fetch-eb-logs.sh

ENV_NAME="Movie-be-env"
OUTPUT_DIR="eb-logs"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Fetching logs for environment: $ENV_NAME"

# Request logs
aws elasticbeanstalk request-environment-info \
  --environment-name "$ENV_NAME" \
  --info-type tail

echo "Waiting for logs to be generated..."
sleep 10

# Retrieve logs
LOGS=$(aws elasticbeanstalk retrieve-environment-info \
  --environment-name "$ENV_NAME" \
  --info-type tail \
  --query 'EnvironmentInfo[*].[SampleTimestamp,Message]' \
  --output text)

if [ -z "$LOGS" ]; then
  echo "No logs available yet. Trying bundle logs..."
  
  aws elasticbeanstalk request-environment-info \
    --environment-name "$ENV_NAME" \
    --info-type bundle
  
  sleep 15
  
  LOG_URL=$(aws elasticbeanstalk retrieve-environment-info \
    --environment-name "$ENV_NAME" \
    --info-type bundle \
    --query 'EnvironmentInfo[0].Message' \
    --output text)
  
  if [ "$LOG_URL" != "None" ] && [ -n "$LOG_URL" ]; then
    echo "Downloading full log bundle from: $LOG_URL"
    curl -o "$OUTPUT_DIR/full-logs.zip" "$LOG_URL"
    echo "Logs saved to $OUTPUT_DIR/full-logs.zip"
  else
    echo "Unable to retrieve logs. Environment may be in a transitional state."
  fi
else
  echo "$LOGS" > "$OUTPUT_DIR/tail-logs.txt"
  echo "Logs saved to $OUTPUT_DIR/tail-logs.txt"
  echo ""
  echo "Recent logs:"
  echo "$LOGS"
fi

# Also check recent events
echo ""
echo "Recent events:"
aws elasticbeanstalk describe-events \
  --environment-name "$ENV_NAME" \
  --max-records 20 \
  --query 'Events[*].[EventDate,Severity,Message]' \
  --output table

