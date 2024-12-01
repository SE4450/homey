const express = require("express");
const router = express.Router();
const { getLists, createList, deleteList, getItems, createItem, updateItem, deleteItem } = require("../controllers/listController.js");

router.get("/", getLists);

router.post("/createList", createList);

router.delete("/deleteList", deleteList);

router.get("/items", getItems);

router.post("/createItem", createItem);

router.post("/updateItem/:row", updateItem);

router.delete("/deleteItem", deleteItem);

module.exports = router;