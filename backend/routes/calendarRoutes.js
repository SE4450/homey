// calendarRoutes.js
const express = require("express");
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent
} = require("../controllers/calendarController");
const { authenticateUser } = require("../middleware/authenticateUser");

// Get all events
router.get("/", authenticateUser(["tenant", "landlord"]), getEvents);

// Get events within 48 hours
router.get("/upcoming", authenticateUser(["tenant", "landlord"]), getUpcomingEvents);

// Create a new event
router.post("/", authenticateUser(["tenant", "landlord"]), createEvent);

// Update an event by id
router.put("/:id", authenticateUser(["tenant", "landlord"]), updateEvent);

// Delete an event by id
router.delete("/:id", authenticateUser(["tenant", "landlord"]), deleteEvent);

module.exports = router;
