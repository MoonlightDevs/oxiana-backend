const Joi = require("joi");

const orderSchema = Joi.object({
	customer: Joi.string().required(),
	items: Joi.array()
		.items(
			Joi.object({
				product: Joi.string().required(),
				quantity: Joi.number().integer().positive().required(),
				price: Joi.number().positive().required(),
			})
		)
		.min(1)
		.required(),
	shipping: Joi.string().required(),
	payment: Joi.string().required(),
	total: Joi.number().positive().required(),
	status: Joi.string().required(),
});

const validateOrder = (order) => {
	return orderSchema.validate(order);
};

module.exports = { validateOrder };
