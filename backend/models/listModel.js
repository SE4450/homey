const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const Group = require("./groupModel.js")

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
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: "id",
        },
        onDelete: "CASCADE",
    }
});

module.exports = List;