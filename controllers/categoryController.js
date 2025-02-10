// controllers/categoryController.js:
const Category = require("../models/Category");
const Product = require("../models/Product");
const { validateCategory } = require("../validators/categoryValidator");

exports.getProductsByCategoryId = async (req, res) => {
	try {
		const { id } = req.params;
		const existingCategory = await Category.findById(id);
		if (!existingCategory)
			return res.status(404).json({ message: "Category not found" });
		const products = await Product.find({
			category: id,
		})
			.populate("images")
			.populate({ path: "reviews", populate: { path: "customer" } })
			.populate("category");
		res.status(200).json({ products: products });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
exports.createCategory = async (req, res) => {
	const { error } = validateCategory(req.body);
	if (error) return res.status(400).send({ message: error.message });

	try {
		const { name, description } = req.body;
		const existingCategory = await Category.findOne({ name: name });
		if (existingCategory)
			return res.status(409).json({ message: "Category already exists" });
		const category = new Category({ name, description });
		await category.save();
		res
			.status(201)
			.json({ message: "Category created successfully", data: category });
	} catch (error) {
		// Handle any errors that occur during the process
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
exports.getAllCategories = async (req, res) => {
	try {
		const categories = await Category.find(); // Fetch all categories
		res.status(200).json({ categories: categories }); // Send categories as JSON response
	} catch (error) {
		res.status(500).json({ message: "Error fetching categories", error });
	}
};
exports.getCategoryById = async (req, res) => {
	try {
		const categoryId = req.params.id;
		const category = await Category.findById(categoryId);

		if (!category) return res.status(404).json({ error: "Category not found" });

		res.status(200).json(category);
	} catch (error) {
		console.error("Error fetching category by ID:", error.message);
		res.status(500).json({ error: "Failed to retrieve category" });
	}
};
exports.updateCategory = async (req, res) => {
	const categoryId = req.params.id;
	const updatedData = req.body;

	const { error } = validateCategory(updatedData);
	if (error) return res.status(400).json({ error: error.message });

	try {
		const duplicateCategory = await Category.findOne({ name: req.body.name });
		if (duplicateCategory && duplicateCategory._id.toString() !== categoryId)
			return res
				.status(409)
				.json({ message: "Category already exists with that name" });
		const updatedCategory = await Category.findByIdAndUpdate(
			categoryId,
			updatedData,
			{
				new: true,
			}
		);

		if (!updatedCategory) {
			return res.status(404).json({ message: "Category not found" });
		}

		res.status(200).json({
			message: "Category updated successfully",
			category: updatedCategory,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
exports.deleteCategory = async (req, res) => {
	const categoryId = req.params.id;

	try {
		// Set the category field of the products that are associated with this category
		await Product.updateMany(
			{ category: categoryId },
			{ $set: { category: null } }
		);
		const deletedCategory = await Category.findByIdAndDelete(categoryId);
		if (!deletedCategory) {
			return res.status(404).json({ message: "Category not found" });
		}

		res.status(204).json({
			message: "Category deleted successfully",
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
