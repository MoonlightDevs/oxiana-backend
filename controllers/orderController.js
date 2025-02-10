const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { validateOrder } = require("../validators/orderValidator");

const createOrder = async (req, res) => {
	const { error } = validateOrder(req.body);
	if (error) return res.status(400).send(error);

	try {
		const { customerId, products, shippingId, paymentId } = req.body;
		let orderTotal = 0;

		for (const item of products) {
			const product = await Product.findById(item.product);
			if (!product)
				return res.status(404).json({ message: "Product not found" });
			orderTotal += product.price * item.quantity;
		}

		const order = new Order({
			customer: customerId,
			products: products,
			shipping: shippingId,
			payment: paymentId,
			total: orderTotal,
		});

		await order.save();

		res.status(200).json({ message: "Order saved successfully", order: order });
	} catch (error) {
		res.status(500).json({ message: "Error saving order" });
	}
};

// Get order by ID
const getOrderById = async (req, res) => {
	try {
		const orderId = req.params.id;
		const order = await Order.findById(orderId)
			.populate("customer")
			.populate("items")
			.populate("shipping")
			.populate("payment");
		if (!order) return res.status(404).json({ message: " Order not found " });
		res.status(200).json({ order: order });
	} catch (error) {
		res
			.status(500)
			.json({ message: " Error getting order ", error: error.message });
	}
};

const getOrdersByCustomer = async (req, res) => {
	try {
		const customerId = req.params.id;
		const order = await Order.find({ customer: customerId })
			.populate("customer")
			.populate("items")
			.populate("shipping")
			.populate("payment");
		if (!order || order.length === 0)
			return res
				.status(404)
				.json({ message: "Order not found for this customer" });
		res.status(200).json({ order: order });
	} catch (error) {
		res.status(500).json({ message: " Error getting order ", error: error });
	}
};

// Update order status
const updateOrderStatus = async (req, res) => {
	const { error } = validateOrder(req.body);
	if (error) return res.status(400).send(error);
	try {
		const orderId = req.params.id;
		const { status } = req.body;
		const validStatuses = [
			"Pending",
			"Processing",
			"Shipped",
			"Delivered",
			"Cancelled",
		];
		if (!validStatuses.includes(status))
			return res.status(400).json({ message: "Invalid status" });
		const order = await Order.findByIdAndUpdate(orderId, {
			status: status,
			updatedAt: Date.now(),
			new: true,
		});
		if (!order) return res.status(404).json({ message: " Order not found" });
		res.status(200).json({ message: "Order status updated successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error updating order status ", error: error });
	}
};

module.exports = {
	createOrder,
	getOrderById,
	updateOrderStatus,
	getOrdersByCustomer,
};
