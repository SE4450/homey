const express = require("express");
const router = express.Router();
const { getReviews, createReview } = require("../controllers/reviewController");
const { authenticateUser } = require("../middleware/authenticateUser");


router.get("/", authenticateUser(["tenant", "landlord"]), getReviews);

router.post("/", authenticateUser(["tenant", "landlord"]), createReview);

module.exports = router;