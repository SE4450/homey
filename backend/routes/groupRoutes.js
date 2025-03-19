const express = require("express");
const router = express.Router();
const {
    createGroup,
    getLandlordGroups,
    getLandlordGroupById,
    getTenantGroups,
    getLandlordInfo,
    getPropertyInfo,
    getGroupParticipants,
    deleteGroup,
    updateGroup,
} = require("../controllers/groupController");

const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/landlord", authenticateUser(["landlord"]), getLandlordGroups);
router.get("/tenant", authenticateUser(["tenant"]), getTenantGroups);
router.get("/:groupId/landlord", authenticateUser(["tenant", "landlord"]), getLandlordInfo);
router.get("/:groupId/property", authenticateUser(["tenant", "landlord"]), getPropertyInfo);
router.get("/:groupId", authenticateUser(["landlord"]), getLandlordGroupById);
router.get("/:groupId/participants", authenticateUser(["tenant", "landlord"]), getGroupParticipants);
router.post("/", authenticateUser(["landlord"]), createGroup);
router.put("/:groupId", authenticateUser(["landlord"]), updateGroup);
router.delete("/:groupId", authenticateUser(["landlord"]), deleteGroup);


module.exports = router;