const User = require("../models/userModel.js");
const Profile = require("../models/profileModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ValidationError } = require("sequelize");
const transporter = require("../mail.js");
const validator = require("validator");
const passwordValidator = require("password-validator");
const sequelize = require("../db.js");
const emailExistence = require("email-existence");

exports.getUsers = async (req, res) => {
    try {
        delete req.query.password;
        delete req.query.email;

        const users = await User.findAll({ attributes: { exclude: ["password", "email"] }, where: req.query });
        if (users.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No user(s) found",
                data: [],
                errors: [`No user(s) found with data ${JSON.stringify(req.query)}`]
            });
        }
        res.status(200).json({
            status: "success",
            message: `${users.length} user(s) found`,
            data: users,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get user(s) due to validation error(s)",
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
                message: `No user found`,
                data: [],
                errors: [`User ${req.params.id} does not exist`]
            });
        }
        res.status(200).json({
            status: "success",
            message: `User ${req.params.id} found`,
            data: [user],
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: `Unable to get user ${req.params.id} due to validation error(s)`,
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: `An unexpected error occured while trying to get user ${req.params.id}`,
            data: [],
            errors: [`${err.message}`]
        });
    }
}

exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, role } = req.body;

        const errors = [];

        if (!firstName || firstName.length < 2) {
            errors.push("First name must be at least 2 characters long");
        }

        if (!lastName || lastName.length < 2) {
            errors.push("Last name must be at least 2 characters long");
        }

        if (!email || !validator.isEmail(email)) {
            errors.push("Email must be a valid email address");
        }

        if (!username || username.length < 6) {
            errors.push("Username must be at least 6 characters long");
        }

        const schema = new passwordValidator();
        schema
            .is().min(8)
            .is().max(100)
            .has().uppercase()
            .has().lowercase()
            .has().digits(1)
            .has().symbols(1)
            .has().not().spaces()

        if (!password || !schema.validate(password)) {
            const failures = schema.validate(password, { details: true }).reduce((current, rule, index) => current + `${index + 1}. ${rule.message.replace("string", "password")}\n`, "");
            errors.push(`Password validation failed:\n\n${failures}`);
        }

        const validRoles = ["tenant", "landlord"];
        if (!role || !validRoles.includes(role)) {
            errors.push(`Role must be one of the following: ${validRoles.join(", ")}`);
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create user due to validation error(s)",
                data: [],
                errors: errors
            });
        }

        const transaction = await sequelize.transaction();

        try {
            const user = await User.create({
                firstName,
                lastName,
                username,
                email,
                password: await bcrypt.hash(password, 10),
                role
            }, { transaction });

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const verificationLink = `${process.env.DEVELOPMENT ? "http" : "https"}://${process.env.HOST}:${process.env.EXPRESS_PORT}/api/users/verify?token=${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Homey - Email Verification",
                html: `<p>Hi ${user.firstName},</p>
                    <p>Thanks for registering! Please verify your email by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Email</a>`,
            });
            await transaction.commit();
            res.status(201).json({
                status: "success",
                message: `User ${user.id} created`,
                data: [],
                errors: []
            });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: `Unable to create user due to validation error(s)`,
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

exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if ((!username && !email) || !password) {
            const missingFields = [];
            if (!username && !email) missingFields.push("username or email");
            if (!password) missingFields.push("password");

            return res.status(400).json({
                status: "error",
                message: "Missing fields in request",
                data: [],
                errors: missingFields.map(field => `Missing ${field}`),
            });
        }

        const user = await User.findOne({ where: username ? { username } : { email } });

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials",
                data: [],
                errors: ["Incorrect username/email or password"],
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials",
                data: [],
                errors: ["Incorrect username/email or password"],
            });
        }

        if (!user.verified) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const verificationLink = `${process.env.DEVELOPMENT ? "http" : "https"}://${process.env.HOST}:${process.env.EXPRESS_PORT}/api/users/verify?token=${token}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Homey - Email Verification",
                html: `<p>Hi ${user.firstName},</p>
             <p>Thanks for registering! Please verify your email by clicking the link below:</p>
             <a href="${verificationLink}">Verify Email</a>`,
            });
            return res.status(403).json({
                status: "error",
                message: `Resent verification email to ${user.email}`,
                data: [],
                errors: ["Account is not verified"],
            });
        }

        const token = jwt.sign({ userId: user.id, role: user.role, verified: user.verified }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: [{ token }],
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: `Unable to login due to validation error(s)`,
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred during login",
            data: [],
            errors: [err.message],
        });
    }
};

exports.verify = async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
                data: [],
                errors: [`User ${decoded.id} not found for given token`]
            });
        }

        user.verified = true;
        await user.save();

        let id = decoded.id;
        await Profile.create({ id });

        res.status(200).json({
            status: "success",
            message: `User ${decoded.id} has been verified`,
            data: [],
            errors: []
        });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            res.status(401).json({
                status: "error",
                message: "The token has expired. Please login again to send another verification email",
                data: [],
                errors: [err.message]
            });
        } else if (err.name === "JsonWebTokenError") {
            res.status(401).json({
                status: "error",
                message: "Invalid token. Please log in or provide a valid token",
                data: [],
                errors: [err.message]
            });
        } else if (err.name === "NotBeforeError") {
            res.status(401).json({
                status: "error",
                message: "The token is not yet active. Please check your system time",
                data: [],
                errors: [err.message]
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "An unexpected error occurred while trying to verify the token",
                data: [],
                errors: [err.message]
            });
        }
    }
};