const { Conversation, Participant, Message, User } = require("../models/associations");
const { ValidationError } = require("sequelize");
const sequelize = require("../db.js");

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
            data: [newConversation],
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

exports.createGroupChat = async (req, res) => {
    try {
        const { userIds, name } = req.body;

        if (!Array.isArray(userIds) || userIds.length < 2) {
            return res.status(400).json({
                status: "error",
                message: "The body must contain an array of at least 2 user IDs",
                data: [],
                errors: ["At least 2 user IDs are required to create a group chat"]
            });
        }

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({
                status: "error",
                message: "Group chat name is required",
                data: [],
                errors: ["A valid group chat name must be provided"]
            });
        }

        const loggedInUserId = req.user.userId;
        userIds.push(loggedInUserId);

        const existingGroup = await Conversation.findOne({
            where: { type: "group" },
            include: [
                {
                    model: Participant,
                    where: { userId: userIds },
                    attributes: ["userId"]
                },
            ],
            group: ["Conversation.id"],
            having: sequelize.literal(`COUNT(Participant.userId) = ${userIds.length}`)
        });

        if (existingGroup) {
            return res.status(409).json({
                status: "error",
                message: "A group chat with these participants already exists",
                data: [existingGroup],
                errors: ["Duplicate group chat detected"]
            });
        }

        const newConversation = await Conversation.create({
            type: "group",
            name: name.trim(),
        });

        const participantsData = userIds.map(userId => ({
            userId,
            conversationId: newConversation.id,
        }));

        await Participant.bulkCreate(participantsData);

        res.status(201).json({
            status: "success",
            message: "Group chat created successfully.",
            data: [{
                conversationId: newConversation.id,
                name: newConversation.name,
                participants: userIds,
            }],
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create group chat due to validation error(s)",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while creating the group chat",
            data: [],
            errors: [`${err.message}`]
        });
    }
};

exports.addParticipant = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        const loggedInUserId = req.user.userId;

        if (!conversationId || !userId) {
            return res.status(400).json({
                status: "error",
                message: "conversationId and userId are required",
                data: [],
                errors: ["Both conversationId and userId must be provided"]
            });
        }

        const conversation = await Conversation.findOne({
            where: { id: conversationId, type: "group" },
            include: {
                model: Participant,
                where: { userId: loggedInUserId },
                attributes: []
            },
        });

        if (!conversation) {
            return res.status(403).json({
                status: "error",
                message: "You are not authorized to add participants to this conversation",
                data: [],
                errors: ["User is not a participant or the conversation does not exist"]
            });
        }

        const existingParticipant = await Participant.findOne({ where: { conversationId, userId } });

        if (existingParticipant) {
            return res.status(409).json({
                status: "error",
                message: "User is already a participant in this group chat",
                data: [],
                errors: ["Duplicate participant detected"]
            });
        }

        const newParticipant = await Participant.create({
            conversationId,
            userId
        });

        res.status(201).json({
            status: "success",
            message: "Participant added successfully",
            data: [{
                conversationId,
                userId: newParticipant.userId
            }],
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error occurred while adding the participant.",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while adding the participant.",
            data: [],
            errors: [`${err.message}`]
        });
    }
};

exports.removeParticipant = async (req, res) => {
    try {
        const { conversationId, userId } = req.body;
        const loggedInUserId = req.user.userId;

        if (!conversationId || !userId) {
            return res.status(400).json({
                status: "error",
                message: "conversationId and userId are required",
                data: [],
                errors: ["Both conversationId and userId must be provided"]
            });
        }

        const conversation = await Conversation.findOne({
            where: { id: conversationId, type: "group" },
            include: {
                model: Participant,
                where: { userId: loggedInUserId },
                attributes: []
            },
        });

        if (!conversation) {
            return res.status(403).json({
                status: "error",
                message: "You are not authorized to remove participants from this conversation",
                data: [],
                errors: ["User is not a participant or the conversation does not exist"]
            });
        }

        const participant = await Participant.findOne({ where: { conversationId, userId } });

        if (!participant) {
            return res.status(404).json({
                status: "error",
                message: "The user is not a participant in this group chat",
                data: [],
                errors: ["User is not a participant of the specified conversation"]
            });
        }

        await Participant.destroy({ where: { conversationId, userId } });

        res.status(200).json({
            status: "success",
            message: "Participant removed successfully",
            data: [{
                conversationId,
                userId,
            }],
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error occurred while removing the participant",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred while removing the participant",
            data: [],
            errors: [`${err.message}`]
        });
    }
};