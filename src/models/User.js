const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  whatsappNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  googleCalendarId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Google Calendar ID for syncing appointments'
  },
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'User preferences for appointment scheduling'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
