const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const store = sequelize.define("store", {
    itemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    itemName: {
        type: DataTypes.STRING,
        allwoNull: false,
    },
    store: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    storeLink: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = store;