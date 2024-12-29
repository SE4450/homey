const { Conversation, Participant, Message } = require("../models/associations");
const { ValidationError } = require("sequelize");

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.findAll({
            include: [
                {
                    model: Participant,
                    where: { userId: req.user.userId },
                    attributes: []
                },
                {
                    model: Participant,
                    include: {
                        model: User,
                        attributes: ["id", "username", "firstName", "lastName"]
                    }
                },
                {
                    model: Message,
                    attributes: ["id", "content", "createdAt"],
                    limit: 1,
                    order: [["createdAt", "DESC"]]
                },
            ]
        });
        if (conversations.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No conversations(s) found",
                data: [],
                errors: [`No conversations(s) found for user ${req.user.userId}`]
            });
        }
        res.status(200).json({
            status: "success",
            message: `${conversations.length} conversations(s) found`,
            data: conversations,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get conversations(s) due to validation error(s)",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get conversations(s)",
            data: [],
            errors: [`${err.message}`]
        });
    }
}

exports.getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findOne({
            where: { id: conversationId },
            include: [
                {
                    model: Participant,
                    where: { userId: req.user.userId },
                    attributes: []
                },
                {
                    model: Participant,
                    include: {
                        model: User,
                        attributes: ["id", "username", "firstName", "lastName"]
                    }
                },
                {
                    model: Message,
                    attributes: ["id", "content", "createdAt"],
                    limit: 1,
                    order: [["createdAt", "DESC"]]
                }
            ]
        });

        if (!conversation) {
            return res.status(404).json({
                status: "error",
                message: "No conversations(s) found",
                data: [],
                errors: [`No conversations(s) found for user ${conversationId}`]
            });
        }

        res.status(200).json({
            status: "success",
            message: `Conversation ${conversationId} found`,
            data: conversation,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to retrieve conversation due to validation error(s)",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while trying to retrieve the conversation",
            data: [],
            errors: [`${err.message}`]
        });
    }
};

exports.createDM = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: "error",
                message: "Missing userId in the request body",
                data: [],
                errors: ["UserId of the other participant is required"]
            });
        }

        const loggedInUserId = req.user.userId;

        const existingConversation = await Conversation.findOne({
            where: { type: "dm" },
            include: [
                {
                    model: Participant,
                    where: { userId: [loggedInUserId, userId] }
                },
            ],
            group: ["Conversation.id"],
            having: sequelize.literal("COUNT(Participant.id) = 2")
        });

        if (existingConversation) {
            return res.status(409).json({
                status: "error",
                message: "Duplicate DM conversation detected",
                data: existingConversation,
                errors: ["A DM conversation already exists between the users.Duplicate DM conversation detected"]
            });
        }

        const newConversation = await Conversation.create({ type: "dm" });

        await Participant.bulkCreate([
            { userId: loggedInUserId, conversationId: newConversation.id },
            { userId, conversationId: newConversation.id }
        ]);

        res.status(201).json({
            status: "success",
            message: "DM conversation created successfully",
            data: newConversation,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create DM due to validation error(s)",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while creating the DM",
            data: [],
            errors: [`${err.message}`]
        });
    }
};
