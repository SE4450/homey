const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Inventory = sequelize.define("Inventory", {
    itemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    houseId: {   //this needs to be modified when the house model is created to be a foreign key
        type: DataTypes.INTEGER,
        allowNull: false
    },
    itemName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Inventory;