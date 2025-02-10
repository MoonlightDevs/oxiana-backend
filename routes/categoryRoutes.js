// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const validateId = require("../middleware/validateId");

router.post("/", categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get(
	"/:id/products",
	validateId,
	categoryController.getProductsByCategoryId
);
router.get("/:id", validateId, categoryController.getCategoryById);
router.put("/:id", validateId, categoryController.updateCategory);
router.delete("/:id", validateId, categoryController.deleteCategory);

module.exports = router;
