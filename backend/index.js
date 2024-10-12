const express = require("express");
const cors = require("cors");
const db = require("./db.js");
const fs = require("fs");
const https = require("https");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`Request: ${req.method}\tPath: ${req.url}`);
    db.query(`INSERT INTO sometable(id) values(10) returning id`);
    next();
});

const options = {
    key: fs.readFileSync("/etc/ssl/private/key.pem"),
    cert: fs.readFileSync("/etc/ssl/certs/cert.pem"),
}

const server = https.createServer(options, app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});