const { Appointment, User, Service } = require('../models');
const { Op } = require('sequelize');
const googleCalendarService = require('../services/googleCalendarService');

class AppointmentController {
  /**
   * Create a new appointment
   * POST /appointments
   */
  async createAppointment(req, res) {
    try {
      const {
        userId,
        serviceId,
        title,
        description,
        startTime,
        endTime,
        participants,
        source = 'api'
      } = req.body;

      // Validate required fields
      if (!userId || !title || !startTime || !endTime) {
        return res.status(400).json({
          error: 'Missing required fields: userId, title, startTime, endTime'
        });
      }

      // Check if user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check for conflicts if calendar is synced
      if (user.googleCalendarId) {
        const conflicts = await googleCalendarService.checkConflicts(
          startTime,
          endTime,
          user.googleCalendarId
        );

        if (conflicts.length > 0) {
          return res.status(409).json({
            error: 'Schedule conflict detected',
            conflicts: conflicts
          });
        }
      }

      // Create appointment
      const appointment = await Appointment.create({
        userId,
        serviceId,
        title,
        description,
        startTime,
        endTime,
        participants: participants || [],
        source,
        status: 'confirmed'
      });

      // Fetch complete appointment with associations
      const fullAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          { model: User, as: 'user' },
          { model: Service, as: 'service' }
        ]
      });

      res.status(201).json({
        success: true,
        data: fullAppointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all appointments for a user
   * GET /appointments?userId=xxx
   */
  async getAppointments(req, res) {
    try {
      const { userId, status, startDate, endDate } = req.query;

      const whereClause = {};
      if (userId) whereClause.userId = userId;
      if (status) whereClause.status = status;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate dates
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          whereClause.startTime = {
            [Op.between]: [start, end]
          };
        }
      }

      const appointments = await Appointment.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'user' },
          { model: Service, as: 'service' }
        ],
        order: [['startTime', 'ASC']]
      });

      res.json({
        success: true,
        count: appointments.length,
        data: appointments
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get a single appointment by ID
   * GET /appointments/:id
   */
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Service, as: 'service' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an appointment
   * PUT /appointments/:id
   */
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      await appointment.update(updates);

      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Service, as: 'service' }
        ]
      });

      res.json({
        success: true,
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Cancel an appointment
   * DELETE /appointments/:id
   */
  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Update status to cancelled instead of deleting
      await appointment.update({ status: 'cancelled' });

      // Delete from Google Calendar if synced
      if (appointment.googleEventId) {
        try {
          const user = await User.findByPk(appointment.userId);
          if (user.googleCalendarId) {
            await googleCalendarService.deleteEvent(
              appointment.googleEventId,
              user.googleCalendarId
            );
          }
        } catch (error) {
          console.error('Error deleting calendar event:', error);
        }
      }

      res.json({
        success: true,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Sync appointment to Google Calendar
   * POST /sync-calendar
   */
  async syncToCalendar(req, res) {
    try {
      const { appointmentId, calendarIds } = req.body;

      if (!appointmentId || !calendarIds || !Array.isArray(calendarIds)) {
        return res.status(400).json({
          error: 'Missing required fields: appointmentId, calendarIds (array)'
        });
      }

      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          { model: User, as: 'user' },
          { model: Service, as: 'service' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const syncResults = await googleCalendarService.syncAppointment(
        {
          title: appointment.title,
          description: appointment.description,
          startTime: appointment.startTime.toISOString(),
          endTime: appointment.endTime.toISOString()
        },
        calendarIds
      );

      // Update appointment with the first successful event ID
      const successfulSync = syncResults.find(r => r.success);
      if (successfulSync) {
        await appointment.update({
          googleEventId: successfulSync.eventId
        });
      }

      res.json({
        success: true,
        data: {
          appointment: appointment,
          syncResults: syncResults
        }
      });
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AppointmentController();
