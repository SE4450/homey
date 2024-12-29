const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, login, verify, test } = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/", authenticateUser("tenant"), getUsers);

router.get("/user/:id", authenticateUser("tenant"), getUserById);

router.get("/verify", verify);

router.post("/", createUser);

router.post("/login", login);


module.exports = router;