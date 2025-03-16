const User = require("./userModel");
const Property = require("./propertyModel");
const PropertyImage = require("./propertyImageModel");
const Group = require("./groupModel");
const Conversation = require("./conversationModel");
const Participant = require("./participantModel");
const Message = require("./messageModel");
const Profile = require("./profileModel");
const Expense = require("./expenseModel");

User.hasMany(Property, { foreignKey: "landlordId", as: "properties" });
Property.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

Property.hasMany(PropertyImage, { foreignKey: "propertyId", as: "images", onDelete: "CASCADE" });
PropertyImage.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

User.hasMany(Group, { foreignKey: "landlordId", as: "groups" });
Group.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

Property.hasMany(Group, { foreignKey: "propertyId", as: "groups", onDelete: "CASCADE" });
Group.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "users" });

Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

Conversation.hasMany(Participant, { foreignKey: "conversationId", as: "filterParticipants" });
Conversation.hasMany(Participant, { foreignKey: "conversationId", as: "participants" });
Participant.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

User.hasMany(Participant, { foreignKey: "userId", as: "participants" });
Participant.belongsTo(User, { foreignKey: "userId", as: "users" });

User.hasMany(Expense, { foreignKey: "owedTo", as: "expensesOwedTo" });
User.hasMany(Expense, { foreignKey: "paidBy", as: "expensesPaidBy" });
Expense.belongsTo(User, { foreignKey: "owedTo", as: "owedToUser" });
Expense.belongsTo(User, { foreignKey: "paidBy", as: "paidByUser" });

module.exports = { User, Property, PropertyImage, Conversation, Participant, Message, Profile, Expense };