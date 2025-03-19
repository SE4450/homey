const User = require("./userModel");
const Property = require("./propertyModel");
const PropertyImage = require("./propertyImageModel");
const Group = require("./groupModel");
const GroupParticipant = require("./groupParticipantModel");
const Conversation = require("./conversationModel");
const Participant = require("./participantModel");
const Message = require("./messageModel");
const Profile = require("./profileModel");
const Expense = require("./expenseModel");
const CalendarEvent = require("./calendarModel")
const Chore = require("./choresModel");
const Review = require("./reviewModel");
const List = require("./listModel");
const Inventory = require("./inventoryModel");

// Property - User (Landlord) Relationship
User.hasMany(Property, { foreignKey: "landlordId", as: "properties" });
Property.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

// Property - Property Images Relationship
Property.hasMany(PropertyImage, {
  foreignKey: "propertyId",
  as: "images",
  onDelete: "CASCADE",
});
PropertyImage.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

// Landlord's Groups (created groups)
User.hasMany(Group, { foreignKey: "landlordId", as: "groups" });
Group.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

// Property - Group Relationship
Property.hasMany(Group, {
  foreignKey: "propertyId",
  as: "groups",
  onDelete: "CASCADE",
});
Group.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

// Many-to-Many Relationship: Tenants in Groups (using a unique alias)
Group.belongsToMany(User, { through: GroupParticipant, foreignKey: "groupId", as: "participants" });
User.belongsToMany(Group, { through: GroupParticipant, foreignKey: "tenantId", as: "joinedGroups" });

// User - Message Relationship
User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "users" });

Conversation.belongsTo(Group, { foreignKey: "groupId", as: "group" });
Group.hasMany(Conversation, { foreignKey: "groupId", as: "conversations" });

// Conversation - Message Relationship
Conversation.hasMany(Message, { foreignKey: "conversationId", as: "messages" });
Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation",
});

// Conversation - Participant Relationship
Conversation.hasMany(Participant, { foreignKey: "conversationId", as: "filterParticipants" });
Conversation.hasMany(Participant, { foreignKey: "conversationId", as: "participants" });
Participant.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

// User - Conversation Participants Relationship
User.hasMany(Participant, { foreignKey: "userId", as: "participants" });
Participant.belongsTo(User, { foreignKey: "userId", as: "users" });

// Linking Expense to Group
Group.hasMany(Expense, { foreignKey: "groupId", as: "expenses", onDelete: "CASCADE" });
Expense.belongsTo(Group, { foreignKey: "groupId", as: "group" });

// Ensure Users can have expenses (paidBy & owedTo relationships)
User.hasMany(Expense, { foreignKey: "paidBy", as: "expensesPaidBy" });
User.hasMany(Expense, { foreignKey: "owedTo", as: "expensesOwedTo" });
Expense.belongsTo(User, { foreignKey: "paidBy", as: "paidByUser" });
Expense.belongsTo(User, { foreignKey: "owedTo", as: "owedToUser" });

// User - Chore Relationship
User.hasMany(Chore, { foreignKey: "assignedTo", as: "assignedChores" });
Chore.belongsTo(User, { foreignKey: "assignedTo", as: "assignee" });

// Group and Chore Relationship
Group.hasMany(Chore, { foreignKey: "groupId", as: "chores", onDelete: "CASCADE" });
Chore.belongsTo(Group, { foreignKey: "groupId", as: "group" });

User.hasMany(CalendarEvent, { foreignKey: "userId", as: "events" });
CalendarEvent.belongsTo(User, { foreignKey: "userId", as: "user" });

Group.hasMany(CalendarEvent, { foreignKey: "groupId", as: "events", onDelete: "CASCADE" });
CalendarEvent.belongsTo(Group, { foreignKey: "groupId", as: "group" });

Group.hasMany(Profile, { foreignKey: "groupId", as: "profiles", onDelete: "CASCADE" });
Profile.belongsTo(Group, { foreignKey: "groupId", as: "group" });

Group.hasMany(List, { foreignKey: "groupId", as: "lists", onDelete: "CASCADE" });
List.belongsTo(Group, { foreignKey: "groupId", as: "list" });

Group.hasMany(Inventory, { foreignKey: "groupId", as: "inventories", onDelete: "CASCADE" });
Inventory.belongsTo(Group, { foreignKey: "groupId", as: "inventory" });

module.exports = {
  User,
  Property,
  PropertyImage,
  Group,
  GroupParticipant,
  Conversation,
  Participant,
  Message,
  Profile,
  Expense,
  Chore,
  Review,
  CalendarEvent,
  List,
  Inventory
};
