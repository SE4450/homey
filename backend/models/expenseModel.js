const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const { Group, User } = require("./associations"); // Import Group model

const Expense = sequelize.define("Expense", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    expenseName: {
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
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paidBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
    },
    owedTo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id",
        },
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "expenses",
});

module.exports = Expense;