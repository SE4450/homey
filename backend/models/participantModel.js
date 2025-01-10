const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./userModel");
const Conversation = require("./conversationModel");

const Participant = sequelize.define("Participant", {
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
            key: "id",
        },
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id",
        },
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM,
        values: ["tenant", "landlord"],
        defaultValue: "tenant"
    }
}, {
    timestamps: true
});

module.exports = Participant;