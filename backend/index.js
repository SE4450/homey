const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userRoutes = require("./routes/userRoutes.js");
const conversationRoutes = require("./routes/conversationRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const { logger } = require("./middleware/logger.js");
const sequelize = require("./db.js");

const app = express();
const isDevelopment = process.env.DEVELOPMENT == "true";

const server = isDevelopment ? http.createServer(app) : https.createServer({ key: fs.readFileSync("./key.pem"), cert: fs.readFileSync("./cert.crt") }, app);

const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `${req.method} ${req.url} Not found` });
});

app.use((req, res, next) => {
    req.app.set("io", io);
    next();
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error"));
    }
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = user;
        next();
    } catch (err) {
        return next(new Error("Authentication error"));
    }
});

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id} (Socket ID: ${socket.id})`);

    socket.on("joinConversation", (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.user.id} joined conversation_${conversationId}`);
    });

    socket.on("sendMessage", (data) => {
        const { conversationId, message } = data;

        io.to(`conversation_${conversationId}`).emit("newMessage", {
            senderId: socket.user.id,
            conversationId,
            message,
        });
    });

    socket.on("typing", (conversationId) => {
        socket.to(`conversation_${conversationId}`).emit("userTyping", { userId: socket.user.id });
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.id} (Socket ID: ${socket.id})`);
    });
});

const port = process.env.EXPRESS_PORT || 8080;

server.listen(port, async () => {
    if (process.env.SYNC == "true") {
        await sequelize.sync({ force: false });
    }
    console.log(`${isDevelopment ? "HTTP" : "HTTPS"} server listening on port ${port}`);
});