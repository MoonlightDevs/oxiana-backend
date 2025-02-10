const Joi = require("joi");

const cartSchema = Joi.object({
	customer: Joi.string().required(),
	items: Joi.array().optional(),
});

const validateCart = (cart) => {
	return cartSchema.validate(cart);
};

module.exports = { validateCart };
