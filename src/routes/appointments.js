const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { optionalAuth } = require('../middlewares/auth');

// Apply optional authentication to all routes
router.use(optionalAuth);

/**
 * @route   POST /appointments
 * @desc    Create a new appointment
 * @access  Public
 */
router.post('/', appointmentController.createAppointment);

/**
 * @route   GET /appointments
 * @desc    Get all appointments (with optional filters)
 * @access  Public
 * @query   userId, status, startDate, endDate
 */
router.get('/', appointmentController.getAppointments);

/**
 * @route   GET /appointments/:id
 * @desc    Get a single appointment by ID
 * @access  Public
 */
router.get('/:id', appointmentController.getAppointmentById);

/**
 * @route   PUT /appointments/:id
 * @desc    Update an appointment
 * @access  Public
 */
router.put('/:id', appointmentController.updateAppointment);

/**
 * @route   DELETE /appointments/:id
 * @desc    Cancel an appointment
 * @access  Public
 */
router.delete('/:id', appointmentController.cancelAppointment);

/**
 * @route   POST /sync-calendar
 * @desc    Sync appointment to Google Calendar
 * @access  Public
 */
router.post('/sync-calendar', appointmentController.syncToCalendar);

module.exports = router;
