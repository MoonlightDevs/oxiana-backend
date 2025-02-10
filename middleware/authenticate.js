const jwt = require("jsonwebtoken");

exports.ensureAuthenticated = (req, res, next) => {
	try {
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

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;

		next();
	} catch (error) {
		console.error(error);
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid token" });
		}
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ message: "Token expired" });
		}
		res.status(500).json({
			message: "Error during authentication",
			error: error.message,
		});
	}
};
