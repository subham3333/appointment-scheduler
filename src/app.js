const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { logger, errorLogger } = require('./middlewares/logger');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Appointment Scheduler API',
    version: '1.0.0',
    endpoints: {
      appointments: '/appointments',
      syncCalendar: '/sync-calendar',
      webhooks: {
        twilio: '/webhooks/twilio/*',
        whatsapp: '/webhooks/whatsapp'
      }
    }
  });
});

// Import routes
const appointmentRoutes = require('./routes/appointments');
const webhookRoutes = require('./routes/webhooks');

// API Routes
app.use('/appointments', appointmentRoutes);
app.use('/webhooks', webhookRoutes);

// Error handling middleware
app.use(errorLogger);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
