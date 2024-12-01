const Profile = require("../models/profileModel.js");
const { ValidationError } = require("sequelize");

//get the user profile
exports.getProfile = async (req, res) => {
    try {
        //first get the lists for the user  query needs to be: ?userId= thid users id
        const usersProfile = await Profile.findAll({ where: req.query }); //req.query is what we're calling in the url ?key1=value1&key2=value2...

        if(usersProfile.length == 0) {
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



//update the user profile
exports.updateProfile = async (req, res) => {
    try {
        const {  cleaningHabits, noiseLevel, sleepStart, sleepEnd, alergies  } = req.body;
        const userProfile = Profile; //this may need to be changes

        if(cleaningHabits != null) {
            userProfile = await Profile.update({ cleaningHabits }, { where: { id: req.params.id }});
        }
        if(noiseLevel != null) {
            userProfile = await Profile.update({ noiseLevel }, { where: { id: req.params.id }});
        }
        if(sleepStart != null) {
            userProfile = await Profile.update({ sleepStart }, { where: { id: req.params.id }});
        }
        if(sleepEnd != null) {
            userProfile = await Profile.update({ sleepEnd }, { where: { id: req.params.id }});
        }
        if(alergies != null) {
            userProfile = await Profile.update({ alergies }, { where: { id: req.params.id }});
        }

        res.status(201).json({
            status: "success",
            message: "updated the users profile in the list",
            data: listItem,
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