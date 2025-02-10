const Wishlist = require("../models/Wishlist"); // Assuming you have a Wishlist model in models/Wishlist.js

// Add a product to the customer's wishlist
exports.addProductToWishlist = async (req, res) => {
	try {
		const { customerId, productId } = req.body; // Destructure data from the request body

		// Check if the wishlist exists for the customer, or create a new one
		let wishlist = await Wishlist.findOne({ customer: customerId });
		if (!wishlist) {
			wishlist = new Wishlist({ customer: customerId, products: [] });
		}

		// Check if the product is already in the wishlist
		if (wishlist.products.includes(productId)) {
			return res.status(400).json({ message: "Product already in wishlist" });
		}

		wishlist.products.push(productId); // Add the product to the wishlist
		await wishlist.save(); // Save the updated wishlist

		res.status(201).json(wishlist); // Send the updated wishlist as JSON response
	} catch (error) {
		console.error("Error adding product to wishlist:", error);
		res.status(500).json({ error: "Failed to add product to wishlist" });
	}
};

// Get the customer's wishlist
exports.getWishlistByCustomer = async (req, res) => {
	try {
		const customerId = req.params.customerId; // Get the customer ID from request parameters
		const wishlist = await Wishlist.findOne({ customer: customerId }).populate(
			"products"
		); // Find wishlist and populate product details

		if (!wishlist) {
			return res.status(404).json({ error: "Wishlist not found" }); // Return 404 if wishlist doesn't exist
		}

		res.status(200).json(wishlist); // Send the wishlist as JSON response
	} catch (error) {
		console.error("Error fetching wishlist by customer:", error);
		res.status(500).json({ error: "Failed to retrieve wishlist" });
	}
};

// Remove a product from the customer's wishlist
exports.removeProductFromWishlist = async (req, res) => {
	try {
		const { customerId, productId } = req.body; // Destructure data from the request body

		const wishlist = await Wishlist.findOne({ customer: customerId }); // Find the wishlist for the customer

		if (!wishlist) {
			return res.status(404).json({ error: "Wishlist not found" }); // Return 404 if wishlist doesn't exist
		}

		// Check if the product is in the wishlist
		if (!wishlist.products.includes(productId)) {
			return res.status(400).json({ message: "Product not found in wishlist" });
		}

		wishlist.products = wishlist.products.filter(
			(product) => product.toString() !== productId
		); // Remove the product from the wishlist
		await wishlist.save(); // Save the updated wishlist

		res.status(200).json(wishlist); // Send the updated wishlist as JSON response
	} catch (error) {
		console.error("Error removing product from wishlist:", error);
		res.status(500).json({ error: "Failed to remove product from wishlist" });
	}
};
