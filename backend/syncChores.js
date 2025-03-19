const sequelize = require("./db.js");
const { Chore } = require("./models/associations");
async function syncChoresTable() {
  try {
    // This will create the Chores table if it doesn't exist
    await Chore.sync({ force: false });
    console.log("Chores table synchronized successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing Chores table:", error);
    process.exit(1);
  }
}
syncChoresTable();
