const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const Cart = require("../models/Cart");

module.exports = function (passport) {
	passport.use(
		new LocalStrategy(
			{ usernameField: "email" },
			async (email, password, done) => {
				try {
					// Check for user
					const customer = await Customer.findOne({ email });
					if (!customer) {
						return done(null, false, {
							message: "Email not found!", // Generic error message
						});
					}

					// Check password
					const isMatch = await bcrypt.compare(password, customer.password);
					if (!isMatch) {
						return done(null, false, {
							message: "Incorrect password!", // Generic error message
						});
					}

					// const cart = await Cart.findOne({ customer: customer });
					// console.log(cart);
					// const cartLength = cart.items.length || 0;

					// Generate JWT
					const payload = {
						userId: customer._id,
						name: customer.name,
						email: customer.email,
						// cartLength: cartLength,
					};
					const token = jwt.sign(payload, process.env.JWT_SECRET, {
						expiresIn: "24h",
					});

					// Successful login
					return done(null, {
						token,
						user: { id: customer._id, email: customer.email }, // Additional data
					});
				} catch (err) {
					return done(err); // Pass errors to Passport
				}
			}
		)
	);
};
