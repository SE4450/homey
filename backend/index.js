const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const http = require("http");
const userRoutes = require("./routes/userRoutes.js");
const listRoutes = require("./routes/listRoutes.js");
const storeRoutes = require("./routes/storeRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js");
const conversationRoutes = require("./routes/conversationRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const { logger } = require("./middleware/logger.js");
const sequelize = require("./db.js");
const expenseRoutes = require("./routes/expenseRoutes.js");
const inventoryRoutes = require("./routes/inventoryRoutes.js");
const calendarRoutes = require("./routes/calendarRoutes.js");

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
app.use("/api/lists", listRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/calendar", inventoryRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `${req.method} ${req.url} Not found` });
});

const port = process.env.EXPRESS_PORT || 8080;

if (process.env.DEVELOPMENT == "true") {
    app.listen(port, async () => {
        if (process.env.SYNC == "true") {
            await sequelize.sync({ force: false });
        }
        console.log(`HTTP listening on port ${port}`);
    });
} else {
    const server = https.createServer({ key: fs.readFileSync("./key.pem"), cert: fs.readFileSync("./cert.crt") }, app);
    server.listen(port, async () => {
        if (process.env.SYNC == "true") {
            await sequelize.sync({ force: false });
        }
        console.log(`HTTPS listening on port ${port}`);
    });
}
