const express = require("express");
const router = express.Router();
const { getUsers, getUserById, getConfidentialUserInfo, createUser, login, verify } = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser(["tenant", "landlord"]), getUsers);

router.get("/user/:id", authenticateUser(["tenant", "landlord"]), getUserById);

router.get("/me", authenticateUser(["tenant", "landlord"]), getConfidentialUserInfo);

router.get("/verify", verify);

router.post("/", createUser);

router.post("/login", login);

module.exports = router;