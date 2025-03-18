const express = require("express");
const router = express.Router();
const { getReviews, createReview } = require("../controllers/reviewController");
const { authenticateUser } = require("../middleware/authenticateUser");


router.get("/", getReviews);

router.post("/", createReview);

module.exports = router;