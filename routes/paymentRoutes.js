// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/create", paymentController.createPayment);
// router.get("/:id", paymentController.getPaymentById);
router.put("/:id/status", paymentController.updatePaymentStatus);
// router.get("/order/:orderId", paymentController.getPaymentsByOrder);

module.exports = router;
