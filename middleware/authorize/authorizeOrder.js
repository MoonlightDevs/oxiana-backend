const Order = require("../../models/Order");

const authorizeOrder = async (req, res, next) => {
	try {
		const order = await Order.findById(req.params.id);
		if (!order) return res.status(404).json({ message: "Order not found" });

		if (order.customer.toString() !== req.user._id.toString())
			return res
				.status(403)
				.json({ message: "You are not authorized to access this profile" });
		next();
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({
				message: "Erro while getting customer profile, please try again later.",
			});
	}
};

module.exports = { authorizeOrder };
