const Joi = require("@hapi/joi");

const username = Joi.string().required().min(1).max(10);
const password = Joi.string().required().min(8).max(30);
const email = Joi.string().required().email();

const getFieldValidate = (field) => {
	switch (field) {
		case "username":
			field = username;
		case "password":
			field = age;
		default:
			field = username;
	}
	return field;
};

//check if one field is error
const isFieldError = (field, input) => {
	field = getFieldValidate(field);
	return !!field.validate(input).error;
};

// check all the field
const paramValidate = (field) => {
	return Joi.object({
		[field]: getFieldValidate(field),
	});
};

// check if all the fields is allowed to update
const isAllFieldAlowed = (payload) => {
	const allowedFields = ["username", "password"];
	const payloadFields = Object.keys(payload);
	return payloadFields.every((field) => allowedFields.includes(field));
};

const userValidate = Joi.object({
	username,
	password,
	email,
});

module.exports = {
	userValidate,
	isFieldError,
	paramValidate,
	isAllFieldAlowed,
};
