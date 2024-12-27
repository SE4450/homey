const User = require("./userModel");
const Conversation = require("./conversationModel");
const Participant = require("./participantModel");
const Message = require("./messageModel");

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });

Conversation.hasMany(Message, { foreignKey: "conversationId" });
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

Conversation.hasMany(Participant, { foreignKey: "conversationId" });
Participant.belongsTo(Conversation, { foreignKey: "conversationId" });

User.hasMany(Participant, { foreignKey: "userId" });
Participant.belongsTo(User, { foreignKey: "userId" });

module.exports = { User, Conversation, Participant, Message };
