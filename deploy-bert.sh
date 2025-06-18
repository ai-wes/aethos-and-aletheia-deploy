#!/bin/bash

# Deployment script for BERT API to Digital Ocean Droplet or any container service

echo "Building BERT API Docker image..."
docker build -f Dockerfile.bert -t bert-api:latest .

# Option 1: Run locally for testing
if [ "$1" == "local" ]; then
    echo "Running BERT API locally..."
    docker run -d -p 5001:5001 --name bert-api bert-api:latest
    echo "BERT API is running at http://localhost:5001"
    echo "Test with: curl http://localhost:5001/health"
    exit 0
fi

# Option 2: Save image for deployment
if [ "$1" == "save" ]; then
    echo "Saving Docker image..."
    docker save bert-api:latest | gzip > bert-api.tar.gz
    echo "Docker image saved to bert-api.tar.gz"
    echo "Transfer this file to your server and load with: docker load < bert-api.tar.gz"
    exit 0
fi

# Option 3: Push to Docker Hub (requires login)
if [ "$1" == "push" ]; then
    if [ -z "$2" ]; then
        echo "Usage: ./deploy-bert.sh push <dockerhub-username>"
        exit 1
    fi
    DOCKER_USER=$2
    echo "Tagging image for Docker Hub..."
    docker tag bert-api:latest $DOCKER_USER/bert-api:latest
    echo "Pushing to Docker Hub..."
    docker push $DOCKER_USER/bert-api:latest
    echo "Image pushed to Docker Hub as $DOCKER_USER/bert-api:latest"
    exit 0
fi

echo "Usage:"
echo "  ./deploy-bert.sh local    - Run locally for testing"
echo "  ./deploy-bert.sh save     - Save image to file for transfer"
echo "  ./deploy-bert.sh push <username> - Push to Docker Hub"