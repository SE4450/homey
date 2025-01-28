const Inventory = require("../models/inventoryModel.js");
const { ValidationError } = require("sequelize");

//get the inventory for the user
exports.getInventory = async(req, res) => {
    try {
        //get the inventory based on the house id
        const inventoryList = await Inventory.findAll({ where: req.query });

        if(inventoryList == 0) {
            return res.status(404).json({
                status: "error",
                message: "No inventory exists for the given house",
                data: [],
                errors: [`no inventory found with data ${JSON.stringify(req.query)}`]
            });
        }

        res.status(200).json({
            status: "success",
            message: `${usersLists.length} inventory found`,
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



//create a new inventory
exports.createInventory = async(req, res) => {
    try {
        //variables received from message
        const { houseId, itemName} = req.body;

        //variable that will hold the new inventory item created
        let newInventoryItem;

        //check to see if the user already has this item in the database
        const inventoryItem = await Inventory.findOne({ where: { houeId: houseId, itemName: itemName.toLowerCase()}});

        //if we didn't find any item then we can create it
        if(!inventoryItem) {
            newInventoryItem = await Inventory.create({
                houseId: houseId,
                itemName: itemName.toLowerCase(),
                quantity: 0
            });
            
            //send response
            res.status(201).json({
                status: "success",
                message: "item added to inventory",
                data: newInventoryItem,
                errors: []
            });
        }
        else{
            res.status(400).json({
                status: "success",
                message: "item already exists",
                data: newInventoryItem,
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


//add new inventory quantity
exports.updateQuantity = async(req, res) => {
    try {
        //sent parameters
        const { itemId, houseId, quantity, addOrRemove } = req.body;

        //check the addOrRemove flag to see if the user wants to increase or decrease the inventory quantity
        if(addOrRemove) {
            //increment the quantity amount
            const inventoryItem = await Inventory.update({ quantity: quantity+1 }, { where: { houseId: houseId, itemId: itemId } });

            res.status(201).json({
                status: "success",
                message: "item added to inventory",
                data: inventoryItem,
                errors: []
            });
        }
        //otherwise decrement
        else {
            //response message
            let message = "item removed from the inventory";

            //reduce the quantity of the inventory
            const inventoryItem = await Inventory.update({quantity: quantity-1}, { where: { houseId: houseId, itemId: itemId}});

            //check to see if there is any of the inventory to delete
            if(inventoryItem.quantity == 0) {
                message = `There is no more ${inventoryItem.itemName}`;
            }
            res.status(201).json({
                status: "success",
                message: `${message}`,
                data: inventoryItem,
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