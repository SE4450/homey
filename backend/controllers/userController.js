const User = require("../models/userModel.js");
const bcrypt = require('bcrypt');
const { Sequelize } = require("sequelize");

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ["password", "email"] }, where: req.query });
        if (users.length = 0) {
            res.status(404).json({
                status: "error",
                message: "User(s) not found",
                data: [],
                errors: [`No users found that match properties in ${JSON.stringify(req.query)}`]
            });
        }
        res.status(200).json({
            status: "success",
            message: "User(s) Found",
            data: [users],
            errors: []
        });
    } catch (err) {
        if (err instanceof Sequelize.ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get user(s) due to validation error",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get user(s)",
            data: [],
            errors: [`${err.message}`]
        });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: { exclude: ["password", "email"] } });
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
                data: [],
                errors: [`No users with id ${req.params.id}`]
            });
        }
        res.status(200).json({
            status: "success",
            message: "User found",
            data: [user],
            errors: []
        });
    } catch (err) {
        if (err instanceof Sequelize.ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get user due to validation error",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get user",
            data: [],
            errors: [`${err.message}`]
        });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, role } = req.body;

        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: await bcrypt.hash(password, 10),
            role,
        });

        res.status(201).json({
            status: "success",
            message: "User created",
            data: user,
            errors: []
        });
    } catch (err) {
        if (err instanceof Sequelize.ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create user due to validation error(s)",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create user",
            data: [],
            errors: [`${err.message}`]
        });
    }
};
