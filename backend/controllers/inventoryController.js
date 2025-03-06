const Inventory = require("../models/inventoryModel.js");
const { ValidationError } = require("sequelize");

//get the inventory for the user
exports.getInventory = async(req, res) => {
    try {
        //get the inventory based on the house id
        const inventoryList = await Inventory.findAll({ order: ['createdAt'], where: req.query });

        if(inventoryList == 0) {
            return res.status(204).json({
                status: "success",
                message: "No inventory exists for the given house",
                data: "empty",
                errors: []  //`no inventory found with data ${JSON.stringify(req.query)}`
            });
        }

        res.status(200).json({
            status: "success",
            message: `${inventoryList.length} inventory found`,
            data: inventoryList,
            errors: []
        });
    } catch(err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get inventory due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the inventory",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



//endpoint to get all items that have a quantity less then 1
exports.getLowItem = async(req, res) => {
    try {
        const inventoryItem = await Inventory.findAll({ order: ['createdAt'], where: req.query });

        if(inventoryItem == 0) {
            return res.status(204).json({
                status: "success",
                message: "No inventory exists for the given house",
                data: "empty",
                errors: []  //`no inventory found with data ${JSON.stringify(req.query)}`
            });
        }

        res.status(200).json({
            status: "success",
            message: `${inventoryItem.length} inventory found`,
            data: inventoryItem,
            errors: []
        });
    } catch(err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get inventory due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the inventory",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



//create a new inventory item
exports.createInventory = async(req, res) => {
    try {
        //variables received from message
        const { houseId, itemName} = req.body;

        //check to see if the user already has this item in the database
        const inventoryItem = await Inventory.findOne({ where: { houseId: houseId, itemName: itemName.toLowerCase()}});

        //if we didn't find any item then we can create it
        if(!inventoryItem) {
            const newInventoryItem = await Inventory.create({
                houseId: houseId,
                itemName: itemName.toLowerCase(),
                quantity: 1
            });
            
            //send response
            res.status(201).json({
                status: "success",
                message: "item added to inventory",
                data: newInventoryItem,
                errors: []
            });
        }
        //otherwise if the item already exists update it's quantity in the database
        else{
            //increment the quantity amount
            const UpdatedInventory = await Inventory.update({ quantity: inventoryItem.quantity+1 }, { where: { houseId: houseId, itemId: inventoryItem.itemId } });

            res.status(201).json({
                status: "success",
                message: "item added to inventory",
                data: UpdatedInventory,
                errors: []
            });
        }

    } catch(err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create new inventory due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create new inventory",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



//delete an inventroy item
exports.deleteInventoryItem = async(req, res) => {
    try {
        const { itemId, houseId } = req.body;

        //check to make sure the item exists
        const inventoryItem = await Inventory.findOne({ where: { houseId: houseId, itemId: itemId }});

        if(inventoryItem == 0) {
            return res.status(404).json({
                status: "error",
                message: "The inventory does not exist",
                data: [],
                errors: ["No inventroy exists"]
            });
        } 
        else{
            //if we find the inventory, delete it from the list
            const newInventoryList = await Inventory.destroy({ where: { houseId: houseId, itemId: itemId }});

            res.status(201).json({
                status: "success",
                message: "item deleted",
                data: newInventoryList,
                errors: []
            });
        }

    } catch(err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to delete the inventory due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to delete new inventory",
            data: [],
            errors: [`${err.message}`]
        });
    }
}


//add new inventory quantity
exports.removeQuantity = async(req, res) => {
    try {
        //sent parameters
        const { itemId, houseId, quantity } = req.body;

        //find the item the user wants to decrement
        const inventoryItem = await Inventory.findOne({ where: { houseId: houseId, itemId: itemId}});

        //if the inventory item is already zero send an error response
        if(inventoryItem.quantity == 0) {
            return res.status(404).json({
                status: "error",
                message: "The inventory is already empty for this item",
                data: [],
                errors: ["No inventory to decrement"]
            });
        }
        //otherwise decrement the item quantity by one
        else {
            //response message
            let message = "item removed from the inventory";

            //reduce the quantity of the inventory
            const updatedInventory = await Inventory.update({quantity: quantity-1}, { where: { houseId: houseId, itemId: itemId}});

            //check to see if there is any of the inventory to delete
            if(inventoryItem.quantity == 2) {
                message = `There is only one more ${inventoryItem.itemName}`;
            }
            res.status(201).json({
                status: "success",
                message: `${message}`,
                data: updatedInventory,
                errors: []
            });
        }      
    } catch(err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create new inventory due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create new inventory",
            data: [],
            errors: [`${err.message}`]
        });
    }
}