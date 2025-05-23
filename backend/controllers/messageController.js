const { User, Message, Conversation, Participant } = require("../models/associations");
const { ValidationError } = require("sequelize");

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user.userId;

        if (!conversationId || !content || content.trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "conversationId and non-empty content are required",
                data: [],
                errors: ["Both conversationId and content must be provided"]
            });
        }

        const conversation = await Conversation.findOne({
            where: { id: conversationId },
            include: {
                model: Participant,
                as: "participants",
                where: { userId: senderId },
                attributes: []
            }
        });

        if (!conversation) {
            return res.status(403).json({
                status: "error",
                message: "You are not authorized to send messages in this conversation",
                data: [],
                errors: ["User is not a participant or the conversation does not exist"]
            });
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            content: content.trim()
        });

        res.status(201).json({
            status: "success",
            message: "Message sent successfully",
            data: [newMessage],
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error occurred while sending the message",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while sending the message",
            data: [],
            errors: [`${err.message}`]
        });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const loggedInUserId = req.user.userId;

        if (!conversationId) {
            return res.status(400).json({
                status: "error",
                message: "conversationId is required",
                data: [],
                errors: ["conversationId must be provided in the request parameters"]
            });
        }

        // Ensure the user is a participant in the conversation
        const conversation = await Conversation.findOne({
            where: { id: conversationId },
            include: {
                model: Participant,
                as: "participants",
                where: { userId: loggedInUserId },
                attributes: []
            },
        });

        if (!conversation) {
            return res.status(403).json({
                status: "error",
                message: "You are not authorized to view messages in this conversation",
                data: [],
                errors: ["User is not a participant or the conversation does not exist"]
            });
        }

        // Fetch messages and include sender details
        const messages = await Message.findAll({
            where: { conversationId },
            order: [["createdAt", "ASC"]],
            include: [
                {
                    model: User,
                    as: "users", // Ensure this alias matches your associations
                    attributes: ["id", "firstName", "lastName"]
                }
            ]
        });

        res.status(200).json({
            status: "success",
            message: `${messages.length} message(s) retrieved successfully`,
            data: messages,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error occurred while retrieving messages",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while retrieving messages",
            data: [],
            errors: [`${err.message}`]
        });
    }
};


exports.markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        const loggedInUserId = req.user.userId;

        if (!messageId) {
            return res.status(400).json({
                status: "error",
                message: "messageId is required",
                data: [],
                errors: ["messageId must be provided in the request body"]
            });
        }

        const message = await Message.findOne({
            where: { id: messageId },
            include: {
                model: Conversation,
                as: "conversation",
                include: {
                    model: Participant,
                    as: "filterParticipants",
                    where: { userId: loggedInUserId },
                    attributes: []
                },
            },
        });

        if (!message) {
            return res.status(403).json({
                status: "error",
                message: "You are not authorized to mark this message as read",
                data: [],
                errors: ["Message does not exist or you are not a participant of the conversation"]
            });
        }

        const readBy = message.readBy ? JSON.parse(message.readBy) : [];
        if (!readBy.includes(loggedInUserId)) {
            readBy.push(loggedInUserId);
            message.readBy = JSON.stringify(readBy);
            await message.save();
        }

        res.status(200).json({
            status: "success",
            message: "Message marked as read",
            data: [{
                messageId: message.id,
                readBy: readBy,
            }],
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error occurred while marking the message as read",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while marking the message as read",
            data: [],
            errors: [`${err.message}`]
        });
    }
};