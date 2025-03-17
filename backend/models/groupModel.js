const { DataTypes } = require('sequelize');
const sequelize = require("../db.js");

const Group = sequelize.define('Group', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    landlordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    propertyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Properties',
            key: 'id'
        },
        onDelete: 'SET NULL'
    }
}, {
    timestamps: true,
    tableName: 'groups'
});

module.exports = Group;
