const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(`postgresql://${encodeURIComponent(process.env.DB_USERNAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${encodeURIComponent(process.env.DB_NAME)}`);
module.exports = sequelize;
