const Cart = require("../../models/Cart");

const authorizeCart = async (req, res, next) => {
	try {
		// Ensure that the user is authenticated and has a valid `userId`
		if (!req.user || !req.user.userId) {
			return res
				.status(401)
				.json({ message: "Unauthorized access: No user data" });
		}

		const customerId = req.user.userId; 

		const cart = await Cart.findOne({ customer: customerId });

		if (!cart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		if (cart.customer.toString() !== customerId.toString()) {
			return res
				.status(403)
				.json({ message: "You are not authorized to access this cart" });
		}

		req.cart = cart;
		next();
	} catch (error) {
		console.error("Error while checking cart ownership:", error);
		return res.status(500).json({
			message: "Error while checking cart ownership",
			error: error.message, 
		});
	}
};

module.exports = { authorizeCart };
