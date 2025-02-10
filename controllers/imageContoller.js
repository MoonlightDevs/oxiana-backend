const Image = require("../models/Image");
const axios = require("axios");
const FormData = require("form-data");
const Product = require("../models/Product");
const {
	validateImage,
	validateUpdateImage,
} = require("../validators/imageValidator");
const { default: mongoose } = require("mongoose");

const getImages = async (req, res) => {
	try {
		const images = await Image.find();
		res.status(200).json(images);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
const getImageById = async (req, res) => {
	try {
		const imageId = req.params.id;
		// it will return a 400 response when the ID
		// doens't follow the 24-character hex format
		if (!mongoose.Types.ObjectId.isValid(imageId))
			return res.status(400).json({ message: "Invalid image ID format" });

		const image = await Image.findById(imageId);

		if (!image) return res.status(404).json({ message: " image not found" });

		res.status(200).json(image);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
const createImage = async (req, res) => {
	// const { error } = validateImage(req.body);
	// if (error) return res.status(400).json({ error: error });

	try {
		if (!req.file) {
			return res.status(400).send({ error: "No file uploaded" });
		}
		console.log("Uploaded file:", req.file);

		const form = new FormData();
		form.append("image", req.file.buffer.toString("base64"));

		// Post the image to ImgBB
		const response = await axios.post("https://api.imgbb.com/1/upload", form, {
			params: { key: process.env.IMGBB_API_KEY },
			headers: form.getHeaders(),
		});

		// Log the ImgBB response for debugging
		console.log("ImgBB Response:", response.data);

		// Ensure the response contains the expected data
		if (!response.data || !response.data.data || !response.data.data.url) {
			return res
				.status(500)
				.send({ error: "Failed to get image URL from ImgBB" });
		}

		const imageUrl = response.data.data.url;
		console.log("Image URL:", imageUrl);

		// Check if the product exists
		const existingProduct = await Product.findById(req.body.product);
		if (!existingProduct)
			return res.status(400).json({ error: "Product not found" });

		// Check if the image already exists
		const existingImage = await Image.findOne({ url: imageUrl });
		if (existingImage)
			return res.status(409).json({ message: "Image already exists" });

		// Destructure the fields from the request body
		const { altText, product, order, isMain } = req.body;

		// Create the image object and save it to the database
		const image = new Image({
			url: imageUrl, // Ensure the URL is included
			altText: altText,
			product: product,
			order: order,
			isMain: isMain,
		});

		// Save the image to the database
		const savedImage = await image.save();

		// Update the product with the new image
		await Product.findByIdAndUpdate(
			product,
			{ $push: { images: savedImage._id } },
			{ new: true, useFindAndModify: false }
		);

		// Return the saved image
		res.status(201).json(savedImage);
	} catch (error) {
		console.error("Error uploading image:", error.message);
		res.status(500).json({ message: error.message });
	}
};

const updateImage = async (req, res) => {
	const { error } = validateUpdateImage(req.body);
	if (error) return res.status(400).json({ error: error });
	try {
		const updatedImageId = req.params.id;
		const updatedImageData = req.body;

		const duplicateImage = await Image.findOne({ url: req.body.url });
		if (duplicateImage && duplicateImage._id.toString() !== updatedImageId) {
			return res
				.status(409)
				.json({ message: "Image already exists with that URL" });
		}

		const updatedImage = await Image.findByIdAndUpdate(
			updatedImageId,
			updatedImageData,
			{ new: true, runValidators: true }
		);
		if (!updatedImage)
			return res.status(404).json({ message: "Image not found" });

		res
			.status(200)
			.json({ message: "Image saved successfully", image: updatedImage });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
const deleteImage = async (req, res) => {
	try {
		const imageId = req.params.id;
		const deletedImage = await Image.findByIdAndDelete(imageId);
		if (!deletedImage)
			return res.status(404).json({ message: "Image not found" });
		res.status(200).json({
			message: "Image deleted successfully}",
			deletedImage: deletedImage,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: " Couldn't delete image " + error.message });
	}
};

module.exports = {
	getImages,
	getImageById,
	createImage,
	updateImage,
	deleteImage,
};
