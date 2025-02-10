const express = require("express");
const router = express.Router();
const multer = require("../config/multer"); // Multer configuration
const axios = require("axios");
const FormData = require("form-data");

router.post("/upload", multer.single("image"), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).send({ error: "No file uploaded" });
		}

		// Convert image buffer to Base64
		const form = new FormData();
		form.append("image", req.file.buffer.toString("base64"));

		// Send image to ImgBB
		const response = await axios.post("https://api.imgbb.com/1/upload", form, {
			params: {
				key: process.env.IMGBB_API_KEY,
			},
			headers: form.getHeaders(),
		});

		// Return the uploaded image URL
		const imageUrl = response.data.data.url;
		res.status(200).send({ imageUrl });
	} catch (error) {
		console.error("Error uploading image:", error.message);
		res.status(500).send({ error: "Image upload failed" });
	}
});

module.exports = router;
