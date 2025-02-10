const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");

const viewProfile = async (req, res) => {
	try {
		const id = req.params.id;
		const customer = await Customer.findById(id);
		if (!customer)
			return res.status(404).json({ message: "Customer not found " });
		const { password, ...customerData } = customer.toObject();
		res.status(200).json(customerData);
	} catch (error) {
		res.status(500).json({ message: "Server Error, please try again later." });
	}
};
const updateProfile = async (req, res) => {
	try {
		const id = req.params.id;
		const { name, email, password } = req.body;

		let customer = await Customer.findById(id);
		if (!customer)
			return res.status(404).json({ message: "customer not found." });
		if (name) customer.name = name;
		if (email) customer.email = email;
		if (password) {
			const salt = await bcrypt.getSalt(10);
			customer.password = await bcrypt.hash(password, salt);
		}

		await customer.save();

		res.status(200).json({
			message: "Customer profile updated successfully.",
			customer: customer,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error updating customer profile, please try again later",
		});
	}
};
const deleteProfile = async (req, res) => {
	try {
		const id = req.params.id;
		const customer = await Customer.findByIdAndDelete(id);

		if (!customer)
			return res.status(404).json({ message: " customer profile not found" });

		res.status(200).json({ message: "Customer profile deleted successfully" });
	} catch (error) {
		res.status(500).json({
			message: "Error deleting customer profile, please try again later",
		});
	}
};

module.exports = { updateProfile, viewProfile, deleteProfile };
