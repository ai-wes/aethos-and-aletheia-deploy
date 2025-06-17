#!/bin/bash

# Aethos & Aletheia Scenario Exporter - Cloud Run Deployment Script
# Google Cloud-Native deployment for MongoDB Atlas → Vertex AI pipeline

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT}
REGION=${GOOGLE_CLOUD_REGION:-"us-central1"}
SERVICE_NAME="aethos-aletheia-exporter"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
GCS_BUCKET="${GCS_BUCKET_NAME:-aethos-datasets}"
SERVICE_ACCOUNT="${SERVICE_NAME}-sa@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🚀 Deploying Aethos & Aletheia Scenario Exporter to Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "Service: ${SERVICE_NAME}"

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: GOOGLE_CLOUD_PROJECT environment variable is not set"
    exit 1
fi

if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI environment variable is not set"
    exit 1
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: GEMINI_API_KEY environment variable is not set"
    exit 1
fi

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Create GCS bucket if it doesn't exist
echo "📦 Creating GCS bucket: ${GCS_BUCKET}"
gsutil mb -p ${PROJECT_ID} -c STANDARD -l ${REGION} gs://${GCS_BUCKET} || echo "Bucket already exists"

# Create service account if it doesn't exist
echo "🔐 Creating service account: ${SERVICE_ACCOUNT}"
gcloud iam service-accounts create ${SERVICE_NAME}-sa \
    --display-name="Aethos Aletheia Scenario Exporter" \
    --description="Service account for Aethos & Aletheia Scenario Exporter" || echo "Service account already exists"

# Grant necessary IAM roles
echo "🛡️ Granting IAM roles to service account..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/logging.logWriter"

# Create secrets for MongoDB and Gemini credentials
echo "🔑 Creating secrets in Secret Manager..."
echo -n "$MONGODB_URI" | gcloud secrets create mongodb-credentials --data-file=- || \
    echo -n "$MONGODB_URI" | gcloud secrets versions add mongodb-credentials --data-file=-

echo -n "$GEMINI_API_KEY" | gcloud secrets create gemini-credentials --data-file=- || \
    echo -n "$GEMINI_API_KEY" | gcloud secrets versions add gemini-credentials --data-file=-

# Grant secret access to service account
gcloud secrets add-iam-policy-binding mongodb-credentials \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding gemini-credentials \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

# Build and push Docker image
echo "🐳 Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME} .

# Update Cloud Run deployment configuration
echo "⚙️ Updating deployment configuration..."
sed -i.bak "s/PROJECT_ID/${PROJECT_ID}/g" cloud-run-deploy.yaml
rm cloud-run-deploy.yaml.bak

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run services replace cloud-run-deploy.yaml \
    --region=${REGION}

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
gcloud run services wait ${SERVICE_NAME} --region=${REGION}

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.url)")

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Service Information:"
echo "   Service URL: ${SERVICE_URL}"
echo "   Export Endpoint: ${SERVICE_URL}/api/export"
echo "   Health Check: ${SERVICE_URL}/api/health"
echo "   Supported Formats: ${SERVICE_URL}/api/export/formats"
echo ""
echo "🔧 Example Usage:"
echo "curl -X POST ${SERVICE_URL}/api/export \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"format\": \"vertex_sft_basic\","
echo "    \"gcs_prefix\": \"gs://${GCS_BUCKET}/exports\","
echo "    \"filter\": {\"constitution_version\": 1},"
echo "    \"split\": {\"train\": 0.9, \"val\": 0.1},"
echo "    \"autotune\": false"
echo "  }'"
echo ""
echo "💡 To enable autotuning, set 'autotune': true in the request"
echo "📚 View logs: gcloud logs read /projects/${PROJECT_ID}/logs/run.googleapis.com%2Frequests --limit=50"

# Test the deployment
echo "🧪 Testing deployment..."
curl -f "${SERVICE_URL}/api/health" > /dev/null 2>&1 && echo "✅ Health check passed" || echo "❌ Health check failed"
curl -f "${SERVICE_URL}/api/export/formats" > /dev/null 2>&1 && echo "✅ Export formats endpoint accessible" || echo "❌ Export formats endpoint failed"

echo ""
echo "🎉 Aethos & Aletheia Scenario Exporter deployed successfully!"
echo "🔗 MongoDB Atlas → Vertex AI pipeline is ready for use"