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
const propertyRoutes = require("./routes/propertyRoutes.js");
const groupRoutes = require("./routes/groupRoutes.js");
const choresRoutes = require("./routes/choresRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(logger);
app.use("/api/users", userRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chores", choresRoutes);
app.use("/api/reviews", reviewRoutes);
app.use((req, res) => {
  res.status(404).json({ message: `${req.method} ${req.url} Not found` });
});
const port = process.env.EXPRESS_PORT || 8080;
if (process.env.DEVELOPMENT == "true") {
  app.listen(port, async () => {
    if (process.env.SYNC == "true") {
      await sequelize.sync({ force: false });
      console.log("Database synced");
    }
    console.log(`HTTP listening on port ${port}`);
  });
} else {
  const server = https.createServer({ key: fs.readFileSync("./key.pem"), cert: fs.readFileSync("./cert.crt") }, app);
  server.listen(port, async () => {
    console.log(`HTTPS listening on port ${port}`);
  });
}
