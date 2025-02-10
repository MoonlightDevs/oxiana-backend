const express = require("express");
const router = express.Router();
const validateId = require("../middleware/validateId");

const {
	getProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
	getProductImages,
	listProducts,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:id/product", validateId, getProductById);
router.get("/:id/images", validateId, getProductImages);
router.post("/", createProduct);
router.delete("/:id", validateId, deleteProduct);
router.put("/:id", validateId, updateProduct);
router.get("/search", listProducts);

// (Optional) Protected routes for other actions like updating, deleting, etc.
// router.post('/', protect, authorize('admin'), createProduct);
// router.put('/:id', protect, authorize('admin'), updateProduct);
// router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
