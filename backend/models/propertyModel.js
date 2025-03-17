const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");

const Property = sequelize.define("Property",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        propertyDescription: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        bedrooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1, // At least 1 bedroom required
            },
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        propertyType: {
            type: DataTypes.ENUM(
                "House",
                "Apartment",
                "Condo",
                "Townhouse",
                "Duplex",
                "Studio",
                "Loft",
                "Bungalow",
                "Cabin",
                "Mobile Home",
                "Other"
            ),
            allowNull: false,
        },
        availability: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        landlordId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        exteriorImage: {
            type: DataTypes.BLOB("long"),
            allowNull: false,
        },
    },
    {
        timestamps: true,
        tableName: "properties",
    }
);

module.exports = Property;