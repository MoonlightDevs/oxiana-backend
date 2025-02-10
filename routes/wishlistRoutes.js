// routes/wishlistRoutes.js
const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

router.post("/add", wishlistController.addProductToWishlist);
router.get("/customer/:customerId", wishlistController.getWishlistByCustomer);
router.delete(
	"/remove/:productId",
	wishlistController.removeProductFromWishlist
);

module.exports = router;
