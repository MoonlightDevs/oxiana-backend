const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema(
	{
		customer: {
			type: Schema.Types.ObjectId,
			ref: "Customer",
			default: null,
		},
		guest: { type: String, default: null },
		items: [
			{
				type: Schema.Types.ObjectId,
				ref: "CartItem",
				required: false,
			},
		],
		totalItems: {
			type: Number,
			default: 0,
		},
		totalPrice: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

// Pre-save hook to calculate total items and total price
CartSchema.pre("save", async function (next) {
	let totalItems = 0;
	let totalPrice = 0;

	// Populate the items to access their details
	const populatedCart = await this.populate("items");

	// Calculate total items and price
	populatedCart.items.forEach((item) => {
		totalItems += item.quantity; // Assuming CartItem has a 'quantity' field
		totalPrice += item.total; // Assuming CartItem has a 'total' field
	});

	this.totalItems = totalItems;
	this.totalPrice = totalPrice;

	next();
});

module.exports = mongoose.model("Cart", CartSchema);
