const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
		},
		items: [
			{
				item: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "CartItem",
					required: true,
				},
			},
		],
		shipping: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shipping",
			required: true,
		},
		payment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
			required: true,
		},
		total: { type: Number, required: true },
		status: { type: String, default: "processing" },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
