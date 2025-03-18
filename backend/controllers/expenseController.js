const { Expense, User } = require("../models/associations");
const { ValidationError } = require("sequelize");

exports.addExpense = async (req, res) => {
    try {
        const { expenseName, amount, owedTo, paidBy } = req.body;

        // Validate required fields
        const errors = [];
        if (!expenseName || expenseName.trim().length === 0) {
            errors.push("Expense name is required.");
        }
        if (!amount || isNaN(amount) || amount <= 0) {
            errors.push("Amount must be a positive number.");
        }
        if (!owedTo) {
            errors.push("OwedTo (user ID) is required.");
        }
        if (!paidBy) {
            errors.push("PaidBy (user ID) is required.");
        }
        if (owedTo === paidBy) {
            errors.push("OwedTo and PaidBy cannot be the same user.");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Validation error(s)",
                data: [],
                errors,
            });
        }

        // Ensure users exist
        const [owedToUser, paidByUser] = await Promise.all([
            User.findByPk(owedTo),
            User.findByPk(paidBy),
        ]);
        if (!owedToUser) {
            errors.push(`User with ID ${owedTo} does not exist.`);
        }
        if (!paidByUser) {
            errors.push(`User with ID ${paidBy} does not exist.`);
        }
        if (errors.length > 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
                data: [],
                errors,
            });
        }

        // Create the expense
        const expense = await Expense.create({
            expenseName,
            amount,
            owedTo,
            paidBy,
        });

        res.status(201).json({
            status: "success",
            message: "Expense added successfully",
            data: expense,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error(s)",
                data: [],
                errors: err.errors.map((e) => e.message),
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while adding the expense",
            data: [],
            errors: [err.message],
        });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const { owedTo, paidBy } = req.query;

        // Validation: Ensure at least one filter is provided
        if (!owedTo && !paidBy) {
            return res.status(400).json({
                status: "error",
                message: "At least one of 'owedTo' or 'paidBy' must be provided as a query parameter",
                data: [],
                errors: ["Missing filter criteria (owedTo or paidBy)"],
            });
        }

        // Build the filter condition
        const whereClause = {};
        if (owedTo) {
            whereClause.owedTo = owedTo;
        }
        if (paidBy) {
            whereClause.paidBy = paidBy;
        }

        whereClause.completed = false;

        // Fetch the expenses
        const expenses = await Expense.findAll({
            where: whereClause,
            include: [
                { model: User, as: "owedToUser", attributes: ["id", "firstName", "lastName"] },
                { model: User, as: "paidByUser", attributes: ["id", "firstName", "lastName"] },
            ],
        });

        if (expenses.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No expenses found for the provided filter(s)",
                data: [],
                errors: [`No expenses found for filter criteria: ${JSON.stringify(whereClause)}`],
            });
        }

        res.status(200).json({
            status: "success",
            message: `${expenses.length} expense(s) found`,
            data: expenses,
            errors: [],
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while fetching expenses",
            data: [],
            errors: [err.message],
        });
    }
};

exports.completeExpense = async (req, res) => {
    try {
        const expenseId = req.params.id;
        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).json({
                status: "error",
                message: "Expense not found",
                data: [],
                errors: [`Expense with id ${expenseId} not found.`],
            });
        }
        expense.completed = true;
        await expense.save();
        res.status(200).json({
            status: "success",
            message: "Expense marked as completed",
            data: expense,
            errors: [],
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while completing the expense",
            data: [],
            errors: [err.message],
        });
    }
};

