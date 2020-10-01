const db = require("../db/db");

const { Schema } = db;
const AutoIncrement = require("../db/autoIncrement");

const TransactionHistoryRequestSchema = new Schema(
  {
    content: {
      type: String,
    },
    duration: {
      type: Number,
    },
  },
  {
    versionKey: false,
    timestamps: {
      updatedAt: false,
    },
  }
);

TransactionHistoryRequestSchema.plugin(
  AutoIncrement.plugin,
  "TransactionHistoryRequest"
);
const TransactionHistoryRequest = db.model(
  "TransactionHistoryRequest",
  TransactionHistoryRequestSchema
);
module.exports = TransactionHistoryRequest;
