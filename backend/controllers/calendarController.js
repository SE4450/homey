const { CalendarEvent, User } = require("../models/associations");
const { ValidationError, Op } = require("sequelize");

// Get all events
exports.getEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.findAll({
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName"],
                },
            ],
        });

        if (!events || events.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No calendar events found",
                data: [],
                errors: ["No events found in the calendar"],
            });
        }

        res.status(200).json({
            status: "success",
            message: `${events.length} event(s) found`,
            data: events,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error occurred while fetching events",
                data: [],
                errors: err.errors.map((e) => e.message),
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while fetching events",
            data: [],
            errors: [err.message],
        });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await CalendarEvent.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName"],
                },
            ],
        });

        if (!event) {
            return res.status(404).json({
                status: "error",
                message: `No event found with id ${id}`,
                data: [],
                errors: [`No event found with id ${id}`],
            });
        }

        res.status(200).json({
            status: "success",
            message: `Event ${id} found`,
            data: event,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error occurred while fetching the event",
                data: [],
                errors: err.errors.map((e) => e.message),
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while fetching the event",
            data: [],
            errors: [err.message],
        });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, eventDate, startTime, endTime, location, description, userId } = req.body;

        // Validate input fields
        const errors = [];
        if (!title || title.trim().length === 0) {
            errors.push("Title is required.");
        }
        if (!eventDate) {
            errors.push("Event date is required.");
        }
        if (!userId) {
            errors.push("User ID is required.");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Validation error(s) occurred while creating the event",
                data: [],
                errors,
            });
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: `User with ID ${userId} not found`,
                data: [],
                errors: [`User with ID ${userId} does not exist`],
            });
        }

        // Create the event
        const newEvent = await CalendarEvent.create({
            title,
            eventDate,
            startTime,
            endTime,
            location,
            description,
            userId,
        });

        res.status(201).json({
            status: "success",
            message: "Event created successfully",
            data: newEvent,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error(s) occurred while creating the event",
                data: [],
                errors: err.errors.map((e) => e.message),
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while creating the event",
            data: [],
            errors: [err.message],
        });
    }
};

// Update an existing event
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, eventDate, startTime, endTime, location, description } = req.body;

        const event = await CalendarEvent.findByPk(id);

        if (!event) {
            return res.status(404).json({
                status: "error",
                message: `Event with id ${id} not found`,
                data: [],
                errors: [`No event found with id ${id}`],
            });
        }

        await event.update({
            title,
            eventDate,
            startTime,
            endTime,
            location,
            description,
        });

        res.status(200).json({
            status: "success",
            message: `Event ${id} updated successfully`,
            data: event,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error(s) occurred while updating the event",
                data: [],
                errors: err.errors.map((e) => e.message),
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while updating the event",
            data: [],
            errors: [err.message],
        });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await CalendarEvent.findByPk(id);

        if (!event) {
            return res.status(404).json({
                status: "error",
                message: `No event found with id ${id}`,
                data: [],
                errors: [`No event found with id ${id}`],
            });
        }

        await event.destroy();

        res.status(200).json({
            status: "success",
            message: `Event ${id} deleted successfully`,
            data: [],
            errors: [],
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while deleting the event",
            data: [],
            errors: [err.message],
        });
    }
};

exports.getUpcomingEvents = async (req, res) => {
    try {
        const now = new Date();
        const twoDaysLater = new Date(now);
        twoDaysLater.setDate(now.getDate() + 2);

        const events = await CalendarEvent.findAll({
            where: {
                eventDate: {
                    [Op.between]: [now.toISOString().split('T')[0], twoDaysLater.toISOString().split('T')[0]]
                }
            },
            include: [{
                model: User,
                as: "user",
                attributes: ["id", "firstName", "lastName"]
            }]
        });

        if (!events.length) {
            return res.status(404).json({
                status: "error",
                message: "No upcoming events within 48 hours",
                data: [],
                errors: []
            });
        }

        res.status(200).json({
            status: "success",
            message: `${events.length} event(s) within 48 hours found`,
            data: events,
            errors: []
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching upcoming events",
            data: [],
            errors: [err.message]
        });
    }
};
