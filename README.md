# Appointment Scheduler

A comprehensive backend API system for automated appointment scheduling through phone calls, WhatsApp messages, and Google Calendar integration.

## Features

- 📞 **Twilio Integration** - Handle phone calls with speech-to-text transcription
- 💬 **WhatsApp Business API** - Receive and respond to WhatsApp appointment requests
- 📅 **Google Calendar Sync** - Automatic appointment syncing for all parties
- 🗄️ **PostgreSQL Database** - Robust data persistence with Sequelize ORM
- 🔐 **Authentication Middleware** - JWT-based authentication support
- 📊 **RESTful API** - Clean, well-documented API endpoints

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Integrations**:
  - Twilio API (Voice & SMS)
  - WhatsApp Business API
  - Google Calendar API
- **Additional Libraries**: Axios, Morgan, CORS, dotenv

## Directory Structure

```
appointment-scheduler/
├── src/
│   ├── routes/          # Express.js routes for APIs
│   │   ├── appointments.js
│   │   └── webhooks.js
│   ├── controllers/     # Controllers with business logic
│   │   ├── appointmentController.js
│   │   ├── twilioController.js
│   │   └── whatsappController.js
│   ├── services/        # Service layer for integrations
│   │   ├── twilioService.js
│   │   ├── whatsappService.js
│   │   └── googleCalendarService.js
│   ├── models/          # Sequelize models
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Appointment.js
│   │   └── index.js
│   ├── middlewares/     # Custom middleware
│   │   ├── auth.js
│   │   └── logger.js
│   └── app.js           # Express app initialization
├── config/
│   ├── db.js            # Database configuration
│   ├── twilio.js        # Twilio credentials
│   ├── whatsapp.js      # WhatsApp API credentials
│   └── googleCalendar.js # Google Calendar credentials
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── server.js            # Server entry point
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Twilio Account
- WhatsApp Business API Access
- Google Cloud Project with Calendar API enabled

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/subham3333/appointment-scheduler.git
   cd appointment-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - Database connection details
   - Twilio Account SID, Auth Token, and Phone Number
   - WhatsApp API credentials
   - Google Calendar API credentials
   - JWT Secret

4. **Setup PostgreSQL database**
   ```bash
   createdb appointment_scheduler
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Appointments

#### Create Appointment
```http
POST /appointments
Content-Type: application/json

{
  "userId": "uuid",
  "serviceId": "uuid",
  "title": "Consultation",
  "description": "Initial consultation",
  "startTime": "2024-12-25T10:00:00Z",
  "endTime": "2024-12-25T11:00:00Z",
  "participants": [],
  "source": "api"
}
```

#### Get Appointments
```http
GET /appointments?userId=uuid&status=confirmed&startDate=2024-12-01&endDate=2024-12-31
```

#### Get Single Appointment
```http
GET /appointments/:id
```

#### Update Appointment
```http
PUT /appointments/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "confirmed"
}
```

#### Cancel Appointment
```http
DELETE /appointments/:id
```

### Calendar Sync

#### Sync to Google Calendar
```http
POST /sync-calendar
Content-Type: application/json

{
  "appointmentId": "uuid",
  "calendarIds": ["primary", "calendar@group.calendar.google.com"]
}
```

### Webhooks

#### Twilio Voice Webhook
```http
POST /webhooks/twilio/voice
```

#### Twilio Transcription Webhook
```http
POST /webhooks/twilio/transcription
```

#### Twilio SMS Webhook
```http
POST /webhooks/twilio/sms
```

#### WhatsApp Verification Webhook
```http
GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE
```

#### WhatsApp Message Webhook
```http
POST /webhooks/whatsapp
```

## Database Models

### User
- `id` (UUID) - Primary key
- `name` (String) - User's name
- `email` (String) - Email address (optional, unique)
- `phone` (String) - Phone number (required, unique)
- `whatsappNumber` (String) - WhatsApp number (optional)
- `googleCalendarId` (String) - Google Calendar ID
- `preferences` (JSONB) - User preferences

### Service
- `id` (UUID) - Primary key
- `name` (String) - Service name
- `description` (Text) - Service description
- `duration` (Integer) - Duration in minutes
- `price` (Decimal) - Service price
- `active` (Boolean) - Active status

### Appointment
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to User
- `serviceId` (UUID) - Foreign key to Service
- `title` (String) - Appointment title
- `description` (Text) - Appointment description
- `startTime` (DateTime) - Start time
- `endTime` (DateTime) - End time
- `status` (Enum) - pending, confirmed, cancelled, completed
- `source` (Enum) - phone, whatsapp, api, manual
- `googleEventId` (String) - Google Calendar event ID
- `participants` (JSONB) - Array of participants
- `metadata` (JSONB) - Additional metadata

## Configuration

### Twilio Setup

1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Configure webhooks in Twilio console:
   - Voice URL: `https://your-domain.com/webhooks/twilio/voice`
   - SMS URL: `https://your-domain.com/webhooks/twilio/sms`
   - Status Callback: `https://your-domain.com/webhooks/twilio/status`

### WhatsApp Business API Setup

1. Create a Meta Developer account
2. Set up WhatsApp Business API
3. Get your Phone Number ID and Access Token
4. Configure webhook URL: `https://your-domain.com/webhooks/whatsapp`
5. Set a verify token in your `.env` file

### Google Calendar API Setup

1. Create a project in Google Cloud Console
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Set redirect URI: `http://localhost:3000/auth/google/callback`
5. Generate a refresh token using OAuth 2.0 Playground
6. Add credentials to `.env` file

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Security Considerations

- Never commit `.env` file to version control
- Use strong JWT secrets
- Implement rate limiting for production
- Validate all webhook signatures
- Use HTTPS in production
- Sanitize user inputs
- Implement proper error handling

## Future Enhancements

- [ ] Add user authentication and authorization
- [ ] Implement rate limiting
- [ ] Add email notifications
- [ ] Support for recurring appointments
- [ ] Advanced NLP for better appointment parsing
- [ ] Multi-language support
- [ ] Payment integration
- [ ] Calendar conflict resolution UI
- [ ] Admin dashboard
- [ ] Analytics and reporting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.