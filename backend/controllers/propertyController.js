const { Property, PropertyImage } = require("../models/associations");
const { ValidationError } = require("sequelize");
const sequelize = require("../db.js");

exports.getProperties = async (req, res) => {
    try {
        const properties = await Property.findAll({
            where: { landlordId: req.user.userId },
            include: [{ model: PropertyImage, as: "images" }],
        });

        if (properties.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No properties found",
                data: [],
                errors: [`No properties found for landlord ${req.user.userId}`],
            });
        }

        const formattedProperties = properties.map((property) => {
            const propertyJSON = property.toJSON();

            return {
                ...propertyJSON,
                exteriorImage: propertyJSON.exteriorImage
                    ? `data:image/jpeg;base64,${propertyJSON.exteriorImage.toString("base64")}`
                    : null,
            };
        });

        res.status(200).json({
            status: "success",
            message: `${formattedProperties.length} property(s) found`,
            data: formattedProperties,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve properties",
            data: [],
            errors: [error.message],
        });
    }
};

exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findOne({
            where: { id: req.params.id, landlordId: req.user.userId },
            include: [{ model: PropertyImage, as: "images" }],
        });

        if (!property) {
            return res.status(404).json({
                status: "error",
                message: "Property not found",
                data: null,
                errors: [`No property found with ID ${req.params.id}`],
            });
        }

        const propertyJSON = property.toJSON();

        res.status(200).json({
            status: "success",
            message: "Property retrieved successfully",
            data: {
                ...propertyJSON,
                exteriorImage: propertyJSON.exteriorImage
                    ? `data:image/jpeg;base64,${propertyJSON.exteriorImage.toString("base64")}`
                    : null,
            },
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to retrieve property",
            data: null,
            errors: [error.message],
        });
    }
};

exports.createProperty = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            name,
            address,
            city,
            propertyDescription,
            bedrooms,
            price,
            propertyType,
            availability,
            exteriorImage,
            images
        } = req.body;

        if (!name || !address || !city || !bedrooms || !price || !propertyType || exteriorImage === undefined) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields",
                data: [],
                errors: ["Name, address, city, bedrooms, price, property type, and exterior image are required"],
            });
        }

        const base64Data = exteriorImage.split(";base64,").pop();

        const property = await Property.create(
            {
                name,
                address,
                city,
                propertyDescription: propertyDescription || null,
                bedrooms,
                price,
                propertyType,
                availability: availability !== undefined ? availability : true,
                landlordId: req.user.userId,
                exteriorImage: Buffer.from(base64Data, "base64"),
            },
            { transaction }
        );

        if (images && Array.isArray(images)) {
            if (images.length > 10) {
                return res.status(400).json({
                    status: "error",
                    message: "Maximum of 10 images allowed",
                    data: null,
                    errors: ["Too many images uploaded"],
                });
            }

            const propertyImages = images.map(img => ({
                propertyId: property.id,
                label: img.label,
                image: Buffer.from(img.image.split(";base64,").pop(), "base64"),
                description: img.description,
            }));

            await PropertyImage.bulkCreate(propertyImages, { transaction });
        }

        await transaction.commit();
        res.status(201).json({
            status: "success",
            message: "Property created successfully",
            data: property,
            errors: [],
        });
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        res.status(500).json({
            status: "error",
            message: "Failed to create property",
            data: null,
            errors: [error.message],
        });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const { name, address, city, propertyDescription, bedrooms, price, propertyType, availability, exteriorImage } = req.body;
        const property = await Property.findOne({
            where: { id: req.params.id, landlordId: req.user.userId },
        });

        if (!property) {
            return res.status(404).json({
                status: "error",
                message: "Property not found",
                data: null,
                errors: [`No property found with ID ${req.params.id}`],
            });
        }

        await property.update({
            name: name || property.name,
            address: address || property.address,
            city: city || property.city,
            propertyDescription: propertyDescription !== undefined ? propertyDescription : property.propertyDescription,
            bedrooms: bedrooms || property.bedrooms,
            price: price || property.price,
            propertyType: propertyType || property.propertyType,
            availability: availability !== undefined ? availability : property.availability,
            exteriorImage: exteriorImage ? Buffer.from(exteriorImage, "base64") : property.exteriorImage,
        });

        res.status(200).json({
            status: "success",
            message: "Property updated successfully",
            data: property,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update property",
            data: null,
            errors: [error.message],
        });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findOne({
            where: { id: req.params.id, landlordId: req.user.userId },
        });

        if (!property) {
            return res.status(404).json({
                status: "error",
                message: "Property not found",
                data: null,
                errors: [`No property found with ID ${req.params.id}`],
            });
        }

        await property.destroy();
        res.status(200).json({
            status: "success",
            message: "Property deleted successfully",
            data: null,
            errors: [],
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete property",
            data: null,
            errors: [error.message],
        });
    }
};