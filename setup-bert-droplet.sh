#!/bin/bash

# Setup script for Digital Ocean Droplet
# Run this on a fresh Ubuntu droplet

echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Creating app directory..."
mkdir -p ~/bert-api
cd ~/bert-api

echo "Creating necessary files..."
# You'll need to copy bert_api.py and Dockerfile.bert to this directory

echo "Creating systemd service..."
sudo tee /etc/systemd/system/bert-api.service > /dev/null <<EOL
[Unit]
Description=BERT Embeddings API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$USER/bert-api
ExecStart=/usr/bin/docker run -d --name bert-api -p 5001:5001 --restart unless-stopped bert-api:latest
ExecStop=/usr/bin/docker stop bert-api
ExecStopPost=/usr/bin/docker rm bert-api

[Install]
WantedBy=multi-user.target
EOL

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy bert_api.py and Dockerfile.bert to ~/bert-api/"
echo "2. Build the Docker image: cd ~/bert-api && docker build -f Dockerfile.bert -t bert-api:latest ."
echo "3. Start the service: sudo systemctl start bert-api"
echo "4. Enable auto-start: sudo systemctl enable bert-api"
echo "5. Check status: sudo systemctl status bert-api"
echo ""
echo "Your BERT API will be available at http://YOUR_DROPLET_IP:5001"