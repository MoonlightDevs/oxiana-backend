const Joi = require("joi");

const productSchema = Joi.object({
	name: Joi.string().min(3).max(30).required(),
	description: Joi.string().min(3).max(511).required(),
	price: Joi.number().positive().required(),
	color: Joi.string(),
	size: Joi.string(),
	category: Joi.string().required(),
	images: Joi.array().required(),
});
const updateProductSchema = Joi.object({
	name: Joi.string().min(3).max(130).optional(),
	description: Joi.string().min(3).max(255).optional(),
	price: Joi.number().positive().optional(),
	color: Joi.string().optional(),
	size: Joi.string(),
	category: Joi.string().optional(),
});

const validateProduct = (product) => {
	return productSchema.validate(product);
};
const validateProductUpdate = (product) => {
	return updateProductSchema.validate(product);
};
module.exports = { validateProduct, validateProductUpdate };
