const { calendar } = require('../../config/googleCalendar');

class GoogleCalendarService {
  /**
   * Create a calendar event
   */
  async createEvent(eventDetails) {
    try {
      const event = {
        summary: eventDetails.title,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startTime,
          timeZone: eventDetails.timeZone || 'UTC'
        },
        end: {
          dateTime: eventDetails.endTime,
          timeZone: eventDetails.timeZone || 'UTC'
        },
        attendees: eventDetails.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: eventDetails.calendarId || 'primary',
        resource: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error.message);
      throw error;
    }
  }

  /**
   * Update a calendar event
   */
  async updateEvent(eventId, eventDetails, calendarId = 'primary') {
    try {
      const event = {
        summary: eventDetails.title,
        description: eventDetails.description,
        start: {
          dateTime: eventDetails.startTime,
          timeZone: eventDetails.timeZone || 'UTC'
        },
        end: {
          dateTime: eventDetails.endTime,
          timeZone: eventDetails.timeZone || 'UTC'
        }
      };

      const response = await calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        resource: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error.message);
      throw error;
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId, calendarId = 'primary') {
    try {
      await calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
        sendUpdates: 'all'
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting calendar event:', error.message);
      throw error;
    }
  }

  /**
   * Check for schedule conflicts
   */
  async checkConflicts(startTime, endTime, calendarId = 'primary') {
    try {
      const response = await calendar.events.list({
        calendarId: calendarId,
        timeMin: startTime,
        timeMax: endTime,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error checking conflicts:', error.message);
      throw error;
    }
  }

  /**
   * Sync appointment to both parties' calendars
   */
  async syncAppointment(appointment, userCalendarIds) {
    const syncResults = [];

    for (const calendarId of userCalendarIds) {
      try {
        const event = await this.createEvent({
          title: appointment.title,
          description: appointment.description,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          calendarId: calendarId
        });

        syncResults.push({
          calendarId: calendarId,
          eventId: event.id,
          success: true
        });
      } catch (error) {
        syncResults.push({
          calendarId: calendarId,
          success: false,
          error: error.message
        });
      }
    }

    return syncResults;
  }
}

module.exports = new GoogleCalendarService();
