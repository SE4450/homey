const express = require("express");
const cors = require("cors");
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

const port = process.env.EXPRESS_PORT || 3000;

if (process.env.DEVELOPMENT == "true") {
    app.listen(port, () => {
        console.log(`HTTP listening on port ${port}`);
    });
} else {
    const server = https.createServer({ key: fs.readFileSync("./key.pem"), cert: fs.readFileSync("./cert.crt") }, app);
    server.listen(port, () => {
        console.log(`HTTPS listening on port ${port}`);
    });
}