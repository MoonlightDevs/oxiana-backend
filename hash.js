const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Product = require("./models/Product"); // Adjust the path if needed

// MongoDB connection
mongoose
	.connect("mongodb://localhost:27017/ecommerce")
	.then(() => console.log("MongoDB Connected"))
	.catch((err) => console.error("MongoDB Connection Error:", err));

const seedProducts = async () => {
	try {
		// Define the category ID
		const categoryId = "679f5d23ea293665a92feebb";

		// Generate 50 fake products
		const products = Array.from({ length: 100 }).map(() => ({
			name: faker.commerce.productName(),
			description: faker.commerce.productDescription(),
			price: faker.commerce.price({ min: 1, max: 10000, dec: 2 }),
			attributes: {
				color: faker.color.human(),
				brand: faker.company.name(),
				material: faker.commerce.productMaterial(),
			},
			category: categoryId,
			images: [],
			reviews: [],
			averageRating: 0,
			reviewCount: 0,
		}));

		// Insert into the database
		await Product.insertMany(products);
		console.log("50 Products Inserted Successfully!");

		// Close the connection
		mongoose.connection.close();
	} catch (error) {
		console.error("Error seeding products:", error);
	}
};

// Run the seeding function
seedProducts();
