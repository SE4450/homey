const express = require("express");
const router = express.Router();
const {
    createGroup,
    getLandlordGroups,
    getTenantGroups,
    deleteGroup,
    updateGroup,
    addParticipant,
    removeParticipant
} = require("../controllers/groupController");

const { authenticateUser } = require("../middleware/authenticateUser");

router.get("/landlord", authenticateUser(["landlord"]), getLandlordGroups);
router.post("/", authenticateUser(["landlord"]), createGroup);
router.post("/:groupId/participants", authenticateUser(["landlord"]), addParticipant);
router.put("/:groupId", authenticateUser(["landlord"]), updateGroup);
router.delete("/:groupId", authenticateUser(["landlord"]), deleteGroup);
router.delete("/:groupId/participants/:userId", authenticateUser(["landlord"]), removeParticipant);

router.get("/tenant", authenticateUser(["tenant"]), getTenantGroups);

module.exports = router;