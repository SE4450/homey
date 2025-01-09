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
    expense: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    payer: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

module.exports = Item;