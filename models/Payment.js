const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
	{
		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: true,
		},
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Customer",
			required: true,
		},
		amount: { type: Number, required: true },
		currency: { type: "String", default: "AFN", required: true },
		paymentMethod: {
			type: "String",
			enum: ["Credit Card", "Debit Card", "PayPal", "HesabPay"],
			required: true,
		},
		paymentStatus: {
			type: String,
			enum: ["Pending", "Completed", "Failed", "Refunded"],
			required: true,
		},
		transactionId: { type: String, required: true },
		paymentDate: { type: Date, default: Date.now() },
		receiptURL: { type: String, required: false },
		payerDetials: {
			name: { type: String, required: true },
			email: { type: String, required: true },
		},
		cardDetails: {
			cardType: { type: String, required: false },
			last4Digits: { type: String, required: false },
		},
		refundDetails: {
			refundedAmount: { type: Number, required: false },
			refundDate: { type: Date, required: false },
			refundTransactionId: { type: String, required: false },
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
