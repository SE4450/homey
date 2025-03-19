const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const User = require("./userModel");
const Conversation = require("./conversationModel");
const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    conversationId: {
        type: DataTypes.INTEGER,
        references: {
            model: Conversation,
            key: "id"
        },
        allowNull: false
    },
    senderId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id"
        },
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    readBy: {
        type: DataTypes.JSON,
        allowNull: true
    },
}, {
    timestamps: true
});
module.exports = Message;