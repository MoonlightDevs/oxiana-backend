const Payment = require("../models/payment");

// Create a new payment
const createPayment = async (req, res) => {
	const {
		orderId,
		customerId,
		paymentMethod,
		cardInfo,
		billingAddress,
		amount,
		currency,
		paymentStatus,
		paymentDate,
		transactionId,
		refundInfo,
		paymentGatewayResponse,
		customerEmail,
		notes,
	} = req.body;

	try {
		const payment = new Payment({
			paymentId,
			orderId,
			customerId,
			paymentMethod,
			cardInfo,
			billingAddress,
			amount,
			currency,
			paymentStatus,
			paymentDate,
			transactionId,
			refundInfo,
			paymentGatewayResponse,
			customerEmail,
			notes,
		});
		await payment.save();
		res.status(201).send(payment);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Retrieve payment details
const getPaymentDetails = async (req, res) => {
	const { id } = req.params;

	try {
		const payment = await Payment.findById(id);
		if (!payment) {
			return res.status(404).send();
		}
		res.send(payment);
	} catch (error) {
		res.status(500).send(error);
	}
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
	const { id } = req.params;
	const updates = req.body;
	const allowedUpdates = [
		"paymentStatus",
		"paymentGatewayResponse",
		"refundInfo",
	];
	const isValidOperation = Object.keys(updates).every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send({ error: "Invalid updates!" });
	}

	try {
		const payment = await Payment.findById(id);

		if (!payment) {
			return res.status(404).send();
		}

		Object.keys(updates).forEach(
			(update) => (payment[update] = updates[update])
		);
		await payment.save();
		res.send(payment);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Refund payment
const refundPayment = async (req, res) => {
	const { id } = req.params;
	const refundDetails = req.body;

	try {
		const payment = await Payment.findById(id);
		if (!payment) {
			return res.status(404).send();
		}

		// Add logic to process the refund with HesabPay

		payment.refundInfo = refundDetails;
		await payment.save();
		res.send(payment);
	} catch (error) {
		res.status(400).send(error);
	}
};

// List all payments
const listPayments = async (req, res) => {
	try {
		const payments = await Payment.find({});
		res.send(payments);
	} catch (error) {
		res.status(500).send(error);
	}
};

module.exports = {
	createPayment,
	getPaymentDetails,
	updatePaymentStatus,
	refundPayment,
	listPayments,
};
