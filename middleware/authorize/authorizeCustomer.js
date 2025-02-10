const jwt = require("jsonwebtoken");
const Customer = require("../../models/Customer");

const authorizeCustomer = async (req, res, next) => {
	try {
		// Extract token from the Authorization header
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		// Verify the token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // Attach the decoded token payload to the req object

		// Fetch the customer by ID
		const customer = await Customer.findById(req.params.id);
		if (!customer) {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Check if the logged-in user's ID matches the customer's ID
		if (customer._id.toString() !== req.user.userId) {
			return res
				.status(403)
				.json({ message: "You are not authorized to access this profile" });
		}

		next(); // Proceed to the next middleware
	} catch (error) {
		console.error(error);
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid token" });
		}
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Token expired" });
		}
		res.status(500).json({
			message: "Error while authorizing customer",
			error: error.message,
		});
	}
};

module.exports = { authorizeCustomer };
