const express = require("express");
const router = express.Router();
const { getProfile, updateProfile} = require("../controllers/profileController.js");

router.get("/", getProfile);

router.post("/updateProfile", updateProfile);


module.exports = router;