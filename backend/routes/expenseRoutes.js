const express = require("express");
const { addExpense, getExpenses, completeExpense } = require("../controllers/expenseController");
const router = express.Router();
const { authenticateUser } = require("../middleware/authenticateUser");

router.post("/", authenticateUser(["tenant", "landlord"]), addExpense);
router.get("/:groupId", authenticateUser(["tenant", "landlord"]), getExpenses);
router.put("/:id/complete", authenticateUser(["tenant", "landlord"]), completeExpense);

module.exports = router;
