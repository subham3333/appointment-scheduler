const { client, phoneNumber } = require('../../config/twilio');

class TwilioService {
  /**
   * Make an outbound call
   */
  async makeCall(to, callbackUrl) {
    try {
      const call = await client.calls.create({
        from: phoneNumber,
        to: to,
        url: callbackUrl,
        record: true
      });
      return call;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(to, message) {
    try {
      const sms = await client.messages.create({
        from: phoneNumber,
        to: to,
        body: message
      });
      return sms;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Parse call transcription for appointment details
   * This is a simplified parser - in production, use NLP/AI services
   */
  parseTranscription(transcription) {
    const appointmentData = {
      date: null,
      time: null,
      service: null,
      notes: transcription
    };

    // Basic regex patterns for date and time extraction
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
    const timePattern = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;

    const dateMatch = transcription.match(datePattern);
    const timeMatch = transcription.match(timePattern);

    if (dateMatch) {
      appointmentData.date = dateMatch[0];
    }

    if (timeMatch) {
      appointmentData.time = timeMatch[0];
    }

    return appointmentData;
  }

  /**
   * Generate TwiML response for handling calls
   */
  generateTwiML(message) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
  <Record maxLength="120" transcribe="true" transcribeCallback="/webhooks/twilio/transcription"/>
</Response>`;
  }
}

module.exports = new TwilioService();
