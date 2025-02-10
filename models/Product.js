const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		attributes: {
			type: Map,
			of: String,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		images: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Image",
				required: true,
			},
		],
		reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
		averageRating: { type: Number, default: 0 },
		reviewCount: { type: Number, default: 0 },
	},
	{
		timestamps: true,
	}
);

productSchema.methods.updateRating = async function () {
	// Fetch all reviews related to this product
	const reviews = await mongoose.model("Review").find({ product: this._id });

	// Calculate the total rating and review count
	const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
	this.reviewCount = reviews.length;
	this.averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

	// Set the reviews field with the IDs of the reviews
	this.reviews = reviews.map((review) => review._id);

	// Save the updated product
	return this.save();
};

module.exports = mongoose.model("Product", productSchema);
