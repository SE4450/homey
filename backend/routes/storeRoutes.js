const express = require("express");
const router = express.Router();
const { getStoreEntries, createStoreEntry } = require("../controllers/storeController.js");
router.get("/getEntries", getStoreEntries);
router.post("/createEntries", createStoreEntry);
module.exports = router;