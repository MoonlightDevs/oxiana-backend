const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/authenticate");
const { authorizeOrder } = require("../middleware/authorize/authorizeOrder");
const {
	createOrder,
	getOrderById,
	updateOrderStatus,
	getOrdersByCustomer,
} = require("../controllers/orderController");

// Order routes
router.post("/:id", ensureAuthenticated, createOrder);
router.get("/:id", ensureAuthenticated, authorizeOrder, getOrderById);
router.get(
	"/customer/:id",
	ensureAuthenticated,
	authorizeOrder,
	getOrdersByCustomer
);
router.put(
	"/:id/status",
	ensureAuthenticated,
	authorizeOrder,
	updateOrderStatus
);

module.exports = router;
