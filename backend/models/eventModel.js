const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Event = sequelize.define("Event", {
    eventId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId : {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        }
    },
    eventName : {
        type: DataTypes.STRING,
        allowNull: false
    },
    eventDate: {
        type: DataTypes.STRING,
        allowNull: false
    },
    eventTime : {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Event;