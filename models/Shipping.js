const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema(
	{
		orders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Order",
				required: true,
			},
		],
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
		},
		address: {
			street: { type: String, required: true },
			city: { type: String, required: true },
			province: { type: String, required: true },
			zipCode: { type: String, required: true },
		},
		shippingMethod: {
			type: String,
			enum: ["Standrad", "Express", "Overnight"],
			required: true,
		},
		trackingNumber: { type: String, required: false },
		carrier: {
			type: String,
			required: true,
		},
		cost: {
			type: Number,
			required: true,
		},
		estimatedDeliveryDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["Pending", "Shipped", "Delivered", "Returned"],
			default: "Pending",
		},
		shippedDate: { type: Date, required: false },
		delivereyDate: { type: Date, required: false },
		weight: { type: Number, required: false },
		dimensions: {
			length: { type: Number, required: false },
			width: { type: Number, required: false },
			height: { type: Number, required: false },
		},
		notes: { type: String, required: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Shipping", shippingSchema);
