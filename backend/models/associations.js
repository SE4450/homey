const User = require("./userModel");
const Conversation = require("./conversationModel");
const Participant = require("./participantModel");
const Message = require("./messageModel");
const Profile = require("./profileModel");
const Expense = require("./expenseModel");
const Event = require("./eventModel");

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

User.hasMany(Event, { foreignKey: "userId", as: "userEvent"});
Event.belongsTo(User, { foreignKey: "userId", as: "users"});

module.exports = { User, Conversation, Participant, Message, Profile, Expense, Event };