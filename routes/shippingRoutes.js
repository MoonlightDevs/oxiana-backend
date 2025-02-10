// routes/shippingRoutes.js
const express = require("express");
const router = express.Router();
const shippingController = require("../controllers/shippingController");

router.post("/", shippingController.createShipping);
router.get("/:id", shippingController.getShippingById);
router.put("/:id/status", shippingController.updateShippingStatus);
router.get("/order/:orderId", shippingController.getShippingsByOrder);

module.exports = router;
