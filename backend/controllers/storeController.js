const Store = require("../models/storeModel.js");
const { ValidationError } = require("sequelize");

//get all the items in the list
exports.getStoreEntries = async (req, res) => {
    try {
        //get all the entries in the database for some searched item
        const foundItems = await Store.findAll({ where: req.query});

        if(foundItems.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No items exist for the given search",
                data: [],
                errors: [`no lists found with data ${JSON.stringify(req.query)}`]
            });
        }

        res.status(200).json({
            status: "success",
            message: `${foundItems.length} stores with item found`,
            data: foundItems,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get store entries due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the store entries",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



//create a new entry in the database
exports.createStoreEntry = async (req, res) => {
    try {
        const {itemName, store, price, storeLink} = req.body;

        const newStore = await Store.create({
            itemName,
            store,
            price,
            storeLink
        });

        res.status(201).json({
            status: "success",
            message: "New Store Created",
            data: newStore,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create store entry due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create the store entry",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



//delete an entry in the database
exports.deleteStoreEntry = async (req, res) => {
    try {
        const {itemID} = req.body;

        const newStore = await Store.destroy({ where: { itemID: itemID}});

        res.status(201).json({
            status: "success",
            message: "New Store Created",
            data: newStore,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create store entry due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create the store entry",
            data: [],
            errors: [`${err.message}`]
        });
    }
}