const db = require("../db/db");
const AutoIncrement = require("mongoose-sequence")(db);

module.exports = AutoIncrement;
