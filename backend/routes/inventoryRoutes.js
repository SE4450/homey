const express = require("express");
const router = express.Router();
const { getInventory, createInventory, updateQuantity } = require("../controllers/inventoryController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getInventory);

router.post("/", authenticateUser(["tenant", "landlord"]), createInventory);

router.post("/updateQuantity", authenticateUser(["tenant", "landlord"]), updateQuantity);

module.exports = router;