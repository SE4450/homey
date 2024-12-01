const express = require("express");
const router = express.Router();
const { getProfile, updateProfile} = require("../controller/profileController.js");

router.get("/", getProfile);

router.post("/updateProfile", updateProfile);


module.exports = router;