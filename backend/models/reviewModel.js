const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Review = sequelize.define("Review", {
    reviewId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    reviewType:{
        type: DataTypes.ENUM,
        values: ["user", "property"],
        allowNull: false
    },
    reviewedItemId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reviewerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Review;
