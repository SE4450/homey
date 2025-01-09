const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Item = sequelize.define("Item", {
    listId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    rowId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    item: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    assignedTo: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = Item;