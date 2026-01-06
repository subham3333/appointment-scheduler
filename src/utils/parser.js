/**
 * Utility functions for parsing appointment information from text
 */

/**
 * Parse date and time from text
 * Supports formats: DD/MM/YYYY, DD-MM-YYYY, HH:MM AM/PM
 */
function parseAppointmentDetails(text) {
  const appointmentData = {
    date: null,
    time: null,
    service: null,
    notes: text
  };

  // Date pattern (supports DD/MM/YYYY and DD-MM-YYYY)
  const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  const dateMatch = text.match(datePattern);

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    
    // Convert 2-digit year to 4-digit
    if (year.length === 2) {
      year = '20' + year;
    }
    
    // Store in ISO format (YYYY-MM-DD) to avoid ambiguity
    appointmentData.date = `${year}-${month}-${day}`;
  }

  // Time pattern (HH:MM with optional AM/PM)
  const timePattern = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;
  const timeMatch = text.match(timePattern);

  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const period = timeMatch[3]?.toLowerCase();

    // Convert to 24-hour format if AM/PM is specified
    if (period === 'pm' && hours < 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }

    appointmentData.time = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  }

  return appointmentData;
}

/**
 * Create Date object from parsed date and time strings
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {string} timeStr - Time in HH:MM:SS format
 * @returns {Date|null} - Date object or null if invalid
 */
function createDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    return null;
  }

  try {
    const dateTimeStr = `${dateStr}T${timeStr}`;
    const date = new Date(dateTimeStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error creating date:', error);
    return null;
  }
}

module.exports = {
  parseAppointmentDetails,
  createDateTime
};
