const Store = require("../models/storeModel.js");
const { ValidationError } = require("sequelize");

//get all the items in the list
exports.getStoreEntries = async (req, res) => {
    try {
        const { item } = req.params.itemName;
        //get all the entries in the database for some searched item
        const foundItems = await Store.findAll({ where: {itemName: item}});

        if(foundItems.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No lists exist for the given user",
                data: [],
                errors: [`no lists found with data ${JSON.stringify(req.query)}`]
            });
        }

        res.status(200).json({
            status: "success",
            message: `${usersLists.length} stores with item found`,
            data: foundItems,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get stores due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the stores",
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

        req.stataus(201).json({
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