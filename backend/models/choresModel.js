const { DataTypes } = require("sequelize");
const sequelize = require("../db.js");
const User = require("./userModel");

const Chore = sequelize.define(
  "Chore",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    choreName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    houseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // We'll store the image path or identifier here
    bannerImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "Chores",
  }
);

module.exports = Chore;
