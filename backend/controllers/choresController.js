const { Chore, User } = require("../models/associations");
const { ValidationError } = require("sequelize");
const sequelize = require("../db.js");
exports.getChores = async (req, res) => {
  try {
    const { houseId, assignedTo } = req.query;
    // Build the filter condition
    const whereClause = {};
    if (houseId) {
      whereClause.houseId = houseId;
    }
    if (assignedTo) {
      whereClause.assignedTo = assignedTo;
    }
    // Get all chores matching the filter
    const chores = await Chore.findAll({
      order: ["dueDate", "ASC"],
      where: whereClause,
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (chores.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No chores found",
        data: [],
        errors: [],
      });
    }
    res.status(200).json({
      status: "success",
      message: `${chores.length} chore(s) found`,
      data: chores,
      errors: [],
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while fetching chores",
      data: [],
      errors: [err.message],
    });
  }
};
exports.addChore = async (req, res) => {
  try {
    const { choreName, room, assignedTo, houseId, bannerImage, dueDate } =
      req.body;
    // Validate required fields
    if (!choreName || choreName.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Chore name is required",
        data: [],
        errors: ["Chore name cannot be empty"],
      });
    }
    if (!room || room.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Room is required",
        data: [],
        errors: ["Room cannot be empty"],
      });
    }
    // Create the chore
    const chore = await Chore.create({
      choreName,
      room,
      assignedTo: assignedTo || null,
      houseId: houseId || null,
      bannerImage: bannerImage || null,
      dueDate: dueDate || null,
      completed: false,
    });
    res.status(201).json({
      status: "success",
      message: "Chore added successfully",
      data: chore,
      errors: [],
    });
  } catch (err) {
    console.error("Error adding chore:", err);
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while adding the chore",
      data: [],
      errors: [err.message],
    });
  }
};
exports.updateChore = async (req, res) => {
  try {
    const { id } = req.params;
    const { choreName, room, assignedTo, completed, bannerImage, dueDate } =
      req.body;
    // Find the chore
    const chore = await Chore.findByPk(id);
    if (!chore) {
      return res.status(404).json({
        status: "error",
        message: "Chore not found",
        data: [],
        errors: [`No chore found with ID: ${id}`],
      });
    }
    // Update the chore
    await chore.update({
      choreName: choreName || chore.choreName,
      room: room || chore.room,
      assignedTo: assignedTo !== undefined ? assignedTo : chore.assignedTo,
      completed: completed !== undefined ? completed : chore.completed,
      bannerImage: bannerImage || chore.bannerImage,
      dueDate: dueDate !== undefined ? dueDate : chore.dueDate,
    });
    res.status(200).json({
      status: "success",
      message: "Chore updated successfully",
      data: chore,
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
      message: "An unexpected error occurred while updating the chore",
      data: [],
      errors: [err.message],
    });
  }
};
exports.deleteChore = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the chore
    const chore = await Chore.findByPk(id);
    if (!chore) {
      return res.status(404).json({
        status: "error",
        message: "Chore not found",
        data: [],
        errors: [`No chore found with ID: ${id}`],
      });
    }
    // Delete the chore
    await chore.destroy();
    res.status(200).json({
      status: "success",
      message: "Chore deleted successfully",
      data: [],
      errors: [],
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while deleting the chore",
      data: [],
      errors: [err.message],
    });
  }
};
exports.getChoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const chore = await Chore.findByPk(id, {
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });
    if (!chore) {
      return res.status(404).json({
        status: "error",
        message: "Chore not found",
        data: null,
        errors: [`No chore found with ID: ${id}`],
      });
    }
    res.status(200).json({
      status: "success",
      message: "Chore found",
      data: chore,
      errors: [],
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred while fetching the chore",
      data: null,
      errors: [err.message],
    });
  }
};
