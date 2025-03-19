const { Group, GroupParticipant, Property, User, Conversation, Participant, Profile } = require("../models/associations");
const { ValidationError } = require("sequelize");
const sequelize = require("../db.js");
const { Op } = require("sequelize");

exports.getLandlordGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            where: { landlordId: req.user.userId },
            include: [
                {
                    model: User,
                    as: "participants",
                    attributes: ["id", "firstName", "lastName", "email"]
                },
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "name", "exteriorImage", "address", "city"]
                }
            ]
        });

        const formattedGroups = groups.map((group) => {
            const groupJSON = group.toJSON();

            // Convert exteriorImage to Base64 if it's stored as a buffer
            const exteriorImageBase64 = groupJSON.property?.exteriorImage
                ? `data:image/jpeg;base64,${groupJSON.property.exteriorImage.toString("base64")}`
                : null;

            return {
                id: groupJSON.id,
                name: groupJSON.name,
                property: groupJSON.property
                    ? {
                        id: groupJSON.property.id,
                        name: groupJSON.property.name,
                        exteriorImage: exteriorImageBase64,
                        address: groupJSON.property.address,
                        city: groupJSON.property.city
                    }
                    : null,
                participants: groupJSON.participants
            };
        });

        res.status(200).json({
            status: "success",
            message: `${formattedGroups.length} group(s) found`,
            data: formattedGroups,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve groups",
            data: [],
            errors: [error.message],
        });
    }
};

exports.getLandlordGroupById = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Fetch the group where the landlord is the owner
        const group = await Group.findOne({
            where: { id: groupId, landlordId: req.user.userId },
            include: [
                {
                    model: User,
                    as: "participants",
                    attributes: ["id", "firstName", "lastName", "email", "username"],
                },
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "name", "exteriorImage", "address", "city"],
                },
            ],
        });

        // If no group found, return 404 error
        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found or does not belong to you",
                data: null,
                errors: ["No group found for the provided ID"],
            });
        }

        const groupJSON = group.toJSON();

        // Convert exteriorImage to Base64 if it's stored as a buffer
        const exteriorImageBase64 = groupJSON.property?.exteriorImage
            ? `data:image/jpeg;base64,${groupJSON.property.exteriorImage.toString("base64")}`
            : null;

        const formattedGroup = {
            id: groupJSON.id,
            name: groupJSON.name,
            property: groupJSON.property
                ? {
                    id: groupJSON.property.id,
                    name: groupJSON.property.name,
                    exteriorImage: exteriorImageBase64,
                    address: groupJSON.property.address,
                    city: groupJSON.property.city,
                }
                : null,
            participants: groupJSON.participants,
        };

        res.status(200).json({
            status: "success",
            message: "Group retrieved successfully",
            data: formattedGroup,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve group",
            data: null,
            errors: [error.message],
        });
    }
};

exports.getTenantGroups = async (req, res) => {
    try {
        const groups = await Group.findAll({
            include: [
                {
                    model: User,
                    as: "participants", // Using the many-to-many alias
                    where: { id: req.user.userId },
                    attributes: [] // We don't need participant details here
                },
                {
                    model: User,
                    as: "landlord",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: Property,
                    as: "property",
                    attributes: ["id", "name", "exteriorImage", "address", "city"],
                }
            ]
        });

        const formattedGroups = groups.map((group) => {
            const groupJSON = group.toJSON();
            const exteriorImageBase64 = groupJSON.property?.exteriorImage
                ? `data:image/jpeg;base64,${groupJSON.property.exteriorImage.toString("base64")}`
                : null;

            return {
                id: groupJSON.id,
                name: groupJSON.name,
                property: groupJSON.property
                    ? {
                        id: groupJSON.property.id,
                        name: groupJSON.property.name,
                        exteriorImage: exteriorImageBase64,
                        address: groupJSON.property.address,
                        city: groupJSON.property.city,
                    }
                    : null,
                landlord: groupJSON.landlord,
                // participants not returned since we only use them to filter groups for the tenant
            };
        });

        res.status(200).json({
            status: "success",
            message: `${formattedGroups.length} group(s) found`,
            data: formattedGroups,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve groups",
            data: [],
            errors: [error.message],
        });
    }
};

exports.createGroup = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, propertyId, tenantIds } = req.body;

        if (!name || !propertyId || !tenantIds || tenantIds.length < 1) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields (name, propertyId, or tenants)",
                data: [],
                errors: ["Name, property, and at least two tenans are required"],
            });
        }

        const group = await Group.create(
            { name, propertyId, landlordId: req.user.userId },
            { transaction }
        );

        const profiles = tenantIds.map((tenantId) => ({
            userId: tenantId,
            groupId: group.id
        }));

        await Profile.bulkCreate(profiles, { transaction });

        // Add tenants to the group
        const participants = tenantIds.map((tenantId) => ({
            groupId: group.id,
            tenantId
        }));

        await GroupParticipant.bulkCreate(participants, { transaction });

        // 3️⃣ Create Group Conversations
        // 🏠 Full Group Chat (Landlord + Tenants)
        const fullGroupChat = await Conversation.create(
            { groupId: group.id, type: "group" },
            { transaction }
        );

        // 🤝 Tenants-Only Chat
        const tenantGroupChat = await Conversation.create(
            { groupId: group.id, type: "group" },
            { transaction }
        );


        console.log("tenant:" + tenantIds.toString());
        console.log("landlord:" + req.user.userId);
        // 4️⃣ Add Participants to Conversations
        // 📌 Full Group Chat (Everyone: Landlord + Tenants)
        const fullGroupParticipants = [
            { conversationId: fullGroupChat.id, userId: req.user.userId, role: "landlord" },
            ...tenantIds.map((tenantId) => ({ conversationId: fullGroupChat.id, userId: tenantId, role: "tenant" })),
        ];

        console.log("Test 1");
        await Participant.bulkCreate(fullGroupParticipants, { transaction });

        // 📌 Tenants-Only Chat (Only Tenants)
        const tenantParticipants = tenantIds.map((tenantId) => ({
            conversationId: tenantGroupChat.id,
            userId: tenantId,
            role: "tenant"
        }));
        console.log("Test 2");
        await Participant.bulkCreate(tenantParticipants, { transaction });

        let privateConversations = [];

        // Landlord <-> Each Tenant
        tenantIds.forEach((tenantId) => {
            privateConversations.push({ type: "dm", groupId: group.id });
        });

        // Tenant <-> Tenant DMs
        for (let i = 0; i < tenantIds.length; i++) {
            for (let j = i + 1; j < tenantIds.length; j++) {
                privateConversations.push({ type: "dm", groupId: group.id });
            }
        }

        // Create Private Conversations
        const createdPrivateChats = await Conversation.bulkCreate(privateConversations, { transaction });

        // Associate Users with Private Conversations
        let privateParticipants = [];
        let chatIndex = 0;

        tenantIds.forEach((tenantId) => {
            // Add landlord <-> tenant DM
            privateParticipants.push({ conversationId: createdPrivateChats[chatIndex].id, userId: req.user.userId });
            privateParticipants.push({ conversationId: createdPrivateChats[chatIndex].id, userId: tenantId, role: "tenant" });
            chatIndex++;
        });

        // Tenant <-> Tenant DMs
        for (let i = 0; i < tenantIds.length; i++) {
            for (let j = i + 1; j < tenantIds.length; j++) {
                privateParticipants.push({ conversationId: createdPrivateChats[chatIndex].id, userId: tenantIds[i] });
                privateParticipants.push({ conversationId: createdPrivateChats[chatIndex].id, userId: tenantIds[j] });
                chatIndex++;
            }
        }

        // Insert all private chat participants
        await Participant.bulkCreate(privateParticipants, { transaction });

        await transaction.commit();

        res.status(201).json({
            status: "success",
            message: "Group created successfully",
            data: group,
            errors: [],
        });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Failed to create group",
            data: [],
            errors: [error.message],
        });
    }
};

exports.getGroupParticipants = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Find the group
        const group = await Group.findOne({
            where: { id: groupId },
            include: [
                {
                    model: User,
                    as: "participants",
                    attributes: ["id", "firstName", "lastName", "email", "username"],
                    through: { attributes: [] },
                },
            ],
        });

        // If no group found, return 404 error
        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found",
                data: null,
                errors: [`No group found with ID ${groupId}`],
            });
        }

        res.status(200).json({
            status: "success",
            message: "Participants retrieved successfully",
            data: group.participants,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve participants",
            data: null,
            errors: [error.message],
        });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const { name, participants } = req.body;
        const { groupId } = req.params;

        // Validate input
        if (!name && !Array.isArray(participants)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid request: Group name or participants list required",
                data: [],
                errors: ["No valid update parameters provided"],
            });
        }

        // Fetch the group and ensure the landlord owns it
        const group = await Group.findOne({
            where: { id: groupId, landlordId: req.user.userId },
            include: [{ model: User, as: "participants", attributes: ["id"] }],
        });

        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found or unauthorized",
                data: null,
                errors: [`No group found with ID ${groupId} owned by you`],
            });
        }

        // Update group name if provided
        if (name) {
            group.name = name;
            await group.save();
        }

        // Sync participants if provided
        if (Array.isArray(participants)) {

            console.log(participants);
            console.log(group.participants);

            const existingParticipantIds = group.participants.map((p) => p.id);

            console.log(existingParticipantIds);

            // Determine which participants to add and remove
            const participantsToAdd = participants.filter((id) => !existingParticipantIds.includes(id));
            const participantsToRemove = existingParticipantIds.filter((id) => !participants.includes(id));

            console.log(participantsToAdd);
            console.log(participantsToRemove);

            // **Remove participants that are no longer in the list**
            if (participantsToRemove.length > 0) {
                await GroupParticipant.destroy({
                    where: { groupId, tenantId: { [Op.in]: participantsToRemove } },
                });
            }

            // **Add new participants (avoid duplicates)**
            const newEntries = participantsToAdd.map((tenantId) => ({ groupId, tenantId }));
            if (newEntries.length > 0) {
                await GroupParticipant.bulkCreate(newEntries, { ignoreDuplicates: true });
            }
        }

        res.status(200).json({
            status: "success",
            message: "Group updated successfully",
            data: {
                id: group.id,
                name: group.name,
                participants,
            },
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update group",
            data: null,
            errors: [error.message],
        });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({ where: { id: groupId, landlordId: req.user.userId } });

        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found",
                data: null,
                errors: [`No group found with ID ${groupId}`],
            });
        }

        await group.destroy();
        res.status(200).json({
            status: "success",
            message: "Group deleted successfully",
            data: null,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete group",
            data: null,
            errors: [error.message],
        });
    }
};

exports.getLandlordInfo = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({
            where: { id: groupId },
            include: {
                model: User,
                as: "landlord",
                attributes: ["id", "firstName", "lastName", "email", "username"]
            }
        });

        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found",
                data: null,
                errors: [`No group found with ID ${groupId}`],
            });
        }

        res.status(200).json({
            status: "success",
            message: "Landlord information retrieved successfully",
            data: group.landlord,
            errors: []
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve landlord information",
            data: null,
            errors: [error.message],
        });
    }
};

exports.getPropertyInfo = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findOne({
            where: { id: groupId },
            include: {
                model: Property,
                as: "property",
                attributes: ["id", "name", "address", "city", "exteriorImage"]
            }
        });

        if (!group) {
            return res.status(404).json({
                status: "error",
                message: "Group not found",
                data: null,
                errors: [`No group found with ID ${groupId}`],
            });
        }

        const groupJSON = group.property.toJSON();
        console.log("test" + groupJSON.firstName);
        const exteriorImageBase64 = groupJSON.exteriorImage ? `data:image/jpeg;base64,${groupJSON.exteriorImage.toString("base64")}` : null;

        res.status(200).json({
            status: "success",
            message: "Property information retrieved successfully",
            data: {
                id: groupJSON.id,
                city: groupJSON.city,
                address: groupJSON.address,
                name: groupJSON.name,
                exteriorImage: exteriorImageBase64
            },
            errors: []
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve property information",
            data: null,
            errors: [error.message],
        });
    }
};