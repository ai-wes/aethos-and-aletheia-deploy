#!/bin/bash

# SophiaGuard Deployment Script
# This script helps deploy the SophiaGuard application to Google Cloud

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi

    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed."
        exit 1
    fi

    print_success "All dependencies are installed."
}

# Function to set up Google Cloud project
setup_gcloud() {
    print_status "Setting up Google Cloud configuration..."

    # Check if logged in
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 &> /dev/null; then
        print_status "Logging into Google Cloud..."
        gcloud auth login
    fi

    # Set project if provided
    if [ ! -z "$1" ]; then
        print_status "Setting project to $1..."
        gcloud config set project "$1"
        export GOOGLE_CLOUD_PROJECT="$1"
    fi

    # Enable required APIs
    print_status "Enabling required Google Cloud APIs..."
    gcloud services enable aiplatform.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable appengine.googleapis.com
    gcloud services enable cloudbuild.googleapis.com

    print_success "Google Cloud setup complete."
}

# Function to deploy to Cloud Run
deploy_cloud_run() {
    print_status "Deploying to Google Cloud Run..."

    # Build and deploy
    gcloud run deploy sophiaguard \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --set-env-vars="GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}" \
        --set-env-vars="GOOGLE_CLOUD_LOCATION=us-central1" \
        --set-env-vars="MONGODB_URI=${MONGODB_URI:-}" \
        --memory 2Gi \
        --cpu 1 \
        --timeout 3600 \
        --max-instances 10 \
        --min-instances 1

    print_success "Deployed to Cloud Run successfully!"

    # Get the URL
    SERVICE_URL=$(gcloud run services describe sophiaguard --region=us-central1 --format="value(status.url)")
    print_success "Application URL: $SERVICE_URL"
}

# Function to deploy to App Engine
deploy_app_engine() {
    print_status "Deploying to Google App Engine..."

    # Check if app.yaml exists and has correct project
    if [ -f "app.yaml" ]; then
        # Update project ID in app.yaml
        if [ ! -z "$GOOGLE_CLOUD_PROJECT" ]; then
            sed -i.bak "s/your-project-id/$GOOGLE_CLOUD_PROJECT/g" app.yaml
        fi

        # Deploy
        gcloud app deploy app.yaml --quiet

        print_success "Deployed to App Engine successfully!"

        # Get the URL
        APP_URL=$(gcloud app browse --no-launch-browser 2>&1 | grep -o 'https://[^[:space:]]*')
        print_success "Application URL: $APP_URL"
    else
        print_error "app.yaml not found. Cannot deploy to App Engine."
        exit 1
    fi
}

# Function to set up data ingestion
setup_data_ingestion() {
    print_status "Setting up data ingestion..."

    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip3 install -r requirements.txt
    fi

    # Set up vector search index
    print_status "Setting up MongoDB Atlas Vector Search index..."
    python3 data_ingestion.py --setup-index

    # Ingest sample data
    print_warning "To ingest sample philosophical texts, run:"
    print_warning "python3 data_ingestion.py --ingest-sample"

    print_success "Data ingestion setup complete."
}

# Function to run locally
run_local() {
    print_status "Running SophiaGuard locally..."

    # Install dependencies
    if [ -f "requirements.txt" ]; then
        print_status "Installing dependencies..."
        pip3 install -r requirements.txt
    fi

    # Set default environment variables
    export GOOGLE_CLOUD_PROJECT="${GOOGLE_CLOUD_PROJECT:-your-project-id}"
    export GOOGLE_CLOUD_LOCATION="${GOOGLE_CLOUD_LOCATION:-us-central1}"
    export PORT="${PORT:-8080}"

    # Run the application
    print_status "Starting Flask application on port $PORT..."
    python3 app.py
}

# Function to show help
show_help() {
    echo "SophiaGuard Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup PROJECT_ID           Set up Google Cloud project and enable APIs"
    echo "  deploy-run                  Deploy to Google Cloud Run"
    echo "  deploy-appengine           Deploy to Google App Engine"
    echo "  setup-data                 Set up data ingestion and MongoDB index"
    echo "  run-local                  Run the application locally"
    echo "  help                       Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  GOOGLE_CLOUD_PROJECT       Google Cloud project ID"
    echo "  MONGODB_URI                MongoDB Atlas connection string"
    echo "  GOOGLE_CLOUD_LOCATION      Google Cloud region (default: us-central1)"
    echo ""
    echo "Examples:"
    echo "  $0 setup my-project-id"
    echo "  $0 deploy-run"
    echo "  $0 setup-data"
    echo "  $0 run-local"
}

# Main script logic
main() {
    case "$1" in
        "setup")
            check_dependencies
            setup_gcloud "$2"
            ;;
        "deploy-run")
            check_dependencies
            deploy_cloud_run
            ;;
        "deploy-appengine")
            check_dependencies
            deploy_app_engine
            ;;
        "setup-data")
            setup_data_ingestion
            ;;
        "run-local")
            run_local
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

# Run main function with all arguments
main "$@"