const express = require("express");
const cors = require("cors");
const db = require("./db.js");
const fs = require("fs");
const https = require("https");
const userRoutes = require("./routes/userRoutes.js");
const listRoutes = require("./routes/listRoutes.js");
const storeRoutes = require("./routes/storeRoutes.js");
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
