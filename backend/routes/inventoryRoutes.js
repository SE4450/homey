const express = require("express");
const router = express.Router();
const { getInventory, getLowItem, createInventory, removeQuantity } = require("../controllers/inventoryController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getInventory);

router.get("/getLowItem", authenticateUser(["tenant", "landlord"]), getLowItem);

router.post("/createInventory", authenticateUser(["tenant", "landlord"]), createInventory);

router.post("/removeQuantity", authenticateUser(["tenant", "landlord"]), removeQuantity);

module.exports = router;