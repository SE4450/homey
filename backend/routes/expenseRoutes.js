const express = require("express");
const { addExpense, getExpenses } = require("../controllers/expenseController");
const router = express.Router();
const { authenticateUser } = require("../middleware/authenticateUser");

router.post("/", addExpense);
router.get("/", getExpenses);

module.exports = router;
