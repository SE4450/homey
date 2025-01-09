const express = require("express");
const router = express.Router();
const { getProfile, updateProfile} = require("../controllers/profileController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getProfile);

router.post("/updateProfile/:id", authenticateUser(["tenant", "landlord"]), updateProfile);


module.exports = router;