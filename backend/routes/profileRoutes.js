const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/:groupId", authenticateUser(["tenant", "landlord"]), getProfile);

router.post("/updateProfile/:groupId", authenticateUser(["tenant", "landlord"]), updateProfile);

module.exports = router;