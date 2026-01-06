const express = require('express');
const router = express.Router();
const twilioController = require('../controllers/twilioController');
const whatsappController = require('../controllers/whatsappController');

// Twilio webhook routes
/**
 * @route   POST /webhooks/twilio/voice
 * @desc    Handle incoming Twilio voice calls
 * @access  Public (Twilio webhook)
 */
router.post('/twilio/voice', twilioController.handleIncomingCall);

/**
 * @route   POST /webhooks/twilio/transcription
 * @desc    Handle Twilio call transcription callback
 * @access  Public (Twilio webhook)
 */
router.post('/twilio/transcription', twilioController.handleTranscription);

/**
 * @route   POST /webhooks/twilio/sms
 * @desc    Handle incoming Twilio SMS
 * @access  Public (Twilio webhook)
 */
router.post('/twilio/sms', twilioController.handleSMS);

/**
 * @route   POST /webhooks/twilio/status
 * @desc    Handle Twilio call status updates
 * @access  Public (Twilio webhook)
 */
router.post('/twilio/status', twilioController.handleCallStatus);

// WhatsApp webhook routes
/**
 * @route   GET /webhooks/whatsapp
 * @desc    Verify WhatsApp webhook
 * @access  Public (WhatsApp webhook)
 */
router.get('/whatsapp', whatsappController.verifyWebhook);

/**
 * @route   POST /webhooks/whatsapp
 * @desc    Handle incoming WhatsApp messages
 * @access  Public (WhatsApp webhook)
 */
router.post('/whatsapp', whatsappController.handleIncomingMessage);

module.exports = router;
