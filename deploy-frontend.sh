#!/bin/bash

# Frontend deployment script for Google Cloud Storage + CDN
set -e

PROJECT_ID=${1:-"your-project-id"}
BUCKET_NAME="aethos-aletheia-frontend-${PROJECT_ID}"
BACKEND_URL=${2:-"https://aethos-aletheia-backend-123456789-uc.a.run.app"}

echo "🚀 Deploying Aethos & Aletheia Frontend to Google Cloud"
echo "Project ID: $PROJECT_ID"
echo "Bucket: $BUCKET_NAME"
echo "Backend URL: $BACKEND_URL"

# Navigate to frontend directory
cd aethos_aletheia_ui

# Set environment variables for build
export REACT_APP_API_URL=$BACKEND_URL
export GENERATE_SOURCEMAP=false
export CI=false

echo "📦 Installing dependencies..."
npm ci --production

echo "🔨 Building frontend..."
npm run build

echo "☁️ Setting up Google Cloud Storage bucket..."
# Create bucket if it doesn't exist
gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://$BUCKET_NAME/ 2>/dev/null || true

# Set bucket for website hosting
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME/

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME/

echo "📤 Uploading build files..."
# Upload with optimized caching headers
gsutil -m rsync -r -d -x ".*\.map$" build/ gs://$BUCKET_NAME/

# Set cache headers for different file types
echo "🔧 Setting cache headers..."

# Static assets (versioned) - 1 year cache
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000, immutable" \
  gs://$BUCKET_NAME/static/**

# HTML files - no cache (for updates)
gsutil -m setmeta -h "Cache-Control:no-cache, no-store, must-revalidate" \
  gs://$BUCKET_NAME/index.html

# Other assets - 1 hour cache
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" \
  gs://$BUCKET_NAME/manifest.json
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" \
  gs://$BUCKET_NAME/robots.txt

echo "🌐 Setting up Cloud CDN..."
# Note: You'll need to manually set up Load Balancer + CDN in console
# or use terraform for full automation

echo "✅ Frontend deployed successfully!"
echo "🔗 Website URL: https://storage.googleapis.com/$BUCKET_NAME/index.html"
echo ""
echo "Next steps:"
echo "1. Set up Cloud Load Balancer + CDN for custom domain"
echo "2. Configure SSL certificate"
echo "3. Update DNS to point to load balancer IP"

cd ..