const { PropertyImage, Property } = require("../models/associations");
const { ValidationError } = require("sequelize");
const sequelize = require("../db.js");

exports.uploadPropertyImage = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { label, image, description } = req.body;
        const propertyId = req.params.id;

        if (!label || !image) {
            return res.status(400).json({
                status: "error",
                message: "Label and image are required",
                data: null,
                errors: ["Missing required fields"],
            });
        }

        // Ensure property exists
        const property = await Property.findByPk(propertyId);
        if (!property) {
            return res.status(404).json({
                status: "error",
                message: "Property not found",
                data: null,
                errors: [`No property found with ID ${propertyId}`],
            });
        }

        // Store image as binary
        const newImage = await PropertyImage.create(
            {
                propertyId,
                label,
                image: Buffer.from(image, "base64"),
                description,
            },
            { transaction }
        );

        await transaction.commit();
        res.status(201).json({
            status: "success",
            message: "Image uploaded successfully",
            data: newImage,
            errors: [],
        });
    } catch (err) {
        await transaction.rollback();

        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error while uploading image",
                data: null,
                errors: err.errors.map(error => error.message),
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to upload image",
            data: null,
            errors: [err.message],
        });
    }
};

exports.getPropertyImages = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const images = await PropertyImage.findAll({ where: { propertyId } });

        if (images.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No images found for this property",
                data: [],
                errors: [`No images found for property ID ${propertyId}`],
            });
        }

        // Convert images to Base64
        const formattedImages = images.map((img) => {
            const imageJSON = img.toJSON();
            return {
                ...imageJSON,
                image: imageJSON.image
                    ? `data:image/jpeg;base64,${imageJSON.image.toString("base64")}`
                    : null,
            };
        });

        res.status(200).json({
            status: "success",
            message: `${formattedImages.length} image(s) found`,
            data: formattedImages,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: "Validation error while retrieving images",
                data: null,
                errors: err.errors.map(error => error.message),
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve images",
            data: null,
            errors: [err.message],
        });
    }
};

exports.updatePropertyImage = async (req, res) => {
    try {
        const { label, image, description } = req.body;
        const { imageId } = req.params;

        const propertyImage = await PropertyImage.findByPk(imageId);
        if (!propertyImage) {
            return res.status(404).json({
                status: "error",
                message: "Image not found",
                data: null,
                errors: [`No image found with ID ${imageId}`],
            });
        }

        await propertyImage.update({
            label: label || propertyImage.label,
            image: image ? Buffer.from(image, "base64") : propertyImage.image,
            description: description || propertyImage.description,
        });

        res.status(200).json({
            status: "success",
            message: "Image updated successfully",
            data: propertyImage,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: `Validation error while updating image ${req.params.imageId}`,
                data: null,
                errors: err.errors.map(error => error.message),
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to update image",
            data: null,
            errors: [err.message],
        });
    }
};

exports.deletePropertyImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const propertyImage = await PropertyImage.findByPk(imageId);
        if (!propertyImage) {
            return res.status(404).json({
                status: "error",
                message: "Image not found",
                data: null,
                errors: [`No image found with ID ${imageId}`],
            });
        }

        await propertyImage.destroy();
        res.status(200).json({
            status: "success",
            message: "Image deleted successfully",
            data: null,
            errors: [],
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({
                status: "error",
                message: `Validation error while deleting image ${req.params.imageId}`,
                data: null,
                errors: err.errors.map(error => error.message),
            });
        }

        res.status(500).json({
            status: "error",
            message: "Failed to delete image",
            data: null,
            errors: [err.message],
        });
    }
};