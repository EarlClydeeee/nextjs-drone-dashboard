#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# deploy-s3.sh  —  Build the static export and sync to S3 + CloudFront
#
# Usage:
#   chmod +x deploy-s3.sh
#   ./deploy-s3.sh
#
# Prerequisites:
#   - AWS CLI v2 configured (aws configure)
#   - Set the three variables below
# ---------------------------------------------------------------------------
set -euo pipefail

BUCKET_NAME="your-s3-bucket-name"          # e.g. uav-dashboard-prod
CLOUDFRONT_DISTRIBUTION_ID="EXXXXXXXXXXXX" # leave blank to skip invalidation
REGION="ap-southeast-1"                    # change to your region

echo "▶  Building static export…"
npm run build

echo "▶  Syncing out/ → s3://${BUCKET_NAME}/"
aws s3 sync out/ "s3://${BUCKET_NAME}/" \
  --region "${REGION}" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# HTML and JSON files should NOT be cached aggressively so updates are instant
aws s3 sync out/ "s3://${BUCKET_NAME}/" \
  --region "${REGION}" \
  --delete \
  --cache-control "public,max-age=0,must-revalidate" \
  --include "*.html" \
  --include "*.json"

if [ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ] && [ "${CLOUDFRONT_DISTRIBUTION_ID}" != "EXXXXXXXXXXXX" ]; then
  echo "▶  Invalidating CloudFront distribution ${CLOUDFRONT_DISTRIBUTION_ID}…"
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" \
    --paths "/*"
fi

echo "✅  Deploy complete → https://${BUCKET_NAME}.s3-website-${REGION}.amazonaws.com"
