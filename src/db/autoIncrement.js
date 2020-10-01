const db = require("../db/db");
const AutoIncrement = require("mongoose-auto-increment");
AutoIncrement.initialize(db.connection);
module.exports = AutoIncrement;
