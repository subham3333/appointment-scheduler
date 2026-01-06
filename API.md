# API Documentation

## Base URL
```
http://localhost:3000
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "count": 0  // Only for list endpoints
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

## Endpoints

### Health Check

#### Check API Health
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-12-25T10:00:00.000Z"
}
```

### Appointments

#### Create Appointment

Create a new appointment in the system.

```http
POST /appointments
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "uuid-string",
  "serviceId": "uuid-string",  // Optional
  "title": "Consultation Appointment",
  "description": "Initial consultation with the team",  // Optional
  "startTime": "2024-12-25T10:00:00Z",
  "endTime": "2024-12-25T11:00:00Z",
  "participants": [],  // Optional: Array of participant info
  "source": "api"  // Optional: phone, whatsapp, api, manual
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "serviceId": "uuid",
    "title": "Consultation Appointment",
    "description": "Initial consultation with the team",
    "startTime": "2024-12-25T10:00:00.000Z",
    "endTime": "2024-12-25T11:00:00.000Z",
    "status": "confirmed",
    "source": "api",
    "googleEventId": null,
    "participants": [],
    "metadata": {},
    "createdAt": "2024-12-24T10:00:00.000Z",
    "updatedAt": "2024-12-24T10:00:00.000Z",
    "user": { ... },
    "service": { ... }
  }
}
```

#### Get Appointments

Retrieve a list of appointments with optional filters.

```http
GET /appointments?userId={uuid}&status={status}&startDate={date}&endDate={date}
```

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status (pending, confirmed, cancelled, completed)
- `startDate` (optional): Filter appointments starting from this date (ISO 8601)
- `endDate` (optional): Filter appointments until this date (ISO 8601)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "uuid",
      "title": "Appointment 1",
      ...
    },
    {
      "id": "uuid",
      "title": "Appointment 2",
      ...
    }
  ]
}
```

#### Get Single Appointment

Retrieve details of a specific appointment.

```http
GET /appointments/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Consultation",
    ...
  }
}
```

#### Update Appointment

Update an existing appointment.

```http
PUT /appointments/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "confirmed",
  "startTime": "2024-12-26T10:00:00Z",
  "endTime": "2024-12-26T11:00:00Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    ...
  }
}
```

#### Cancel Appointment

Cancel an appointment (sets status to cancelled).

```http
DELETE /appointments/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

### Calendar Sync

#### Sync to Google Calendar

Sync an appointment to Google Calendar for multiple participants.

```http
POST /sync-calendar
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": "uuid",
  "calendarIds": [
    "primary",
    "another-calendar@group.calendar.google.com"
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "appointment": { ... },
    "syncResults": [
      {
        "calendarId": "primary",
        "eventId": "google-event-id",
        "success": true
      },
      {
        "calendarId": "another-calendar@group.calendar.google.com",
        "eventId": "google-event-id-2",
        "success": true
      }
    ]
  }
}
```

### Webhooks

#### Twilio Voice Webhook

Handles incoming phone calls from Twilio.

```http
POST /webhooks/twilio/voice
Content-Type: application/x-www-form-urlencoded
```

**Twilio Parameters:**
- `From`: Caller's phone number
- `CallSid`: Unique call identifier
- Other standard Twilio voice parameters

**Response:** TwiML XML
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! Thank you for calling...</Say>
  <Record maxLength="120" transcribe="true" transcribeCallback="/webhooks/twilio/transcription"/>
</Response>
```

#### Twilio Transcription Webhook

Receives call transcriptions from Twilio.

```http
POST /webhooks/twilio/transcription
Content-Type: application/x-www-form-urlencoded
```

**Twilio Parameters:**
- `TranscriptionText`: The transcribed text
- `CallSid`: Call identifier
- `From`: Caller's phone number

**Response:** `200 OK`

#### Twilio SMS Webhook

Handles incoming SMS messages from Twilio.

```http
POST /webhooks/twilio/sms
Content-Type: application/x-www-form-urlencoded
```

**Twilio Parameters:**
- `From`: Sender's phone number
- `Body`: SMS message content

**Response:** `200 OK`

#### WhatsApp Webhook Verification

Verifies WhatsApp webhook endpoint (GET request from Meta).

```http
GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}
```

**Response:** `200 OK`
Returns the challenge string if verification token matches.

#### WhatsApp Message Webhook

Receives incoming WhatsApp messages.

```http
POST /webhooks/whatsapp
Content-Type: application/json
```

**Request Body (from Meta):**
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "1234567890",
                "id": "message-id",
                "text": {
                  "body": "I want to book an appointment for 25/12/2024 at 10:00 AM"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Response:** `200 OK`

## Error Codes

- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `409 Conflict` - Schedule conflict or duplicate
- `500 Internal Server Error` - Server error

## Authentication

Currently, authentication is optional. To enable authentication:

1. Include JWT token in header:
```http
Authorization: Bearer your-jwt-token
```

2. The token will be validated by the auth middleware

## Rate Limiting

Rate limiting is not currently implemented but should be added in production.

Recommended limits:
- API endpoints: 100 requests per minute per IP
- Webhook endpoints: 1000 requests per minute per IP

## Webhooks Security

### Twilio
Twilio signs all webhook requests. Implement signature validation in production:
- [Twilio Request Validation](https://www.twilio.com/docs/usage/security#validating-requests)

### WhatsApp
WhatsApp uses a verification token for webhook setup and optionally signs requests:
- Verify the `hub.verify_token` matches your configured token
- [WhatsApp Webhook Security](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)

## Examples

### Example 1: Create and Sync Appointment

```bash
# Step 1: Create appointment
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Team Meeting",
    "startTime": "2024-12-25T14:00:00Z",
    "endTime": "2024-12-25T15:00:00Z",
    "source": "api"
  }'

# Step 2: Sync to calendar (use appointment ID from step 1)
curl -X POST http://localhost:3000/sync-calendar \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "appointment-uuid-from-step-1",
    "calendarIds": ["primary"]
  }'
```

### Example 2: Get User's Upcoming Appointments

```bash
curl -X GET "http://localhost:3000/appointments?userId=123e4567-e89b-12d3-a456-426614174000&status=confirmed&startDate=2024-12-25T00:00:00Z"
```

### Example 3: Cancel Appointment

```bash
curl -X DELETE http://localhost:3000/appointments/appointment-uuid
```

## Development Tips

1. **Use ngrok for webhook testing:**
   ```bash
   ngrok http 3000
   # Use the provided URL for webhook configuration
   ```

2. **Test webhooks locally:**
   ```bash
   # Simulate Twilio SMS
   curl -X POST http://localhost:3000/webhooks/twilio/sms \
     -d "From=%2B1234567890" \
     -d "Body=Test message"
   ```

3. **Monitor logs:**
   The application uses Morgan for request logging in development mode.

## Support

For issues or questions:
- Check the [SETUP.md](SETUP.md) for configuration help
- Review [README.md](README.md) for overview
- Open an issue on GitHub
