const List = require("../models/listModel.js");
const shoppingItem = require("../models/shoppingItemModel.js");
const expenseItem = require("../models/expenseItemModel.js");
const choreItem = require("../models/choresItemModel.js");
const { ValidationError } = require("sequelize");

// Utility function to get the correct model
const getModel = (type) => {
    switch (type) {
        case "Shopping":
            return shoppingItem;
        case "Expense":
            return expenseItem;
        case "Chores":
            return choreItem;
        default:
            throw new Error("Invalid list type");
    }
};

// Get all items in a list
exports.getItems = async (req, res) => {
    try {
        const { type, listId } = req.query;
        const model = getModel(type);
        const listItems = await model.findAll({ where: { listId } });

        if (listItems.length === 0) {
            return res.status(404).json({
                status: "error",
                message: `No items found for the ${type} list`,
                data: [],
            });
        }

        res.status(200).json({
            status: "success",
            message: `${listItems.length} items found`,
            data: listItems,
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Create a new item
const { ValidationError } = require("sequelize");
const shoppingItem = require("../models/shoppingItemModel.js");
const expenseItem = require("../models/expenseItemModel.js");
const choreItem = require("../models/choresItemModel.js");

// Utility function to get the correct model
const getModel = (type) => {
    switch (type) {
        case "Shopping":
            return shoppingItem;
        case "Expense":
            return expenseItem;
        case "Chores":
            return choreItem;
        default:
            throw new Error("Invalid list type");
    }
};

exports.createItem = async (req, res) => {
    try {
        const { type, listId, ...data } = req.body;

        if (!listId || !Object.keys(data).length) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields",
                data: [],
                errors: ["listId and item details are required"]
            });
        }

        const model = getModel(type);

        const listItem = await model.create({
            listId,
            ...data
        });

        res.status(201).json({
            status: "success",
            message: `${type} item added successfully`,
            data: listItem,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create item due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while trying to create the item",
            data: [],
            errors: [`${err.message}`]
        });
    }
};



// Update an item
exports.updateItem = async (req, res) => {
    try {
        const { type, listId, ...updates } = req.body;
        const { rowId } = req.params;
        const model = getModel(type);

        await model.update(updates, { where: { listId, rowId } });
        res.status(200).json({ status: "success", message: "Item updated" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Delete an item
exports.deleteItem = async (req, res) => {
    try {
        const { type, listId, rowId } = req.body;
        const model = getModel(type);

        await model.destroy({ where: { listId, rowId } });
        res.status(200).json({ status: "success", message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Create a list
exports.createList = async (req, res) => {
    try {
        const { userId, listName } = req.body;
        const newList = await List.create({ userId, listName });

        res.status(201).json({
            status: "success",
            message: "List created",
            data: newList,
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

// Delete a list
exports.deleteList = async (req, res) => {
    try {
        const { listId } = req.body;
        await List.destroy({ where: { listId } });

        res.status(200).json({ status: "success", message: "List deleted" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};
