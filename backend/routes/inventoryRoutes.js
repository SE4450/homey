const express = require("express");
const router = express.Router();
const { getInventory, getLowItem, createInventory, deleteInventoryItem, removeQuantity } = require("../controllers/inventoryController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/:groupId", authenticateUser(["tenant", "landlord"]), getInventory);

router.get("/getLowItem/:groupId", authenticateUser(["tenant", "landlord"]), getLowItem);

router.post("/createInventory", authenticateUser(["tenant", "landlord"]), createInventory);

router.post("/deleteItem", authenticateUser(["tenant", "landlord"]), deleteInventoryItem);

router.post("/removeQuantity", authenticateUser(["tenant", "landlord"]), removeQuantity);

module.exports = router;