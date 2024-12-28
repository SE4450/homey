const express = require("express");
const cors = require("cors");
const db = require("./db.js");
const fs = require("fs");
const https = require("https");
const userRoutes = require("./routes/userRoutes.js");
const listRoutes = require("./routes/listRoutes.js");
const storeRoutes = require("../routes/storeRoutes.js");
const { logger } = require("./middleware/logger.js");
const sequelize = require("./db.js");
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/api/users", userRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/stores", storeRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `${req.method} ${req.url} Not found` });
});

const options = {
    key: fs.readFileSync("/etc/ssl/private/key.pem"),
    cert: fs.readFileSync("/etc/ssl/certs/cert.pem")
}

const server = https.createServer(options, app);
const port = process.env.EXPRESS_PORT || 3000;

server.listen(port, async () => {
    await sequelize.sync({force: false});
    console.log(`Listening on port ${port}`);
});