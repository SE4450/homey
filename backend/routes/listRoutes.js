const express = require("express");
const router = express.Router();
const {
    getLists,
    createList,
    deleteList,
    getItems,
    createItem,
    updateItem,
    deleteItem
} = require("../controllers/listController.js");
const { authenticateUser } = require("../middleware/authenticateUser");

// Middleware validation to ensure `authenticateUser` is defined correctly
if (typeof authenticateUser !== "function") {
    throw new Error("authenticateUser must be a valid middleware function");
}

// Route to get all lists for a user
router.get("/", authenticateUser("tenant"), async (req, res, next) => {
    try {
        await getLists(req, res);
    } catch (err) {
        next(err); // Pass errors to the global error handler
    }
});

// Route to create a new list
router.post("/createList", async (req, res, next) => {
    try {
        await createList(req, res);
    } catch (err) {
        next(err);
    }
});

// Route to delete a list
router.delete("/deleteList", async (req, res, next) => {
    try {
        await deleteList(req, res);
    } catch (err) {
        next(err);
    }
});

// Route to get items for a list
router.get("/items", async (req, res, next) => {
    try {
        await getItems(req, res);
    } catch (err) {
        next(err);
    }
});

// Route to create a new item in a list
router.post("/createItem", async (req, res, next) => {
    try {
        await createItem(req, res);
    } catch (err) {
        next(err);
    }
});

// Route to update an item in a list
router.post("/updateItem/:row", async (req, res, next) => {
    try {
        await updateItem(req, res);
    } catch (err) {
        next(err);
    }
});

// Route to delete an item from a list
router.post("/deleteItem", async (req, res, next) => {
    try {
        await deleteItem(req, res);
    } catch (err) {
        next(err);
    }
});

// Global error handler for routes
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error
    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        errors: [err.message]
    });
});

module.exports = router;
