const Inventory = require("../models/Inventory"); // Assuming you have an Inventory model in models/Inventory.js
const Product = require("../models/Product"); // Assuming you have a Product model in models/Product.js

// Add new inventory entry
exports.addInventory = async (req, res) => {
	try {
		const { product, quantity, restockDate, lowStockThreshold } = req.body; // Destructure data from the request body

		const newInventory = new Inventory({
			product,
			quantity,
			restockDate,
			lowStockThreshold,
		});

		await newInventory.save(); // Save new inventory to the database
		res.status(201).json(newInventory); // Send the created inventory as JSON response
	} catch (error) {
		console.error("Error adding inventory:", error);
		res.status(500).json({ error: "Failed to add inventory" });
	}
};

// Get inventory details by product ID
exports.getInventoryByProduct = async (req, res) => {
	try {
		const productId = req.params.productId; // Get the product ID from the request parameters
		const inventory = await Inventory.findOne({ product: productId }); // Find inventory for the specific product

		if (!inventory) {
			return res
				.status(404)
				.json({ error: "Inventory not found for this product" }); // Return 404 if not found
		}

		res.status(200).json(inventory); // Send the found inventory as JSON response
	} catch (error) {
		console.error("Error fetching inventory by product ID:", error);
		res.status(500).json({ error: "Failed to retrieve inventory" });
	}
};

// Update inventory quantity for a product
exports.updateInventoryQuantity = async (req, res) => {
	try {
		const productId = req.params.productId; // Get the product ID from the request parameters
		const { quantity } = req.body; // Destructure quantity from request body

		const inventory = await Inventory.findOneAndUpdate(
			{ product: productId },
			{ quantity },
			{ new: true } // Return the updated document
		);

		if (!inventory) {
			return res
				.status(404)
				.json({ error: "Inventory not found for this product" }); // Return 404 if not found
		}

		res.status(200).json(inventory); // Send the updated inventory as JSON response
	} catch (error) {
		console.error("Error updating inventory quantity:", error);
		res.status(500).json({ error: "Failed to update inventory" });
	}
};

// Get all low stock items
exports.getAllLowStockItems = async (req, res) => {
	try {
		const lowStockItems = await Inventory.find({ quantity: { $lte: 5 } }); // Find items with quantity less than or equal to 5

		res.status(200).json(lowStockItems); // Send low stock items as JSON response
	} catch (error) {
		console.error("Error fetching low stock items:", error);
		res.status(500).json({ error: "Failed to retrieve low stock items" });
	}
};
