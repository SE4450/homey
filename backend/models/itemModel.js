const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Item = sequelize.define("Item", {
    itemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    listId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    item: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    assignedTo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    purchased: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Item;