const jwt = require("jsonwebtoken");

function jwtMiddleware(req, res, next) {
	const cookieToken = req.headers.cookie
		? req.headers.cookie.split("=")[1]
		: null;

	const token = cookieToken
		? cookieToken
		: req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: null;

	if (token) {
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				// Token is invalid
				generateGuestToken(req, res, next);
			} else {
				// Token is valid, attach user info to request
				req.user = decoded;
				next();
			}
		});
	} else {
		// No token provided, generate guest token
		generateGuestToken(req, res, next);
	}
}

const generateUniqueId = () => {
	const timestamps = Date.now();
	const randNum = Math.floor(Math.random() * 1000000);
	return `${timestamps}-${randNum}`;
};

function generateGuestToken(req, res, next) {
	// Generate a new unique ID for the guest user
	const guestId = generateUniqueId();

	// Create payload with unique guest ID
	const payload = {
		userId: guestId,
		role: "guest",
	};

	// Sign the token with the payload
	const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

	res.setHeader("Authorization", `Bearer ${token}`);

	// Attach guest user info to request
	req.user = payload;

	// Proceed to the next middleware or route handler
	next();
}

module.exports = jwtMiddleware;
