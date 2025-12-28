# Quick Deploy to VPS - TL;DR Version

## What You Need

1. Your actual domain name (e.g., `bible.tbcdecatur.org`)
2. VPS with Docker installed
3. Caddy running on VPS
4. DNS pointing to your VPS

## Super Quick Deploy (5 Steps)

### Step 1: Push to GitHub

```bash
# On your Windows machine
cd C:\Users\Fred\projects\bible-reading-plan
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/bible-reading-plan.git
git push -u origin main
```

### Step 2: SSH to VPS and Clone

```bash
ssh user@your-vps-ip
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/bible-reading-plan.git
cd bible-reading-plan
```

### Step 3: Add Caddy Configuration

```bash
sudo nano /etc/caddy/Caddyfile
```

Add this (replace with YOUR actual domain):

```
bible.YOUR-DOMAIN.com {
    reverse_proxy localhost:8080
    encode gzip
}
```

Save (Ctrl+X, Y, Enter), then reload:

```bash
sudo systemctl reload caddy
```

### Step 4: Start the App

```bash
cd /opt/bible-reading-plan
sudo docker-compose up -d --build
```

### Step 5: Verify

Check it's running:

```bash
sudo docker-compose ps
```

Visit your site:
```
https://bible.YOUR-DOMAIN.com
```

## Done! 🎉

Your app is now live with automatic HTTPS!

## Common Commands

**See logs:**
```bash
sudo docker-compose logs -f
```

**Update app:**
```bash
cd /opt/bible-reading-plan
sudo git pull
sudo docker-compose up -d --build
```

**Restart:**
```bash
sudo docker-compose restart
```

**Stop:**
```bash
sudo docker-compose down
```

## Troubleshooting

**App not loading?**
```bash
# Check containers
sudo docker-compose ps

# Check logs
sudo docker-compose logs backend
sudo docker-compose logs frontend
```

**SSL not working?**
```bash
# Check Caddy
sudo systemctl status caddy

# Check Caddy logs
sudo journalctl -u caddy -f
```

**Still not working?**

See the full guide: [DEPLOY_TO_VPS.md](DEPLOY_TO_VPS.md)

---

## What Gets Deployed

- ✅ Backend API (Node.js/Express)
- ✅ Frontend PWA (React)
- ✅ Nginx (routing)
- ✅ Automatic HTTPS (via Caddy)
- ✅ Auto-restart on crash
- ✅ Health checks
- ✅ All your customizations (dark mode, CSB, TBC subtitle)

## URLs After Deployment

- **Main App:** `https://bible.YOUR-DOMAIN.com`
- **API:** `https://bible.YOUR-DOMAIN.com/api/plans`
- **Health:** `https://bible.YOUR-DOMAIN.com/health`

---

**Need Help?** Check [DEPLOY_TO_VPS.md](DEPLOY_TO_VPS.md) for the complete guide.
