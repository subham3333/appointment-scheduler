const axios = require('axios');
const whatsappConfig = require('../../config/whatsapp');
const { parseAppointmentDetails } = require('../utils/parser');

class WhatsAppService {
  /**
   * Send a WhatsApp message
   */
  async sendMessage(to, message) {
    try {
      const url = `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/messages`;
      
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${whatsappConfig.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send appointment confirmation via WhatsApp
   */
  async sendAppointmentConfirmation(to, appointmentDetails) {
    const message = `✅ Appointment Confirmed!\n\n` +
      `📅 Date: ${appointmentDetails.date}\n` +
      `⏰ Time: ${appointmentDetails.time}\n` +
      `📝 Service: ${appointmentDetails.service}\n\n` +
      `Thank you for booking with us!`;

    return await this.sendMessage(to, message);
  }

  /**
   * Parse incoming WhatsApp message for appointment details
   * This is a simplified parser - in production, use NLP/AI services
   */
  parseMessage(messageText) {
    return parseAppointmentDetails(messageText);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === whatsappConfig.verifyToken) {
      return challenge;
    }
    return null;
  }
}

module.exports = new WhatsAppService();
