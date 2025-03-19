const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const Profile = sequelize.define("Profile", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    cleaningHabits: {
        type: DataTypes.ENUM,
        values: ["", "Low", "Medium", "High"],
        allowNull: true,
    },
    noiseLevel: {
        type: DataTypes.ENUM,
        values: ["", "Low", "Medium", "High"],
        allowNull: true,
    },
    sleepStart: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sleepEnd: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    alergies:{
        type: DataTypes.STRING,
        allowNull: true
    }
});
module.exports = Profile;