const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const http = require("http");
const userRoutes = require("./routes/userRoutes.js");
const conversationRoutes = require("./routes/conversationRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const { logger } = require("./middleware/logger.js");
const sequelize = require("./db.js");

const app = express();
const isDevelopment = process.env.DEVELOPMENT === "true";

const server = isDevelopment
    ? http.createServer(app)
    : https.createServer(
        {
            key: fs.readFileSync("./key.pem"),
            cert: fs.readFileSync("./cert.crt"),
        },
        app
    );

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `${req.method} ${req.url} Not found` });
});

const port = process.env.EXPRESS_PORT || 8080;

server.listen(port, async () => {
    if (process.env.SYNC === "true") {
        await sequelize.sync({ force: false });
    }
    console.log(`${isDevelopment ? "HTTP" : "HTTPS"} server listening on port ${port}`);
});