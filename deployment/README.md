# Deployment Guide

This guide will help you deploy the M'Cheyne Bible Reading Plan to your VPS.

## Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name pointed to your VPS
- SSH access to your VPS

## Quick Start

### 1. Prepare Data

First, convert your Excel file to JSON:

```bash
cd data
pip install -r requirements.txt
python convert_excel_to_json.py
```

This creates `reading_plan.json` which contains all three plans.

### 2. Configure Environment

Edit `docker-compose.yml` and `nginx.conf`:

- Replace `yourdomain.com` with your actual domain
- Update API URLs as needed

### 3. Deploy to VPS

#### Option A: Manual Deployment

Copy files to your VPS:

```bash
scp -r bible-reading-plan user@your-vps-ip:/home/user/
```

SSH into your VPS and run:

```bash
cd /home/user/bible-reading-plan/deployment
docker-compose up -d
```

#### Option B: Using Git

On your VPS:

```bash
git clone <your-repo-url>
cd bible-reading-plan/deployment
docker-compose up -d
```

### 4. Set Up SSL

#### Option A: Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deployment/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deployment/ssl/

# Restart nginx
docker-compose restart nginx
```

#### Option B: Use Your Internal CA

If you have an internal CA (like from your homelab):

```bash
# Copy your certificates
cp /path/to/your/fullchain.pem deployment/ssl/
cp /path/to/your/privkey.pem deployment/ssl/

# Restart nginx
docker-compose restart nginx
```

### 5. Verify Deployment

Check that all services are running:

```bash
docker-compose ps
```

Test the endpoints:

```bash
# Backend health check
curl https://yourdomain.com/health

# Frontend
curl https://yourdomain.com

# API endpoint
curl https://yourdomain.com/api/plans
```

## Architecture

```
Internet
    |
    v
[Nginx Reverse Proxy]
    |
    +-- /api/* --> [Backend API Container]
    |
    +-- /voice/* --> [Backend API Container]
    |
    +-- /* --> [Frontend PWA Container]
```

## Services

### Backend API (Port 3000)

- Serves reading plan data
- Provides voice assistant endpoints
- Bible Gateway integration

### Frontend PWA (Port 8080)

- React-based Progressive Web App
- Installable on mobile devices
- Offline capable

### Nginx (Ports 80, 443)

- Reverse proxy
- SSL termination
- Rate limiting
- Compression

## Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup Data

```bash
# Backup reading plan data
cp ../data/reading_plan.json ~/backups/reading_plan-$(date +%Y%m%d).json

# Backup user progress (if you add a database later)
docker exec bible-reading-backend tar czf - /app/data > backup-$(date +%Y%m%d).tar.gz
```

### SSL Certificate Renewal

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deployment/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deployment/ssl/

# Reload nginx
docker-compose exec nginx nginx -s reload
```

## Monitoring

### Health Checks

All containers have health checks configured. Check status:

```bash
docker-compose ps
```

### Resource Usage

```bash
docker stats
```

## Troubleshooting

### Backend not responding

```bash
# Check logs
docker-compose logs backend

# Verify data file exists
docker-compose exec backend ls -l /app/data/reading_plan.json

# Restart backend
docker-compose restart backend
```

### Frontend not loading

```bash
# Check logs
docker-compose logs frontend

# Verify build
docker-compose exec frontend ls -l /usr/share/nginx/html

# Rebuild
docker-compose up -d --build frontend
```

### SSL errors

```bash
# Verify certificates exist
ls -l deployment/ssl/

# Check nginx config
docker-compose exec nginx nginx -t

# View nginx logs
docker-compose logs nginx
```

### API CORS errors

Edit `backend/server.js` to add your domain to CORS whitelist:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com']
}));
```

## Integration with Twingate

Since you're using Twingate, you can:

1. Keep the service private (no public internet access)
2. Access via Twingate from anywhere
3. No need for public SSL if only accessing via Twingate

To run without public access:

```bash
# Don't expose ports 80/443 publicly
# Access via http://internal-ip or hostname through Twingate
```

## Performance Tuning

### Increase Rate Limits

Edit `nginx.conf`:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;
```

### Enable Caching

Add to `nginx.conf`:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;
```

### Scale Containers

Edit `docker-compose.yml`:

```yaml
backend:
  deploy:
    replicas: 2
```

## Security Recommendations

1. Use strong SSL/TLS configurations
2. Keep Docker images updated
3. Use environment variables for secrets
4. Enable firewall (ufw/iptables)
5. Regular backups
6. Monitor logs for suspicious activity

## Next Steps

- Add user authentication
- Implement progress tracking database
- Set up automated backups
- Configure monitoring (Prometheus/Grafana)
- Add analytics
