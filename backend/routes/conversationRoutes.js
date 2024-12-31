const express = require("express");
const router = express.Router();
const { getConversations, getConversationById, createDM, createGroupChat, addParticipant, removeParticipant } = require("../controllers/conversationController");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getConversations);

router.get("/:conversationId", authenticateUser(["tenant", "landlord"]), getConversationById);

router.post("/dm", authenticateUser(["tenant", "landlord"]), createDM);

router.post("/group", authenticateUser(["tenant", "landlord"]), createGroupChat);

router.post("/participants/add", authenticateUser(["tenant", "landlord"]), addParticipant);

router.delete("/participants/remove", authenticateUser(["tenant", "landlord"]), removeParticipant);

module.exports = router;
