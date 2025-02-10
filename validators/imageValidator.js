const Joi = require("joi");

const imageSchema = Joi.object({
	url: Joi.string().required(),
	altText: Joi.string().default(""),
	product: Joi.string().required(),
	order: Joi.number().default(0),
	isMain: Joi.boolean().default(false),
});

const updatedImageSchema = Joi.object({
	url: Joi.string().optional(),
	altText: Joi.string().default(""),
	product: Joi.string().optional(),
	order: Joi.number().default(0),
	isMain: Joi.boolean().default(false),
});

const validateImage = (image) => {
	return imageSchema.validate(image);
};
const validateUpdateImage = (image) => {
	return updatedImageSchema.validate(image);
};

module.exports = { validateImage, validateUpdateImage };
