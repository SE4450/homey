const express = require("express");
const router = express();
const { getEvents, createEvent, updateEvent, deleteEvent } = require("../controllers/eventController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", getEvents);

router.post("/", createEvent);

router.post("/updateEvent", updateEvent);

router.post("/deleteEvent", deleteEvent);

module.exports = router;