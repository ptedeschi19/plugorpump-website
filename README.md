# PlugOrPump Backend API

A comprehensive backend system for generating personalized vehicle analysis reports. This API receives questionnaire responses, performs vehicle cost analysis, generates professional PDF reports, and emails them to users.

## Features

- **15-Question Questionnaire Processing**: Validates and processes detailed user responses
- **Vehicle Analysis Engine**: Compares electric vs conventional vehicles based on user data
- **PDF Report Generation**: Creates professional 25-page reports using Puppeteer
- **Email Service**: Sends personalized reports via email with attachments
- **Rate Limiting**: Protects against abuse with configurable limits
- **Error Handling**: Comprehensive error handling and logging
- **Validation**: Request validation using Joi schemas

## Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Gmail account (for email service) or SMTP server

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd plugorpump-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Copy the example environment file and configure it:
   ```bash
   copy .env.example .env
   ```

4. **Configure Environment Variables**:
   Edit the `.env` file with your settings:

   ```env
   # Environment Configuration
   NODE_ENV=development
   PORT=3000

   # Email Configuration (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=PlugOrPump Vehicle Analysis <noreply@plugorpump.com>

   # Report Configuration
   REPORT_COMPANY_NAME=PlugOrPump
   REPORT_COMPANY_WEBSITE=https://plugorpump.com
   REPORT_SUPPORT_EMAIL=support@plugorpump.com

   # Security
   CORS_ORIGIN=http://localhost:8080,https://plugorpump.com,https://www.plugorpump.com

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=10
   ```

## Email Setup (Gmail)

To use Gmail for sending emails:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS` in your `.env` file

3. **Alternative**: Use a dedicated email service like SendGrid, Mailgun, or AWS SES for production

## Development

### Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### API Endpoints

#### Health Check
```
GET /health
```
Returns server health status.

#### Generate Report
```
POST /api/reports/generate
```

**Request Body**:
```json
{
  "responses": {
    "drivingHabits": "mixed",
    "dailyMiles": "25to50",
    "vehicleAge": "3to7",
    "fuelCosts": "150to300",
    "maintenanceFreq": "quarterly",
    "maintenanceCosts": "100to300",
    "chargingAccess": "home",
    "purchaseBudget": "30to50k",
    "vehicleType": "sedan",
    "primaryUse": "commuting",
    "environmentalConcern": "very-important",
    "techComfort": "comfortable",
    "incentivesInterest": "very-interested",
    "timelineDecision": "3months",
    "currentSatisfaction": "neutral"
  },
  "userInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "zipCode": "80301"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Report generated and sent successfully",
  "reportId": "uuid-string",
  "summary": {
    "recommendation": "Strong Electric Vehicle Recommendation",
    "totalCostSavings": 5420,
    "paybackPeriod": 3.2
  }
}
```

### Testing the API

1. **Start the backend server**:
   ```bash
   npm run dev
   ```

2. **Test health endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test report generation** (you can use Postman, curl, or the frontend):
   ```bash
   curl -X POST http://localhost:3000/api/reports/generate \
     -H "Content-Type: application/json" \
     -d @test-data.json
   ```

## Frontend Integration

The frontend (`order.html`) is already configured to work with this backend. It will:

1. **Automatically detect the environment**:
   - Local development: `http://localhost:3000/api`
   - Production: `https://api.plugorpump.com/api` (update this URL)

2. **Handle errors gracefully** with user-friendly messages

3. **Show personalized success messages** with report summaries

### Local Testing

1. Start the backend: `npm run dev`
2. Serve the frontend locally (using a simple HTTP server)
3. Navigate to the questionnaire page
4. Complete the form and submit

## Project Structure

```
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variables template
├── routes/
│   └── reports.js            # Report generation endpoints
├── middleware/
│   ├── validation.js         # Request validation
│   └── errorHandler.js       # Error handling middleware
└── services/
    ├── analysisEngine.js     # Vehicle analysis logic
    ├── reportGenerator.js    # PDF generation service
    └── emailService.js       # Email sending service
```

## Deployment

### Environment Variables for Production

Update these for production deployment:

```env
NODE_ENV=production
PORT=443
EMAIL_HOST=your-smtp-host
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-password
CORS_ORIGIN=https://plugorpump.com,https://www.plugorpump.com
```

### Deploy to Cloud Platform

#### Heroku
```bash
# Install Heroku CLI and login
heroku create plugorpump-api
heroku config:set NODE_ENV=production
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
# ... set other environment variables
git push heroku main
```

#### Vercel
```bash
# Install Vercel CLI
vercel
# Follow prompts and configure environment variables in dashboard
```

#### AWS/DigitalOcean
- Use PM2 for process management
- Configure NGINX as reverse proxy
- Set up SSL certificates
- Configure environment variables

## Monitoring and Logs

The application includes comprehensive logging:

- **Request/Response logging**
- **Error tracking**
- **Performance monitoring**
- **Email delivery status**

Monitor logs using:
```bash
# Development
npm run dev

# Production (with PM2)
pm2 logs plugorpump-api
```

## Security Features

- **CORS protection** with configurable origins
- **Rate limiting** to prevent abuse
- **Input validation** using Joi schemas
- **Helmet.js** for security headers
- **Environment variable protection**

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check EMAIL_USER and EMAIL_PASS
   - Verify Gmail App Password is correct
   - Check firewall/network restrictions

2. **PDF generation fails**:
   - Ensure sufficient memory allocation
   - Check Puppeteer dependencies on Linux

3. **CORS errors**:
   - Update CORS_ORIGIN in environment variables
   - Ensure frontend URL is included

4. **Rate limiting**:
   - Adjust RATE_LIMIT_MAX_REQUESTS for testing
   - Monitor request patterns

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm run dev
```

## Support

For issues or questions:
- Create an issue in the repository
- Contact: support@plugorpump.com
- Review logs for error details

## License

This project is licensed under the MIT License.
