// controllers/productController.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const {
	validateProduct,
	validateProductUpdate,
} = require("../validators/productValidator");
const { default: mongoose } = require("mongoose");
const Cart = require("../models/Cart");

const getProducts = async (req, res) => {
	const { name, category, size, color, priceMin, priceMax } = req.query;
	try {
		let filter = {};

		if (category) {
			filter.category = category;
		}
		if (priceMin) {
			filter.price = { $gte: priceMin };
		}
		if (priceMax) {
			filter.price = filter.price
				? { ...filter.price, $lte: priceMax }
				: { $lte: priceMax };
		}

		// parameters from request.query to implement pagination
		const page = parseInt(req.query.page);
		const limit = parseInt(req.query.limit);
		// page and limit should be positive integers
		if (page < 1 || limit < 1)
			return res.status(400).json({ message: "invalid pagination" });
		const startIndex = (page - 1) * limit;

		const totalProducts = await Product.countDocuments(filter);

		const products = await Product.find(filter)
			.skip(startIndex)
			.limit(limit)
			.populate("images")
			.populate("category");

		res.status(200).json({
			products: products,
			totalPages: Math.ceil(totalProducts / limit),
			currentPage: page,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const listProducts = async (req, res) => {
	try {
		const {
			search,
			category,
			size,
			color,
			priceMin,
			priceMax,
			page = 1,
			limit = 32,
			sortBy = "createdAt",
			sortOrder = "desc",
		} = req.query;

		const query = {};

		if (category) {
			query.category = category;
		}
		if (priceMin) {
			query.price = { $gte: priceMin };
		}
		if (priceMax) {
			query.price = query.price
				? { ...query.price, $lte: priceMax }
				: { $lte: priceMax };
		}

		// Constructing the query object
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } }, // Case-insensitive search in name
				{ description: { $regex: search, $options: "i" } },
				// Case-insensitive search in description
			];
		}

		// Calculating the total number of products matching the query
		const totalProducts = await Product.countDocuments(query);

		// Fetching the products with pagination and sorting
		const products = await Product.find(query)
			.populate("category", "name") // Populating the category field with only the name
			.populate("images", "url") // Populating the images field with only the URL
			.populate({
				path: "reviews",
				select: "rating comment",
				options: { limit: 5, sort: { createdAt: -1 } }, // Fetch latest 5 reviews
			})
			.skip((page - 1) * limit)
			.limit(Number(limit))
			.sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 }); // Sorting by the specified field and order

		// Sending the response
		res.status(200).json({
			success: true,
			data: products,
			totalProducts,
			currentPage: Number(page),
			totalPages: Math.ceil(totalProducts / limit),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
};

const getProductById = async (req, res) => {
	const userId = req.user ? req.user.userId : null;
	if (!userId) {
		return res.status(400).json({
			success: false,
			message: "Invalid request: User ID is required",
		});
	}
	const productId = req.params.id;
	try {
		let product;
		product = await Product.findById(productId)
			.populate("images")
			.populate({ path: "reviews", populate: { path: "customer" } })
			.populate("category");
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		const recommendations = await Product.find({
			category: product.category._id,
		})
			.populate("category", "name") // Populating the category field with only the name
			.populate("images", "url") // Populating the images field with only the URL
			.populate({
				path: "reviews",
				select: "rating comment",
				options: { limit: 5, sort: { createdAt: -1 } }, // Fetch latest 5 reviews
			});

		product = [product, recommendations];

		res.status(200).json(product);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
const getProductImages = async (req, res) => {
	try {
		const productId = req.params.id;
	} catch (error) {}
};
const createProduct = async (req, res) => {
	const { error } = validateProduct(req.body);
	if (error) return res.status(400).json({ error: error.message });

	const { name, description, price, color, size, category } = req.body;
	try {
		if (!mongoose.Types.ObjectId.isValid(category))
			return res.status(400).json({ message: "Invalid category id " });

		const existingCategory = await Category.findById(category);
		if (!existingCategory)
			return res.status(404).json({ message: "Category not found" });

		const newProduct = new Product({
			name,
			description,
			price,
			color,
			size,
			category,
		});
		await newProduct.save();

		const savedProduct = await newProduct.save();
		res.status(201).json({ product: savedProduct });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
const deleteProduct = async (req, res) => {
	const { id } = req.params.id;
	try {
		const activeOrders = await Order.find({
			"items.product": id,
			status: { $in: ["pending", "processing", "shipped"] },
		});

		if (activeOrders.length > 0)
			return res.status(409).json({
				message:
					"Product cannot be deleted because it is associated with active orders",
			});

		const deletedProduct = await Product.findByIdAndDelete(id);
		if (!deletedProduct) {
			res.status(404).send({ message: "Product not found" });
		}
		res.status(200).json({
			message: "Product deleted successfully!",
			product: deletedProduct,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error deleting product", error: error.message });
	}
};
const updateProduct = async (req, res) => {
	const { error } = validateProductUpdate(req.body);
	if (error) return res.status(400).json({ error: error.message });

	const { id } = req.params;
	const data = req.body;
	try {
		const existingProduct = await Product.findById(id);
		if (!existingProduct)
			return res.status(404).json({ message: "Product not found" });

		const updatedProduct = await Product.findByIdAndUpdate(id, data, {
			new: true,
			runValidators: true,
		});
		res.json({ message: "Product updated", product: updatedProduct });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Product updated error", error: error.message });
	}
};
module.exports = {
	getProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
	getProductImages,
	listProducts,
};
