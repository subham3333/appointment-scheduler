const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const User = require('./User');
const Service = require('./Service');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Service,
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  source: {
    type: DataTypes.ENUM('phone', 'whatsapp', 'api', 'manual'),
    allowNull: false
  },
  googleEventId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Google Calendar Event ID for synced appointments'
  },
  participants: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of participant user IDs or contact information'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Additional appointment metadata (transcription, messages, etc.)'
  }
}, {
  tableName: 'appointments',
  timestamps: true
});

// Define associations
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Appointment.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });
User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });
Service.hasMany(Appointment, { foreignKey: 'serviceId', as: 'appointments' });

module.exports = Appointment;
