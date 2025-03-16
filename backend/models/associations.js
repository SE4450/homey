const User = require("./userModel");
const Conversation = require("./conversationModel");
const Participant = require("./participantModel");
const Message = require("./messageModel");
const Profile = require("./profileModel");
const Expense = require("./expenseModel");
const CalendarEvent = require("./calendarModel"); // Import CalendarEvent

// Existing associations
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

User.hasMany(CalendarEvent, { foreignKey: "userId", as: "events" });
CalendarEvent.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = { User, Conversation, Participant, Message, Profile, Expense, CalendarEvent };
