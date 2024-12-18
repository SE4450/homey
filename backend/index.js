const express = require("express");
const cors = require("cors");
const db = require("./db.js");
const fs = require("fs");
const https = require("https");
const userRoutes = require("./routes/userRoutes.js");
const { logger } = require("./middleware/logger.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/api/users", userRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `${req.method} ${req.url} Not found` });
});

const options = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem")
}

const server = https.createServer(options, app);
const port = process.env.EXPRESS_PORT || 3000;

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});