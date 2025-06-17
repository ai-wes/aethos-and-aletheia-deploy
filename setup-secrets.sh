#!/bin/bash

# Script to set up Google Cloud Secret Manager secrets
set -e

PROJECT_ID=${1:-"your-project-id"}

if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo "❌ Please provide your Google Cloud Project ID as the first argument"
    echo "Usage: $0 <PROJECT_ID>"
    exit 1
fi

echo "🔐 Setting up secrets for project: $PROJECT_ID"

# Set the project
gcloud config set project $PROJECT_ID

# Function to create secret if it doesn't exist
create_secret() {
    local secret_name=$1
    local description=$2
    
    if ! gcloud secrets describe $secret_name &>/dev/null; then
        echo "Creating secret: $secret_name"
        gcloud secrets create $secret_name --data-file=- <<< "PLACEHOLDER_VALUE"
        gcloud secrets describe $secret_name --format="table(name,createTime)"
        echo "⚠️  Please update the secret value manually:"
        echo "   gcloud secrets versions add $secret_name --data-file=-"
    else
        echo "✅ Secret $secret_name already exists"
    fi
}

echo "📝 Creating required secrets..."

# MongoDB connection string
create_secret "mongodb-credentials" "MongoDB Atlas connection string"

# Gemini API key
create_secret "gemini-credentials" "Google Gemini API key"

# Optional: JWT secret for session management
create_secret "jwt-secret" "JWT secret key for session management"

echo ""
echo "🔧 Manual setup required:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. MongoDB connection string:"
echo "   echo 'mongodb+srv://username:password@cluster.mongodb.net/database' | gcloud secrets versions add mongodb-credentials --data-file=-"
echo ""
echo "2. Gemini API key:"
echo "   echo 'your-gemini-api-key' | gcloud secrets versions add gemini-credentials --data-file=-"
echo ""
echo "3. JWT secret (optional):"
echo "   echo 'your-jwt-secret-key' | gcloud secrets versions add jwt-secret --data-file=-"
echo ""
echo "📋 To view existing secrets:"
echo "   gcloud secrets list"
echo ""
echo "🔍 To view secret versions:"
echo "   gcloud secrets versions list mongodb-credentials"