const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		price: {
			type: Number,
			required: true,
		},
		total: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

// Pre-save hook to calculate the total price
CartItemSchema.pre("save", function (next) {
	this.total = this.quantity * this.price;
	next();
});

module.exports = mongoose.model("CartItem", CartItemSchema);
