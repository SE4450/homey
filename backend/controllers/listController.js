const List = require("../models/listModel.js");
const Item = require("../models/itemModel.js");
const { ValidationError } = require("sequelize");
//way to get all of the users lists
exports.getLists = async (req, res) => {
    try {
        //first get the lists for the user  query needs to be: ?userId= thid users id  example: http://10.0.0.236:8080/api/lists?userId=1
        const usersLists = await List.findAll({ order: ['createdAt'], where: req.query }); //req.query is what we're calling in the url ?key1=value1&key2=value2...
        if(usersLists.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No lists exist for the given user",
                data: [],
                errors: [`no lists found with data ${JSON.stringify(req.query)}`]
            });
        }
        res.status(200).json({
            status: "success",
            message: `${usersLists.length} lists found`,
            data: usersLists,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get lists due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the lists",
            data: [],
            errors: [`${err.message}`]
        });
    }
}
//option to create a new list
exports.createList = async (req, res) => {
    try {
        const {userId, listName} = req.body;
        const userList = await List.create({
            userId,
            listName,
        });
        res.status(201).json({
            status: "success",
            message: "List created",
            data: userList,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create list due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create the list",
            data: [],
            errors: [`${err.message}`]
        });
    }
}
//option to delete a list
exports.deleteList = async (req, res) => {
    try {
        const { listId } = req.body;
        const userList = await List.destroy({ where: { listId: listId}});
        if(userList) {
            //clear out an items that are in the deleted list
            await Item.destroy({ where: { listId: listId }});
        }
        res.status(201).json({
            status: "success",
            message: "List deleted",
            data: userList,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to delete list due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to delete the list",
            data: [],
            errors: [`${err.message}`]
        });
    }
}
//option to get all items in a list
exports.getItems = async (req, res) => {
    try {
        //the listId needs to be sent in the body for this to work
        const listItems = await Item.findAll({ order: ['createdAt'], where: req.query});
        if(listItems.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No items exist for the users given list",
                data: [],
                errors: [`no lists found with data ${JSON.stringify(req.query)}`]
            });
        }
        res.status(200).json({
            status: "success",
            message: `${listItems.length} items found for the list`,
            data: listItems,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get items due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the items",
            data: [],
            errors: [`${err.message}`]
        });
    }
}
//option to add an item to the list
exports.createItem = async (req, res) => {
    try {
        const { listId, item, assignedTo } = req.body;
        //first check if the sent item is already in the list
        const existingListItem = await Item.findAll({ where: { listId: listId, item: item }});
        if(existingListItem.length != 0) {
            return res.status(400).json({
                status: "error",
                message: "The item already exists in the list",
                data: [],
                errors:  [`The item already exists in the list`]
            });
        }
        else {
            const listItem = await Item.create({
                listId: listId,
                item: item,
                assignedTo: assignedTo,
                purchased: 0
            });
            res.status(201).json({
                status: "success",
                message: "item added to list",
                data: listItem,
                errors: []
            });
        }
        
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create items due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create the items",
            data: [],
            errors: [`${err.message}`]
        });
    }
}
//option to assign someone to the item 
exports.updateItem = async (req, res) => {
    try {
        const { rowNum, listId, item, assignedTo, purchased } = req.body;
        let listItem = Item;
        if(item != null) {
            listItem = await Item.update({ item: item }, { where: { listId: listId, itemId: rowNum }});
        }
        if(assignedTo != null) {
            listItem = await Item.update({ assignedTo: assignedTo }, { where: { listId: listId, itemId: rowNum }});
        }
        if(purchased != null) {
            listItem = await Item.update({ purchased: purchased }, { where: { listId: listId, itemId: rowNum }});
        }
        res.status(201).json({
            status: "success",
            message: "updated the items in the list",
            data: listItem,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to add an assignment due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to update the assignment of items",
            data: [],
            errors: [`${err.message}`]
        });
    }
}
//option to remove an item from a list
exports.deleteItem = async (req, res) => {
    try {
        const { listId, rowNum } = req.body;
        let listItem = await Item.destroy({ where: { listId: listId, itemId: rowNum }});
        res.status(201).json({
            status: "success",
            message: "deleted the item in the list",
            data: listItem,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to delete the item due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to delete the item of items",
            data: [],
            errors: [`${err.message}`]
        });
    }
}