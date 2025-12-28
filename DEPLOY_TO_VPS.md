# Deploy to VPS - Complete Guide

This guide walks you through deploying the M'Cheyne Bible Reading Plan to your VPS with Caddy reverse proxy.

## Prerequisites

✅ VPS with Docker and Docker Compose installed
✅ Caddy reverse proxy already running
✅ Domain/subdomain DNS pointed to your VPS
✅ SSH access to your VPS

## Overview

Your setup:
- **Reverse Proxy:** Caddy (handles SSL automatically via Let's Encrypt)
- **Deployment:** Git clone
- **Domain:** bible.yourdomain.com (replace with your actual domain)
- **Containers:** Backend API + Frontend PWA + Internal Nginx

## Step-by-Step Deployment

### 1. Prepare Your Repository

First, push your code to GitHub/GitLab:

```bash
# On your local machine
cd C:\Users\Fred\projects\bible-reading-plan

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - M'Cheyne Bible Reading Plan"

# Create repository on GitHub/GitLab, then:
git remote add origin https://github.com/yourusername/bible-reading-plan.git
git branch -M main
git push -u origin main
```

### 2. DNS Setup

Make sure your subdomain points to your VPS:

```
Type: A Record
Name: bible (or your subdomain)
Value: YOUR_VPS_IP_ADDRESS
TTL: 300 (or default)
```

Wait a few minutes for DNS propagation. Test with:
```bash
ping bible.yourdomain.com
```

### 3. SSH into Your VPS

```bash
ssh user@your-vps-ip
```

### 4. Clone the Repository

```bash
# Choose a location (e.g., /opt or /home/user)
cd /opt
sudo git clone https://github.com/yourusername/bible-reading-plan.git
cd bible-reading-plan

# Or if using private repo:
sudo git clone https://YOUR_TOKEN@github.com/yourusername/bible-reading-plan.git
```

### 5. Update Configuration

Edit the Docker Compose file with your settings:

```bash
cd deployment
sudo nano docker-compose.prod.yml
```

If needed, adjust ports (default is 8080).

### 6. Configure Caddy

Add your domain to Caddy configuration:

**Option A: If you use a Caddyfile:**

```bash
sudo nano /etc/caddy/Caddyfile
```

Add this block (replace with your actual domain):

```
bible.yourdomain.com {
    reverse_proxy localhost:8080
    encode gzip

    header {
        Strict-Transport-Security "max-age=31536000"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
}
```

Then reload Caddy:
```bash
sudo systemctl reload caddy
```

**Option B: If you use Caddy API (programmatic config):**

```bash
curl -X POST "http://localhost:2019/config/" \
  -H "Content-Type: application/json" \
  -d '{
    "apps": {
      "http": {
        "servers": {
          "bible": {
            "listen": [":443"],
            "routes": [{
              "match": [{
                "host": ["bible.yourdomain.com"]
              }],
              "handle": [{
                "handler": "reverse_proxy",
                "upstreams": [{"dial": "localhost:8080"}]
              }]
            }]
          }
        }
      }
    }
  }'
```

**Option C: Using Caddy Docker labels (if Caddy runs in Docker):**

Add labels to docker-compose.prod.yml:
```yaml
frontend:
  labels:
    caddy: bible.yourdomain.com
    caddy.reverse_proxy: "{{upstreams 8080}}"
```

### 7. Build and Start the Containers

```bash
cd /opt/bible-reading-plan/deployment

# Build the containers
sudo docker-compose -f docker-compose.prod.yml build

# Start the services
sudo docker-compose -f docker-compose.prod.yml up -d
```

### 8. Verify Deployment

Check that containers are running:

```bash
sudo docker-compose -f docker-compose.prod.yml ps
```

You should see all containers running and healthy.

Check logs:
```bash
# Backend logs
sudo docker logs bible-reading-backend

# Frontend logs
sudo docker logs bible-reading-frontend

# Nginx logs
sudo docker logs bible-reading-nginx
```

### 9. Test the Application

**Local test (on VPS):**
```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/plans
```

**Public test:**

Open your browser and visit:
```
https://bible.yourdomain.com
```

Caddy will automatically:
- Get Let's Encrypt SSL certificate
- Redirect HTTP to HTTPS
- Handle SSL termination

### 10. Verify SSL

Check that HTTPS is working:

```bash
curl -I https://bible.yourdomain.com
```

You should see:
- HTTP/2 200
- Valid SSL certificate from Let's Encrypt

## Testing Checklist

After deployment, test these features:

- [ ] App loads at https://bible.yourdomain.com
- [ ] HTTPS (green lock) is working
- [ ] Dark mode auto-detects and works
- [ ] Can switch between reading plans
- [ ] Plan selection is remembered
- [ ] Can click "Read" to open passages in CSB
- [ ] Can mark readings as complete
- [ ] Works on mobile device
- [ ] PWA install prompt appears (mobile)

## Updating the App

When you make changes:

```bash
# On your local machine
cd C:\Users\Fred\projects\bible-reading-plan
git add .
git commit -m "Description of changes"
git push

# On your VPS
cd /opt/bible-reading-plan
sudo git pull
cd deployment
sudo docker-compose -f docker-compose.prod.yml build
sudo docker-compose -f docker-compose.prod.yml up -d
```

Or use the update script (see below).

## Useful Commands

### View Logs
```bash
cd /opt/bible-reading-plan/deployment

# All logs
sudo docker-compose -f docker-compose.prod.yml logs -f

# Specific service
sudo docker-compose -f docker-compose.prod.yml logs -f backend
sudo docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Services
```bash
cd /opt/bible-reading-plan/deployment

# Restart all
sudo docker-compose -f docker-compose.prod.yml restart

# Restart specific service
sudo docker-compose -f docker-compose.prod.yml restart backend
```

### Stop Services
```bash
cd /opt/bible-reading-plan/deployment
sudo docker-compose -f docker-compose.prod.yml down
```

### Check Container Health
```bash
sudo docker ps
sudo docker stats
```

## Automated Update Script

Create an update script for easy deployments:

```bash
sudo nano /opt/bible-reading-plan/update.sh
```

Add this content:

```bash
#!/bin/bash
set -e

echo "Updating M'Cheyne Bible Reading Plan..."

cd /opt/bible-reading-plan

echo "Pulling latest code..."
git pull

echo "Rebuilding containers..."
cd deployment
docker-compose -f docker-compose.prod.yml build

echo "Restarting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "Checking status..."
docker-compose -f docker-compose.prod.yml ps

echo "Update complete!"
echo "Visit https://bible.yourdomain.com to verify"
```

Make it executable:
```bash
sudo chmod +x /opt/bible-reading-plan/update.sh
```

Use it:
```bash
sudo /opt/bible-reading-plan/update.sh
```

## Monitoring

### Check if app is running
```bash
curl -f http://localhost:8080/health && echo "✓ Backend is healthy"
curl -f http://localhost:8080/ && echo "✓ Frontend is serving"
```

### Check Caddy
```bash
sudo systemctl status caddy
sudo journalctl -u caddy -f
```

### Check SSL expiry
```bash
echo | openssl s_client -servername bible.yourdomain.com -connect bible.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

Caddy renews automatically, but good to check!

## Troubleshooting

### App not loading

1. Check containers are running:
   ```bash
   sudo docker ps
   ```

2. Check logs:
   ```bash
   sudo docker logs bible-reading-backend
   sudo docker logs bible-reading-frontend
   ```

3. Test locally:
   ```bash
   curl http://localhost:8080/health
   ```

4. Check Caddy:
   ```bash
   sudo systemctl status caddy
   ```

### SSL not working

1. Verify DNS is correct:
   ```bash
   nslookup bible.yourdomain.com
   ```

2. Check Caddy logs:
   ```bash
   sudo journalctl -u caddy -f
   ```

3. Verify port 443 is open:
   ```bash
   sudo netstat -tulpn | grep :443
   ```

4. Check firewall:
   ```bash
   sudo ufw status
   # If needed:
   sudo ufw allow 443/tcp
   ```

### Changes not appearing

1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if you rebuilt containers:
   ```bash
   sudo docker-compose -f docker-compose.prod.yml build
   ```

### Backend API errors

Check backend logs:
```bash
sudo docker logs bible-reading-backend -f
```

Verify data file exists:
```bash
sudo docker exec bible-reading-backend ls -l /app/data/reading_plan.json
```

### Port conflicts

If port 8080 is in use:

1. Edit docker-compose.prod.yml
2. Change port mapping: `"8080:80"` → `"8081:80"`
3. Update Caddy config to use 8081
4. Restart services

## Security Best Practices

1. **Keep Docker updated**
   ```bash
   sudo apt update && sudo apt upgrade docker-ce docker-compose-plugin
   ```

2. **Monitor logs regularly**
   ```bash
   sudo docker-compose -f docker-compose.prod.yml logs --tail=100
   ```

3. **Use firewall**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp  # SSH
   sudo ufw enable
   ```

4. **Regular backups**
   ```bash
   # Backup the data
   sudo tar -czf bible-reading-backup-$(date +%Y%m%d).tar.gz /opt/bible-reading-plan/data
   ```

5. **Monitor SSL certificate renewal**
   Caddy auto-renews, but check:
   ```bash
   sudo journalctl -u caddy | grep -i renew
   ```

## Performance Tuning

### For high traffic:

1. **Scale backend containers**
   ```yaml
   # In docker-compose.prod.yml
   backend:
     deploy:
       replicas: 3
   ```

2. **Add Redis caching** (future enhancement)

3. **Use CDN** for static assets

## Backup and Restore

### Backup
```bash
# Backup everything
sudo tar -czf bible-reading-full-backup.tar.gz /opt/bible-reading-plan

# Backup just data
sudo tar -czf bible-reading-data.tar.gz /opt/bible-reading-plan/data
```

### Restore
```bash
sudo tar -xzf bible-reading-full-backup.tar.gz -C /
cd /opt/bible-reading-plan/deployment
sudo docker-compose -f docker-compose.prod.yml up -d
```

## Support

If you encounter issues:

1. Check logs first
2. Verify DNS and SSL
3. Test locally with curl
4. Check Caddy configuration
5. Review Docker container health

---

## Quick Reference

**Deploy:**
```bash
cd /opt/bible-reading-plan/deployment
sudo docker-compose -f docker-compose.prod.yml up -d
```

**Update:**
```bash
sudo /opt/bible-reading-plan/update.sh
```

**Logs:**
```bash
sudo docker-compose -f docker-compose.prod.yml logs -f
```

**Restart:**
```bash
sudo docker-compose -f docker-compose.prod.yml restart
```

**Stop:**
```bash
sudo docker-compose -f docker-compose.prod.yml down
```

**Your App URL:**
```
https://bible.yourdomain.com
```

---

**Happy Deploying! 🚀**

May your beta testers be blessed by this tool!
