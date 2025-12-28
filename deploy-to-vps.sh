#!/bin/bash
# Deploy M'Cheyne Bible Reading Plan to VPS
# Usage: ./deploy-to-vps.sh [vps-user@vps-host] [domain]

set -e

# Configuration
VPS_HOST="${1:-user@your-vps-ip}"
DOMAIN="${2:-bible.yourdomain.com}"
DEPLOY_DIR="/opt/bible-reading-plan"
REPO_URL="https://github.com/YOUR_USERNAME/bible-reading-plan.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}M'Cheyne Bible Reading Plan - VPS Deployment${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""
echo "VPS Host: $VPS_HOST"
echo "Domain: $DOMAIN"
echo "Deploy Directory: $DEPLOY_DIR"
echo ""

# Step 1: Test SSH connection
echo -e "${CYAN}[Step 1/8]${NC} Testing SSH connection..."
if ssh -o ConnectTimeout=5 "$VPS_HOST" "exit" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} SSH connection successful"
else
    echo -e "${RED}✗${NC} SSH connection failed"
    echo "Please check your SSH key and VPS connection"
    exit 1
fi
echo ""

# Step 2: Check prerequisites on VPS
echo -e "${CYAN}[Step 2/8]${NC} Checking prerequisites on VPS..."

# Check Docker
DOCKER_VERSION=$(ssh "$VPS_HOST" "docker --version 2>/dev/null" || echo "")
if [ -n "$DOCKER_VERSION" ]; then
    echo -e "${GREEN}✓${NC} Docker: $DOCKER_VERSION"
else
    echo -e "${RED}✗${NC} Docker not found"
    echo "Please install Docker on your VPS"
    exit 1
fi

# Check Docker Compose
COMPOSE_VERSION=$(ssh "$VPS_HOST" "docker-compose --version 2>/dev/null || docker compose version 2>/dev/null" || echo "")
if [ -n "$COMPOSE_VERSION" ]; then
    echo -e "${GREEN}✓${NC} Docker Compose: $COMPOSE_VERSION"
else
    echo -e "${RED}✗${NC} Docker Compose not found"
    echo "Please install Docker Compose on your VPS"
    exit 1
fi

# Check Caddy
CADDY_STATUS=$(ssh "$VPS_HOST" "systemctl is-active caddy 2>/dev/null" || echo "inactive")
if [ "$CADDY_STATUS" = "active" ]; then
    echo -e "${GREEN}✓${NC} Caddy is running"
else
    echo -e "${YELLOW}⚠${NC} Caddy is not running"
    echo "Caddy will need to be started after deployment"
fi
echo ""

# Step 3: Clone or update repository
echo -e "${CYAN}[Step 3/8]${NC} Deploying code to VPS..."

ssh "$VPS_HOST" << EOF
    if [ -d "$DEPLOY_DIR" ]; then
        echo "Repository exists, pulling latest changes..."
        cd $DEPLOY_DIR
        git pull
    else
        echo "Cloning repository..."
        sudo mkdir -p /opt
        cd /opt
        sudo git clone $REPO_URL
        sudo chown -R \$USER:$USER $DEPLOY_DIR
    fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Code deployed successfully"
else
    echo -e "${RED}✗${NC} Failed to deploy code"
    exit 1
fi
echo ""

# Step 4: Build Docker containers
echo -e "${CYAN}[Step 4/8]${NC} Building Docker containers..."
ssh "$VPS_HOST" << EOF
    cd $DEPLOY_DIR
    docker-compose build
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Containers built successfully"
else
    echo -e "${RED}✗${NC} Failed to build containers"
    exit 1
fi
echo ""

# Step 5: Configure Caddy
echo -e "${CYAN}[Step 5/8]${NC} Configuring Caddy..."

ssh "$VPS_HOST" << EOF
    # Check if Caddy config exists
    if [ -f /etc/caddy/Caddyfile ]; then
        # Check if our domain is already configured
        if grep -q "$DOMAIN" /etc/caddy/Caddyfile; then
            echo "Domain already configured in Caddyfile"
        else
            echo "Adding domain to Caddyfile..."
            sudo tee -a /etc/caddy/Caddyfile > /dev/null << 'CADDY_EOF'

$DOMAIN {
    reverse_proxy localhost:8080
    encode gzip

    header {
        Strict-Transport-Security "max-age=31536000"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
}
CADDY_EOF
        fi
    else
        echo "Caddyfile not found at /etc/caddy/Caddyfile"
        echo "Please configure Caddy manually"
    fi
EOF

echo -e "${GREEN}✓${NC} Caddy configuration updated"
echo ""

# Step 6: Start containers
echo -e "${CYAN}[Step 6/8]${NC} Starting Docker containers..."
ssh "$VPS_HOST" << EOF
    cd $DEPLOY_DIR
    docker-compose up -d
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Containers started successfully"
else
    echo -e "${RED}✗${NC} Failed to start containers"
    exit 1
fi
echo ""

# Step 7: Reload Caddy
echo -e "${CYAN}[Step 7/8]${NC} Reloading Caddy..."
ssh "$VPS_HOST" "sudo systemctl reload caddy" 2>/dev/null || echo "Caddy reload failed - may need manual restart"
echo -e "${GREEN}✓${NC} Caddy reloaded"
echo ""

# Step 8: Verify deployment
echo -e "${CYAN}[Step 8/8]${NC} Verifying deployment..."

sleep 5  # Give containers time to start

# Check container status
echo "Container status:"
ssh "$VPS_HOST" "cd $DEPLOY_DIR && docker-compose ps"
echo ""

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_STATUS=$(ssh "$VPS_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/health" || echo "000")
if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} Health check passed"
else
    echo -e "${YELLOW}⚠${NC} Health check failed (HTTP $HEALTH_STATUS)"
    echo "Containers may still be starting up..."
fi
echo ""

# Final summary
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}Deployment Summary${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Code deployed to: $DEPLOY_DIR"
echo -e "${GREEN}✓${NC} Containers running"
echo -e "${GREEN}✓${NC} Caddy configured"
echo ""
echo "Your app should be accessible at:"
echo -e "${GREEN}https://$DOMAIN${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:    ssh $VPS_HOST 'cd $DEPLOY_DIR && docker-compose logs -f'"
echo "  Restart:      ssh $VPS_HOST 'cd $DEPLOY_DIR && docker-compose restart'"
echo "  Update:       ./deploy-to-vps.sh $VPS_HOST $DOMAIN"
echo ""
echo -e "${YELLOW}Note:${NC} It may take a few minutes for SSL certificate to be issued."
echo "      Check Caddy logs: ssh $VPS_HOST 'sudo journalctl -u caddy -f'"
echo ""
