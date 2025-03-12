const express = require("express");
const router = express.Router();
const {
  getChores,
  addChore,
  updateChore,
  deleteChore,
} = require("../controllers/choresController");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getChores);
router.post("/", authenticateUser(["tenant", "landlord"]), addChore);
router.put("/:id", authenticateUser(["tenant", "landlord"]), updateChore);
router.delete("/:id", authenticateUser(["tenant", "landlord"]), deleteChore);

module.exports = router;
