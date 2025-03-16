// const { DataTypes } = require("sequelize");
// const sequelize = require("../db.js");

// const PropertyImage = sequelize.define("PropertyImage", {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     propertyId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: "properties",
//             key: "id"
//         },
//         onDelete: "CASCADE"
//     },
//     label: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     image: {
//         type: DataTypes.BLOB("long"),
//         allowNull: false
//     },
//     description: {
//         type: DataTypes.TEXT,
//         allowNull: true
//     }
// }, {
//     timestamps: true,
//     tableName: "property_images" // Ensure this is explicitly set
// });

// module.exports = PropertyImage;