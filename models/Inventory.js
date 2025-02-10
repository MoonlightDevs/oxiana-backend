const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		quantity: { type: Number, required: true },
		restockDate: { type: Date },
		lowStockThreshold: { type: Number, default: 5 },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
