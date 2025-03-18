const Review = require("../models/reviewModel.js");
const { ValidationError } = require("sequelize");

//a way to get the reviews 
exports.getReviews = async(req, res) => {
    try {

        const listOfReviews = await Review.findAll({ order: ['createdAt'], where: req.query });

        if(listOfReviews.length == 0) {
            return res.status(404).json({
                status: "error",
                message: "There are no reviews for the selected item",
                data: [],
                errors: [`no lists found with data ${JSON.stringify(req.query)}`]
            })
        }

        res.status(200).json({
            status: "success",
            message: `${listOfReviews.length} lists found`,
            data: listOfReviews,
            errors: []
        });
    }catch(err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to get reviews due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to get the reviews",
            data: [],
            errors: [`${err.message}`]
        });
    }
}



//a way to create reviews
exports.createReview = async(req, res) => {
    try{
        const { reviewType, reviewedItemId, reviewerId, score, description } = req.body;

        //first need to check if the reviewer has already reviewed this topic
        const existingReviews = await Review.findAll({ where: { reviewType: reviewType, reviewedItemId: reviewedItemId, reviewerId: reviewerId }});

        if(existingReviews.length > 0) {
            return res.status(404).json({
                status: "error",
                message: "The user has already created a review for this item",
                data: [],
                errors: [`a review was found with data ${JSON.stringify(req.query)}`]
            })
        }

        const newReview = await Review.create({
            reviewType: reviewType,
            reviewedItemId: reviewedItemId,
            reviewerId: reviewerId,
            score: score,
            description: description
        });

        res.status(201).json({
            status: "success",
            message: "List created",
            data: newReview,
            errors: []
        })

    } catch(err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Unable to create reviews due to validation errors",
                data: [],
                errors: err.errors.map(err => err.message)
            });
        }
        res.status(500).json({
            status: "error",
            message: "An unexpected error occured while trying to create the reviews",
            data: [],
            errors: [`${err.message}`]
        });
    }
}