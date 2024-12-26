const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

const authenticateUser = (role) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Invalid token",
                data: [],
                errors: ["Token is invalid or expired, please login to get a new token"],
            });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role != role) {
                return res.status(403).json({
                    status: "error",
                    message: "Access denied",
                    data: [],
                    errors: [`User role must be ${role} and you are ${decoded.role}`],
                });
            }
            req.user = decoded;
            next();
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({
                    status: "error",
                    message: "The token has expired. Please log in again.",
                    data: [],
                    errors: [err.message],
                });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid token. Please log in or provide a valid token.",
                    data: [],
                    errors: [err.message],
                });
            } else if (err.name === "NotBeforeError") {
                return res.status(401).json({
                    status: "error",
                    message: "The token is not yet active. Please check your system time.",
                    data: [],
                    errors: [err.message],
                });
            } else {
                return res.status(500).json({
                    status: "error",
                    message: "An unexpected error occurred while trying to verify the token.",
                    data: [],
                    errors: [err.message],
                });
            }
        }
    };
};

module.exports = { authenticateUser };
