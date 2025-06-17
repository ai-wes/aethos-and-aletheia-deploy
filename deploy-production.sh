#!/bin/bash

# Complete deployment script for Aethos & Aletheia platform
set -e

# Configuration
PROJECT_ID=${1:-"your-project-id"}
REGION="us-central1"
SERVICE_ACCOUNT="aethos-backend-sa@${PROJECT_ID}.iam.gserviceaccount.com"

if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo "❌ Please provide your Google Cloud Project ID as the first argument"
    echo "Usage: $0 <PROJECT_ID>"
    exit 1
fi

echo "🚀 Deploying Aethos & Aletheia Platform to Google Cloud"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"

# Authenticate and set project
gcloud auth login
gcloud config set project $PROJECT_ID

echo "📋 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable aiplatform.googleapis.com

echo "🔐 Setting up service account..."
# Create service account if it doesn't exist
gcloud iam service-accounts create aethos-backend-sa \
    --display-name="Aethos Backend Service Account" \
    --description="Service account for Aethos & Aletheia backend" \
    2>/dev/null || true

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

echo "🏗️ Building and deploying backend..."
# Build Docker image
gcloud builds submit --tag gcr.io/$PROJECT_ID/aethos-aletheia-backend:latest \
    --file=Dockerfile.production .

echo "📝 Updating deployment configuration..."
# Update the YAML file with actual project ID
sed "s/PROJECT_ID/$PROJECT_ID/g" cloud-run-production.yaml > cloud-run-production-${PROJECT_ID}.yaml

echo "🚢 Deploying to Cloud Run..."
gcloud run services replace cloud-run-production-${PROJECT_ID}.yaml \
    --region=$REGION

# Get the backend URL
BACKEND_URL=$(gcloud run services describe aethos-aletheia-backend \
    --region=$REGION \
    --format="value(status.url)")

echo "✅ Backend deployed successfully!"
echo "🔗 Backend URL: $BACKEND_URL"

echo "🌐 Deploying frontend..."
chmod +x deploy-frontend.sh
./deploy-frontend.sh $PROJECT_ID $BACKEND_URL

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: https://storage.googleapis.com/aethos-aletheia-frontend-${PROJECT_ID}/index.html"
echo "Project ID:   $PROJECT_ID"
echo "Region:       $REGION"
echo ""
echo "🔧 Next Steps:"
echo "1. Set up secrets in Secret Manager:"
echo "   - mongodb-credentials (MongoDB connection string)"
echo "   - gemini-credentials (Gemini API key)"
echo "2. Configure custom domain with Cloud Load Balancer"
echo "3. Set up monitoring and alerting"
echo "4. Configure backup strategies"
echo ""
echo "🧪 Test your deployment:"
echo "curl $BACKEND_URL/api/health"

# Cleanup
rm -f cloud-run-production-${PROJECT_ID}.yaml