const { Expense, User, Group } = require("../models"); // Ensure models are imported

/**
 * Add an Expense to a Group
 */
exports.addExpense = async (req, res) => {
    try {
        const { groupId, description, amount, owedTo, paidBy } = req.body;

        // Validate required fields
        if (!groupId || !description || !amount || !owedTo || !paidBy) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields",
                data: [],
                errors: ["groupId, description, amount, owedTo, and paidBy are required"],
            });
        }

        // Ensure the group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found",
                data: null,
                errors: [`No group found with ID ${groupId}`],
            });
        }

        // Create the expense
        const expense = await Expense.create({
            groupId,
            description,
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
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to add expense",
            data: [],
            errors: [error.message],
        });
    }
};

/**
 * Get all Expenses for a Group
 */
exports.getExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { owedBy, paidBy } = req.query; // Query params for filtering

        // Ensure the group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found",
                data: null,
                errors: [`No group found with ID ${groupId}`],
            });
        }

        // Build query conditions
        let whereClause = { groupId };
        if (owedBy) whereClause.owedTo = owedBy;
        if (paidBy) whereClause.paidBy = paidBy;

        // Fetch expenses
        const expenses = await Expense.findAll({
            where: whereClause,
            include: [
                { model: User, as: "owedToUser", attributes: ["id", "firstName", "lastName"] },
                { model: User, as: "paidByUser", attributes: ["id", "firstName", "lastName"] },
            ],
        });

        res.status(200).json({
            status: "success",
            message: `${expenses.length} expense(s) found`,
            data: expenses,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve expenses",
            data: [],
            errors: [error.message],
        });
    }
};