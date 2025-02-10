const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
	try {
		const userId = req.user ? req.user.userId : null;
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "Invalid request: User ID is required",
			});
		}
		let query;
		if (req.user.role === "guest") {
			query = { guest: userId };
		} else {
			query = { customer: userId };
		}

		let cart = await Cart.findOne(query).populate({
			path: "items",
			populate: {
				path: "product",
				model: "Product",
				populate: {
					path: "category", // Assuming 'category' is a field in Product that references the Category model
					model: "Category", // The model name for Category
				},
			},
		});

		// If no cart is found, respond with an empty cart (but don't create one yet)
		if (!cart) {
			return res.status(200).json({
				success: true,
				message: "Cart is empty",
				data: { customer: userId, items: [] },
			});
		}

		// Send the cart response
		return res.status(200).json({
			success: true,
			message: "Cart retrieved successfully",
			cart,
		});
	} catch (error) {
		console.error("Error retrieving cart:", error);

		if (!res.headersSent) {
			return res.status(500).json({
				success: false,
				message: "Failed to retrieve cart",
			});
		}

		console.warn("Response already sent; no further response will be made.");
	}
};

exports.createCart = async (req, res) => {
	try {
		const id = req.user.userId;
		if (!id) {
			return res
				.status(401)
				.json({ message: "Unauthorized: No customer ID found." });
		}

		let cart = await Cart.findOne({ customer: id });

		if (cart) {
			cart.items = [];
			cart.totalItems = 0;
			cart.totalPrice = 0;
		} else {
			cart = new Cart({ customer: id });
		}

		await cart.save();
		res.status(201).json({ message: "Cart created successfully!", cart: cart });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to create or reset cart" });
	}
};

exports.deleteCart = async (req, res) => {
	try {
		const userId = req.user ? req.user.userId : null;
		const sessionId = req.sessionId;

		if (!userId && !sessionId) {
			return res.status(400).json({
				success: false,
				message: "Invalid request: User ID or session ID is required",
			});
		}

		if (userId) {
			cart = await Cart.findOneAndDelete({
				customer: userId,
			});
		} else if (sessionId) {
			cart = await Cart.findOneAndDelete({
				sessionId: sessionId,
			});
		} else {
			res.status(400).json({ message: "Sessions not found" });
		}

		res.status(200).json({ message: "Cart deleted successfully", cart: cart });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to delete cart" });
	}
};

exports.addItem = async (req, res) => {
	try {
		const userId = req.user ? req.user.userId : null;
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "Invalid request: User ID is required",
			});
		}
		const { productId, quantity } = req.body;

		// Validate quantity
		if (!Number.isInteger(quantity) || quantity <= 0) {
			return res.status(400).json({ message: "Invalid quantity" });
		}

		let query;
		if (req.user.role === "guest") {
			query = { guest: userId };
		} else {
			query = { customer: userId };
		}

		let cart = await Cart.findOne(query).populate({
			path: "items",
			populate: {
				path: "product",
				model: "Product",
				populate: {
					path: "category",
					model: "Category",
				},
			},
		});

		if (!cart) {
			try {
				if (req.user.role === "guest") {
					cart = new Cart({ guest: userId, items: [] });
				} else {
					cart = new Cart({ customer: userId, items: [] });
				}
				await cart.save();
			} catch (error) {
				console.error("Error creating new cart:", error);
				if (error.code === 11000) {
					cart = await Cart.findOne(query);
				} else {
					throw error;
				}
			}
		}

		// Double-check if cart is initialized properly
		if (!cart) {
			return res
				.status(500)
				.json({ message: "Failed to create or retrieve cart" });
		}

		// Find product
		const itemProduct = await Product.findById(productId);
		if (!itemProduct) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Check if the product is already in the cart
		let cartItem = await CartItem.findOne({
			product: productId,
			_id: { $in: cart.items },
		});

		if (cartItem) {
			// Update quantity if item exists in cart
			cartItem.quantity = quantity;
			cartItem.total = cartItem.quantity * itemProduct.price;
			await cartItem.save();
		} else {
			// Create new cart item if it doesn't exist
			cartItem = new CartItem({
				product: productId,
				quantity: quantity,
				price: itemProduct.price,
				total: quantity * itemProduct.price,
			});
			await cartItem.save();

			// Add the new cart item to the cart
			cart.items.push(cartItem._id);
		}

		await cart.save(); // Save the cart after modifications

		// Return success response
		res.status(201).json({
			message: "Item added successfully",
			cart: cart,
		});
	} catch (error) {
		console.error("Error adding item to cart:", error);
		res.status(500).json({ message: "Failed to add item to cart" });
	}
};

exports.updateItemQuantity = async (req, res) => {
	try {
		const userId = req.user ? req.user.userId : null;
		const { itemId } = req.params;
		const { quantity } = req.body;

		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "Invalid request: User ID is required",
			});
		}

		// Validate quantity
		if (!Number.isInteger(quantity) || quantity <= 0) {
			return res.status(400).json({ message: "Invalid quantity" });
		}

		let query;
		if (req.user.role === "guest") {
			query = { guest: userId };
		} else {
			query = { customer: userId };
		}

		// Find the cart item and update the quantity
		const cartItem = await CartItem.findById(itemId);
		if (!cartItem) {
			return res.status(404).json({ message: "Cart item not found" });
		}

		// Update quantity and total
		cartItem.quantity = quantity;
		cartItem.total = quantity * cartItem.price;
		await cartItem.save();

		let cart;
		// Find or create cart based on userId or sessionId

		cart = await Cart.findOne(query).populate({
			path: "items",
			populate: {
				path: "product",
				model: "Product",
				populate: {
					path: "category", // Assuming 'category' is a field in Product that references the Category model
					model: "Category", // The model name for Category
				},
			},
		});
		if (!cart) return res.status(404).json({ message: "No cart found" });

		// Recalculate total items and total price
		const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
		const totalPrice = cart.items.reduce((acc, item) => acc + item.total, 0);

		// Update the cart with new totals
		cart.totalItems = totalItems;
		cart.totalPrice = totalPrice;
		await cart.save();

		// Return the updated cart and cart item
		res.status(200).json({
			cartItem: cartItem,
			cart: cart,
			message: "Cart item updated successfully!",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to update item quantity" });
	}
};

// Remove specific item from cart
exports.removeItem = async (req, res) => {
	try {
		const userId = req.user ? req.user.userId : null;
		const { itemId } = req.params;

		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "Invalid request: User ID is required",
			});
		}

		let query;
		if (req.user.role === "guest") {
			query = { guest: userId };
		} else {
			query = { customer: userId };
		}

		let cart;

		// Find or create cart based on userId or sessionId
		cart = await Cart.findOne(query).populate({
			path: "items",
			populate: {
				path: "product",
				model: "Product",
			},
		});
		if (!cart) return res.status(404).json({ message: "No cart found" });

		const cartItem = await CartItem.findById(itemId);
		if (!cartItem) {
			return res.status(404).json({ message: "Cart item not found" });
		}

		// Remove the item from the cart and delete it
		cart.items.pull(itemId);
		await cartItem.deleteOne();

		// Recalculate total items and total price
		const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
		const totalPrice = cart.items.reduce((acc, item) => acc + item.total, 0);

		// Update the cart with new totals
		cart.totalItems = totalItems;
		cart.totalPrice = totalPrice;
		// Save the updated cart
		await cart.save();
		res.status(200).json({ message: "Item removed from cart", cart: cart });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to remove item from cart" });
	}
};

// Clear all items from the cart
exports.clearItems = async (req, res) => {
	try {
		const userId = req.user ? req.user.userId : null;
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "Invalid request: User ID is required",
			});
		}

		let query;
		if (req.user.role === "guest") {
			query = { guest: userId };
		} else {
			query = { customer: userId };
		}

		let cart;
		// Find the cart
		cart = await Cart.findOne(query);

		// Remove all items in the cart
		await CartItem.deleteMany({ _id: { $in: cart.items } });
		cart.items = [];
		cart.totalItems = 0;
		cart.totalPrice = 0;

		await cart.save();
		res
			.status(200)
			.json({ message: "All items cleared from cart", cart: cart });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to clear items from cart" });
	}
};
