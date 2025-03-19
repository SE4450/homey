// calendarModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const CalendarEvent = sequelize.define("CalendarEvent", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  // Event title (e.g., "Meeting with Team")
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Date of the event
  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // Optional start time (e.g., "14:00")
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  // Optional end time (e.g., "16:00")
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  // Optional location for the event
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Optional description or additional details
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true
});
module.exports = CalendarEvent;
