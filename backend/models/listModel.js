const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const List = sequelize.define("List", {
    listId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    listName: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});
module.exports = List;