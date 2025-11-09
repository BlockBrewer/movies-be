#!/bin/bash

# Script to check AWS CLI setup and environment
# Usage: ./scripts/check-aws-setup.sh

echo "========================================"
echo "AWS CLI & Environment Check"
echo "========================================"
echo ""

# Check if AWS CLI is installed
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI is installed"
    aws --version
    echo ""
else
    echo "❌ AWS CLI is NOT installed"
    echo ""
    echo "To install:"
    echo "  macOS:  brew install awscli"
    echo "  Linux:  pip install awscli"
    echo "  Other:  https://aws.amazon.com/cli/"
    echo ""
    exit 1
fi

# Check if AWS credentials are configured
if [ -f ~/.aws/credentials ] || [ -n "$AWS_ACCESS_KEY_ID" ]; then
    echo "✅ AWS credentials appear to be configured"
else
    echo "⚠️  AWS credentials may not be configured"
    echo ""
    echo "To configure:"
    echo "  aws configure"
    echo ""
fi

# Check if user can access AWS
echo ""
echo "Testing AWS access..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ AWS access is working"
    echo ""
    echo "Current AWS Identity:"
    aws sts get-caller-identity --output table
    echo ""
else
    echo "❌ Cannot access AWS"
    echo ""
    echo "Please run: aws configure"
    echo "You'll need:"
    echo "  - AWS Access Key ID"
    echo "  - AWS Secret Access Key"
    echo "  - Default region (e.g., ap-southeast-1)"
    echo ""
    exit 1
fi

# Check if EB environment exists
echo ""
echo "Checking for Elastic Beanstalk environment..."
if aws elasticbeanstalk describe-environments --environment-names Movie-be-env &> /dev/null; then
    echo "✅ Movie-be-env environment found"
    echo ""
    echo "Environment Status:"
    aws elasticbeanstalk describe-environments \
        --environment-names Movie-be-env \
        --query 'Environments[0].[EnvironmentName,Status,Health,HealthStatus]' \
        --output table
    echo ""
else
    echo "❌ Cannot find Movie-be-env environment"
    echo ""
    echo "Make sure:"
    echo "  1. The environment name is correct"
    echo "  2. You have permissions to access Elastic Beanstalk"
    echo "  3. You're in the correct AWS region"
    echo ""
fi

echo "========================================"
echo "Setup check complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Fetch logs:    ./scripts/fetch-eb-logs.sh"
echo "  2. Abort & fix:   ./scripts/abort-and-fix.sh"
echo "  3. Deploy fix:    git add . && git commit && git push"
echo ""

