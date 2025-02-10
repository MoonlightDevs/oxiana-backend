const Joi = require("joi");

const customerSchema = Joi.object({
	name: Joi.string().min(3).max(30).required().messages({
		"string.base": "Name must be a string",
		"string.min": "Name must be at least 3 characters long",
		"string.max": "Name must be less than or equal to 30 characters",
		"any.required": "Name is required",
	}),
	email: Joi.string().email().required().messages({
		"string.base": "Email must be a string",
		"string.email": "Please provide a valid email address",
		"any.required": "Email is required",
	}),
	password: Joi.string().min(8).max(50).required().messages({
		"string.base": "Password must be a string",
		"string.min": "Password must be at least 8 characters long",
		"string.max": "Password must be less than or equal to 50 characters",
		"any.required": "Password is required",
	}),
});

const validateCustomer = (customer) => {
	return customerSchema.validate(customer);
};

module.exports = { validateCustomer };
