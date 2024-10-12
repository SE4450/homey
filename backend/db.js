const pg = require("pg");

const db = new pg.Client({ connectionString: `postgresql://${encodeURIComponent(process.env.DB_USERNAME)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${encodeURIComponent(process.env.DB_NAME)}` });
db.connect();

module.exports = db;
