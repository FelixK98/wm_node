const db = require("../db/db");

const { Schema } = db;
const AutoIncrement = require("../db/autoIncrement");


const TransactionHistoryRequestSchema = new Schema({
	_id: {
		type: Number,
	},
	content: {
		type: String,
	},
	duration: {
		type: Number,
	},

}
,{ versionKey: false,
	timestamps: {
		updatedAt: false
	}
	
}
);



TransactionHistoryRequestSchema.plugin(AutoIncrement, { inc_field: "_id" });
const TransactionHistoryRequest = db.model("TransactionHistoryRequest", TransactionHistoryRequestSchema);
module.exports = TransactionHistoryRequest;
