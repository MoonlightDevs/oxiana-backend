const passport = require("passport");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Cart = require("../models/Cart");
const UnverifiedUser = require("../models/UnverifiedUser");
const { validateCustomer } = require("../validators/customerValidator");

exports.register = async (req, res) => {
	const { error } = validateCustomer(req.body);
	if (error) return res.status(400).json({ error: error.message });
	try {
		const userId = req.user ? req.user.userId : null;
		let query;
		if (req.user.role === "guest") {
			query = { guest: userId };
		}
		const { name, email, password } = req.body;

		const existingUser = await Customer.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already registered." });
		}

		const unverifiedUser = await UnverifiedUser.findOne({ email });
		if (unverifiedUser) {
			return res
				.status(400)
				.json({ message: "Email already awaiting verification." });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const token = jwt.sign({ email, query }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

		const newUnverifiedUser = new UnverifiedUser({
			name,
			email,
			password: hashedPassword,
			verificationToken: token,
			verificationTokenExpires: Date.now() + 3600000, // Expires in 1 hour
		});
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
		const emailTemplate = `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: #333;
        }
        p {
            color: #555;
            font-size: 16px;
        }
        .btn {
            display: inline-block;
            background: #007bff;
            color: #ffffff;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Our Service, ${name}!</h1>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationLink}" target="_blank" class="btn">Verify Email</a>
        <p class="footer">If you did not sign up for this service, please ignore this email.</p>
    </div>
</body>
</html>
`;

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: email,
			subject: "Verify Your Email",
			html: emailTemplate,
		};

		await transporter.sendMail(mailOptions); // Uncomment to send the email

		await newUnverifiedUser.save();

		res.status(200).json({
			email,
			message:
				"Registration successful. Please check your email for the verification link. The link will be valid for 1 hour.",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error during registration." });
	}
};

exports.verifyEmail = async (req, res) => {
	try {
		const { token } = req.query;
		if (!token) {
			return res
				.status(400)
				.json({ message: "Verification token is required." });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			return res.status(400).json({ message: "Invalid or expired token." });
		}

		const { email, query } = decoded;
		const unverifiedUser = await UnverifiedUser.findOne({ email });
		if (
			!unverifiedUser ||
			unverifiedUser.verificationTokenExpires < Date.now()
		) {
			return res
				.status(400)
				.json({ message: "Invalid or expired verification link." });
		}

		let customer;
		try {
			customer = await Customer.create({
				name: unverifiedUser.name,
				email: unverifiedUser.email,
				password: unverifiedUser.password,
				isVerified: true,
			});
		} catch (error) {
			return res
				.status(500)
				.json({ message: "Error creating customer account." });
		}

		try {
			const tempCart = await Cart.findOne(query);

			if (tempCart) {
				await Cart.create({
					customer: customer._id,
					items: tempCart.items || [],
				});
				await Cart.deleteOne(query);
			} else {
				await Cart.create({
					customer: customer._id,
					items: [],
				});
			}
		} catch (error) {
			return res
				.status(500)
				.json({ message: "Error handling cart migration." });
		}

		try {
			await UnverifiedUser.deleteOne({ email });
		} catch (error) {
			return res
				.status(500)
				.json({ message: "Error deleting unverified user." });
		}

		res.status(200).json({ message: "Email verified successfully!" });
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Server error during email verification." });
	}
};

exports.forgetPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const customer = await Customer.findOne({ email });
		if (!customer) {
			return res.status(404).json({ message: "Invalid email address!" });
		}

		// Create a reset token
		const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});
		const emailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.4.2/mdb.min.css" rel="stylesheet"/>
</head>
<body style="background-color: #f4f4f4; padding: 30px;">

    <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
        <div class="card shadow-lg p-4" style="max-width: 500px; width: 100%;">
            <div class="card-body text-center">
                <h3 class="card-title mb-3">Reset Your Password</h3>
                <p class="text-muted">
                    Hello, <br>
                    We received a request to reset your password. Click the button below to proceed.
                </p>
                <a href="${url}" 
                   class="btn btn-primary btn-lg"
                   style="width: 100%; margin-top: 10px;">
                    Reset Password
                </a>
                <p class="text-muted mt-3">
                    If you did not request this, please ignore this email.
                </p>
                <hr>
                <p class="small text-muted">
                    Need help? Contact our support team at <a href="mailto:support@example.com">support@example.com</a>
                </p>
            </div>
        </div>
    </div>

</body>
</html>
`;

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: customer.email,
			subject: "Password Reset",
			html: emailTemplate,
		});

		res.status(200).json({ message: "Password reset link sent" });
	} catch (error) {
		res.status(500).json({ message: "Error sending email" });
	}
};

// Step 2: Reset Password

exports.resetPassword = async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	if (!password || password.length < 6) {
		return res
			.status(400)
			.json({ message: "Password must be at least 6 characters long" });
	}

	if (!token) {
		return res.status(400).json({ message: "Token is required" });
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const userId = decoded.id;

		// Find user
		const user = await Customer.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update password
		await Customer.findByIdAndUpdate(userId, { password: hashedPassword });

		res.status(200).json({ message: "Password reset successfully" });
	} catch (error) {
		console.error("Reset Password Error:", error);

		if (error.name === "JsonWebTokenError") {
			return res.status(400).json({ message: "Invalid token" });
		} else if (error.name === "TokenExpiredError") {
			return res.status(400).json({ message: "Token has expired" });
		}

		res.status(500).json({ message: "Internal server error" });
	}
};

exports.login = (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);
		if (!user) return res.status(401).json({ message: info.message });

		const { token } = user; // Assuming the user object contains a pre-generated JWT token
		const customerId = user.user.id.toString();

		res.status(200).json({
			message: "Logged in",
			token, // Optional, you might not need to return the token in the response
			customerId,
			user,
		});
	})(req, res, next);
};

exports.logout = (req, res) => {
	res.status(200).json({ message: "Logged out successfully" });
};

exports.status = (req, res) => {
	let token;

	if (req.headers.authorization) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return res
			.status(401)
			.json({ message: "Unauthorized access: No token provided" });
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ message: err.message });
		}
		return res.status(200).json({ message: "Token is valid" });
	});
};
