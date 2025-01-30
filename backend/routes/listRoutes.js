const express = require("express");
const router = express.Router();
const { getLists, createList, deleteList, getItems, createItem, updateItem, deleteItem } = require("../controllers/listController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getLists);

router.post("/createList", authenticateUser(["tenant", "landlord"]), createList);

router.post("/deleteList", authenticateUser(["tenant", "landlord"]), deleteList);

router.get("/items", authenticateUser(["tenant", "landlord"]), getItems);

router.post("/createItem", authenticateUser(["tenant", "landlord"]), createItem);

router.post("/updateItem", authenticateUser(["tenant", "landlord"]), updateItem);

router.post("/deleteItem", authenticateUser(["tenant", "landlord"]), deleteItem);

module.exports = router;