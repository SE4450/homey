const express = require("express");
const router = express.Router();
const {
    getProperties,
    getPropertyById,
    getPropertiesForTenants,
    createProperty,
    updateProperty,
    deleteProperty
} = require("../controllers/propertyController");
const {
    uploadPropertyImage,
    updatePropertyImage,
    deletePropertyImage,
    getPropertyImages
} = require("../controllers/propertyImageController");
const { authenticateUser } = require("../middleware/authenticateUser");
router.get("/", authenticateUser(["landlord"]), getProperties);
router.get("/search", authenticateUser(["tenant", "landlord"]), getPropertiesForTenants);
router.get("/:id", authenticateUser(["landlord"]), getPropertyById);
router.post("/", authenticateUser(["landlord"]), createProperty);
router.put("/:id", authenticateUser(["landlord"]), updateProperty);
router.delete("/:id", authenticateUser(["landlord"]), deleteProperty);
router.get("/:id/images", authenticateUser(["tenant", "landlord"]), getPropertyImages);
router.post("/:id/images", authenticateUser(["landlord"]), uploadPropertyImage);
router.put("/:id/images/:imageId", authenticateUser(["landlord"]), updatePropertyImage);
router.delete("/:id/images/:imageId", authenticateUser(["landlord"]), deletePropertyImage);
module.exports = router;