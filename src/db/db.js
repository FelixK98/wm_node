const mongoose = require("mongoose");

const connection = mongoose.connect("mongodb://localhost:27017/wmmoney", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
exports.connection = connection;
module.exports = mongoose;
