const express = require("express");
const router = express.Router();
const { getStoreEntries, createStoreEntry } = require("../controllers/storeController.js");

router.get("/getEntries/:itemName", getStoreEntries);

router.post("/createEntries", createStoreEntry);