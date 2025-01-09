const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, markMessageAsRead } = require("../controllers/messageController");
const { authenticateUser } = require("../middleware/authenticateUser");

router.post("/send", authenticateUser(["tenant", "landlord"]), sendMessage);

router.get("/conversation/:conversationId", authenticateUser(["tenant", "landlord"]), getMessages);

router.patch("/read", authenticateUser(["tenant", "landlord"]), markMessageAsRead);

module.exports = router;
