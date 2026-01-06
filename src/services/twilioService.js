const { client, phoneNumber } = require('../../config/twilio');
const { parseAppointmentDetails } = require('../utils/parser');

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
    return parseAppointmentDetails(transcription);
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
