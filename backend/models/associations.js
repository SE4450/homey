const User = require("./userModel");
const Conversation = require("./conversationModel");
const Participant = require("./participantModel");
const Message = require("./messageModel");

User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "users" });

Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

Conversation.hasMany(Participant, { foreignKey: "conversationId", as: "filterParticipants" });
Conversation.hasMany(Participant, { foreignKey: "conversationId", as: "participants" });
Participant.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

User.hasMany(Participant, { foreignKey: "userId", as: "participants" });
Participant.belongsTo(User, { foreignKey: "userId", as: "users" });

module.exports = { User, Conversation, Participant, Message };