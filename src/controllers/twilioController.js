const { Appointment, User } = require('../models');
const twilioService = require('../services/twilioService');
const { createDateTime } = require('../utils/parser');
const { DEFAULT_APPOINTMENT_DURATION_MS } = require('../utils/constants');

class TwilioController {
  /**
   * Handle incoming Twilio voice calls
   * POST /webhooks/twilio/voice
   */
  async handleIncomingCall(req, res) {
    try {
      const { From, CallSid } = req.body;

      console.log(`Incoming call from ${From}, CallSid: ${CallSid}`);

      // Generate TwiML response
      const twiml = twilioService.generateTwiML(
        'Hello! Thank you for calling. Please describe your appointment needs after the beep.'
      );

      res.type('text/xml');
      res.send(twiml);
    } catch (error) {
      console.error('Error handling incoming call:', error);
      res.status(500).send('Error processing call');
    }
  }

  /**
   * Handle call transcription callback
   * POST /webhooks/twilio/transcription
   */
  async handleTranscription(req, res) {
    try {
      const { TranscriptionText, CallSid, From } = req.body;

      console.log(`Transcription received for ${From}: ${TranscriptionText}`);

      // Parse transcription for appointment details
      const appointmentData = twilioService.parseTranscription(TranscriptionText);

      // Find or create user
      let user = await User.findOne({ where: { phone: From } });
      if (!user) {
        user = await User.create({
          name: `User ${From}`,
          phone: From
        });
      }

      // Create appointment with parsed data
      // Note: In production, you'd want more sophisticated parsing
      // and potentially human verification before confirming
      if (appointmentData.date && appointmentData.time) {
        const startTime = createDateTime(appointmentData.date, appointmentData.time);
        
        if (startTime) {
          const endTime = new Date(startTime.getTime() + DEFAULT_APPOINTMENT_DURATION_MS);
          
          const appointment = await Appointment.create({
            userId: user.id,
            title: 'Phone Appointment',
            description: appointmentData.notes,
            startTime: startTime,
            endTime: endTime,
            source: 'phone',
            status: 'pending',
            metadata: {
              callSid: CallSid,
              transcription: TranscriptionText
            }
          });

          // Send confirmation SMS
          await twilioService.sendSMS(
            From,
            `Your appointment request has been received. Confirmation pending.`
          );
        } else {
          // Send SMS for invalid date/time
          await twilioService.sendSMS(
            From,
            'We received your call but the date/time format was unclear. Please reply with: DD/MM/YYYY HH:MM AM/PM'
          );
        }
      } else {
        // Send SMS asking for clarification
        await twilioService.sendSMS(
          From,
          'We received your call but couldn\'t determine the appointment details. Please reply with: DATE TIME SERVICE'
        );
      }

      res.status(200).send('Transcription processed');
    } catch (error) {
      console.error('Error handling transcription:', error);
      res.status(500).send('Error processing transcription');
    }
  }

  /**
   * Handle incoming SMS
   * POST /webhooks/twilio/sms
   */
  async handleSMS(req, res) {
    try {
      const { From, Body } = req.body;

      console.log(`SMS received from ${From}: ${Body}`);

      // Parse SMS for appointment details
      const appointmentData = twilioService.parseTranscription(Body);

      // Find user
      let user = await User.findOne({ where: { phone: From } });
      if (!user) {
        user = await User.create({
          name: `User ${From}`,
          phone: From
        });
      }

      // Send acknowledgment
      await twilioService.sendSMS(
        From,
        'Thank you for your message. We will process your appointment request shortly.'
      );

      res.status(200).send('SMS processed');
    } catch (error) {
      console.error('Error handling SMS:', error);
      res.status(500).send('Error processing SMS');
    }
  }

  /**
   * Handle call status callback
   * POST /webhooks/twilio/status
   */
  async handleCallStatus(req, res) {
    try {
      const { CallSid, CallStatus } = req.body;

      console.log(`Call ${CallSid} status: ${CallStatus}`);

      res.status(200).send('Status received');
    } catch (error) {
      console.error('Error handling call status:', error);
      res.status(500).send('Error processing status');
    }
  }
}

module.exports = new TwilioController();
