const express = require("express");
const router = express();
const { getEvents, createEvent, updateEvent, deleteEvent } = require("../controllers/eventController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getEvents);
router.post("/", authenticateUser(["tenant", "landlord"]), createEvent);
router.post("/updateEvent", authenticateUser(["tenant", "landlord"]), updateEvent);
router.post("/deleteEvent", authenticateUser(["tenant", "landlord"]), deleteEvent);

module.exports = router;