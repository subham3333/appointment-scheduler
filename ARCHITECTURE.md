# Appointment Scheduler Architecture

## System Overview

The Appointment Scheduler is a comprehensive backend system that enables automated appointment scheduling through multiple channels: phone calls, WhatsApp messages, and direct API integration. It seamlessly syncs appointments to Google Calendar for all participants.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Twilio Phone   │    WhatsApp     │    HTTP Clients/Apps        │
│   (Voice/SMS)   │   Business API  │      (Web/Mobile)           │
└────────┬────────┴────────┬────────┴───────────┬─────────────────┘
         │                 │                    │
         │ Webhooks        │ Webhooks           │ REST API
         │                 │                    │
┌────────▼─────────────────▼────────────────────▼─────────────────┐
│                    Express.js Application                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Middleware Layer                     │  │
│  │  • CORS  • Body Parser  • Logger  • Auth (Optional)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Routes Layer                         │  │
│  │  • /appointments  • /sync-calendar  • /webhooks/*        │  │
│  └──────────────────┬────────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼────────────────────────────────────────┐  │
│  │                   Controllers Layer                       │  │
│  │  • AppointmentController  • TwilioController              │  │
│  │  • WhatsAppController                                     │  │
│  └──────────────────┬────────────────────────────────────────┘  │
│                     │                                            │
│  ┌──────────────────▼────────────────────────────────────────┐  │
│  │                    Services Layer                         │  │
│  │  • TwilioService  • WhatsAppService                       │  │
│  │  • GoogleCalendarService                                  │  │
│  └──────┬──────────────────┬─────────────────┬───────────────┘  │
│         │                  │                 │                  │
└─────────┼──────────────────┼─────────────────┼──────────────────┘
          │                  │                 │
          │                  │                 │
┌─────────▼──────────┐ ┌─────▼─────┐ ┌────────▼──────────┐
│  Twilio API        │ │ WhatsApp  │ │ Google Calendar   │
│  • Voice           │ │   API     │ │      API          │
│  • SMS             │ │           │ │                   │
└────────────────────┘ └───────────┘ └───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Sequelize ORM                           │  │
│  │  • User Model  • Service Model  • Appointment Model      │  │
│  └──────────────────────────────┬───────────────────────────┘  │
│                                 │                               │
│  ┌──────────────────────────────▼───────────────────────────┐  │
│  │                    PostgreSQL Database                    │  │
│  │  • users  • services  • appointments                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Phone Call Appointment Flow

```
User makes call
    ↓
Twilio receives call → POST /webhooks/twilio/voice
    ↓
TwiML response (recording)
    ↓
User speaks appointment details
    ↓
Twilio transcribes → POST /webhooks/twilio/transcription
    ↓
Parse transcription for date/time/service
    ↓
Create/Update User in database
    ↓
Create Appointment with source='phone'
    ↓
Send confirmation SMS to user
```

### 2. WhatsApp Appointment Flow

```
User sends WhatsApp message
    ↓
WhatsApp API → POST /webhooks/whatsapp
    ↓
Parse message for appointment details
    ↓
Create/Update User in database
    ↓
Create Appointment with source='whatsapp'
    ↓
Send confirmation via WhatsApp
    ↓
(Optional) Sync to Google Calendar
```

### 3. API Appointment Flow

```
Client application
    ↓
POST /appointments with appointment details
    ↓
Validate required fields
    ↓
Check for schedule conflicts (if calendar synced)
    ↓
Create Appointment with source='api'
    ↓
Return appointment details
    ↓
(Optional) POST /sync-calendar to sync
```

### 4. Calendar Sync Flow

```
POST /sync-calendar
    ↓
Fetch appointment from database
    ↓
For each calendar ID:
    ↓
    Create Google Calendar event
    ↓
    Store event ID in appointment
    ↓
Return sync results for all calendars
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(255) NOT NULL UNIQUE,
  whatsapp_number VARCHAR(255),
  google_calendar_id VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Services Table
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 60,
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  source VARCHAR(20) NOT NULL,
  google_event_id VARCHAR(255),
  participants JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Key Components

### Controllers
- **AppointmentController**: CRUD operations for appointments
- **TwilioController**: Handle Twilio webhooks (voice, SMS, transcription)
- **WhatsAppController**: Handle WhatsApp messages and webhook verification

### Services
- **TwilioService**: Make calls, send SMS, parse transcriptions
- **WhatsAppService**: Send messages, parse messages, verify webhooks
- **GoogleCalendarService**: Create/update/delete events, check conflicts

### Models
- **User**: Store user information and preferences
- **Service**: Define available services
- **Appointment**: Store appointment details and metadata

### Middleware
- **Auth**: JWT authentication (optional)
- **Logger**: Request logging using Morgan

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/appointments` | Create appointment |
| GET | `/appointments` | List appointments |
| GET | `/appointments/:id` | Get appointment |
| PUT | `/appointments/:id` | Update appointment |
| DELETE | `/appointments/:id` | Cancel appointment |
| POST | `/sync-calendar` | Sync to Google Calendar |
| POST | `/webhooks/twilio/voice` | Twilio voice webhook |
| POST | `/webhooks/twilio/transcription` | Twilio transcription webhook |
| POST | `/webhooks/twilio/sms` | Twilio SMS webhook |
| GET | `/webhooks/whatsapp` | WhatsApp verification |
| POST | `/webhooks/whatsapp` | WhatsApp message webhook |

## Security Considerations

1. **Environment Variables**: All sensitive data in `.env` file
2. **Webhook Validation**: Verify Twilio signatures and WhatsApp tokens
3. **JWT Authentication**: Optional for API endpoints
4. **HTTPS**: Required for production webhooks
5. **Input Validation**: Sanitize all user inputs
6. **Database**: Use parameterized queries (Sequelize ORM)
7. **Rate Limiting**: Should be implemented for production

## Scalability

### Horizontal Scaling
- Stateless design allows multiple instances
- Use load balancer for distribution
- Shared PostgreSQL database

### Performance Optimization
- Database indexing on frequently queried fields
- Connection pooling (configured in db.js)
- Caching for frequently accessed data
- Async operations for external API calls

### High Availability
- Database replication
- Multiple server instances
- Health check endpoint for monitoring
- Graceful error handling

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Sequelize |
| Phone/SMS | Twilio API |
| Messaging | WhatsApp Business API |
| Calendar | Google Calendar API |
| Authentication | JWT (jsonwebtoken) |
| HTTP Client | Axios |
| Logging | Morgan |

## Development Workflow

1. **Local Development**
   - Use `.env` for configuration
   - Run with `npm run dev` (nodemon)
   - Use ngrok for webhook testing

2. **Testing**
   - Test API endpoints with curl/Postman
   - Verify webhook handling
   - Check database operations

3. **Deployment**
   - Set production environment variables
   - Use process manager (PM2)
   - Enable HTTPS
   - Configure production database

## Monitoring and Logging

- **Request Logs**: Morgan middleware logs all HTTP requests
- **Error Logs**: Console error logging with stack traces
- **Database Logs**: Optional Sequelize query logging
- **Webhook Logs**: Log all incoming webhook data

## Future Enhancements

1. **Advanced Features**
   - AI-powered NLP for better appointment parsing
   - Recurring appointments support
   - Email notifications
   - SMS reminders
   - Payment integration

2. **Improvements**
   - Rate limiting implementation
   - Advanced authentication system
   - Admin dashboard
   - Analytics and reporting
   - Multi-language support

3. **Integrations**
   - Microsoft Teams
   - Slack notifications
   - Zoom meeting links
   - Stripe payments
   - SendGrid for emails

## Documentation Files

- `README.md` - Project overview and quick start
- `SETUP.md` - Detailed setup instructions
- `API.md` - Complete API documentation
- `ARCHITECTURE.md` - This file (system architecture)
- `.env.example` - Environment variables template

## Getting Started

1. Read `README.md` for overview
2. Follow `SETUP.md` for installation
3. Reference `API.md` for API usage
4. Review `ARCHITECTURE.md` for system understanding

## Support and Contributing

- Open issues on GitHub for bugs
- Submit pull requests for improvements
- Check documentation for common questions
- Follow coding standards in existing files
