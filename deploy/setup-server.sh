#!/bin/bash
set -e

echo "=== Setup VPS for Next.js ==="

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot (SSL)
apt install -y certbot python3-certbot-nginx

# Create app directory
mkdir -p /var/www/travel
chown -R $USER:$USER /var/www/travel

echo "=== Server ready ==="
echo "Next: upload your project to /var/www/travel and run the deploy script"
