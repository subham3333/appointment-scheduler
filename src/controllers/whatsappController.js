const { Appointment, User } = require('../models');
const whatsappService = require('../services/whatsappService');

class WhatsAppController {
  /**
   * Verify WhatsApp webhook
   * GET /webhooks/whatsapp
   */
  verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const verificationResult = whatsappService.verifyWebhook(mode, token, challenge);

      if (verificationResult) {
        res.status(200).send(verificationResult);
      } else {
        res.status(403).send('Forbidden');
      }
    } catch (error) {
      console.error('Error verifying webhook:', error);
      res.status(403).send('Forbidden');
    }
  }

  /**
   * Handle incoming WhatsApp messages
   * POST /webhooks/whatsapp
   */
  async handleIncomingMessage(req, res) {
    try {
      const { entry } = req.body;

      if (!entry || !entry[0]?.changes) {
        return res.status(200).send('OK');
      }

      const changes = entry[0].changes[0];
      const value = changes.value;

      // Check if it's a message
      if (!value.messages) {
        return res.status(200).send('OK');
      }

      const message = value.messages[0];
      const from = message.from;
      const messageBody = message.text?.body;

      if (!messageBody) {
        return res.status(200).send('OK');
      }

      console.log(`WhatsApp message from ${from}: ${messageBody}`);

      // Parse message for appointment details
      const appointmentData = whatsappService.parseMessage(messageBody);

      // Find or create user
      let user = await User.findOne({ where: { whatsappNumber: from } });
      if (!user) {
        user = await User.create({
          name: `User ${from}`,
          phone: from,
          whatsappNumber: from
        });
      }

      // Create appointment if we have date and time
      if (appointmentData.date && appointmentData.time) {
        const appointment = await Appointment.create({
          userId: user.id,
          title: 'WhatsApp Appointment',
          description: appointmentData.notes,
          startTime: new Date(`${appointmentData.date} ${appointmentData.time}`),
          endTime: new Date(new Date(`${appointmentData.date} ${appointmentData.time}`).getTime() + 60 * 60 * 1000),
          source: 'whatsapp',
          status: 'pending',
          metadata: {
            messageId: message.id,
            originalMessage: messageBody
          }
        });

        // Send confirmation
        await whatsappService.sendAppointmentConfirmation(from, {
          date: appointmentData.date,
          time: appointmentData.time,
          service: appointmentData.service || 'General'
        });
      } else {
        // Request more information
        await whatsappService.sendMessage(
          from,
          'Thank you for contacting us! To book an appointment, please provide:\n\n' +
          '📅 Date (DD/MM/YYYY)\n' +
          '⏰ Time (HH:MM AM/PM)\n' +
          '📝 Service needed\n\n' +
          'Example: 25/12/2024 10:00 AM Consultation'
        );
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Error handling WhatsApp message:', error);
      res.status(500).send('Error processing message');
    }
  }

  /**
   * Send WhatsApp notification
   * POST /api/whatsapp/send
   */
  async sendNotification(req, res) {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          error: 'Missing required fields: to, message'
        });
      }

      const result = await whatsappService.sendMessage(to, message);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new WhatsAppController();
