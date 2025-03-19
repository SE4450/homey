const { DataTypes } = require('sequelize');
const sequelize = require("../db.js");

const GroupParticipant = sequelize.define('GroupParticipant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'groups',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    tableName: 'group_participants'
});

module.exports = GroupParticipant;
