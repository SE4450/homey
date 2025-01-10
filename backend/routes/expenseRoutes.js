const express = require("express");
const { addExpense, getExpenses } = require("../controllers/expenseController");
const router = express.Router();
const { authenticateUser } = require("../middleware/authenticateUser");

router.post("/", authenticateUser(["tenant", "landlord"]), addExpense);
router.get("/", authenticateUser(["tenant", "landlord"]), getExpenses);

module.exports = router;
