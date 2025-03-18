const express = require("express");
const { addExpense, getExpenses, completeExpense } = require("../controllers/expenseController");
const router = express.Router();
const { authenticateUser } = require("../middleware/authenticateUser");

router.post("/", addExpense);
router.get("/", getExpenses);
router.put("/:id/complete", completeExpense);

module.exports = router;
