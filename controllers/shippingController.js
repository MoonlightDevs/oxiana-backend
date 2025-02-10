const Shipping = require("../models/Shipping"); // Assuming you have a Shipping model in models/Shipping.js

// Create a new shipping entry
exports.createShipping = async (req, res) => {
	try {
		const { orderId, address, city, state, postalCode, country, status } =
			req.body; // Destructure data from request body

		const newShipping = new Shipping({
			orderId,
			address,
			city,
			state,
			postalCode,
			country,
			status,
		});

		await newShipping.save(); // Save new shipping to the database
		res.status(201).json(newShipping); // Send the created shipping as JSON response
	} catch (error) {
		console.error("Error creating shipping:", error);
		res.status(500).json({ error: "Failed to create shipping" });
	}
};

// Get shipping details by shipping ID
exports.getShippingById = async (req, res) => {
	try {
		const shippingId = req.params.id; // Get the shipping ID from the request parameters
		const shipping = await Shipping.findById(shippingId); // Find shipping by ID

		if (!shipping) {
			return res.status(404).json({ error: "Shipping not found" }); // Return 404 if shipping doesn't exist
		}

		res.status(200).json(shipping); // Send the found shipping as JSON response
	} catch (error) {
		console.error("Error fetching shipping by ID:", error);
		res.status(500).json({ error: "Failed to retrieve shipping" });
	}
};

// Update shipping status
exports.updateShippingStatus = async (req, res) => {
	try {
		const shippingId = req.params.id; // Get the shipping ID from the request parameters
		const { status } = req.body; // Destructure status from request body

		const updatedShipping = await Shipping.findByIdAndUpdate(
			shippingId,
			{ status },
			{ new: true } // Return the updated document
		);

		if (!updatedShipping) {
			return res.status(404).json({ error: "Shipping not found" }); // Return 404 if shipping doesn't exist
		}

		res.status(200).json(updatedShipping); // Send the updated shipping as JSON response
	} catch (error) {
		console.error("Error updating shipping status:", error);
		res.status(500).json({ error: "Failed to update shipping" });
	}
};

// Get all shippings by order ID
exports.getShippingsByOrder = async (req, res) => {
	try {
		const orderId = req.params.orderId; // Get the order ID from the request parameters
		const shippings = await Shipping.find({ orderId }); // Find shippings associated with the specific order

		res.status(200).json(shippings); // Send the shippings as JSON response
	} catch (error) {
		console.error("Error fetching shippings by order ID:", error);
		res.status(500).json({ error: "Failed to retrieve shippings" });
	}
};
