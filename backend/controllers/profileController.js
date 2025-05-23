const { Profile } = require("../models/associations");
const { ValidationError } = require("sequelize");

//get the user profile
exports.getProfile = async (req, res) => {
    try {
        const { groupId } = req.params; // Extract groupId from route parameters
        const { userId } = req.query; // Extract userId from query parameters

        if (!groupId) {
            return res.status(400).json({
                status: "error",
                message: "groupId is required",
                data: [],
                errors: ["groupId must be provided as a route parameter"]
            });
        }

        // Build the where clause dynamically
        const whereClause = { groupId };
        if (userId) {
            whereClause.userId = userId; // Filter by userId if it's provided
        }

        //first get the lists for the user  query needs to be: ?userId= thid users id
        const usersProfile = await Profile.findAll({ where: whereClause }); //req.query is what we're calling in the url ?key1=value1&key2=value2...

        if (usersProfile.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "No profile exists for the given user",
                data: [],
                errors: [`no lists found with data ${JSON.stringify(req.query)}`]
            });
        }

        res.status(200).json({
            status: "success",
            message: `profile found`,
            data: usersProfile,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get the profile due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the profile",
            data: [],
            errors: [`${err.message}`]
        });
    }
}

//create the user profile
exports.createProfile = async (req, res) => {
    try {
        const { id } = req.body;
        const usersProfile = await Profile.create({ id });

        res.status(201).json({
            status: "success",
            message: "List created",
            data: usersProfile,
            errors: []
        });

    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create the users profile due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create the users profile of items",
            data: [],
            errors: [`${err.message}`]
        });
    }
}

//update the user profile
exports.updateProfile = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { cleaningHabits, noiseLevel, sleepStart, sleepEnd, alergies, userId } = req.body;
        let userProfile = Profile;

        if (cleaningHabits != null) {
            userProfile = await Profile.update({ cleaningHabits: cleaningHabits }, { where: { userId, groupId } });
        }
        if (noiseLevel != null) {
            userProfile = await Profile.update({ noiseLevel: noiseLevel }, { where: { userId, groupId } });
        }
        if (sleepStart != null) {
            userProfile = await Profile.update({ sleepStart: sleepStart }, { where: { userId, groupId } });
        }
        if (sleepEnd != null) {
            userProfile = await Profile.update({ sleepEnd: sleepEnd }, { where: { userId, groupId } });
        }
        if (alergies != null) {
            userProfile = await Profile.update({ alergies: alergies }, { where: { userId, groupId } });
        }

        res.status(201).json({
            status: "success",
            message: "updated the users profile in the list",
            data: userProfile,
            errors: []
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to update the users profile due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to update the users profile of items",
            data: [],
            errors: [`${err.message}`]
        });
    }
}