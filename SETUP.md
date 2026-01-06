# Setup Guide for Appointment Scheduler

This guide will help you set up and configure the Appointment Scheduler backend.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)
- **npm** or **yarn** package manager (comes with Node.js)

## Required Third-Party Services

You'll need accounts and API credentials for:

1. **Twilio** - For phone and SMS functionality
2. **WhatsApp Business API** - For WhatsApp messaging
3. **Google Cloud Platform** - For Google Calendar API

## Quick Start

### 1. Automatic Setup (Recommended)

Run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

### 2. Manual Setup

If you prefer manual setup, follow these steps:

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials (see detailed configuration below).

#### Step 3: Setup PostgreSQL Database

Create a new database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE appointment_scheduler;
\q

# Or using command line
createdb appointment_scheduler
```

#### Step 4: Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Detailed Configuration

### Database Configuration

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=appointment_scheduler
DB_USER=postgres
DB_PASSWORD=your_password
```

### Twilio Configuration

1. Sign up at [Twilio](https://www.twilio.com)
2. Get your credentials from the Twilio Console
3. Purchase a phone number

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/webhooks/twilio
```

**Webhook Setup:**
- Go to your Twilio phone number settings
- Set Voice URL: `https://your-domain.com/webhooks/twilio/voice`
- Set SMS URL: `https://your-domain.com/webhooks/twilio/sms`
- Set Status Callback: `https://your-domain.com/webhooks/twilio/status`

### WhatsApp Business API Configuration

1. Create a [Meta Developer Account](https://developers.facebook.com/)
2. Set up WhatsApp Business API
3. Get your credentials

```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
```

**Webhook Setup:**
- Configure webhook URL: `https://your-domain.com/webhooks/whatsapp`
- Set verify token (must match your .env value)
- Subscribe to `messages` webhook field

### Google Calendar API Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Generate refresh token using [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

**Getting a Refresh Token:**
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click settings (gear icon), check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, select "Calendar API v3" and authorize
5. In Step 2, exchange authorization code for tokens
6. Copy the refresh token to your .env file

### JWT Configuration

Set a strong secret for JWT token generation:

```env
JWT_SECRET=your_very_strong_secret_key_here
```

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Testing the Setup

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-12-25T10:00:00.000Z"
}
```

### 2. API Documentation

Visit: `http://localhost:3000/`

### 3. Test Creating an Appointment

```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "title": "Test Appointment",
    "startTime": "2024-12-25T10:00:00Z",
    "endTime": "2024-12-25T11:00:00Z"
  }'
```

## Deployment

### Deploying to Production

1. **Environment Variables**: Set all production values in your hosting environment
2. **Database**: Use managed PostgreSQL (e.g., AWS RDS, Heroku Postgres)
3. **HTTPS**: Use SSL/TLS certificates (required for webhooks)
4. **Process Manager**: Use PM2 or similar to keep the server running

```bash
# Install PM2
npm install -g pm2

# Start server with PM2
pm2 start server.js --name appointment-scheduler

# Make it restart on system reboot
pm2 startup
pm2 save
```

### Hosting Options

- **Heroku**: Easy deployment with PostgreSQL add-on
- **AWS**: EC2 + RDS for full control
- **DigitalOcean**: App Platform or Droplet
- **Google Cloud**: Cloud Run or Compute Engine
- **Railway**: Simple deployment with PostgreSQL

### Required Port Configuration

Ensure your hosting provider allows:
- Inbound HTTP/HTTPS traffic
- Outbound connections to Twilio, WhatsApp, and Google APIs

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -h localhost -d appointment_scheduler
```

### Webhook Issues

- Ensure your server is publicly accessible (use ngrok for development)
- Verify webhook URLs are correctly configured
- Check webhook signatures/tokens match

### Development with Webhooks

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 3000

# Use the provided URL for webhook configuration
# Example: https://abc123.ngrok.io/webhooks/twilio/voice
```

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Validate all webhook signatures
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment-specific credentials
- [ ] Enable database connection encryption
- [ ] Implement proper error handling
- [ ] Set up monitoring and logging

## Next Steps

After successful setup:

1. Test all API endpoints
2. Configure Twilio webhooks
3. Set up WhatsApp webhooks
4. Test Google Calendar integration
5. Implement additional features as needed

## Getting Help

- Check the [README.md](README.md) for API documentation
- Review code comments in the source files
- Open an issue on GitHub for bugs or questions

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Twilio API Documentation](https://www.twilio.com/docs)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
