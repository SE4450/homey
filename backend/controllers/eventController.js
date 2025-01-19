const { Event } = require('../models/associations');
const { ValidationError } = require("sequelize");

exports.getEvents = async(req, res) => {
    try {
        const houseEvents = await Event.findAll( { where: req.query } );

        if(houseEvents.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No events exist for the given houseshold",
                data: [],
                errors: [`no events found with data ${JSON.stringify(req.query)}`]
            });
        }

        return res.status(200).json({
            status: "success",
            message: `${houseEvents.length} events found`,
            data: houseEvents,
            errors: []
        });

    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get users events due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the users events",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



exports.createEvent = async (req, res) => {
    try {
        const {userId, eventName, eventDate, eventTime} = req.body;

        const newEvent = await Event.create({
            userId,
            eventName,
            eventDate,
            eventTime
        });

        return res.status(201).json({
            status: "success",
            message: "event created",
            data: newEvent,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create event due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create the event",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



exports.updateEvent = async (req, res) => {
    try {
        const {eventId, eventName, eventDate, eventTime} = req.body;
        let houseEvent = Event;

        if(eventName != null) {
            houseEvent = await Event.update({ eventName: eventName }, { where: { eventId: eventId }});
        }
        if(eventDate != null) {
            houseEvent = await Event.update({ eventDate: eventDate }, { where: { eventId: eventId }});
        }
        if(eventTime) {
            houseEvent = await Event.update({ eventTime: eventTime }, { where: { eventId: eventId }});
        }
        
        res.status(201).json({
            status: "success",
            message: "updated the event in the calendar",
            data: houseEvent,
            errors: []
        })
        
    } catch (err){
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to update the event due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to update the event",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



exports.deleteEvent = async (req, res) => {
    try {
        const {eventId} = req.body;
        const houseEvent = await Event.destroy({ where: { eventId: eventId } });

        res.status(201).json({
            status: "success",
            message: "deleted the event from the calendar",
            data: houseEvent,
            errors: []
        });
    } catch (err){
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to delete the event due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to delete the event",
            data: [],
            errors: [`${err.message}`]
        });
    }
}