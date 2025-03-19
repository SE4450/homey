const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const Conversation = sequelize.define("Conversation", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
