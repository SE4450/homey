const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const Group = require("./groupModel"); // Import Group model

const Expense = sequelize.define("Expense", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "groups",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paidBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
    owedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
    },
}, {
    timestamps: true,
    tableName: "expenses",
});

module.exports = Expense;