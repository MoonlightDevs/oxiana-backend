const Review = require("../models/Review");
const Product = require("../models/Product");

exports.addReview = async (req, res) => {
	try {
		const { customer, product, rating, comment } = req.body;
		existingProduct = await Product.findById(product);
		if (!existingProduct)
			return res.status(404).json({ message: "Product not found" });
		const newReview = new Review({
			customer,
			product,
			rating,
			comment,
		});
		await newReview.save();

		await Product.findByIdAndUpdate(
			product,
			{ $push: { reviews: newReview._id } },
			{ new: true, useFindAndModify: false }
		);

		await existingProduct.updateRating();
		// we are saving the the review only if the product has been updated
		res
			.status(201)
			.json({ message: "Review was added succesfully!!", review: newReview });
	} catch (err) {
		console.error("Error adding review:", err);
		res.status(500).json({ error: "Failed to add review" });
	}
};

exports.getReviewsByProduct = async (req, res) => {
	try {
		const productId = req.params.productId;
		const reviews = await Review.find({ product: productId });

		res.status(200).json({ reviews: reviews });
	} catch (err) {
		console.error("Error fetching reviews by product:", err);
		res.status(500).json({ error: "Failed to retrieve reviews" });
	}
};

exports.getReviewById = async (req, res) => {
	try {
		const reviewId = req.params.id;
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ error: "Review not found" });
		}

		res.status(200).json({ review: review });
	} catch (err) {
		console.error("Error fetching review by ID:", err);
		res.status(500).json({ error: "Failed to retrieve review" });
	}
};

exports.updateReview = async (req, res) => {
	try {
		const reviewId = req.params.id;
		const { rating, comment } = req.body;

		const updatedReview = await Review.findByIdAndUpdate(
			reviewId,
			{ rating, comment },
			{ new: true }
		);

		if (!updatedReview) {
			return res.status(404).json({ error: "Review not found" }); // Return 404 if review doesn't exist
		}

		res.status(200).json({
			message: "Review updated sucessfully!",
			updatedReview: updatedReview,
		});
	} catch (err) {
		console.error("Error updating review:", err);
		res.status(500).json({ error: "Failed to update review" });
	}
};

exports.deleteReview = async (req, res) => {
	try {
		const reviewId = req.params.id;
		const deletedReview = await Review.findByIdAndDelete(reviewId);

		if (!deletedReview) {
			return res.status(404).json({ error: "Review not found" });
		}

		res.status(200).json({
			message: "Review deleted successfully",
			deletedReview: deletedReview,
		});
	} catch (err) {
		console.error("Error deleting review:", err);
		res.status(500).json({ error: "Failed to delete review" });
	}
};
