const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const Group = require("./groupModel");

const Conversation = sequelize.define("Conversation", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: "id",
        },
        onDelete: "CASCADE",
    },
    type: {
        type: DataTypes.ENUM,
        values: ["dm", "group"],
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Conversation;