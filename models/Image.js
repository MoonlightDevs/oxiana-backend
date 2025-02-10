const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			unique: true,
			required: true,
		},
		altText: {
			type: String,
			trim: true,
			default: "",
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		order: {
			type: Number,
			default: 0,
		},
		isMain: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
