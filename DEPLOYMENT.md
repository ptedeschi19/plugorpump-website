# PlugOrPump Backend Deployment Guide

## Quick Start

### 1. Install Node.js
- Download from https://nodejs.org/ (LTS version recommended)
- Install and restart your terminal

### 2. Set Up the Project
```bash
# Run the setup script (Windows)
setup.bat

# Or run the setup script (Mac/Linux)
chmod +x setup.sh
./setup.sh

# Or manual setup:
npm install
cp .env.example .env
```

### 3. Configure Email
Edit the `.env` file:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**To get a Gmail App Password:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate a password for "Mail"
4. Use this password (not your regular Gmail password)

### 4. Start the Backend
```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

### 5. Test the System
- Backend will run on http://localhost:3000
- Test health: http://localhost:3000/health
- Test components: `node test-backend.js`

## Frontend Integration

The frontend (`order.html`) automatically detects:
- Local development: connects to `http://localhost:3000/api`
- Production: connects to your production API URL

## Production Deployment

### Option 1: Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set CORS_ORIGIN=https://plugorpump.com
git push heroku main
```

### Option 2: Vercel
```bash
# Install Vercel CLI
vercel
# Follow prompts and add environment variables in dashboard
```

### Option 3: AWS/DigitalOcean
1. Deploy files to server
2. Install Node.js and dependencies
3. Set environment variables
4. Use PM2 for process management: `pm2 start server.js`
5. Configure NGINX as reverse proxy

## Environment Variables

Required for production:
```env
NODE_ENV=production
PORT=443
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-app-password
CORS_ORIGIN=https://your-domain.com
```

## Monitoring

Check logs and status:
```bash
# Development
npm run dev

# Production with PM2
pm2 logs your-app-name
pm2 status
```

## Security Checklist

- ✅ Environment variables set
- ✅ CORS configured for your domain
- ✅ Rate limiting enabled
- ✅ Input validation active
- ✅ HTTPS enabled (production)
- ✅ Email credentials secured

## Troubleshooting

**Common Issues:**

1. **"npm not found"** → Install Node.js
2. **Email fails** → Check Gmail App Password setup
3. **CORS errors** → Update CORS_ORIGIN in .env
4. **PDF generation fails** → Check memory limits
5. **Rate limiting** → Adjust limits in .env

**Debug Mode:**
```bash
DEBUG=* npm run dev
```

## Support

- 📖 Full documentation: `README.md`
- 🧪 Test components: `node test-backend.js`
- 📧 Support: support@plugorpump.com
