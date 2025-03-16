const { CalendarEvent } = require("../models/calendarModel");
const { ValidationError } = require("sequelize");

// Get all events
exports.getEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.findAll();

        if (events.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No calendar events found",
                data: [],
                errors: ["No events found in the calendar"]
            });
        }

        res.status(200).json({
            status: "success",
            message: `${events.length} event(s) found`,
            data: events,
            errors: []
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching calendar events",
            data: [],
            errors: [err.message]
        });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await CalendarEvent.findByPk(id);

        if (!event) {
            return res.status(404).json({
                status: "error",
                message: "Event not found",
                data: [],
                errors: [`No event found with id ${id}`]
            });
        }

        res.status(200).json({
            status: "success",
            message: `Event ${id} found`,
            data: event,
            errors: []
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "An error occurred while fetching the event",
            data: [],
            errors: [err.message]
        });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, eventDate, startTime, endTime, location, description } = req.body;

        // Validate input
        const errors = [];
        if (!title || title.trim().length === 0) {
            errors.push("Title is required.");
        }
        if (!eventDate) {
            errors.push("Event date is required.");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                data: [],
                errors,
            });
        }

        // Create the event
        const newEvent = await CalendarEvent.create({
            title,
            eventDate,
            startTime,
            endTime,
            location,
            description
        });

        res.status(201).json({
            status: "success",
            message: "Event created successfully",
            data: newEvent,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                data: [],
                errors: err.errors.map(error => error.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An error occurred while creating the event",
            data: [],
            errors: [err.message]
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
                message: "Event not found",
                data: [],
                errors: [`No event found with id ${id}`]
            });
        }

        await event.update({
            title,
            eventDate,
            startTime,
            endTime,
            location,
            description
        });

        res.status(200).json({
            status: "success",
            message: `Event ${id} updated successfully`,
            data: event,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                data: [],
                errors: err.errors.map(error => error.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An error occurred while updating the event",
            data: [],
            errors: [err.message]
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
                message: "Event not found",
                data: [],
                errors: [`No event found with id ${id}`]
            });
        }

        await event.destroy();

        res.status(200).json({
            status: "success",
            message: `Event ${id} deleted successfully`,
            data: [],
            errors: []
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "An error occurred while deleting the event",
            data: [],
            errors: [err.message]
        });
    }
};
